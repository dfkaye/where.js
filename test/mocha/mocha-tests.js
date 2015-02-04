
// mocha-tests.js

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

describe('where.js [mocha tests]', function(done) {
  
  // ASSERT
  
  describe('with assert', function () {
  
    var assert;
    
    if (typeof require == 'function') {
      // enable to re-use in a browser without require.js
      assert = require('assert');
    } else {
      assert = window.assert; //(github.com/Jxck/assert)
    }
    
    it('should throw when function has only one row in data-table', function () {
          
      var pass = false;
      
      try {
        where(function(){
          /*** 
          a  |  b  |  c 
          ***/
        });

      } catch(err) {
        pass = true;
      }
      
      assert.ok(pass);
    });
    
    it('should pass', function() {
          
      var results = where(function(){
        /***
        | a | b | c |
        | 1 | 2 | 2 |
        | 7 | 5 | 7 |
        ***/
        
        assert.equal(assert, context.assert);
        assert.equal(Math.max(a, b), c);
        
      }, { assert: assert});
      
      assert.equal(results.data.values.length, 2);
    });
    
    
    it('should throw unintercepted errors', function() {
    
      assert.throws(function(){
      
        where(function(){
          /***
          | a | b | c |
          | 1 | 2 | 3 |
          ***/
          assert.equal(Math.max(a, b), c);
          
        }, { assert: assert});
        
      });
        
    });
    
    it('should log table', function() {
          
      var results = where(function(){
        /***
        | a | b | c |
        | 1 | 2 | 2 |
        | 7 | 5 | 7 |
        ***/
        
        assert.equal(context.log, 1);        
        assert.equal(Math.max(a, b), c);
        
      }, { assert: assert, log: 1});
      
      assert.equal(results.data.values.length, 2);
    });
    
    it('should intercept failing results', function() {
    
      var results = where(function(){
        /***
        | a | b | c |
        | 1 | 2 | 2 |
        | 7 | 5 | 7 |
        ***/
        
        assert.equal(context.intercept, 1);        
        assert.equal(Math.max(a, b), 2); // should error on 2nd row
        
      }, { assert: assert, intercept: 1});
      
      assert.equal(results.failing.length, 1);
      assert.equal(results.data.values.length, 2);
    });
    
    it('should log and intercept', function() {
         
      var results = where(function(){
        /***
        | a | b | c |
        | 1 | 2 | 2 |
        | 7 | 5 | 7 |
        ***/
     
        assert.equal(Math.max(a, b), 2); // should error on 2nd row
        
      }, { assert: assert, log: 1, intercept: 1});
      
      assert.equal(results.failing.length, 1);
      assert.equal(results.data.values.length, 2);
    });
  });
  
  // EXPECT

  describe('with expect.js', function() {
  
    var expect;
    
    if (typeof require == 'function') {
      // enable to re-use in a browser without require.js
      expect = require('expect.js');
    } else {
      expect = window.expect;
    }

    it('should pass', function() {
          
      var results = where(function(){
        /***
        | a | b | c |
        | 1 | 2 | 2 |
        | 7 | 5 | 7 |
        ***/
        
        expect(expect).to.be(context.expect);
        expect(Math.max(a, b)).to.be(c);
        
      }, { expect: expect });
      
      expect(results.data.values.length).to.be(2);
    });
    

    it('should throw unintercepted errors', function() {
    
      expect(function() {
        where(function(){
          /***
          | a | b | c |
          | 1 | 2 | 3 |
          ***/
          expect(Math.max(a, b)).to.be(c);
          
        }, { expect: expect});
        
      }).to.throwError(); // synonym of throwException

    });
    
    
    it('should log data', function() {
          
      var results = where(function(){
        /***
        | a | b | c |
        | 1 | 2 | 2 |
        | 7 | 5 | 7 |
        ***/
        
        expect(Math.max(a, b)).to.be(c);
        
      }, { expect: expect, log: 1 });
      
      expect(results.data.values.length).to.be(2);
    });
    
    it('should intercept failures', function() {
          
      var results = where(function(){
        /***
        | a | b | c |
        | 1 | 2 | 2 |
        | 7 | 5 | 7 |
        
        ***/
        
        expect(Math.max(a, b)).to.be(2); // should error on 2nd row
        
      }, { expect: expect, intercept: 1 });
      
      expect(results.failing.length).to.be(1);
      expect(results.data.values.length).to.be(2);    
    });
    
    it('should log and intercept', function() {
          
      var results = where(function(){
        /***
        | a | b | c |
        | 1 | 2 | 2 |
        | 7 | 5 | 7 |
        
        ***/
        
        expect(Math.max(a, b)).to.be(2); // should error on 2nd row
        
      }, { expect: expect, intercept: 1, log: 1 });
      
      expect(results.failing.length).to.be(1);
      expect(results.data.values.length).to.be(2);    
    });
  });
  
  // SHOULD
  
  describe('with should.js', function() {
  
    if (typeof require == 'function') {
      // enable to re-use in a browser without require.js
      require('should');
    }
    
    // should is added to Object.prototype
    
    it('should pass without a context', function() {
    
      var results = where(function(){
        /***
        |  a  | b | c |
        |  1  | 2 | 2 |
        |  7  | 5 | 7 |
        | -17 | 2 | 2 |
        ***/

        Math.max(a, b).should.equal(c);
      });
      
      results.data.values.length.should.equal(3);
    });
    
    
    it('should throw unintercepted errors', function() {

      (function(){
      
        where(function(){
          /***
          | a | b | c |
          | 1 | 2 | 3 |
          ***/
          Math.max(a, b).should.equal(c);
        });
        
      }).should.throw();
    });
    
    it('should log data', function() {
    
      var results = where(function(){
        /***
        |  a  | b | c |
        |  1  | 2 | 2 |
        |  7  | 5 | 7 |
        | -17 | 2 | 2 |
        ***/
        
        Math.max(a, b).should.equal(c);
        
      }, {log: 1});
      
      results.data.values.length.should.equal(3);
    });
    
    it('should intercept failures', function() {
    
      var results = where(function(){
        /***
        |  a  | b | c |
        |  1  | 2 | 2 |
        |  7  | 5 | 7 |
        | -17 | 2 | 2 |
        ***/
        Math.max(a, b).should.equal(2); // should error on 2nd row
        
      }, {intercept: 1});
          
      results.failing.length.should.equal(1);
      results.data.values.length.should.equal(3);
    });
    
    it('should log and intercept', function() {
    
      var results = where(function(){
        /***
        |  a  | b | c |
        |  1  | 2 | 2 |
        |  7  | 5 | 7 |
        | -17 | 2 | 2 |
        ***/
        
        Math.max(a, b).should.equal(2); // should error on 2nd row
        
      }, {log: 1, intercept: 1});
          
      results.failing.length.should.equal(1);
      results.data.values.length.should.equal(3);
    });
    
  });
  
  // CHAI
  
  describe('with chai', function () {
  
    var chai;
    
    if (typeof require == 'function') {
      // enable to re-use in a browser without require.js
      chai = require('chai');
    } else {
      chai = window.chai;
    }    
    
    describe('with chai.assert', function () {
      
      it('should throw when function has only one row in data-table', function () {
      
        var assert = chai.assert;

        var pass = false;
        
        try {
          where(function(){
            /*** 
            a  |  b  |  c 
            ***/
          });

        } catch(err) {
          pass = true;
        }
        
        assert.ok(pass);
      });
      
      it('should pass', function() {
      
        var assert = chai.assert;
        
        var results = where(function(){
          /***
          | a | b | c |
          | 1 | 2 | 2 |
          | 7 | 5 | 7 |
          ***/
          
          assert.equal(assert, context.assert);
          assert.equal(Math.max(a, b), c);
          
        }, { assert: assert});
        
        assert.equal(results.data.values.length, 2);
      });
      
      
      it('should throw unintercepted errors', function() {
        var assert = chai.assert;
        assert.throws(function() {
          where(function(){
            /***
            | a | b | c |
            | 1 | 2 | 3 |
            ***/
            assert.equal(Math.max(a, b), c);
          }, { assert: assert});
        });
      });
      
      
      it('should log table', function() {
      
        var assert = chai.assert;
        
        var results = where(function(){
          /***
          | a | b | c |
          | 1 | 2 | 2 |
          | 7 | 5 | 7 |
          ***/
          
          assert.equal(context.log, 1);        
          assert.equal(Math.max(a, b), c);
          
        }, { assert: assert, log: 1});
        
        assert.equal(results.data.values.length, 2);
      });
      
      it('should intercept failing results', function() {
      
        var assert = chai.assert;
        
        var results = where(function(){
          /***
          | a | b | c |
          | 1 | 2 | 2 |
          | 7 | 5 | 7 |
          ***/
          
          assert.equal(context.intercept, 1);        
          assert.equal(Math.max(a, b), 2); // should error on 2nd row
          
        }, { assert: assert, intercept: 1});
        
        assert.equal(results.failing.length, 1);
        assert.equal(results.data.values.length, 2);
      });
      
      it('should log and intercept', function() {
      
        var assert = chai.assert;

        var results = where(function(){
          /***
          | a | b | c |
          | 1 | 2 | 2 |
          | 7 | 5 | 7 |
          ***/
       
          assert.equal(Math.max(a, b), 2); // should error on 2nd row
          
        }, { assert: assert, log: 1, intercept: 1});
        
        assert.equal(results.failing.length, 1);
        assert.equal(results.data.values.length, 2);
      });
      
    });
    
    describe('with chai.expect', function() {
      
      it('should work with expect', function() {
      
        var expect = chai.expect;

        var results = where(function(){
          /***
          | a | b | c |
          | 1 | 2 | 2 |
          | 7 | 5 | 7 |
          ***/
          
          expect(expect).to.equal(context.expect);
          expect(Math.max(a, b)).to.equal(c);
          
        }, { expect: expect });
        
        expect(results.data.values.length).to.equal(2);
      });
      
      
      it('should throw unintercepted errors', function() {
        var expect = chai.expect;
        expect(function() {
        
          where(function(){
            /***
            | a | b | c |
            | 1 | 2 | 3 |
            ***/
            expect(Math.max(a, b)).to.equal(c);
          }, { expect: expect});
          
        }).to.throw();
      });
      
      
      it('should log data', function() {
      
        var expect = chai.expect;
        
        var results = where(function(){
          /***
          | a | b | c |
          | 1 | 2 | 2 |
          | 7 | 5 | 7 |
          ***/
          
          expect(Math.max(a, b)).to.equal(c);
          
        }, { expect: expect, log: 1 });
        
        expect(results.data.values.length).to.equal(2);
      });
      
      it('should intercept failures', function() {
      
        var expect = chai.expect;
        
        var results = where(function(){
          /***
          | a | b | c |
          | 1 | 2 | 2 |
          | 7 | 5 | 7 |
          ***/
          
          expect(Math.max(a, b)).to.equal(2); // should error on 2nd row
          
        }, { expect: expect, intercept: 1 });
        
        expect(results.failing.length).to.equal(1);
        expect(results.data.values.length).to.equal(2);    
      });
      
      it('should log and intercept', function() {
      
        var expect = chai.expect;
        
        var results = where(function(){
          /***
          | a | b | c |
          | 1 | 2 | 2 |
          | 7 | 5 | 7 |
          ***/
          
          expect(Math.max(a, b)).to.equal(2); // should error on 2nd row
          
        }, { expect: expect, intercept: 1, log: 1 });
        
        expect(results.failing.length).to.equal(1);
        expect(results.data.values.length).to.equal(2);    
      });
      
    });

    
    describe('with chai.should', function() {

      // decontaminate should.js first...
      delete Object.prototype.should;

      // now get chai using Should() rather than should (which just got scrubbed)
      var should = chai.Should();
      
      // ~ should is added to Object.prototype
      it('should pass without a context', function() {
      
        var results = where(function(){
          /***
          |  a  | b | c |
          |  1  | 2 | 2 |
          |  7  | 5 | 7 |
          | -17 | 2 | 2 |
          ***/

          Math.max(a, b).should.equal(c);
        });
        
        results.data.values.length.should.equal(3);
      });
      
      
      it('should throw unintercepted errors', function() {
        (function(){
        
          where(function(){
            /***
            | a | b | c |
            | 1 | 2 | 3 |
            ***/
            Math.max(a, b).should.equal(c);
          });
          
         }).should.throw();
         
      });
      
      
      it('should log data', function() {
      
        var results = where(function(){
          /***
          |  a  | b | c |
          |  1  | 2 | 2 |
          |  7  | 5 | 7 |
          | -17 | 2 | 2 |
          ***/
          
          Math.max(a, b).should.equal(c);
          
        }, {log: 1});
        
        results.data.values.length.should.equal(3);
      });
      
      it('should intercept failures', function() {
      
        var results = where(function(){
          /***
          |  a  | b | c |
          |  1  | 2 | 2 |
          |  7  | 5 | 7 |
          | -17 | 2 | 2 |
          ***/
          Math.max(a, b).should.equal(2); // should error on 2nd row
          
        }, {intercept: 1});
            
        results.failing.length.should.equal(1);
        results.data.values.length.should.equal(3);
      });
      
      it('should log and intercept', function() {
      
        var results = where(function(){
          /***
          |  a  | b | c |
          |  1  | 2 | 2 |
          |  7  | 5 | 7 |
          | -17 | 2 | 2 |
          ***/
          
          Math.max(a, b).should.equal(2); // should error on 2nd row
          
        }, {log: 1, intercept: 1});
            
        results.failing.length.should.equal(1);
        results.data.values.length.should.equal(3);
      });
      
    });
  });
  
  
  // FORMAT 
  describe('format tests with expect.js', function() {
  
    var expect;
    
    if (typeof require == 'function') {
      // enable to re-use in a browser without require.js
      expect = require('expect.js');
    } else {
      expect = window.expect;
    }
  
  // issue 8 - error reporting format (tables not well-formed)
  // requested enhancement from johan sonntagbauer  
  // https://github.com/dfkaye/where.js/issues/8
  
    it('should return well-formatted messages', function () {
    
      var results = where(function () {
        /*** 
          leftInput |    b  |  andTheAnswerIs
            1000    |  1000 |  1000
             12     |    24 |  24
          451       |  2    |  4451
          4         |  8    |  7
        ***/
        
        expect(Math.max(leftInput, b)).to.be(andTheAnswerIs);
        
        // jasmine allows this second assertion to run
        // mocha does NOT, as it is "fail fast"
        expect(b).not.to.be(2);
        
        }, { expect: expect, intercept: 1, log: 1 });    
      
      var passing = results.passing[0].message.split('\n');
      
      expect(passing.length).to.be(4);
      expect(passing[0]).to.be('');
      expect(passing[1]).to.be(' [leftInput | b    | andTheAnswerIs] : ');
      expect(passing[2]).to.be(' [1000      | 1000 | 1000          ] (Passed) ');
      expect(passing[3]).to.be('');
      
      var failing = results.failing[0].message.split('\n');
      
      expect(failing[0]).to.be('');
      expect(failing[1]).to.be(' [leftInput | b    | andTheAnswerIs] : ');
      
      // verify row format and that the message is produced
      expect(failing[2]).to.contain(' [451       | 2    | 4451          ]');
      
      // verify first expectation failure message
      // mocha inserts "Error: " in message
      expect(failing[2]).to.contain('Error: expected 451 to equal 4451');
      
      // verify the second expectation is NOT appended 
      expect(failing[2]).not.to.contain('expected 2 not to be 2');
      
      // last row empty
      expect(failing[3]).to.be('');
    });
  });
  
});