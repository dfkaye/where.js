// nodeunit node suite

require('../../where.js');
require('../../strategy/nodeunit-strategy.js');

var reporter = require('nodeunit').reporters.minimal;

// nice surprise - run() expects pathnames to test files
reporter.run(['./test/nodeunit/fix-tests.js', './test/nodeunit/where-tests.js']);
