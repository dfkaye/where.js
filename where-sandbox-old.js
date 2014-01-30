// where-sandbox
;(function whereSandox() {

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
  var PASSING = 'Passed';
  var FAILING = 'Failed';
  var DEFAULT = 'default';
  
  // TODO
  // IMPLEMENT STRATEGIES:
  // + DEFAULT (NO PRE OR POST APPLY)
  // + TAPE (PRE APPLY WITH ON RESULT HANDLER
  // + QUNIT (POST APPLY WITH QUNIT.LOG OR CURRENT ASSERTION RESULT
  // + JASMINE (PRE APPLY CURRENTSPEC OR MOCK; POST APPLY RESULT
  // INTERCEPTS (PREVENT ERRORS TO THE REPORTERS) - intercept is true unless 
  //    specified false
  // LOG - log is true unless specified false 
  
  /*
    where(function() {
  //    /***
        a | b | c
        1 | 2 | 3
  //    ***\/
      method(Math.max(a,b)).to.be(c);
      
    }, { method: method , strategy: 'tape|qunit|jasmine', intercept: 0, log: 0 });
  
  */
  
  
  /*
   * This function processes a function with a commented data-table and any expectations
   *  into a data array, passing each array row into a new Function() that contains the 
   *  original function body's expectation statements.
   *
   * @method where
   * @param fn - function containing data table and expectations 
   * @param context - configuration object for injecting local arguments to the new test 
   *  test function, mainly for placing non-global assert|expect methods into the test, 
   *  and for passing output flags. 
   *
   * context output flags - log, intercept 
   *  + if {log: 1} is specified, the row data under test is logged to the console.
   *  + if {intercept: 1} is NOT specified, expectation failures are immediately thrown as 
   *      errors.
   *
   * @returns an object containing arrays for failing, passing, and values for further use 
   *  in other expectations.
  */
  function where(fn, context) {

    if (typeof fn != 'function') {
      throw new Error('where(param) expected param should be a function');
    }
    
    context = context || {};
    
    var fs = fn.toString();
    var fnBody = fs.replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                            .replace(/[\}]$/, '');
    var values = parseFnBody(fnBody);
    var labels = values[0];

    var fnVars = '\n;';
    for (var key in context) {
      if (context.hasOwnProperty(key)) {
        fnVars += 'var ' + key + ' = context[\'' + key + '\'];\n';
      }
    }
    fnBody = fnVars + fnBody;

    /*
     * {labels} array is toString'd so values become param symbols in new Function.
     * {fnBody} is what's left of the original function, mainly the expectation, plus any 
     *  context attributes.
     */
    var fnTest = new Function('context,' + labels.toString(), fnBody);

    var traceLabels = '\n [' + labels.join(PAD) + '] : ';
    var failing = [];
    var passing = [];
    var results = { failing: failing, passing: passing, values: values };
    
    var item, message, test, i;   
    
    // var currentSpec, result;
    
    
   // STRATEGY for JASMINE, I once respected, now despise thee.
    // if (context.jasmine) {
      // currentSpec = /* jasmine 1.x.x. */ jasmine.getEnv().currentSpec || 
                    // /* jasmine 2.x.x. */ { result : { failedCount: 0 } };
      // result = /* jasmine 2.x.x. */ currentSpec.result || 
               // /* jasmine 1.x.x. */ currentSpec.results_;
               
      // if (context.intercept) {
      
        // console.log('setup jasmine intercept');
      // }
    // }
    
    var adapter;
    if (context.jasmine) {
      adapter = JasmineAdapter(context);
    } else if (context.QUnit) {
      adapter = QUnitAdapter(context);
    } else if (context.tape) {
      adapter = TapeAdapter(context);
    } else {
      adapter = MochaAdapter(context);    
    }
    
   // STRATEGY for tape whose event-driven reporting is not interceptable, but
    // which can be further utilized due to james' foresight in re-using
    // each test function as both an emitter AND as the test result cache
    // if (context.tape) {
      // context.tape.on('result', function onResult(r) {
        // if (!r.ok) {
          // message = 'Error: expected ' + r.actual + ' to be ' + r.expected;
          // r.skip = true;
        // }
        //context.tape.removeListener('result', onResult);
      // });
    // }

    
    // i is 1 to start with first data row (row 0 is the labels row)
    for (i = 1; i < values.length; i += 1) {
    
      //message = PASSING;
      test = { result: PASSING };
      
      adapter(fnTest, test, values[i]);
      
      //try {
      
       // STRATEGY for tape whose event-driven reporting is not interceptable, but
        // which can be further utilized due to james' foresight in re-using
        // each test function as both an emitter AND as the test result cache.
        // if (context.tape) {
          // context.tape.on('result', function onResult(r) {
            // if (!r.ok) {
              // message = 'Error: expected ' + r.actual + ' to be ' + r.expected;
              // r.skip = true;
            // }
            // context.tape.removeListener('result', onResult);
          // });
        // }
        
       // STRATEGY ~ IF INTERCEPT && JASMINE, APPLY JASMINE-INTERCEPT
        //if (context.jasmine && context.intercept) {
        
        //} else {
    //      fnTest.apply({}, [context].concat(values[i]));
        //}
         
         
       // STRATEGY for QUnit which forks its logging (detail json) from its 
        // assertions (message contains html).
    //    if (context.QUnit) {
    //      var assertions = context.QUnit.config.current.assertions;
    //      if (!assertions[assertions.length - 1].result) {
     //       message = FAILING;
     //     }
    //    }
        
       // STRATEGY FOR JASMINE - LOG FAILED EXPECTATIONS
        // if (context.jasmine) {
          // if (result.failedExpectations && result.failedExpectations.length) {
            // /*
             // * jasmine 2.x.x.
             // */
            // if (result.failedCount + 1 == result.failedExpectations.length) {
              // item = result.failedExpectations[result.failedCount];
              // message = item.message;
              // result.failedCount += 1;
            // }
            
          // } else if (result.items_) {
            // /*
             // * jasmine 1.x.x.
             // */
            // item = result.items_[result.items_.length - 1];
            // if (item && !item.passed_) {
              // message = item.message;
            // }
          // }
        // }
        
     // } catch (err) {
        // mocha, chai, expect, should don't hide failures behind event skirts
     //   message = err.name + ': ' + err.message;
        
      //} finally {

        test.message = traceLabels + '\n [' + values[i].join(PAD) + '] (' + test.result + ')\n';
      //}
            
      if (test.result != PASSING) {
        results.failing.push(test);
        console.log(test.message);
      } else {
        results.passing.push(test);
        if (context.log) {
          console.log(test.message);
        }
      }
    }

    if (!context.intercept && failing.length > 0) {
      throwFailingResults(failing);
    }
    
    // for use in further assertions
    return results;
  }
  

  // default
  function MochaAdapter(context) {
  
    return function testMocha(fnTest, test, value) {
    
      try {
        fnTest.apply({}, [context].concat(value));
      } catch(err) {
        // mocha, chai, expect, should don't hide failures behind event skirts
        test.result = err.name + ': ' + err.message;
      }
    };
  }
  
  function JasmineAdapter(context) {
  
    var currentSpec, result, failedCount;
    
   // STRATEGY for JASMINE, I once respected, now despise thee.
    currentSpec = /* jasmine 1.x.x. */ jasmine.getEnv().currentSpec || 
                  /* jasmine 2.x.x. */ { result : { } };
    result = /* jasmine 2.x.x. */ currentSpec.result || 
             /* jasmine 1.x.x. */ currentSpec.results_;
    failedCount = /* jasmine 2.x.x. */ 0;
    
    if (context.intercept) {
      console.log('IMPLEMENT jasmine intercept');
    }

    return function testJasmine(fnTest, test, value) {
    
      fnTest.apply(currentSpec, [context].concat(value));
      
      if (result.failedExpectations && result.failedExpectations.length) {
        /*
         * jasmine 2.x.x.
         */
        if (failedCount < result.failedExpectations.length) {
          item = result.failedExpectations[failedCount];
          test.result = item.message;
          failedCount += 1;
        }
        
      } else if (result.items_) {
        /*
         * jasmine 1.x.x.
         */
        item = result.items_[result.items_.length - 1];
        if (item && !item.passed_) {
          test.result = item.message;
        }
      }
    };
  }

  function QUnitAdapter(context) {
  
    return function testQUnit(fnTest, test, value) {
    
      fnTest.apply({}, [context].concat(value));
       
      // STRATEGY for QUnit forks logging details (json) from assertions (html)
      var assertions = context.QUnit.config.current.assertions;
      if (!assertions[assertions.length - 1].result) {
        test.result = FAILING;
      } 
    };
  }
  
  function TapeAdapter(context) {
  
    return function testTape(fnTest, test, value) {
    
      context.tape.on('result', function onResult(r) {
        if (!r.ok) {
          r.skip = true;
          test.result = 'Error: expected ' + r.actual + ' to be ' + r.expected;
        }
        context.tape.removeListener('result', onResult);
      });

      fnTest.apply({}, [context].concat(value));
    };
  }
  
  
  /*
   * @private 
   * @method throwFailingResults() iterates over array of failing items, concatenates 
   *  their messages, and throws an error with the merged messages.
   * @param row array of failing items.
   */
  function throwFailingResults(failing) {
    for (var errorMessage = '', i = 0; i < failing.length; ++i) {
      errorMessage += failing[i].message;
    }
    throw new Error(errorMessage);  
  }
  
  /*
   * @private 
   * @method parseFnBody() accepts a function or string and extracts the data 
   *  table labels and row values as an array of arrays.  parseFnBody() enforces several 
   *  rules regarding row data - balanced borders, no empty columns, no duplicated column 
   *  headers, all rows identical length, at least one row of data after headers - and 
   *  converts numeric string data to pure/primitive number types.
   * @returns array of table row data arrays.
   */
  function parseFnBody(fnBody) {

    var fs = fnBody.toString();
    var table = fs.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//);
    var data = table[0].replace(/[\/\*]*[\r]*[\*\/]*/g, '').split('\n');
    var rows = [];
    var row, size, i;
    
    for (i = 0; i < data.length; i++) {

      row = data[i].replace(/[\|][\s*]/g,'|').replace(/[\s]*[\|]/g, '|');
      
      // skips empty rows
      if (row.match(/\S+/)) {

        row = row.replace(/\s+/g, '');
        
        // empty column
        if (row.match(/[\|][\|]/g)) {
          throw new Error('where-data table has unbalanced columns: ' + row);
        }
        
        row = balanceRowData(row);
        
        // visiting label row
        if (typeof size != 'number') {
          shouldNotHaveDuplicateLabels(row);
          size = row.length;
        }

        // data row length
        if (size !== row.length) {
          throw new Error('where-data table has unbalanced row; expected ' + size + 
                          ' columns but has ' + row.length + ': [' + row.join(', ') + 
                          ']');
        }

        convertNumerics(row);

        rows.push(row);        
      }
    }
    
    // verifying after skipping empty rows
    if (rows.length < 2) {
      throw new Error('where-data table should contain at least 2 rows but has ' + 
                      rows.length);
    }
    
    return rows;
  }
  
  
  function balanceRowData(row) {
  
    var cells = row.split(SEP);
    var left  = cells[0] === '';    //left border
    var right = cells[cells.length - 1] === '';    //right border
    
    if (left != right) {
      throw new Error('where-data table borders are not balanced: ' + row);
    }
    
    if (left) {
      cells.shift();
    }

    if (right) {
      cells.pop();
    }
      
    return cells;
  }
  
  
  /*
   * @private 
   * @method shouldNotHaveDuplicateLabels() checks that row of data contains no duplicated 
   *  data values - mainly used for checking column headers (a,b,c vs. a,b,b).
   * @param row array of values.
   */
  function shouldNotHaveDuplicateLabels(row) {
    for (var label, visited = {}, j = 0; j < row.length; j += 1) {
    
      label = row[j];

      if (visited[label]) {
        throw new Error('where-data table contains duplicate label \'' + label +
                        '\' in [' + row.join(', ') + ']');
      }
      
      visited[label] = 1;
    }
  }
  
  /*
   * @private 
   * @method convertNumerics() replaces row data with numbers if value is numeric, or a 
   *  'quoted' numeric string.
   * @param row array of values.
   */
  function convertNumerics(row) {
    for (var t, i = 0; i < row.length; i += 1) {
    
      t = parseFloat(row[i].replace(/\'|\"|\,/g,''));
      
      isNaN(t) || (row[i] = t);
    }
  }



  
  function jasmineStrategy(context, values) {
    
  
    var failedCount = result.failedExpectations.length;
    var test;
    
   // STRATEGY ~ IF INTERCEPT && JASMINE, APPLY JASMINE-INTERCEPT
    fnTest.apply({}, [context].concat(values[i]));

    // collect any failed expectations 
    if (result.failedExpectations && result.failedExpectations.length) {
    
      /*
       * jasmine 2.x.x.
       */
       
      if (failedCount < result.failedExpectations.length) {
        test = result.failedExpectations[result.failedExpectations.length - 1];
        return test.message;
      }
      
    } else if (result.items_) {
    
      /*
       * jasmine 1.x.x.
       */
      
      test = result.items_[result.items_.length - 1];
      
      if (test && !test.passed_) {
        return test.message;
      }
    }
  }
  

  

  
}());
