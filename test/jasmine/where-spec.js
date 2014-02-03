// $ jasmine-node --verbose test/jasmine/where-spec.js
// where-spec.js

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
    
describe('where() with jasmine', function () {

  it('should be function', function () {
    expect(typeof where).toBe('function');
  });
  
  it('should pass jasmine context', function() {
    
    var results = where(function(){/***
      | a | b | c |
      | 1 | 2 | 2 |
      | 7 | 5 | 7 |
      ***/
      
      expect(jasmine).toBe(context.jasmine);
      
    }, { jasmine: jasmine, expect: expect });
    
  });

  it('should throw when data-table is malformed', function () {

      var pass = false;
      
      try {
        where(function(){/*** 
          a  |  b  |  c 
          ***/
        });

      } catch(err) {
        pass = true;
      }
      
      expect(pass).toBe(true);
  });

  it('should return results', function() {
        
    var results = where(function(){/***
        | a | b | c |
        | 1 | 2 | 2 |
        | 7 | 5 | 7 |
        ***/
        expect(Math.max(a, b)).toBe(c)
        
      }, { jasmine: jasmine, expect: expect });
    
    expect(results.values.length).toBe(3);
    expect(results.failing.length).toBe(0);
    expect(results.passing.length).toBe(2);

  });
  
  it('should throw unintercepted errors', function() {

    expect(function() {
    
      where(function() {/***
        | a | b | c |
        | 1 | 2 | c |
        ***/
        expect(Math.max(a, b)).toBe(c)
        
      }, { jasmine: jasmine, expect: expect });
     
    }).toThrow();
    
  });
  
// UNCOMMENT THIS TEST TO SEE STACK OUTPUT FOR FAILING WHERE() ASSERTION
// it('this test should fail with intercept off', function() {
  
    // where(function() {/***
      // | a | b | c |
      // | 3 | 5 | 9 |
      // ***/
      // expect(Math.max(a, b)).toBe(c)
      
    // }, { jasmine: jasmine, expect: expect });
       
// });

  it('should log errors by default', function() {

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
        
        expect(Math.max(a, b)).toBe(c);
        
      }, { expect: expect, jasmine: jasmine });
      
    } catch (err) {
    
      message = err.message;
      
      // RESTORE console.log
      console.log = log;    
    }
    
    expect(message).toBe(last);
    
    // RESTORE console.log -- just being safe
    console.log = log;
    
  });

  it('should log all data when specified', function() {
    // stub out console.log - then restore it afterward
    var log = console.log;
    
    var count = 0;
    
    console.log = function () {
      count += 1;
    }
    
    var results = where(function(){/***
    
      | a | b | c |
      | 1 | 2 | 2 |
      | 7 | 5 | 7 |
      ***/
      expect(Math.max(a, b)).toBe(c)
        
    }, { jasmine: jasmine, expect: expect, log: 1 });
    
    expect(count).toBe(results.passing.length);
    
    // RESTORE console.log
    console.log = log; 
    
  });
  
  it('should not throw when intercept specified', function() {

    expect(function() {
      var results = where(function() {/***
        | a | b | c |
        | 1 | 2 | 2 |
        | 7 | 5 | c |
        ***/
        expect(Math.max(a, b)).toBe(c)
          
      }, { jasmine: jasmine, expect: expect, intercept: 1 });

      expect(results.failing.length).toBe(1);
      expect(results.passing.length).toBe(1);
    }).not.toThrow();

  });

});
