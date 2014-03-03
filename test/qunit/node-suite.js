
// qunit/node-suite.js

/*Owner@OWNER-PC /c/projects/where-sandbox
$ node test/qunit-suite.js
*/

// qunit-tap + qunitjs

var util = require('util'),
    QUnit = require('qunitjs'),
    qunitTap = require('qunit-tap');
    
/*
QUnit.config. options:
  initialCount
  showExpectationOnFailure
  showTestNameOnFailure
  showModuleNameOnFailure
  showSourceOnFailure
  requireExpects - If true, QUnit-TAP prints expected assertion count
  updateRate
 */

var tap = qunitTap(QUnit, util.puts);
tap.config.showExpectationOnFailure = 1;
tap.config.showTestNameOnFailure = 0;
tap.config.showModuleNameOnFailure = 0;
tap.config.showSourceOnFailure = 0; // this turns off the noisy stack trace

/*
 * explicit init() and start() calls needed on node.js
 */
QUnit.init();
require('./qunit-tests');
QUnit.start();
