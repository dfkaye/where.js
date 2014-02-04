// jasmine-based where.spec.js

if (typeof require == 'function') {
  // enable to re-use in a browser without require.js
  require('../../where.js');
}

describe('where.js jasmine spec', function () {

   /* CHARACTERIZATION TESTS */

  describe('where characteristics', function () {
      
    it('should be global', function() {
      expect(typeof where).toBe('function');
    });
      
    it('should accept 2 arguments', function () {
      expect(where.length).toBe(2);
    });
    
    it('should accept context with jasmine and expect specified', function () {
      where(function(){/*** 
          a  |  b  |  c
          1  |  2  |  3
        ***/
        expect(jasmine).toBe(context.jasmine);
        expect(expect).toBe(context.expect);

      }, { jasmine: 1, expect: expect});
    });
    
    it('should accept context arg with {strategy: "jasmine"}', function () {
      where(function(){/*** 
          a  |  b  |  c
          1  |  2  |  3
        ***/
        expect(strategy).toBe('jasmine');
        
      }, { strategy: 'jasmine', expect: expect});
    });
    
    it('should accept only a function as first argument', function () {
      expect(function () {
        where(!function(){});
       }).toThrow();
    });
    
    it('should not throw if missing expectation', function () {
      expect(function () {
        where(function(){/*** 
          a  |  b  |  c
          1  |  2  |  2
          4  |  3  |  4
          6  |  6  |  6
        ***/});
       }).not.toThrow();
    });
    
    it('should pass with correct data and expectation', function () {
      where(function(){/*** 
          a  |  b  |  c
          1  |  2  |  2
          4  |  3  |  4
          6  |  6  |  6
        ***/
        expect(Math.max(a, b)).toBe(Number(c));
      });
    });
    
    it('should pass with left and right table borders', function () {
      where(function(){/*** 
        | d | e | f |
        | 1 | 2 | 2 |
        | 4 | 3 | 4 |
        | 6 | 6 | 6 |
        ***/
        expect(Math.max(d, e)).toBe(f);
      });
    });
    
    it('should throw if borders not balanced', function() {
      expect(function () {
        where(function(){/*** 
          | a | b | c 
          | t | o | to
          ***/
          expect(a + b).toBe(c);
        });
      }).toThrow();
    });

    it('should return results', function () {
      var results = where(function(){/*** 
          a  |  b  |  c
          6  |  6  |  6
        ***/
        expect(Math.max(a, b)).toBe(Number(c));
      });
      
      expect(results.passing.length).toBe(1);
      expect(results.values.length).toBe(2);
      // values[0] is the label or header row
      expect(results.values[0].join(',')).toBe("a,b,c");
    });
    
    it('should ignore empty rows', function () {
      var results = where(function(){/*** 
          a  |  b  |  c

          6  |  6  |  6
        ***/
        expect(Math.max(a, b)).toBe(Number(c));
      });
      
      expect(results.values.length).toBe(2);
    });
    
    it('should pass with data containing various padding', function () {
      expect(function () {
        where(function(){/*** 
            a | b|c
             6|4 |10
          ***/
          
         // /* I DETECT A USABILITY ISSUE WITH Number() for every input      */
          expect(Number(a) + Number(b)).toBe(Number(c))
        });
      }).not.toThrow();
    });
    
    it('should convert numeric data automatically', function () {
      expect(function () {
        where(function(){/***
        
                a     |    b     |    c     |  p
                
                0     |    1     |    1     |  1
                0.0   |    1.0   |    1     |  1
               -1     |   +1     |    0     |  1
               +1.1   |   -1.2   |   -0.1   |  2
               08     |   08     |   16     |  2
                6     |    4     |   10.0   |  3
                8.030 |   -2.045 |    5.985 |  4
            1,000.67  | 1345     | 2345.67  |  6
                5f |      5 | 10f | 1
          ***/
          
          /* 
           * using precisions for famous .1 + .2 == 0.30000000000000004 
           * and 5.985 vs 5.98499999999999999999999999 bugs 
           */
          var s = (a + b).toPrecision(p)
          expect(+s).toBe(c) // implicit conversion with prefixed +
        });
        
       }).not.toThrow();
    });
    
    // contributed via issues by @jamonholmgren 4 FEB 2014
    it('should instantiate objects with correct keys', function () {
    
      where(function () {
        /***
          a | b | c
          1 | 2 | 3
          6 | 12 | 18
        ***/
        
        var obj = new Obj(a,b,c); // DIY instantiation
        expect(obj.a + obj.b).toEqual(obj.c);

        // quick array test
        expect([a,b,c].reverse()).toEqual([c,b,a]);
        
      }, { Obj: function (a,b,c) { this.a = a; this.b = b; this.c = c;} });
      
    });
    
  });   

  /* MALFORMED TABLE */
  
  describe('malformed data table', function () {

    it('should throw when function has no data-table comment', function () {
      expect(function () {
        where(function(){});
       }).toThrow();
    });
    
    it('should throw when function has no data-table rows', function () {
      expect(function () {
        where(function(){/***
        ***/});
       }).toThrow();
    });
    
    it('should throw when function has only one row in data-table', function () {
      expect(function () {
        where(function(){/*** 
          a  |  b  |  c 
        ***/});
       }).toThrow();
    });

    it('should throw with duplicate labels', function () {
      expect(function () {
        where(function(){/***
          a | a
          0 | 1
          ***/
        });
      }).toThrow();
    });
     
    it('should throw when function has un-separated items in data-table', function () {
      expect(function () {
        where(function(){/*** 
          a  |  b  |  c
          6  
        ***/});
       }).toThrow();
    });
    
    it('should throw when missing last value', function () {
      expect(function () {
        where(function(){/*** 
          a  |  b  |  c
          1  |  2  |
        ***/});
      }).toThrow();
    });
     
    it('should throw when missing first value', function () {
      expect(function () {
        where(function(){/*** 
          a  |  b  |  c
             |  1  |  2
        ***/});
      }).toThrow();
    });
     
    it('should throw when missing inner value', function () {
      expect(function () {
        where(function(){/*** 
          a  |  b  |  c
          1  |     | 2
        ***/});
      }).toThrow();
    });
    
    it('should throw when missing separator in data-table', function () {
      expect(function () {
        where(function(){/*** 
          a  |  b  |  c
          6     4  |  0
        ***/});
       }).toThrow();
    });
  });

  
  /***
   * INTERCEPT & LOG TESTS
   * Use these tests to intercept results set by jasmine, particularly on specs
   * that fail.
   ***/

  describe('using strategy for intercept and log', function () {

    it('specify jasmine strategy in context', function () {

      var results = where(function(){/*** 
            a  |  b  |  c
            1  |  1  |  1
          ***/
          
          expect(jasmine).toBe(context.jasmine);
          
        }, { jasmine: jasmine, expect: expect});
      
      expect(results.failing.length).toBe(0);
      expect(results.passing.length).toBe(1);
    });
    
    it('should not throw on error when intercept specified', function () {

      var results = where(function(){/*** 
            a  |  b  |  c
            1  |  1  |  x
          ***/
          
          expect(Math.max(a, b)).toBe(c);
          
        }, { jasmine: jasmine, expect: expect, intercept: 1});
      
      expect(results.failing.length).toBe(1);
    });
    
    it('should log all results when specified', function () {
    
      // stub out console.log - then restore it afterward
      var log = console.log;
      
      var count = 0;
      
      console.log = function () {
        count += 1;
      }
      
      var results = where(function(){/*** 
            a  |  b  |  c
            1  |  1  |  1
            1  |  2  |  2
            4  |  2  |  4
            4  |  8  |  7
          ***/
          expect(Math.max(a, b)).toBe(Number(c));
          
        }, { jasmine: 1, expect: expect, intercept: 1, log: 1});
      
      expect(count).toBe(results.passing.length + results.failing.length);
      
      // RESTORE console.log
      console.log = log;      
    });
  
    it('should return results for incorrect expectation', function () {
    
      var results = where(function(){/*** 
          a  |  b  |  c
          1  |  1  |  1
          1  |  2  |  2
          4  |  2  |  4
          4  |  8  |  7
        ***/
        expect(Math.max(a, b)).toBe(c);
      }, { strategy: 'jasmine', expect: expect, intercept: 1 });
            
      expect(results.failing.length).toBe(1);
      expect(results.passing.length).toBe(3);
      expect(results.failing[0].message).toContain("[a | b | c]");
      expect(results.failing[0].message).toContain("[4 | 8 | 7]");
      expect(results.failing[0].message).toContain("Expected 8 to be 7.");
    });

    it('should return results for incorrect matches or values', function () {
    
      var results = where(function(){/*** 
          a  |  b  |  c
          1  |  1  |  1
          1  |  2  |  x
          3  |  2  |  3
          5  |  3  |  5.01
        ***/
        
        // /* using match for numeric data here */
        expect(Math.max(a, b)).toBe(c);
      }, { strategy: 'jasmine', expect: expect, intercept: 1 });

      expect(results.failing.length).toBe(2);
      expect(results.passing.length).toBe(2);
      expect(results.failing[0].message).toContain("Expected 2 to be '" + results.values[2][2] + "'.");
      expect(results.failing[1].message).toContain("Expected 5 to be 5.01.");
      
    }); 

  });

  
  // ASYNCHRONOUS TESTS IN JASMINE
  
  describe('asynchronous tests', function () {
  
    it('should throw when missing separator in data-table', function (done) {
    
      setTimeout(function () {
      
        expect(function () {
          where(function(){/*** 
            a  |  b  |  c
            6     4  |  0
          ***/});
         }).toThrow();
         
         done();
         
      }, 500);
      
    });
    
    it('should work with intercept', function (done) {

      setTimeout(function () {
      
        var results = where(function(){/*** 
              a  |  b  |  c
              1  |  1  |  1
              1  |  2  |  2
              4  |  2  |  4
              4  |  8  |  7
            ***/
            expect(Math.max(a, b)).toBe(Number(c));
          }, { jasmine: 1, expect: expect, intercept: 1});
        
        expect(results.failing.length).toBe(1);
        expect(results.passing.length).toBe(3);
        expect(results.failing[0].message).toContain("Expected 8 to be 7.");
        
        done();
        
      }, 500);
    });
    
    it('should log all results', function (done) {

      setTimeout(function () {
      
        var results = where(function(){/*** 
              a  |  b  |  c
              1  |  1  |  1
              1  |  2  |  2
              4  |  2  |  4
              4  |  8  |  7
            ***/
            expect(Math.max(a, b)).toBe(Number(c));
          }, { jasmine: 1, expect: expect, intercept: 1, log: 1});
        
        expect(results.failing.length).toBe(1);
        expect(results.passing.length).toBe(3);
        expect(results.failing[0].message).toContain("[a | b | c]");
        expect(results.failing[0].message).toContain("[4 | 8 | 7]");
        expect(results.failing[0].message).toContain("Expected 8 to be 7.");
        
        done();
        
      }, 500);
    });
    
  });
  
  /***
   * Use these tests to see displayed stack traces and results messages for failed specs.
   ***/
  describe('non-intercepted failing tests', function () {

    it("stack trace ~ 'should contain at least 2 rows but has 0'", function () {
      
      // stub out console.log - then restore it afterwards.
      var log = console.log;
      
      var last;
      var results;

      console.log = function (msg) {
        last = msg;
      }
      try {
        results = where(function(){/***
          ***/
        });
      } catch(error) {
        last = error.message;
        console.log = log;
      }
      
      expect(last).toContain('should contain at least 2 rows but has 0');
      expect(results).toBeUndefined();
    });
    
  });

});