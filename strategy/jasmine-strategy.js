// STRATEGY for JASMINE ~ I once respected thee.
// requires context argument with strategy defined as { jasmine: jasmine }
where.strategy('jasmine', function jasmineStrategy(context) {

  // ! enforce { jasmine: jasmine } convention in context !
  var jasmine = context.jasmine;
  
  var currentSpec = /* jasmine 1.x.x. */ jasmine.getEnv().currentSpec || 
                    /* jasmine 2.x.x. */ { result : { } };
  var result = /* jasmine 1.x.x. */ currentSpec.results_ ||
               /* jasmine 2.x.x. */ currentSpec.result;
  
  return function testJasmine(fnTest, test, value) {
  
    /*overwrite result api (temporarily)...*/
    
    /* jasmine 1.x.x. */
    var addResult = result.addResult;
    addResult && (result.addResult = function (data) {
    
      if (!data.passed_) {
      
        /* 
         * johann sonntagbauer fix 15 MAR 2015
         * the strategy will be called initial with test.result = 'Passed' 
         * therefore reset the test result
         */
         
        if (test.result === 'Passed') {
          test.result = '';
        }
        
        test.result += data.trace + ' ';
        
      } else {
        addResult.call(result, data);
      }
    });
    
    /* jasmine 2.x.x. */
    var addExpectationResult = jasmine.Spec.prototype.addExpectationResult;
    addExpectationResult && 
    (jasmine.Spec.prototype.addExpectationResult = function (passed, data) {

      if (!passed) {
      
        /* 
         * johann sonntagbauer fix 15 MAR 2015
         * the strategy will be called initial with test.result = 'Passed' 
         * therefore reset the test result
         */
         
        if (test.result === 'Passed') {
          test.result = '';
        }
        
        // simply append error messages
        test.result += data.message + ' ';

      } else {
        addExpectationResult.call(result, passed, data);
      }          
    });
    
    /* execute on currentSpec for jasmine 1.x.x */
    try {
      fnTest.apply(currentSpec, [context].concat(value));
    }
    finally {
      /* restore result api */

      /* jasmine 1.x.x. */
      addResult && (result.addResult = addResult);

      /* jasmine 2.x.x. */
      addExpectationResult &&
      (jasmine.Spec.prototype.addExpectationResult = addExpectationResult);
    }
  };        
});