// qunit-tests.js

if (typeof require == 'function') {
  // enable to re-use in a browser without require.js
  require('../../where.js');
}

// should be function
// should pass tape context        
// should throw when data-table is malformed
// should return results
// should throw unintercepted errors
// this test should fail with intercept off
// should log errors by default
// should log all data when specified
// should not throw when intercept specified

QUnit.module('where.js [QUnit tests]');

test('should be a function', function () {
  QUnit.assert.equal(typeof where, 'function');
});

test('should pass QUnit context', function(assert) {
      
  var results = where(function(){
    /***
    | a | b | c |
    | 1 | 2 | 2 |
    | 7 | 5 | 7 |
    ***/
    
    assert.equal(QUnit, context.QUnit, 'should find QUnit');

  }, { assert: assert, QUnit: QUnit });
  
  assert.equal(results.data.values.length, 2);
});

test('should throw when data-table is malformed', function(assert) {

  throws(
    function () {
      where(function(){
        /*** 
        | a | b | c |
        | 1 | 2 | 3   // missing border
        | 2 | 4 | 6 |
        ***/
        assert.ok(a + b == c);
        
      }, { assert: assert, QUnit: QUnit });
    },
    'where.js table has unbalanced column borders'
  );
 
});

test('should return results', function(assert) {
      
  var results = where(function(){
    /***
    | a | b | c |
    | 1 | 2 | 2 |
    | 7 | 5 | 7 |
    ***/
    
    assert.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);

  }, { assert: assert, QUnit: QUnit });
  
  assert.equal(results.data.values.length, 2, '2 value rows');
  assert.equal(results.failing.length, 0, '0 failing assertions');
  assert.equal(results.passing.length, 2, '2 passing assertions');

});

test('should throw unintercepted failing tests', function(assert) {

  throws(
    function() {
      where(function(){
        /***
        | a | b | c |
        | 1 | 2 | c |
        ***/
        
        // logic fork in QUnit between ok() and the other assertions, 
        // which leads to different logging and assertion queue paths
        assert.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);
        //QUnit.push(false, 2, 'x', 'should fail');
        
      }, { assert: assert, QUnit: QUnit});
    },
    'should have thrown failing tests'
  );
});

// UNCOMMENT THIS TEST TO SEE STACK OUTPUT FOR FAILING WHERE() ASSERTION
// test('this test should fail with intercept off', function(assert) {
  
    // where(function() {
      // /***
      // | a | b | c |
      // | 3 | 5 | 9 |
      // ***/
      // assert.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);
    
  // }, { assert: assert, QUnit: QUnit});
       
// });

test('should not log passing tests on Node.js, should log in browser', function(assert) {

  // stub out console.log - then restore it afterward
  var log = console.log;
  var count = 0;
  
  console.log = function () {
    count += 1;
  };
  
  where(function(){
    /***
    | a | b | c |
    | 1 | 2 | 2 |
    ***/
    // force pass
    QUnit.push(true, 2, 'x', 'force pass');
    
  }, { assert: assert, QUnit: QUnit });

  // RESTORE console.log
  console.log = log;
  
  if (typeof window != 'undefined') {
    // we're in browser - forked behavior
    assert.ok(count > 0, 'should log passing test in browsers');
  } else {
    // qunitjs on node.js - no logging by default
    assert.equal(count, 0, 'should not log passing test in qunitjs for node.js');
  }
});

test('should log passing tests when specified', function(assert) {

  // stub out console.log - then restore it afterward
  var log = console.log;
  
  var count = 0;
  
  console.log = function () {
    count += 1;
  };
  
  var results = where(function(){
    /***
    | a | b | c |
    | 1 | 2 | 2 |
    | 7 | 5 | 7 |
    ***/
    assert.equal(context.log, 1, 'should see context.log');        
    
  }, { assert: assert, QUnit: QUnit, log: 1});
  
  // RESTORE console.log
  console.log = log;
  
  if (typeof window != 'undefined') {
    // we're in browser - forked behavior
    assert.equal(count, 2 * results.passing.length, 'should log each test');
  } else {
    // qunitjs on node.js
    assert.equal(count, results.passing.length, 'should log each test on node.js');
  }
  
});

test('should not throw when intercept specified', function(assert) {

  var results;
  var error;
  
  try {
  
    results = where(function(){
      /***
      | a | b | c |
      | 1 | 2 | 2 |
      | 7 | 5 | c |
      ***/
      
      assert.equal(Math.max(a, b), c, 'Math.max(' + a + ',' + b + ') should be ' + c);

    }, { assert: assert, QUnit: QUnit, intercept: 1  });

  } catch(e) {
    error = e;
  }
  
  assert.ok(!error, 'should not have thrown');
  assert.equal(results.failing.length, 1, 'should be 1 failing');
  assert.equal(results.passing.length, 1, 'should be 1 passing');
});
