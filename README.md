# Spectra

Simple, flexible, asynchronous TDD/BDD framework for [node.js][http://nodejs.org].

## Usage

The simplest spec module:

```js

```

That's right, an empty module. An empty module is a failing test. So no excuses
for not starting with a failing test first!

To do something useful, the simplest spec is:

```js
module.exports = function (spec){
  spec.equal(2+2, 4);
  spec();
}
```

Note that each spec function is passed a spec function/object, which it can
treat as the assert object and also call when finished. Because of the explicit
callback, asynchronous functions can easily be tested, and setup work can be
done ahead of test execution.

If a map is passed to the spec object, it represents a nested spec:

```js
module.exports = function (spec){
  spec({
    'math': function (spec){
      spec({
        '2 + 2 should equal 4': function (spec){
          spec.equal(2+2, 4);
          spec();
        }
      });
    }
  });
}
```

You can nest as many specs as you like. Because the specs are functions, it's
easy to reference variables in outer specs.

You can also define the outermost specs like this:

```js
exports['first test'] = function (spec){
  // test something
}

exports['second test'] = function (spec){
  // test something else
}
```

But then you'll lose the ability to do asynchronous setup work for your
outermost specs.

### Multiple callbacks

If you have multiple callbacks, you can state that with a "when" assertion:

```js
module.exports = function (spec){
  spec.when('sooner','later');
  setTimeout(function(){
    spec('sooner');
  },1000);
  setTimeout(function(){
    spec('later');
  },2000);
};
```
