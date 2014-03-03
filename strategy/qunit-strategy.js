  // STRATEGY for QUnit ~ surprisingly not bad! however, complete interception 
  // of expected failures is not possible in the HTML Reporter as currently 
  // implemented (QUnit v1.13 as of this writing 12-FEB-2014.
  //
  // requires context argument with strategy defined as { QUnit: QUnit }
  
  where.strategy('QUnit', function qunitStrategy(context) {
    
    // this code reminds me of java for some reason...
    var QUnit = context.QUnit;
    var test;
    var realPush;
    var interceptingPush;
        
    if (context.intercept) {
      
      /*
       * this block attempts to capture failing assertions, reset them to 
       * passing (i.e., they are expected to fail), and push them to QUnit's 
       * assertions list with the real 'push()' method.
       */
       
      interceptingPush = function overridingAssertionsPush(details) {
        if (!details.result) {
          details.result = !details.result;
        }
        realPush.call(QUnit.config.current.assertions, details);
      };
      
      // override on start
      QUnit.testStart(function(detail) {
        realPush = QUnit.config.current.assertions.push;
        QUnit.config.current.assertions.push = interceptingPush;
      });
    
      // undo override on done
      QUnit.testDone(function(detail) {
        QUnit.config.current.assertions.push = realPush;
      });
    }

    QUnit.log(function onResult(details) {
      if (!details.result) {
        
        // overwrite default result with non-passing result detail
        test.result = 'Error: expected ' + details.actual + ' to be ' + 
                      details.expected;
                      
        if (!context.intercept) {
          // this adds the QUnit sourceFromStacktrace() output
          test.result = test.result + '\n' + details.source;
        }
      }
    });
    
    return function testQUnit(fnTest, thisTest, value) {
    
      test = thisTest;

      fnTest.apply({}, [context].concat(value));
    };
  });