/**
 * @name where.js
 * @author david kaye (@dfkaye)
 * @date 31 JAN 2014
 * @license MIT
 *
 * where.js enables data-driven testing with JavaScript test runners such as 
 * Mocha, Jasmine, QUnit and Tape in node.js and browser environments.
 *
 * WARNING: where() is a global function so as not to attach itself to any 
 * specific framework.
 *
 * @example - simple: default strategy, global expectation, no logging:
 *
 *  it('should work', function () {
 *
 *    where(function() {
 *      /***
 *      a | b | c
 *      1 | 2 | 3
 *      ***\/
 *
 *      expect(Math.max(a,b)).to.be(c);
 *    
 *    });
 *  });
 * 
 * @example - context: QUnit strategy, non-global expectation method, and 
 *            failure interception:
 *
 *  test('should not throw when intercept specified', function(assert) {
 *
 *    var results = where(function(){
 *      /***
 *      | a | b | c |
 *      | 1 | 2 | 2 |
 *      | 7 | 5 | c |
 *      ***\/ // <- escaped for comments only
 *
 *      assert.equal(Math.max(a, b), c, 
 *                  'Math.max(' + a + ',' + b + ') should be ' + c);
 *  
 *    }, { assert: assert, QUnit: QUnit, intercept: 1});
 *
 *    // assert results after data tests
 *    assert.equal(results.failing.length, 1, 'should be one failing');
 *    assert.equal(results.passing.length, 1, 'should be one passing');
 *  });
 * 
 * Documentation and source at 
 * + github.com/dfkaye/where.js
 * + npmjs.org/dfkaye/where.js
 *
 */
;(function whereSandox(/* named IFFE for tests */){

  // This makes where() a global function so as not to attach itself to any 
  // specific framework.
  
  if (typeof global != "undefined") {
    !global.where && (global.where = where);
  }
  if (typeof window != "undefined") {
    !window.where && (window.where = where);
  }
  
  /*
   * CONSTANTS
   */
  var SEP = '|';
  var PAD = ' ' + SEP + ' ';
  var PASSED = 'Passed';
  var FAILED = 'Failed';
  
  /**
   * This function processes a function with a commented data-table and any 
   * expectations into a data array, passing each array row into a new 
   * Function() that contains the original function body's expectation 
   * statements.
   
   * Function accepts a second optional context argument for specifying 
   * non-global expectation methods into the test (e.g., expect: expect), a 
   * strategy or test runner (e.g., strategy: 'qunit'), and output flags (e.g., 
   * intercept: 1, log: 1).
   
   * There are two output flags - log, intercept:
   *  + If {log: 1} is specified, the row data under test is always logged to 
   *    the console; otherwise only failing rows are logged.
   *  + If {intercept: 1} is specified, where attempts to suppress errors from 
   *    appearing in the test runner's reports as failed. If intercept is NOT 
   *    specified, an error containing all failures as a single message is 
   *    thrown after all rows have been tested.
   *
   * @global
   * @function where
   * @param {Function} fn - Function containing data table and expectations. 
   * @param {Object} [context] - Optional argument for injecting local arguments 
   *  and output flags to the new test function.
   * @returns object for further use in other expectations, containing arrays 
   *  for failing and passing tests, and a values array representing the parsed 
   *  data for each row, including labels.
   */
  function where(fn, context) {

    if (typeof fn != 'function') {
      throw new Error('where(param) expected param should be a function');
    }
    
    context = context || {};
    //context = context || strategy;
    
    // long stretch of procedural code here
    
    var fs = fn.toString();
    
    var fnBody = fs.replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                            .replace(/[\}]$/, '');
    var fnVars = '\n;';
    
    for (var key in context) {
      if (context.hasOwnProperty(key)) {
        fnVars = fnVars + 'var ' + key + ' = context[\'' + key + '\'];\n';
      }
    }
    
    fnBody = fnVars + fnBody;

    var values = parseDataTable(fnBody);   
    var labels = values[0];
    var traceLabels = '\n [' + labels.join(PAD) + '] : ';
    
    /*
     * labels array is toString'd so values become param symbols in new Function.
     * fnBody is what's left of the original function, mainly the expectation, 
     * plus any context attributes.
     */
    var fnTest = new Function('context,' + labels.toString(), fnBody);
    
    var failing = [];
    var passing = [];
    //var data = { labels: labels, values: values };
    var results = { failing: failing, passing: passing, values: values };
    
    /*
     * Search the strategy cache for the corresponding method to apply to each
     * test row.  The default strategy is "mocha" which uses a try+catch 
     * approach.  If a strategy method is not found, an error is thrown.  If a 
     * strategy method is returned, it is immediately invoked with the context 
     * object and returns the "seeded" method for the given strategy.
     */
    var applyStrategy = where.strategy(context.strategy || 
                                       (context.jasmine && 'jasmine') || 
                                       (context.QUnit && 'QUnit') || 
                                       (context.tape && 'tape') || 
                                       (context.mocha || 'mocha'))(context);
    
    var test, i;   

    // i is 1 to start with first data row (row 0 is the labels row)
    for (i = 1; i < values.length; i += 1) {
    
      test = { result: PASSED };
      
      applyStrategy(fnTest, test, values[i]);
      
      // each strategy modifies test.result if the test fails.
      test.message = traceLabels + '\n [' + values[i].join(PAD) + '] (' + 
                     test.result + ')\n';

      if (test.result != PASSED) {
      
        // always log failures
        console.log(test.message);
        failing.push(test);
        
      } else {
      
        passing.push(test);
        
        if (context.log) {
          console.log(test.message);
        }
      }
    }

    if (!context.intercept && failing.length > 0) {
      throwFailingResults(failing);
    }
    
    return results;
  }
  
  
  // HELPER METHODS
  
  /**
   * Iterates over array of failing items, concatenates their messages, and 
   * throws an error with the merged messages.
   *
   * @private 
   * @method throwFailingResults() 
   * @param row array of failing items.
   * @throws {Error} containing all failure messages
   */
  function throwFailingResults(failing) {
  
    for (var errorMessage = '', i = 0; i < failing.length; ++i) {
      errorMessage += failing[i].message;
    }
    
    throw new Error(errorMessage);  
  }
  
  /**
   * Extracts data table labels and row values from a function or string, and 
   * and converts them into an array of arrays. Method also converts numeric 
   * string data to pure/primitive number types.
   *
   * Method enforces several rules regarding row data:
   * + balanced borders
   * + no empty columns
   * + no duplicated column headers
   * + all rows identical length
   * + at least one row of data after headers
   *
   * @private 
   * @function parseDataTable
   * @param {Function|String} fnBody
   * @returns {Array} - table data row arrays
   */
  function parseDataTable(fnBody) {

    var fs = fnBody.toString();
    
    // find data table comment
    var table = fs.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//)[0];
    
    // convert table into an array of row data
    var data = table.replace(/\/\/[^\r]*/g, '') // remove line comments...
                    .replace(/[\/\*]*[\r]*[\*\/]*/g, '') // ...block comments
                    .split('\n'); // and split by newline
    
    var rows = [];
    var str, row, size, i;
    
    for (i = 0; i < data.length; i++) {

      str = data[i].replace(/[\|][\s*]/g,'|').replace(/[\s]*[\|]/g, '|');
      
      // skip empty rows
      if (str.match(/\S+/)) {

        row = balanceRowData(str);
        
        // visiting label row - set size for data row iterations
        if (typeof size != 'number') {
          shouldNotHaveDuplicateLabels(row);
          size = row.length;
        }

        // data row length
        if (size !== row.length) {
          throw new Error('where.js table has unbalanced row; expected ' + 
                          size + ' columns but has ' + row.length + ': [' + 
                          row.join(', ') + ']');
        }

        convertTypes(row);
        
        rows.push(row);        
      }
    }
    
    if (rows.length < 2) {
      throw new Error('where.js table should contain at least 2 rows but has ' + 
                      rows.length);
    }
    
    return rows;
  }
  
  /**
   * Checks that row of data is properly formatted with column separators, and 
   * returns array of trimmed row values.
   *
   * @private 
   * @function balanceRowData
   * @param {String} str - String of row data values.
   * @returns {Array} - row data values
   * @throws {Error} when table has unbalanced borders or empty data cells.
   */
  function balanceRowData(str) {
  
    var left, right, row;
    
    // trim row string...
    str = str.replace(/^\s+|\s+$/gm, '');
    
    // check for left and right borders
    left = str.charAt(0) === SEP;
    right = str.charAt(str.length - 1) === SEP;
    
    if (left != right) {
      throw new Error('where.js table has unbalanced column borders: ' + str);
    }

    // ... and split into data array
    row = str.split(SEP);

    // remove empty border tokens
    row[0] === '' && row.shift();
    row[row.length - 1] === '' && row.pop();
    
    // trim each value
    for (var i = 0; i < row.length; i += 1) {
      row[i] = row[i].replace(/^\s+|\s+$/gm, '');
    }
    
    return row;
  }
  
  /**
   * Checks that row of data contains no duplicated label values, i.e., [a,b,c] 
   * and not [a,b,b].
   *
   * @private 
   * @function shouldNotHaveDuplicateLabels
   * @param {Array} row - row data values.
   * @throws {Error} when a duplicate is detected
   */
  function shouldNotHaveDuplicateLabels(row) {
    for (var label, visited = {}, j = 0; j < row.length; j += 1) {
    
      label = row[j];
      
      if (visited[label]) {
        throw new Error('where.js table contains duplicate label \'' + label +
                        '\' in [' + row.join(', ') + ']');
      }
      
      visited[label] = 1;
    }
  }
  
  /**
   * Replaces row data value string with falsy/truthy or numeric value.
   *
   * @private 
   * @function convertTypes
   * @param {Array} row - row data values.
   */
  function convertTypes(row) {
    for (var v, i = 0; i < row.length; i += 1) {
       
      v = row[i];
      
      if (v.match(/undefined|null|true|false/)) {
      
        // convert falsy values
        if (v === "undefined") row[i] = undefined;
        if (v === "null") row[i] = null;
        if (v === "true") row[i] = true;
        if (v === "false") row[i] = false;
        
      } else {
      
        // convert numerics
        v = parseFloat(v.replace(/\'|\"|\,/g,''));
        isNaN(v) || (row[i] = v);        
      }
    }
  }
  
  
  // STRATEGY
  // TODO - YET ANOTHER REFACTORING:
  //    PROVIDE A LIST METHOD TO SHOW ALL STRATEGIES REGISTERED
  //    EASE UP LOOKUP'S CLEVERNESS
  //    make context specification easier, more global
  //    EXAMPLE OF DEFINING CUSTOM STRATEGY
  
  
  /**
   * Provides an enclosed registry for name+function pairings to be used as test 
   * framework strategies - or ways of hooking into or overriding behavior for a
   * given test framework.
   *
   * Method takes two arguments if registering, one argument if retrieving. The 
   * first argument is a name string for the strategy.  The second argument is a
   * function which acts as a "seeding" function when invoked.  If the function 
   * argument is not provided, method works as a getter; otherwise method 
   * attempts to register the function with the corresponding name. If the name 
   * is already taken, an error is thrown.
   *
   * When a registered function is returned, it must then be called with a 
   * context object to "seed" it and return the actual function to be applied.
   * 
   * @function strategy
   * @memberof where
   * @static
   * @param {String} name
   * @param {function} [fn] - The seed function to be associated with the given
   *  name.  If provided, the strategy() call acts as a setter. If not provided, 
   *  strategy() acts as a getter.
   * @returns {Function} Lookup function for getting and setting a strategy.
   * @throws {Error} when a 'set' call is made on a name already registered.
   */
  where.strategy = (function whereStrategy(/* IFFE named only for tests */) {

    /**
     * @private
     */
    var registry = {};

    return function lookup(name, fn) {
    
      if (!(name in registry)) {
        if (fn && typeof fn == 'function') {
            registry[name] = fn;
        } else {
            throw new Error('where.strategy ["' + name + '"] is not defined.');
        }
      }
      return registry[name];
    };
  }());
  
  // STRATEGY for MOCHA, the default try-catch strategy
  //
  // does not require a context argument with a strategy
  
  where.strategy('mocha', function mochaStrategy(context) {
  
    return function testMocha(fnTest, test, value) {
      try {
        fnTest.apply({}, [context].concat(value));
      } catch(err) {
        test.result = err.name + ': ' + err.message;
      }
    };
  });
  
  // STRATEGY for JASMINE ~ I once respected thee.
  //
  // requires context argument with strategy defined as { jasmine: jasmine }

  where.strategy('jasmine', function jasmineStrategy(context) {

    // TODO - enforce jasmine: jasmine convention in context
    //var jasmine = context.jasmine;
    //
    
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
          test.result = data.trace;
        } else {
          addResult.call(result, data);
        }
      });
      
      /* jasmine 2.x.x. */
      var addExpectationResult = jasmine.Spec.prototype.addExpectationResult;
      addExpectationResult && 
      (jasmine.Spec.prototype.addExpectationResult = function (passed, data) {
      
        if (!passed) {
          test.result = data.message;
        } else {
          addExpectationResult.call(result, passed, data);
        }          
      });
      
      /* execute on currentSpec for jasmine 1.x.x */
      fnTest.apply(currentSpec, [context].concat(value));
    
      /* restore result api */
      
      /* jasmine 1.x.x. */ 
      addResult && (result.addResult = addResult);
      
      /* jasmine 2.x.x. */ 
      addExpectationResult && 
      (jasmine.Spec.prototype.addExpectationResult = addExpectationResult);     
    };        
  });
  
  // STRATEGY for QUnit ~ surprisingly not bad! however, complete interception 
  // of expected failures is not possible in the HTML Reporter as currently 
  // implemented (QUnit v1.13 as of this writing 12-FEB-2014.
  //
  // requires context argument with strategy defined as { QUnit: QUnit }
  
  where.strategy('QUnit', function qunitStrategy(context) {
    
    // this code reminds me of java for some reason...
    
    var test;
    var realPush;
    var interceptingPush;
        
    if (context.intercept) {
      
      /*
       * this block attempts to capture test assertions, reset them to passing 
       * (i.e., they are expected to fail), and push them to QUnit's assertions
       * list with the real 'push()' method.
       */
      interceptingPush = function overridingAssertionsPush(details) {
        if (!details.result) {
          details.result = !details.result;
        }
        //realPush.call(QUnit.config.current.assertions, details);
      };
      
      // override on start
      context.QUnit.testStart(function(detail) {
        realPush = QUnit.config.current.assertions.push;
        QUnit.config.current.assertions.push = interceptingPush;
      });
    
      // undo override on done
      context.QUnit.testDone(function(detail) {
        QUnit.config.current.assertions.push = realPush;
      });
    }

    context.QUnit.log(function onResult(details) {
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
  
  // STRATEGY for TAPE ~ bit less elegant than QUnit, but less verbose (possible 
  // contraction?). tape's event-driven reporting allows us to turn off the 
  // the default test reports so that expected failures are not reported as 
  // failed.  James' foresight in using each tape/test function as an event
  // emitter AND using the 'result' event handler as a pre-reporting-processor.
  //
  // requires context argument with strategy defined as { tape: test | t } where
  // [test | t] is the current test (or t) method
  
  where.strategy('tape', function tapeStrategy(context) {
  
    return function testTape(fnTest, test, value) {
    
      var listeners;
      
      // turn off tape's automatic reporting (pass/fail counts) 
      if (context.intercept) {
        listeners = context.tape._events['result'];
        context.tape.removeAllListeners('result');        
      }
      
      context.tape.on('result', function onResult(result) {
        if (!result.ok) {
          test.result = 'Error: expected ' + result.actual + ' to be ' + 
                        result.expected;
        }
        context.tape.removeListener('result', onResult);
      });
      
      fnTest.apply({}, [context].concat(value));
      
      // restore tape's result reporting
      if (context.intercept) {
        for (var i = 0; i < listeners.length; ++i) {
          context.tape.on('result', listeners[i]);
        }
      }      
    };
  });
  
}());