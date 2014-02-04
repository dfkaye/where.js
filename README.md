where.js
========

Data-driven test method for JavaScript frameworks (Jasmine, Mocha, QUnit, and 
Tape).

__[4 FEB 2014 ~ IN PROGRESS ~ ACTUAL DOCUMENTATION]__
__[30 JAN 2014 ~ COMING SOON ~ REALLY]__

# works on my machine

+ travis [![Build Status](https://travis-ci.org/dfkaye/where.js.png?branch=master)](https://travis-ci.org/dfkaye/where.js)
+ functionality tests using jasmine
  - npm test
  - node jasmine-node --verbose ./test/where/where.spec.js

+ framework strategy comparison tests
  - npm run jasmine
  - npm run mocha
  - npm run qunit
  - npm run tape

+ testem launchers
  - npm run testem
  - npm run testem-jasmine
  - npm run testem-mocha
  - npm run testem-qunit
  - npm run testem-tape

+ rawgithub links
  - https://rawgithub.com/dfkaye/where.js/master/test/where/browser-suite.html
  - https://rawgithub.com/dfkaye/where.js/master/test/jasmine/browser-suite.html
  - https://rawgithub.com/dfkaye/where.js/master/test/mocha/browser-suite.html
  - https://rawgithub.com/dfkaye/where.js/master/test/qunit/browser-suite.html
  - https://rawgithub.com/dfkaye/where.js/master/test/tape/browser-suite.html

# TODO
+ apply qunit-tap in the browser suite with testem?
+ add testling config for tape suite
+ try testling with another test framework?
+ readme
  - table, format (no preprocessor, just fun with Function constructors).
  - context: test-method-reference, strategy, intercept, log
  - examples from jasmine-where readme.
+ strategies
  - jasmine - 1.3.1 and 2.0.0
  - mocha - assert, expect.js, should, chai (assert, expect, should)
    + assert.js for browser - github.com/Jxck/assert
  - qunit - qunit-tap, dist/qunit.js
    + using qunitjs on node with qunit-tap ("A TAP Output Producer Plugin for 
      QUnit") - github.com/twada/qunit-tap
  - tape - @substack's event-driven TDD flavored TAP project for testling
    + add dom-console for tape browser suite (browserify tape-bundle)
  - how to add a custom strategy
+ vendor dir contains browser versions of mocha, expect.js, assert.js, should, 
    chai, qunit, jasmine-2.0.0
+ version bump
+ npm publish
+ post
+ add coffeescript support with a mocha or tape example


# documentation started

Provides a `where()` clause for data table tests, similar to Cucumber's 
scenario-outline 
[Examples](https://github.com/cucumber/cucumber/wiki/Scenario-Outlines) 
and Spock's 
[where blocks](https://code.google.com/p/spock/wiki/SpockBasics#Where_Blocks).

Also inspired by:
+ JP Castro's (@jphpsf)
    [DRYing Up Your JavaScript Jasmine Tests With the Data Provider Pattern]
    (http://blog.jphpsf.com/2012/08/30/drying-up-your-javascript-jasmine-tests)
+ Richard Rodger's [mstring](https://github.com/rjrodger/mstring)

install
-------

    npm install where.js
    
    git clone https://github.com/dfkaye/where.js.git
  
important
---------

Including or requiring `where.js` adds a `where()` method to the **global** 
namespace, for example:

    require('where.js');
    assert(typeof where === 'function');
    // => true
    assert(typeof global.where === 'function');
    // => true

    <script src="../where.js"></script>

    ...
    assert(typeof where === 'function');
    // => true
    assert(typeof window.where === 'function');
    // => true
    
justify
-------

Easier to modify this
    
    it('description', function () {
    
      where(function(){/*** 
          a  |  b  |  c
          1  |  2  |  2
          4  |  3  |  4
          6  |  6  |  6
        ***/
        
        expect(a + b)).toBe(c);
      });
      
    });

than this:

    it('description', function () {
    
      [[1, 2, 2],
       [4, 3, 4],
       [6, 6, 6]].forEach(function(row, r, rows) {
               
        expect(Number(row[0]) + Number(row[1])).toBe(Number(row[2]));
      });
      
    });
    
story
-----

Borrowing from Richard Rodger's [mstring](https://github.com/rjrodger/mstring), 
`where()` accepts a function and inspects its string value, converts the triple-
commented data-table into an array of values, uses the labels as variables or 
symbols in a new Function().

Each `where()` clause works best with only one expectation clause at the moment 
(still debating whether it's worth supporting multiple expects in a single 
`where()`).

format
------

Data tables must contain at least two rows, the first row containing symbols to 
be used as variables in the expectation, whereas the remaining rows must contain 
data for each symbol.

For example:

    it('should pass with correct data and expectation', function () {
      where(function(){/***
         a | b | c
         1 | 2 | 2
         4 | 3 | 4
         6 | 6 | 6
        ***/
        expect(Math.max(a, b)).toBe(c);
      });
    });

Tables may also contain left and right borders, similar to Cucumber and Fit:

    it('should pass with left and right table borders', function () {
      where(function(){/***
        | a | b | c |
        | 1 | 2 | 2 |
        | 4 | 3 | 4 |
        | 6 | 6 | 6 |
        ***/
        expect(Math.max(a, b)).toBe(c);
      });
    });

    
Numeric data is automatically coerced to Number type
----------------------------------------------------

Supports `Math.max(a, b)` to avoid re-typing `Math.max(Number(a), Number(b))`.

Everything can use `toBe()` (strict equality) - no need to rely on `toMatch()`.

However, where `Math` is involved there is usually an octal, signed, comma, or 
precision bug waiting.  All but precision are handled automatically; however, 
you can get precision into your tests by adding another column, as seen in the 
test created to verify numeric conversions work:

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
        
      ***/
      
      /* 
       * using precisions for famous .1 + .2 == 0.30000000000000004 
       * and 5.985 vs 5.98499999999999999999999999 bugs 
       */
      var s = (a + b).toPrecision(p) // toPrecision() returns a string
      expect(+s).toBe(c) // but prefixed '+' uses implicit conversion to number.
    });

output
------

A passing `where()` clause has no effect on the usual jasmine output. 

When an expectation fails, the data-table labels plus the row of values for the 
current expectation are added to the *current* failing item. Every failed 
expectation in a `where()` clause will appear similar to:

     [a | b | c] : 
     [1 | 2 | x] (Error: Expected 2 to be 'x'.)

inspect return values
---------------------
results:
values
failing
passing

context:
log
intercept
strategy

strategy:
mocha
jasmine
QUnit
tape

    
# License

MIT