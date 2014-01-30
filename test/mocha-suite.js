
// run mocha programmatically
// https://github.com/itaylor/qunit-mocha-ui

// mocha has 148 contributors as of 30 JAN 2014 v 1.17.1

//Load mocha
var Mocha = require("mocha");
//Tell mocha to use the interface.
var mocha = new Mocha({ui:"bdd", reporter:"tap"});
//Add your test files
mocha.addFile("./test/mocha-tests.js");
//Run your tests
mocha.run(function(failures){
  process.exit(failures);
});
