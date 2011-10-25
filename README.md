# Spectra

Simple, flexible, asynchronous TDD/BDD framework for [node.js][http://nodejs.org].

## Usage

The simplest spec module:

```js
```

That's right, an empty module. An empty module is a failing test. So no excuses
for starting with a failing test!

To do something useful, the simplest spec is:

```js
module.exports = function (spec){
  spec.equal(2+2, 4);
  spec();
}
```

Note that each spec function is passed a spec function/object, which it can
treat as the assert object and also call when finished. If a map is passed to
the spec object, it represents a nested spec:

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

A test module is just a regular module that exports a single function, like this:

```js
module.exports = function (spec){
}
```
