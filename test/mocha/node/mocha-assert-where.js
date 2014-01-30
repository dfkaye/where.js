// mocha-assert-where

describe('assert where', function () {

  it('should throw when function has only one row in data-table', function () {
  
    var assert = require('assert');
    
    var pass = false;
    
    try {
      where(function(){/*** 
        a  |  b  |  c 
        ***/
      });

    } catch(err) {
      pass = true;
    }
    
    assert.ok(pass);
  });
  
  it('should pass', function() {
  
    var assert = require('assert');
    
    var results = where(function(){/***
      | a | b | c |
      | 1 | 2 | 2 |
      | 7 | 5 | 7 |
      ***/
      
      assert.equal(assert, context.assert);
      assert.equal(Math.max(a, b), c);
      
    }, { assert: assert});
    
    assert.equal(results.values.length, 3);
  });
  
  it('should log table', function() {
  
    var assert = require('assert');
    
    var results = where(function(){/***
    
      | a | b | c |
      | 1 | 2 | 2 |
      | 7 | 5 | 7 |
      ***/
      
      assert.equal(context.log, 1);        
      assert.equal(Math.max(a, b), c);
      
    }, { assert: assert, log: 1});
    
    assert.equal(results.values.length, 3);
  });
  
  it('should intercept failing results', function() {
  
    var assert = require('assert');
    
    var results = where(function(){/***
    
      | a | b | c |
      | 1 | 2 | 2 |
      | 7 | 5 | 7 |
      ***/
      
      assert.equal(context.intercept, 1);        
      assert.equal(Math.max(a, b), 2); // should error on 2nd row
      
    }, { assert: assert, intercept: 1});
    
    assert.equal(results.failing.length, 1);
    assert.equal(results.values.length, 3);
  });
  
  it('should log and intercept', function() {
  
    var assert = require('assert');
    
    var results = where(function(){/***
      | a | b | c |
      | 1 | 2 | 2 |
      | 7 | 5 | 7 |
      ***/
   
      assert.equal(Math.max(a, b), 2); // should error on 2nd row
      
    }, { assert: assert, log: 1, intercept: 1});
    
    assert.equal(results.failing.length, 1);
    assert.equal(results.values.length, 3);
  });
});