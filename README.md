[![Build Status](https://travis-ci.org/dfkaye/where.js.png?branch=master)](https://travis-ci.org/dfkaye/where.js)

# where.js

Provides data-table support in JavaScript tests.

Mostly ready for prime time, though still some things [to do](#TODO).

## inspired by:
+ Cucumber [`scenario-outlines`](https://github.com/cucumber/cucumber/wiki/Scenario-Outlines)
+ Spock [`where:` blocks](https://code.google.com/p/spock/wiki/SpockBasics#Where_Blocks)
+ JP Castro's (@jphpsf)[DRYing Up Your JavaScript Jasmine Tests With the Data Provider Pattern](http://blog.jphpsf.com/2012/08/30/drying-up-your-javascript-jasmine-tests)
+ Richard Rodger's (@rjrodger) [mstring](https://github.com/rjrodger/mstring)

## see also
+ [data-driven](https://github.com/fluentsoftware/data-driven), an extension for 
  mocha.js

## contributors

+ [Johann Sonntagbauer](https://github.com/johann-sonntagbauer)
+ [Jason Karns](https://github.com/jasonkarns)
+ [Jamon Holmgren](https://github.com/jamonholmgren)
+ [Casey Watson](https://github.com/watsoncj)

## license

JSON

## libraries tested and supported so far
+ [jasmine](http://jasmine.github.io/) (v2.0.0 on browser)
  - [jasmine-node](https://github.com/mhevery/jasmine-node) which uses v1.3.1
+ [mocha](http://visionmedia.github.io/mocha/)
  - `assert` (on node.js) and [assert.js](https://github.com/Jxck/assert) in the
    browser
  - [expect.js](https://github.com/LearnBoost/expect.js)
  - [should.js](https://github.com/visionmedia/should.js)
  - [chai](http://chaijs.com/) (assert, expect, should)
+ [nodeunit](https://github.com/caolan/nodeunit)
+ [QUnit](http://qunitjs.com/)
+ [tape](https://github.com/substack/tape) @substack's event-driven TDD-flavored 
  TAP project for [testling](http://ci.testling.com/)

## works on my machine...

See the [tests](#tests)...
  
## install

    npm install where.js
    
or

    git clone https://github.com/dfkaye/where.js.git
  
## important: global assignment

Running `where.js` adds a `where()` method to the **global** namespace - 
([__here's why__](https://gist.github.com/dfkaye/9129150), if you're curious...)

node.js:

    require('where.js');
    
    assert(typeof where === 'function');
    // => true
    assert(typeof global.where === 'function');
    // => true

browsers:

    <script src="[path/to]/where.js"></script>

    assert(typeof where === 'function');
    // => true
    assert(typeof window.where === 'function');
    // => true
    

# justify

Easier to read and modify this
    
    it('description', function () {
      where(function(){
        /*** 
          a  |  b  |  c
          1  |  2  |  3
          4  |  3  |  7
          6  |  6  |  12
        ***/
        expect(a + b).toBe(c);
      });
    });

than this

    it('description', function () {
      [[1, 2, 3],
       [4, 3, 7],
       [6, 6, 12]].forEach(function(row, r, rows) {
               
        expect(Number(row[0]) + Number(row[1])).toBe(Number(row[2]));
      });
    });
    
where.js merges methods and lessons learned from my earlier 
[jasmine-where](https://github.com/dfkaye/jasmine-where) 
and [jasmine-intercept](https://github.com/dfkaye/jasmine-intercept) projects, 
which are now __deprecated__ as of this release.


## where(fn, context) ~ arguments

### {Function} fn

In imitation of Richard Rodger's [mstring](https://github.com/rjrodger/mstring), 
`where()` accepts a function and inspects its string value, converts the 
commented data-table into an array of values, and applies the first row data as 
argument names in a new Function().

The function's body should contain an expectation or assertion statement.

If your JavaScript runtime supports ES65 strict mode, an undeclared variable in 
the function body will result in an error.

### {Object} context

`where()` accepts a second argument, an context specifier, that allows you to 
inject other information or references into the test function, namely any 
references to your test library (jasmine, QUnit, etc.) and methods, variables 
that are defined outside of the current test (in setup or before calls, for 
example), and flags for logging or intercepting results to the console.

See more details about the [`context`](#context) argument.

## multi-line comments

A data table inside a where() function should be enclosed between start `/***` 
and end `***/` 3-asterisk comments.

      where(function(){
        /***        // start
         a | b | c
         1 | 2 | 2
         4 | 3 | 4
         6 | 6 | 6
        ***/        // end
        
        expect(Math.max(a, b)).toBe(c);
      });

__aside__ where.js is a *testing* module and is not intended to be run through a 
pre-production minifer such as google closure or uglify, both of which remove 
the comments.

### CoffeeScript comments

If you're writing tests in CoffeeScript, see the 
[CoffeeScript format](#coffeescript-format) section for slightly different 
syntax (though more aesthetically appealing, I must admit). 


## row format

Similar to Cucumber and Spock, where.js data tables must contain at least two 
rows. The first row must contain the names to be used as variables in the 
expectation. The remaining rows must contain data values for each name.  Values 
must be separated by the pipe | character.

For example, `a`, `b`, and `c` are named as variables in the table, and used in 
the expectation - without having to be declared explicitly with the `var` 
keyword.

    it('should pass with correct data and expectation', function () {
      where(function(){
        /***
         a | b | c
         1 | 2 | 2
         4 | 3 | 4
         6 | 6 | 6
        ***/
        
        expect(Math.max(a, b)).toBe(c);
      });
    });

    
## borders

Tables may also optionally contain left and right edge borders, similar to 
Cucumber and Fit:

    it('should pass with left and right table borders', function () {
      where(function(){
        /***
        | a | b | c |
        | 1 | 2 | 2 |
        | 4 | 3 | 4 |
        | 6 | 6 | 6 |
        ***/
        expect(Math.max(a, b)).toBe(c);
      });
    });

For empty cells, borders are required.

## line comments

Table rows may contain line comments.

      where(function(){
        /***
        | a | b | c |
        | 1 | 2 | 2 |  // should pass
        | 4 | 3 | x |  // should fail
        ***/
        expect(Math.max(a, b)).toBe(c);
      });
      
A commented row is ignored.

      where(function(){
        /***
          | a | b | c |
          | 1 | 2 | 2 | // should pass
        //| 4 | 3 | x | (should not execute)
        ***/
        expect(Math.max(a, b)).toBe(c);
      });

## string data vs. empty data

### data with quoted strings are preserved

    it('should handle quoted strings', function () {
      where(function () {
        /***
          a  | b  | c    | d    | e   | f        | g           | h | normal 
          '' | "" | "''" | '""' | ' ' | ' faff ' | 'undefined' |   |   a b   
          ***/
        expect(a).toBe('\'\'');
        expect(b).toBe('\"\"');
        expect(c).toBe('\"\'\'\"');
        expect(d).toBe('\'"\"\'');
        expect(e).toBe('\' \'');
        expect(f).toBe('\' faff \'');
        expect(g).toBe('\'undefined\'');
        expect(h).toBe('');         // empty boxes are empty strings
        expect(normal).toBe('a b'); // unquoted values are strings
      });
    });
    
### *empty* data should be delimited with separators:

      it('should throw when empty data missing separators', function() {
        expect(function() {
          where(function() {
            /***
             a 
                // interpreted as missing row, not as row with empty data
            ***/
            expect(a).toBe('');
          });
        }).toThrow();
      });
      
      it('should not throw when empty data is separated', function() {
        where(function() {
          /***
          | a |
          |   | // interpreted as row with empty data
          ***/
          expect(a).toBe('');
        });
      });
      
## numeric data vs numeric string

### numeric data is automatically converted to the `Number` type

That enables you to type `Math.max(a, b)` to avoid re-typing coercions such as 
`Math.max(Number(a), Number(b))`.

That also means every test can use strict equality, so you don't need to rely 
on regular expression matchers when getting started.

_However_, where `Math` is involved there is usually an octal, signed, comma, or 
precision bug waiting.  where.js handles all but precision automatically.  You 
can get precision into your tests by adding another column, as seen in the test 
created to verify that numeric conversions work:

      where(function(){
      
        /***
          a        | b      | c       | p
              
          0        | 1      | 1       | 1
          0.0      | 1.0    | 1       | 1
          -1       | +1     | 0       | 1
          +1.1     | -1.2   | -0.1    | 2
          08       | 08     | 16      | 2
          6        | 4      | 10.0    | 3
          8.030    | -2.045 | 5.985   | 4
          1,000.67 | 1345   | 2345.67 | 6
          5        | 5      | 10      | 1
          ***/
        
        /*
         * using precision for famous .1 + .2 == 0.30000000000000004 
         * and 5.985 vs 5.98499999999999999999999999 bugs 
         */
 
        var s = (a + b).toPrecision(p);
        
        /*
         * toPrecision() returns a string, so the prefixed '+' uses implicit 
         * conversion to number.
         */
         
        expect(+s).toBe(c);
      });

### numeric strings are preserved

      where(function () {
        /***
          date        | dataString   | number | numberString
          1973-01-01  | '2014-01-01' | 2      | '4'
          ***/
        expect(date).toBe('1973-01-01');
        expect(dataString).toBe('\'2014-01-01\'');
        expect(number).toBe(2);
        expect(numberString).toBe('\'4\'');
      });
      
      
## null, undefined, boolean values

Truthy/falsy values are also automatically converted as per this test:

      where(function () {
        /***
          a    | b         | c     | d
          null | undefined | false | true
        ***/
        
        expect(a).toBe(null);
        expect(b).toBe(undefined);
        expect(c).toBe(false);
        expect(d).toBe(true);
      });

      
## output

A passing `where()` test has no effect on the test runner's default reporter 
output.

When an expectation fails, the data-table labels plus the row of values for the 
current expectation are added to the *current* failing item. Every failed 
expectation in a `where()` test will appear similar to:

    [a | b | c] : 
    [1 | 2 | x] (Error: Expected 2 to be 'x'.)

    
## results

`where()` returns a `results` object with arrays for `labels` and `values` 
derived from the data table, `passing` tests, and `failing` tests.

The following snip shows how to refer to each array in the results:

    it('should pass with correct data and expectation', function () {
      var results = where(function(){
        /***
         a | b | c
         1 | 2 | 2
         4 | 3 | 4
         6 | 6 | 6
        ***/
        expect(Math.max(a, b)).toBe(c);
      });
      
      expect(results.data.labels.join(',')).toBe("a,b,c");
      expect(results.data.values.length).toBe(3);
      expect(results.passing.length).toBe(3);
      expect(results.failing.length).toBe(0);
    });

## context specifier

__THIS IS THE CRITICAL "LIBRARY-AGNOSTIC" PIECE OF THE PUZZLE.__

`where()` accepts up to two arguments. The first is the function containing the 
data table and assertions.  

The second, optional but _recommended_, argument is a `context` or configuration 
object that allows you to specify the test strategy (or library) in use, and 
pass non-global items to the test function (a library's assert or expect or test 
method, e.g.).

The following snip shows that `context` is itself made available for inspection 
inside the test function:

      where(function(){
        /***
         a | b | c
         0 | 0 | 0
        ***/
        
        expect(context.expect).toBe(expect);
        
      }, { expect: expect }); // <= context

### log
     
Normal logging occurs mainly with failing tests. You can set a nonce property on 
the context specifier as `log: 1` to enable logging of *all* test output to the 
console.

      where(function(){
        /***
         a | b | c
         1 | 2 | 2
         4 | 3 | 4
         6 | 6 | 6
        ***/
        expect(Math.max(a, b)).toBe(c);
        
      }, { log: 1, expect: expect });
      
Failed tests or errors will appear as

    [a | b | c] : 
    [1 | 2 | x] (Error: Expected 2 to be 'x'.)
     
Passing tests will appear as

    [a | b | c] : 
    [1 | 2 | 2] (Passed)
     

### intercept

Not all test libraries support "fail" in the same way - that is, while some 
tests "should" fail, a library may report the test as failed even though the 
failure is expected.  To prevent expected failures from appearing *as failed* in 
a test library's reporter (make a fail into a pass), you can set a nonce 
property on the context specifier as `intercept: 1` and verify the number of 
expected failures in the results returned by `where()`:

      var results = where(function(){
        /***
         a | b | c
         1 | 2 | 2
         4 | 3 | x
         6 | 6 | 6
        ***/
        expect(Math.max(a, b)).toBe(c);
        
      }, { intercept: 1, expect: expect });
      
      expect(results.data.labels.join(',')).toBe("a,b,c");
      expect(results.data.values.length).toBe(3);
      expect(results.passing.length).toBe(2);
      expect(results.failing.length).toBe(1);
      

__ISSUE__: In logging-event-based libraries like QUnit and tape, pure 
interception is not always successful - an assertion that fails inside a `where` 
clause will almost always be reported as failed. This behavior will be visited 
more thoroughly in the refactoring of the `strategy` API (see next section...).


### strategy

where.js comes with several strategies pre-defined for each testing library 
supported initially.  The default strategy is a basic try+catch used by mocha. 
__You do not need to specify a strategy when using mocha.__ 

A strategy can be specified in one of two ways:

+ use `{ strategy: '<quoted-name>' }` 
  - if the name is available as a global variable (this is true for jasmine)
  - if you do not need a reference to that object (that is true for nodeunit).
+ use `{ <name>: <named-object-reference> }` 
  - when the name is not a global, *and/or...* 
  - when your strategy needs a reference to the object (this is true for QUnit 
    and for tape).

#### mocha (default)

The default strategy is a basic try+catch used by mocha. __You do not need to 
specify a strategy when using mocha.__ 

+ `{ strategy: 'mocha' }`
+ `{ mocha: mocha }` (use this when `mocha` is defined elsewhere in your tests 
    and you wish to use it within the test function itself)

However, unless you are using `should.js`, you must specify which assertion 
method your test relies on:

+ `{ expect: expect }`
+ `{ assert: assert }`
+ `{ expect: chai.expect }`
+ `{ assert: chai.assert }`

(Both mocha's should.js and chai's should.js add a `should` method to 
`Object.prototype`, brilliantly making every object assertable - except those, 
not surprisingly, created by the `Object.create()` method.)

The mocha `assert` browser tests in this repo rely on 
[assert.js](http://github.com/Jxck/assert), "a port of the Node.js standard 
assertion library for the browser."

#### jasmine

To use the jasmine strategy, add the following to your node suite:

    require('[path/to/]/strategy/jasmine-strategy.js');
  
Because jasmine also uses a try+catch approach, you do not need to specify 
jasmine as the test strategy.  However, it is *recommended if you want to 
intercept failing test messages*:

+ `{ strategy: 'jasmine' }` when jasmine is defined globally (node, browsers)
+ `{ jasmine: jasmine }` when you need to use jasmine within the where function.

#### nodeunit

To use the nodeunit strategy, add the following to your node suite:

    require('[path/to/]/strategy/nodeunit-strategy.js');
  
The nodeunit strategy does not use a reference to the nodeunit object, so you 
need only use the strategy string approach in your tests:

    { strategy: 'nodeunit' }
    
When you need to use nodeunit within the where() function specify nodeunit with:

    { nodeunit: nodeunit }


#### QUnit

To use the QUnit strategy, add the following to your node suite:

    require('[path/to/]/strategy/qunit-strategy.js');
    
When using QUnit, specify the QUnit strategy as follows:

+ `{ QUnit: QUnit }` (QUnit is defined globally in both node and browsers)

The QUnit tests in this repo rely on 
[qunit-tap](//https://github.com/twada/qunit-tap), "A TAP Output Producer Plugin 
for QUnit."

#### tape

To use the tape strategy, add the following to your node suite:

    require('[path/to/]/strategy/tape-strategy.js');
    
For use with tape, specify the tape strategy as follows:

+ `{ tape: [test | t] }` 

where `test` or `t` refers to the test function passed in to each tape test:

    var test = require('tape');

    test('should pass tape context', function(t) { // t is test, test is tape...
          
      var results = where(function(){
        /***
        | a | b | c |
        | 0 | 0 | 0 |
        ***/
        
        // use the context reference to 'tape' to test itself
        tape.equal(tape, context.tape, 'should find tape');

      }, { tape: t });  // <= context
      
      t.equal(results.passing.length, 1);
      t.end();
    });

    
A copy of my [dom-console](https://github.com/dfkaye/dom-console) library is 
included in the browser suite for tape, and can be found in the 
[test/util](/test/util) folder. The dom-console merely writes `console.log()` 
statements to a list in the DOM.


### custom strategy 

You can define your own strategy for a different library than those supported by 
where.js. 

+ call `where.strategy(name, fn);`
  + `name` is the name of your target test runner (not the expectation library).
  + `fn` is an initializer or seed function that should return another function 
    ~ which in turn is to be called on each row of where-data.
    
The following boilerplate shows how to do this.

    where.strategy(name, function nameStrategy(context) {
    
      // vars and references
      
      return function nameTest(fnTest, test, value) {
        
        // pre-process blocks here
        
        fnTest.apply({}, [context].concat(value));
        
        // post-process
        
        if (error) {
          test.result = 'there was an error';
        }
      };
    });

The 'nameStrategy' function is the initializer, and accepts a `context` argument 
that refers to the context specifier object in where() calls.

The returned 'nameTest' function should accept these three parameters:

+ `fnTest`, the wrapped test function that executes once per each 
  row of where-data
+ `test`, the current test iteration, for collecting results
+ `values`, an array containing the labels used as variables in each test

The post-process block is where to capture failing results and add them to the 
`test` object's `.result` property.

Beyond this, it's best to look at the various strategy implementations to see 
which approach would suit your needs.  These are located in the 
[strategy](./strategy) directory.


## CoffeeScript format

As of Jan 2014, the 3-asterisk comment sequences and line comments are the only 
items not directly translatable to CoffeeScript.  

### embedded table with backticks

One workaround is to use CoffeeScript's mechanism for 
[embedded JavaScript](http://coffeescript.org/#embedded) by placing backtick 
( \` ) characters before the start `/***` and after the end `***/` comment
sequences.

      where ->
      
        `/***
        
         a | b | c
         1 | 2 | 2
         4 | 3 | 4
         6 | 6 | 6
         
        ***/`
        
        expect(Math.max(a, b)).toBe c
      
### triple quote comments

You can also use the triple-quote multi-line string supported by CoffeeScript. 

    where ->
      """
      a | b | c
      1 | 2 | 3
      4 | 5 | 9
      """
      expect(a + b).toBe(c)
      
which compiles to

    where(function() {
      "a | b | c\n1 | 2 | 3\n4 | 5 | 9";
      return expect(a + b).toBe(c);
    });
 
*__Thanks to [Jason Karns](https://github.com/jasonkarns)__, for this 
suggestion* ~ this is a nicer approach.
    
To intercept expected failures (using jasmine in this case), this CoffeeScript:

       results = where ->
         """
         a | b | c
         1 | 2 | 3
         4 | 5 | 6
         """
         expect(a + b).toBe(c)
               
       , { jasmine: jasmine, expect: expect, intercept: 1 }
       
       expect(results.failing.length).toBe(1)
       expect(results.passing.length).toBe(1)

compiles to:

      var results;

      results = where(function() {
        "a | b | c\n1 | 2 | 3\n4 | 5 | 6";
        return expect(a + b).toBe(c);
      }, {
        jasmine: jasmine,
        expect: expect,
        intercept: 1
      });

      expect(results.failing.length).toBe(1);

      expect(results.passing.length).toBe(1);

which is good enough for now.

### line comments

Line comments inside the multi-line comment are not removed by the CoffeeScript 
compiler, but `where()` will parse for this situation.

In other words, this Coffeescript:

      where ->
        """
        a | b | c
      # 1 | 2 | 3 # should be removed
        4 | 5 | 9
        """
        expect(a + b).toBe(c)
        
compiles to

      where(function() {
      
        "a | b | c\n# 1 | 2 | 3 # should be removed\n4 | 5 | 9";
        
        return expect(a + b).toBe(c);
      });
      
and `where()` will replace the characters from `#` to `\n` to:

    "a | b | c\n 4 | 5 | 9";

      
## tests

The goal of making where.js run in "any" test framework required making numerous 
versions of test suites.  Here's how they stack up:

+ where.js core functionality tests using jasmine-node
  - `npm test`
  - `node jasmine-node --verbose ./test/where/where.spec.js`

+ framework strategy comparison tests on node.js
  - `npm run jasmine`
  - `npm run mocha`
  - `npm run nodeunit`
  - `npm run qunit`
  - `npm run tape`

### testem

I'm using Toby Ho's (@airportyh) MAGNIFICENT 
[testem](https://github.com/airportyh/testem) to drive tests in node.js and in 
multiple browsers.

The core tests use 
[jasmine-2.0.0](http://jasmine.github.io/2.0/introduction.html) (which requires 
testem v0.6.3 or later) in browsers, and Misko Hevery's (@mhevery)
[jasmine-node](https://github.com/mhevery/jasmine-node) (which uses jasmine 
1.3.1 internally) on node.js.

The `testem.json` file defines launchers for the different frameworks for both 
node.js and browser suites:

+ `testem -l where` (core tests using jasmine)
+ `testem -l jasmine` 
+ `testem -l mocha`
+ `testem -l nodeunit`
+ `testem -l qunit`
+ `testem -l tape` (runs browserify on the tape suite)

### npm testem scripts

The `package.json` file defines scripts to call the testem launchers (with the 
appropriate browser test page for each):

+ `npm run testem` (core tests using jasmine)
+ `npm run testem-jasmine`
+ `npm run testem-mocha`
+ `npm run testem-nodeunit`
+ `npm run testem-qunit`
+ `npm run testem-tape`

### browser suites (and rawgit)

The `browser-suites` rely on browser versions of each library stored in the 
[vendor](./vendor) directory (mocha, expect.js, assert.js, should, 
chai, qunit, qunit-tap, and jasmine-2.0.0), rather than your system's `/testem` 
directory, so they can be viewed as static pages.  

You can view them directly on rawgit:

+ [core suite](https://rawgit.com/dfkaye/where.js/master/test/where/browser-suite.html)
+ [jasmine](https://rawgit.com/dfkaye/where.js/master/test/jasmine/browser-suite.html)
+ [mocha et al.](https://rawgit.com/dfkaye/where.js/master/test/mocha/browser-suite.html)
+ [nodeunit](https://rawgit.com/dfkaye/where.js/master/test/nodeunit/browser-suite.html)
+ [QUnit with qunit-tap](https://rawgit.com/dfkaye/where.js/master/test/qunit/browser-suite.html)
+ [tape with browserified source](https://rawgit.com/dfkaye/where.js/master/test/tape/browser-suite.html)


### custom adapter for nodeunit with testem

Adding a custom adapter for nodeunit to work in testem took half a day to get 
completely wrong, then a second half-day to get correct. The file is at 
[vendor/testem/nodeunit-adapter.js](./vendor/testem/nodeunit-adapter.js)


## conclusions so far  

I started with jasmine-where back when (October 2013) as a self-assessment and 
found both v1.3.1 and v2.0.0-rc3 were a bit tricky but not difficult to 
intercept.  With jasmine 2.0.0 (first stable in late December) a fundamental 
feature was no longer exposed (the currentSpec) which led to - shockingly - 
simplifying my own jasmine-where and jasmine-intercept projects.  Thinking I was 
just not that great at this anymore, I took on the whole `where.js` concept in 
January 2014 to invalidate that bit of self-doubt in a hurry.

__what I found out__

Test libraries make assumptions.  Not all test libraries are designed with the 
same "lifecycle" in mind, meaning they do not expose hooks at identical stages. 
When adding message interception support, I found in more than one case that 
there is no 'after-test-but-before-result' hook that would allow me to scrub 
expected failures from the reporter.  

That indicates some library output reporters are tightly coupled with their test 
runners.  *Which means some libraries themselves may not benefit from their own 
stated purpose - to ease test-driven development.*

In addition, not all *browsers* handle the test lifecycle the same way.  This 
was not a surprise so much as annoyance.  For example, in the QUnit suite, IE, 
Chrome and Opera report two failures whereas Firefox reports only one.  However, 
these failures are expected so we really want to see NO failures because we're 
trying to intercept them before QUnit sends them to the reporter.  QUnit also 
reported the failures *first* in the console, regardless of their occurrence in 
the test suite.  (That could be a side-effect of using qunit-tap, however.)

QUnit was surprisingly easy to hook *some* information, but impossible to trap 
completely.  You can force a failing result in QUnit with this:

    QUnit.push(false, 'actual', 'expected', 'force fail message');
    
But QUnit's legacy lifecycle doesn't expose a way for testers to intercept 
messages to the HTML reporter (which is just visual rather than logical 
inspection anyway).  So I recommend using it with another reporting utility like 
qunit-tap so that you can ignore the "should fail" results in the HTML reporter. 

Same goes for Tape except that there is no HTML reporter for it, as it is a test 
library for node.js projects.  To run tape in the browser, you need 
[browserify](http://browserify.org/). That's a minor benefit if you prefer the 
terse syntax of tape. If your emphasis is on browser capabilities rather than 
node.js, tape should not be your first choice.

Mocha was even easier to work with, probably due to TJ's (@tjholowaychuk) early 
decision to de-couple the assertion system completely from the test runner and 
reporter.  Taking assert, expect and should to the browser required only one 
library to be ported - assert.js.  Working with chai was even easier - no port 
needed for the browser. 

The browser version that ships with nodeunit is based on an earlier version of 
that library.  After trying the `make` command on it in my Windows setup and 
finding yet again that some people just can't be bothered to test anything on 
Windows, I've updated the key methods with the proper versions in the core 
library.  That's in the [vendor/nodeunit](./vendor/nodeunit) directory.


## TODO

+ clean up the procedural long-method setup code in the where() function
+ clean up the procedural verbose documentation
