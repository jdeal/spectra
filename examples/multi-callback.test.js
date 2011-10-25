module.exports = function (spec){
  spec.when('sooner','later');
  setTimeout(function(){
    spec('sooner');
  },1000);
  setTimeout(function(){
    spec('later');
  },2000);
};
