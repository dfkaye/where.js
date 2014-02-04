where.js
========

Data-driven test method for JavaScript frameworks (Jasmine, Mocha, QUnit, and 
Tape).

__[4 FEB 2014 ~ IN PROGRESS ~ ACTUAL DOCUMENTATION]__
__[30 JAN 2014 ~ COMING SOON ~ REALLY]__

# working now

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
+ assert.js for browser - github.com/Jxck/assert
+ qunit-tap ("A TAP Output Producer Plugin for QUnit") for qunit node-suite - github.com/twada/qunit-tap
+ apply qunit-tap in the browser suite with testem?
+ document using qunitjs on node (dist/qunit.js)
+ add testling config for tape suite
+ try testling with another test framework?
+ add dom-console for tape browser suite (browserify tape-bundle)
+ readme
  - table, format (no preprocessor, just fun with Function constructors).
  - context: test-method-reference, strategy, intercept, log
  - examples from jasmine-where readme.
+ strategies
  - jasmine - 1.3.1 and 2.0.0
  - mocha - assert, expect.js, should, chai (assert, expect, should)
  - qunit - qunit-tap, dist/qunit.js
  - tape - @substack's event-driven TDD flavored TAP project for testling
  - how to add a custom strategy
+ vendor dir contains browser versions of mocha, expect.js, assert.js, should, 
    chai, qunit, jasmine-2.0.0
+ version bump
+ npm publish
+ post
+ add coffeescript support with a mocha or tape example

# License

MIT