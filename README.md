where.js
========

Data-driven test method for JavaScript frameworks (Jasmine, Mocha, QUnit, and 
Tape).

__[4 FEB 2014 ~ IN PROGRESS ~ ACTUAL DOCUMENTATION]__

__[30 JAN 2014 ~ COMING SOON ~ REALLY]__

# works on my machine

+ travis [![Build Status](https://travis-ci.org/dfkaye/where.js.png?branch=master)](https://travis-ci.org/dfkaye/where.js)

tests
-----

The goal of making where.js run in "any" test framework required making numerous 
versions of test suites.  Here's how they stack up:

+ where.js core functionality tests using jasmine-node
  - `npm test`
  - `node jasmine-node --verbose ./test/where/where.spec.js`

+ framework strategy comparison tests on node.js
  - `npm run jasmine`
  - `npm run mocha`
  - `npm run qunit`
  - `npm run tape`

testem
------

Using Toby Ho's MAGNIFICENT [testemjs](https://github.com/airportyh/testem) to 
drive tests in multiple browsers for jasmine-2.0.0 (requires testem v0.6.3 or 
later) as well as for jasmine-node (which uses jasmine 1.3.1 internally).  

The `testem.json` file defines launchers for the different frameworks for both 
node.js and browser suites:
  - `testem -l where` # the core tests
  - `testem -l jasmine`
  - `testem -l mocha`
  - `testem -l qunit`
  - `testem -l tape` # this runs browserify on the tape suite 

npm testem scripts
------------------

The `package.json` file defines scripts to call the testem launchers (with the 
appropriate browser test page for each):
  - `npm run testem`
  - `npm run testem-jasmine`
  - `npm run testem-mocha`
  - `npm run testem-qunit`
  - `npm run testem-tape`

browser suites
--------------

The `browser-suites` can be viewed as standalone web pages, with no dependency 
on testem.  You can view these pages directly on rawgithub:
  - [core suite](https://rawgithub.com/dfkaye/where.js/master/test/where/browser-suite.html)
  - [jasmine](https://rawgithub.com/dfkaye/where.js/master/test/jasmine/browser-suite.html)
  - [mocha et al.](https://rawgithub.com/dfkaye/where.js/master/test/mocha/browser-suite.html)
  - [qunit with qunit-tap](https://rawgithub.com/dfkaye/where.js/master/test/qunit/browser-suite.html)
  - [tape with browserified source](https://rawgithub.com/dfkaye/where.js/master/test/tape/browser-suite.html)


# ISSUES
+ triple star comments `/***` not (easily) supported in Coffeescript - could 
    convert to `/*`
+ need more sophisticated object-creation examples


# TODO
+ add testling config for tape suite
+ try testling with another test framework?
+ add coffeescript support with a mocha or tape example (resolve /*** vs /*!)

+ README documentation
  + context: test-method-reference, strategy, intercept, log
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




# documentation starts...

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
  
important: global
-----------------

Running `where.js` adds a `where()` method to the **global** namespace:

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

Easier to read and modify this
    
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

than this

    it('description', function () {
    
      [[1, 2, 2],
       [4, 3, 4],
       [6, 6, 6]].forEach(function(row, r, rows) {
               
        expect(Number(row[0]) + Number(row[1])).toBe(Number(row[2]));
      });
      
    });
    
story
-----

where.js replaces both [jasmine-where](https://github.com/dfkaye/jasmine-where) 
and [jasmine-intercept](https://github.com/dfkaye/jasmine-intercept) projects 
which are now _deprecated_.

Borrowing from Richard Rodger's [mstring](https://github.com/rjrodger/mstring), 
`where()` accepts a function and inspects its string value, converts the 
commented data-table into an array of values, and applies the labels as argument 
names in a new Function().

(I'll relate some additional lessons learned from this project down below or 
elsewhere.)

format
------

Similar to Cucumber and Spock, where.js data tables must contain at least two 
rows. The first row must contain the names to be used as variables in the 
expectation. The remaining rows must contain data values for each name.  Values 
must be separated by the pipe | character.

For example, a, b, and c are named as variables in the table, and used in the 
expectation - without having to be defined or var'd:

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

borders
-------

Tables may also optionally contain left and right edge borders, similar to 
Cucumber and Fit:

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

    
Numeric data
------------

_Numeric data is automatically coerced to the `Number` type._

That enables you to type `Math.max(a, b)` to avoid re-typing coercions such as 
`Math.max(Number(a), Number(b))`.

That also means every test can use strict equality, so you don't need to rely 
on matchers.

_However_, where `Math` is involved there is usually an octal, signed, comma, or 
precision bug waiting.  where.js handles all but precision automatically.  You 
can get precision into your tests by adding another column, as seen in the test 
created to verify that numeric conversions work:

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

A passing `where()` test has no effect on the defect test runner reporter 
output.

When an expectation fails, the data-table labels plus the row of values for the 
current expectation are added to the *current* failing item. Every failed 
expectation in a `where()` test will appear similar to:

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