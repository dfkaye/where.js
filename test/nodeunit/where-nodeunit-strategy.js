// where-nodeunit-strategy.js
// where.js/strategy/nodeunit.js
// STRATEGY for nodeunit ~ turned out to be really simple
// which means @caolan knew what he was doing.
//
// specify 'nodeunit' and test: { strategy: 'nodeunit', test: test }, 
// and use test inside where(fn(){ test.ok...});
// ...
where.strategy('nodeunit', function nodeunitStrategy(context) {
  
  return function nodeunitTest(fnTest, test, value) {
  
    fnTest.apply({}, [context].concat(value));
    
    // get the assertion list from the nodeunit test function and find error 
    // if any, update where's test.result...
    
    var last = context.test._assertion_list.slice(-1);   
    var error = last[0].error;
    
    if (error) {
      test.result = 'Error: expected ' + error.actual + ' to be ' + 
                    error.expected;
    }
  };
});

 