// qunit-tests.js

require('../where.js');

// should be function
// should pass tape context        
// should throw when data-table is malformed
// should return results
// should throw unintercepted errors
// this test should fail with intercept off
// should log errors by default
// should log all data when specified
// should not throw when intercept specified

QUnit.module("where() with QUnit");

test('should be a function', function () {
  QUnit.assert.equal(typeof where, 'function');
});

test('should pass QUnit context', function(assert) {
      
  var results = where(function(){/***
    | a | b | c |
    | 1 | 2 | 2 |
    | 7 | 5 | 7 |
    ***/
    
    assert.equal(QUnit, context.QUnit, 'should find QUnit');

  }, { assert: assert, QUnit: QUnit });
  
  assert.equal(results.values.length, 3);
});

test('should throw when data-table is malformed', function(assert) {

    throws(
      function () {
         where(function(){/*** 
            | a | b | c |
            | 1 | 2 | 3 
            | 2 | 4 | 6 |
            ***/
            assert.ok(a + b == c);
            
          }, { assert: assert, QUnit: QUnit });
      },
      'should throw'
    );
 
});

test('should return results', function(assert) {
      
  var results = where(function(){/***
    | a | b | c |
    | 1 | 2 | 2 |
    | 7 | 5 | 7 |
    ***/
    
    assert.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);

  }, { assert: assert, QUnit: QUnit });
  
  assert.equal(results.values.length, 3, '3 value rows');
  assert.equal(results.failing.length, 0, 'no failing assertions');
  assert.equal(results.passing.length, 2, '2 passing assertions');

});

test('should throw unintercepted errors', function(assert) {

  throws(
    function() {
      where(function(){/***
        | a | b | c |
        | 1 | 2 | c |
        ***/
        assert.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);
        
      }, { assert: assert, QUnit: QUnit});
    },
    "should throw"
  );
});

// UNCOMMENT THIS TEST TO SEE STACK OUTPUT FOR FAILING WHERE() ASSERTION
// test('this test should fail with intercept off', function(assert) {
  
    // where(function() {/***
      // | a | b | c |
      // | 3 | 5 | 9 |
      // ***/
      // assert.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);
    
  // }, { assert: assert, QUnit: QUnit});
       
// });

test('should log errors by default', function(assert) {

  // stub out console.log - then restore it afterward
  var log = console.log;
  
  var last;
  var message;

  console.log = function (msg) {
    last = msg;
  }
  
  try {
  
    where(function(){/***
    
      | a | b | c |
      | 1 | 2 | 2 |
      | 3 | 2 | 1 |
      | 3 | 2 | 3 |
      
      ***/
      
      assert.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);
      
    }, { assert: assert, QUnit: QUnit });
    
  } catch (err) {
  
    message = err.message;
    
    // RESTORE console.log
    console.log = log;    
  }
  
  assert.equal(message, last, 'should log [3 | 2 | 1] error');
  
  // RESTORE console.log -- just being safe
  console.log = log;    
});

test('should log all data when specified', function(assert) {

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
    
    assert.equal(context.log, 1, 'should see context.log');        
    
  }, { assert: assert, QUnit: QUnit, log: 1});
  
  assert.equal(count, results.passing.length, 'should call log for each row');
  
  // RESTORE console.log
  console.log = log;
});

test('should not throw when intercept specified', function(assert) {

  var results = where(function(){/***
  
    | a | b | c |
    | 1 | 2 | 2 |
    | 7 | 5 | c |
    ***/
    assert.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);
    
  }, { assert: assert, QUnit: QUnit, intercept: 1});
  
  assert.equal(results.failing.length, 1, 'should be one failing');
  assert.equal(results.passing.length, 1, 'should be one passing');
});
