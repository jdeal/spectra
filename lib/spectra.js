var path = require('path');
var fs = require('fs');
var burrito = require('burrito');
var assert = require('assert');

var MAP_MARKER = '__{}__';

function filesOkay(files, cb){
  var remaining = files.length;
  if (!remaining) return cb();
  files.forEach(function (file){
    fs.exists(file,function (exists){
      if (!exists) throw new Error('file ' + file + ' does not exist');
      remaining--;
      if (!remaining) return cb();
    });
  });
}

function createAssertion(obj){
  return {
    error: obj.error
  };
}

function makeAssertMethod(name){
  return function (){
    var a = createAssertion({
    });
    try {
      assert[name].apply(null, arguments);
      this.good.push(a);
    } catch (e) {
      this.isFailed = true;
      a.error = e;
      this.bad.push(a);
    }
  }
}

function spec_done(){
  this.isDone = true;
}

function spec_when(){
  for (var i = 0; i < arguments.length; i++){
    this.whenList.push(arguments[i]);
  }
}

function spec_isEmpty(){
  return this.children.length < 1 && this.good.length < 1 && this.bad.length < 1 &&
  (this.whenList.length === 0 || (this.whenList.length === 1 && (this.whenList[0] === '' || this.whenList === MAP_MARKER)));
}

function spec_isDone(){
  if (this.doneList.length < 1){
    return false;
  }
  try {
    assert.deepEqual(this.whenList,this.doneList);
    return true;
  } catch (e) {
    return false;
  }
}

var specBase = {
  fail: makeAssertMethod('fail'),
  ok: makeAssertMethod('ok'),
  equal: makeAssertMethod('equal'),
  notEqual: makeAssertMethod('notEqual'),
  deepEqual: makeAssertMethod('deepEqual'),
  notDeepEqual: makeAssertMethod('notDeepEqual'),
  strictEqual: makeAssertMethod('strictEqual'),
  notStrictEqual: makeAssertMethod('notStrictEqual'),
  throws: makeAssertMethod('throws'),
  doesNotThrow: makeAssertMethod('doesNotThrow'),
  ifError: makeAssertMethod('ifError'),
  done: spec_done,
  isEmpty: spec_isEmpty,
  when: spec_when,
  isDone: spec_isDone
};

function createSpec(parent,title){
  var spec = function spec(thing){
    if (typeof thing === 'object'){
      Object.keys(thing).forEach(function (key){
        var handler = thing[key];
        runSpecHandler(spec,key,handler);
      });
      if (spec.whenList.length < 1){
        spec.whenList.push(MAP_MARKER);
      }
      spec.doneList.push(MAP_MARKER);
    } else if (typeof thing === 'string') {
      spec.doneList.push(thing);
    } else if (typeof thing === 'undefined'){
      if (spec.whenList.length < 1){
        spec.whenList.push('');
      }
      spec.doneList.push('');
    }
  };
  spec.title = title;
  spec.runner = this;
  spec.parent = parent;
  //spec.isDone = false;
  spec.isFailed = false;
  spec.whenList = [];
  spec.doneList = [];
  spec.children = [];
  spec.good = [];
  spec.bad = [];
  if (parent){
    parent.children.push(spec);
  }
  Object.keys(specBase).forEach(function (key){
    spec[key] = specBase[key];
  })
  return spec;
}

function runSpecHandler(parentSpec,name,handler){
  var spec = createSpec(parentSpec,name);
  if (typeof handler === 'function'){
    handler(spec);
  } else if (typeof handler === 'object'){
    Object.keys(handler).forEach(function (key){
      var handler = handler[key];
      var subSpec = createSpec(spec,key);
      handler(subSpec);
    })
  }
  return spec;
}

function indentString(s,depth){
  var indent = '';
  for (var i = 0; i < depth; i++){
    indent += '  ';
  }
  s = indent + s;
  s = s.replace(/\n/g,'\n' + indent);
  return s;
}

function reportSpec(spec,depth){
  console.log(indentString(spec.title,depth));
  if (spec.good.length > 0 || spec.bad.length > 0){
    console.log(indentString(
      "success: " + spec.good.length + "\n" +
      "failure: " + spec.bad.length
    ,depth+1));
  }
  if (spec.isEmpty()){
    console.log(indentString("Spec appears to be empty. Specs must contain assertions or child specs.",depth+1));
  }
  if (!spec.isDone()){
    console.log(indentString("Spec did not finish. Did you use the spec callback?",depth+1));
  }
  spec.children.forEach(function (spec){
    reportSpec(spec,depth+1);
  });
}



function report(){
  this.specs.forEach(function (spec){
    reportSpec(spec,0);
  })
  console.log("Success: " + (this.specCount - this.specFailedCount));
  if (this.specFailedCount){
    console.log("Failure: " + this.specFailedCount);
  }
}

function finishSpecs(specs){
  var self = this;
  specs.forEach(function (spec){
    if (!spec.isDone()){
      spec.isFailed = true;
    }
    // spec is failed if it is an empty leaf
    if (spec.isEmpty()){
      spec.isFailed = true;
    }
    self.finishSpecs(spec.children);
    // ignore non-assertion parent specs
    if (!self.isFailed && spec.children.length > 0){
      return;
    }
    self.specCount++;
    if (spec.isFailed){
      self.specFailedCount++;
    }
  })
}

function start(){
  var self = this;
  var files = self.options.files;
  if (files.length < 1) throw new Error('must supply at least one file');
  filesOkay(files,function(){
    files.forEach(function (shortFile){
      file = path.join(process.cwd(),shortFile);
      file = file.replace(/\.js$/,'');
      var specModule = require(file);
      var rootSpec = runSpecHandler(null,shortFile,specModule);
      rootSpec.file = shortFile;
      self.specs.push(rootSpec);
    })
  });
  process.on('exit', function (){
    self.finishSpecs(self.specs);
    self.report();
  })
}

function Runner(options){
  this.options = options;
  this.specs = [];
  this.specCount = 0;
  this.specFailedCount = 0;
}

Runner.prototype.start = start;
Runner.prototype.runSpecHandler = runSpecHandler;
Runner.prototype.createSpec = createSpec;
Runner.prototype.report = report;
Runner.prototype.finishSpecs = finishSpecs;

function createRunner(options){
  return new Runner(options);
}

exports.createRunner = createRunner;
