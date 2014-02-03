where.js
========

data-driven testing for JavaScript frameworks (Jasmine, Mocha, QUnit, & Tape).

__[30 JAN 2014 ~ COMING SOON ~ REALLY]__

# working now

+ travis [![Build Status](https://travis-ci.org/dfkaye/where.js.png)](https://travis-ci.org/dfkaye/where.js)

+ functionality tests using jasmine
- npm test 
- node test/where/where.spec.js

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
+ document qunit-tap for qunit node-suite
+ add testling config for tape suite
+ 
+ readme
  - jasmine - 1.3.1 and 2.0.0
  - mocha - assert, expect.js, should, chai (assert, expect, should)
  - qunit - qunit-tap, dist/qunit.js
  - tape - @substack's event-driven TDD flavored TAP project for testling
  - table, format (no preprocessor, just fun with Function constructors).
  - context: test-method-reference, strategy, intercept, log, 
  - for frameworks not covered, how to add a testrunner strategy
+ version bump
+ npm publish
+ post

# License

MIT