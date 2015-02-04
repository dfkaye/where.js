// fix-tests.js

this.fixTests = {

  // setUp and tearDown were broken in the browser version of nodeunit (in the
  // nodeunit examples directory
  // these are here to verify the fix for those
  // see https://gist.github.com/dfkaye/9280921
  'setUp': function (callback) {
    this.running = true;
    callback();
  },
  
  'tearDown': function (callback) {
    this.running = false;
    callback();
  },

  'test running': function (test) {
    test.ok(this.running, 'setup running');
    test.done();
  },
  
  'test timeout': function (test) {
    test.ok(true, 'everything ok');
    setTimeout(function () {
      test.done();
    }, 10);
  },
  
  'apples and oranges': function (test) {
    test.equal('apples', 'oranges', 'comparing apples and oranges');
    test.done();
  }
};