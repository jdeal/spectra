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
