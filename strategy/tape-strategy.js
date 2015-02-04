// STRATEGY for TAPE ~ bit less elegant than QUnit, but less verbose (possible 
// contraction?). tape's event-driven reporting allows us to turn off the 
// the default test reports so that expected failures are not reported as 
// failed.  James' (@substack) foresight in using each tape/test function as 
// an event emitter AND using the 'result' event handler as a pre-reporting 
// processor.
//
// requires context argument with strategy defined as { tape: test | t } where
// [test | t] is the current test (or t) method

where.strategy('tape', function tapeStrategy(context) {

  var tape = context.tape;
  
  return function testTape(fnTest, test, value) {
  
    var listeners;
    
    // turn off tape's automatic reporting (pass/fail counts) 
    if (context.intercept) {
      listeners = tape._events['result'];
      tape.removeAllListeners('result');        
    }
    
    tape.on('result', function onResult(result) {
      if (!result.ok) {
      
        /* 
         * johann sonntagbauer fix 15 MAR 2015
         * the strategy will be called initial with test.result = 'Passed' 
         * therefore reset the test result
         */
         
        if (test.result === 'Passed') {
          test.result = 'Error: ' + result.name;
        }

        test.result += ': expected ' + result.actual + ' to ' + 
                       result.operator + ' ' + result.expected;
      }
      tape.removeListener('result', onResult);
    });
    
    fnTest.apply({}, [context].concat(value));
    
    // restore tape's result reporting
    if (context.intercept) {
      for (var i = 0; i < listeners.length; ++i) {
        tape.on('result', listeners[i]);
      }
    }      
  };
});