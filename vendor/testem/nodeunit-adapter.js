// /vendor/testem/nodeunit-adapter.js
// david kaye
// 27 FEB 2014
// part of where.js custom strategy exercis
//
// modified from 
// https://github.com/airportyh/testem/tree/master/examples/customAdapter.js
//================
// The interface for an adapter is simply a function that takes
// a [Socket.IO](http://socket.io/) socket. When test events
// `tests-start`, `test-result`, `all-test-results` come in,
// the adapter is responsible for sending these events to the socket.
//================

function nodeunitAdapter(socket) {

  // nodeunit.run() is called from the browser suite to kick things off.
  // nodeunit.run() calls nodeunit.runModules(). 
  // We intercept runModules() here and populate the real options object with 
  // callbacks for each event we care about in the lifecyle.
  
  var runModules = nodeunit.runModules;
  nodeunit.runModules = function (modules, options) {

    // restore control first
    nodeunit.runModules = runModules;
    
    // options could be nothing so add a no-op facade for the API events we'll 
    // intercept
    function empty() {}    
    options || (options = {});
    
    // hold on to the handlers for each lifecycle event which we'll intercept.
    var moduleStart = options.moduleStart || empty;
    var testDone = options.testDone || empty;
    var done = options.done || empty;
    
    var allResults = {
      failed: 0,
      passed: 0,
      total: 0,
      tests: []
    };
    
    // intercept for suite start
    // this is a no-op in nodeunit - leave this here in case that changes
    options.moduleStart = function (name) {
    
      // tell nodeunit first
      moduleStart.call(options, name);
    };
    
    // this is the heart of it. intercept calls to testDone() and populate test 
    // results with Testem-specific details.
    options.testDone = function (name, assertions) {
      
      // tell nodeunit first
      testDone.call(options, name, assertions);
      
      var testResult = {
        name: name,
        passed: 0,
        failed: 0,
        total: 1,
        items: []
      };

      for (var i = 0, result, error, message; i < assertions.length; ++i) {
      
        testResult.total++;
        allResults.total++;        

        result = assertions[i]; 
        error = result.error;
        
        if (error) {
        
          message = error.message || result.message;
          testResult.failed++;
          allResults.failed++;
          
          testResult.items.push({
            passed: false,
            message: message,
            stack: error.stack || undefined
          });
          
        } else {
        
          testResult.passed++;
          allResults.passed++;     
        }
      }

      allResults.tests.push(testResult);
      
      // report result to Testem
      socket.emit('test-result', testResult);
    };

    // intercept done for all tests
    options.done = function (assertions) {
    
      // tell nodeunit first
      done.call(options, assertions);
      
      // report all results to Testem
      socket.emit('all-test-results', allResults);
    };
    
    // tell Testem we're under way
    socket.emit('tests-start');
    
    // tell nodeunit we're under way...
    runModules(modules, options);
  };
}

// Tell Testem to use your adapter
Testem.useCustomAdapter(nodeunitAdapter);