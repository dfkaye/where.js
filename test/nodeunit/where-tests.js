// where-tests.js
// another nice surprise - nodeunit is commonjs+this friendly
//(typeof exports != 'undefined' || (exports = this));

if (typeof require == 'function') {
  var nodeunit = require('nodeunit');
}

this.whereTests = {
  
  'assert where' : function (test) {
    test.ok(typeof where != 'undefined', 'where exists');
    test.done();
  },
  
  'where-nodeunit-strategy': function (test) {
  
    var results = where(function () {
      /***
      a | b | c
      1 | 2 | 3
      4 | 5 | 9
      // shouldn't see this
      ***/
      test.equal(a + b, c, (a + ' + ' + b + ' = ' + c));
      
    }, { strategy: 'nodeunit', test: test });
  
    test.equal(results.passing.length, 2, 'should be 2 passing');
    test.equal(results.failing.length, 0, 'should be 0 failing');
    test.done();
  },
  
  'should not throw on failed assertions': function (test) {
  
    test.doesNotThrow(function() {
      where(function () {
        /***
        a | b | c
        x | y | z  // 'xy' == 'z' should fail
        ***/
        test.equal(a + b, c, (a + ' + ' + b + ' = ' + c));
        
      }, { strategy: 'nodeunit', test: test });
    });

    test.done();
  },
  
  'should suppress stack trace with intercept': function (test) {
  
    var results = where(function () {
      /***
      a | b | c
      1 | 2 | 3
      4 | 5 | 7 // check the console
      // shouldn't see this
      ***/
      test.equal(a + b, c, (a + ' + ' + b + ' = ' + c));
      
    }, { strategy: 'nodeunit', intercept: 1, test: test });
  
    test.equal(results.passing.length, 1, 'should be 1 passing');
    test.equal(results.failing.length, 1, 'should be 1 failing');
    test.done();
  },
  
  'should display passing test with log': function (test) {
  
    var results = where(function () {
      /***
      a | b | c
      1 | 2 | 3 // should see (passed) in console
      4 | 5 | 7
      // shouldn't see this
      ***/
      test.equal(a + b, c, (a + ' + ' + b + ' = ' + c));
      
    }, { strategy: 'nodeunit', log: 1, test: test });
  
    test.equal(results.passing.length, 1, 'should be 1 passing');
    test.equal(results.failing.length, 1, 'should be 1 failing');
    test.done();
  } 
};

