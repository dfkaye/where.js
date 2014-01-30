
// node test/tape-suite
require('../where.js');

var tape = require('tape');

// should be function
// should pass tape context        
// should throw when data-table is malformed
// should return results
// should throw unintercepted errors
// this test should fail with intercept off
// should log errors by default
// should log all data when specified
// should not throw when intercept specified

console.log('where() with tape');

tape('should be a function', function (test) {
  test.plan(1);
  test.equal(typeof where, 'function');
});

tape('should pass tape context', function(test) {
      
  var results = where(function(){/***
    | a | b | c |
    | 1 | 2 | 2 |
    | 7 | 5 | 7 |
    ***/
    
    t.equal(tape, context.tape, 'should find tape');

  }, { t: test, tape: test });
  
  test.equal(results.values.length, 3);
  test.end();
});

tape('should throw when data-table is malformed', function (test) {

    test.throws(
      function() {
        where(function(){/*** 
        | a | b | c |
        | 1 | 2 | 3 
        | 2 | 4 | 6 |
        ***/
        });
      },
      'should throw'
    );
    test.end();
});

tape('should return results', function(test) {
      
  var results = where(function(){/***
    | a | b | c |
    | 1 | 2 | 2 |
    | 7 | 5 | 7 |
    ***/
    
    tape.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);

  }, { tape: test});
  
  test.equal(results.values.length, 3, '3 value rows');
  test.equal(results.failing.length, 0, 'no failing assertions');
  test.equal(results.passing.length, 2, '2 passing assertions');

  test.end();
});

tape('should throw unintercepted errors', function(test) {

  test.throws(
    function() {
      where(function(){/***
        | a | b | c |
        | 1 | 2 | c |
        ***/
        tape.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);
        
      }, { tape: test});
    },
    "should throw"
  );
  
  test.end();
});

// UNCOMMENT THIS TEST TO SEE STACK OUTPUT FOR FAILING WHERE() ASSERTION
// tape('this test should fail with intercept off', function(test) {
  
    // where(function() {/***
      // | a | b | c |
      // | 3 | 5 | 9 |
      // ***/
      // tape.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);
    
  // }, { tape: test});
  
  // test.end();
// });

tape('should log errors by default', function(test) {

  test.throws(
    function() {
      where(function(){/***
      
        | a | b | c |
        | 1 | 2 | 2 |
        | 3 | 2 | 1 |
        | 3 | 2 | 3 |
        
        ***/
        
        tape.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);
        
      }, { tape: test });
    
    },
    'should log [3 | 2 | 1] error'
  );
  
  test.end();
  
});

tape('should log all data when specified', function(test) {

  // stub out console.log - then restore it afterward
  var log = console.log;
  
  var count = 0;
  
  console.log = function () {
    count += 1;
    log.apply(console, arguments);
  }
  
  var results = where(function(){/***
  
    | a | b | c |
    | 1 | 2 | 2 |
    | 7 | 5 | 7 |
    ***/
    
    tape.equal(context.log, 1, 'should see context.log');        
    
  }, { tape: test, log: 1});
  
  // RESTORE console.log
  console.log = log;
  
  test.ok(count / results.passing.length > 0, 'should call log for each row');

  test.end();
});

tape('should not throw when intercept specified', function(test) {

  var results;
  
  test.doesNotThrow(
    function() {
      results = where(function(){/***
      
        | a | b | c |
        | 1 | 2 | 2 |
        | 7 | 5 | c |
        ***/
        tape.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);
        
      }, { tape: test, intercept: 1});
    }
  );
  
  test.equal(results.failing.length, 1, 'should be one failing');
  test.equal(results.passing.length, 1, 'should be one passing');
  test.end();
});
