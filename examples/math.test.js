module.exports = function (spec){
  spec({
    'math': function (spec){
      spec.equal(2+2, 4);
      spec();
    }
  });
}
