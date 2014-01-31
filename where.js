

// where.js


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
  var PASSED = 'Passed';
  var FAILED = 'Failed';
  
  // TODO - jasmine 2.x.x. tests
  // documentation -
  //  context.expect | assert | tape
  //  context.jasmine | tape | QUnit 
  //  context.log | intercept

  /*
    where(function() {
  //    /***
        a | b | c
        1 | 2 | 3
  //    ***\/
      assert|expect(Math.max(a,b)).to.be(c);
      
    }, { assert|expect: assert|expect , tape|QUnit|jasmine: test|QUnit|jasmine, intercept: 1, log: 1 });
  
  */
  
  /**
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

    var fnVars = '\n;';
    for (var key in context) {
      if (context.hasOwnProperty(key)) {
        fnVars = fnVars + 'var ' + key + ' = context[\'' + key + '\'];\n';
      }
    }
    fnBody = fnVars + fnBody;

    /*
     * {labels} array is toString'd so values become param symbols in new Function.
     * {fnBody} is what's left of the original function, mainly the expectation, plus any 
     *  context attributes.
     */
    var values = parseDataTable(fnBody);
   
    var labels = values[0];
    var traceLabels = '\n [' + labels.join(PAD) + '] : ';
    
    var fnTest = new Function('context,' + labels.toString(), fnBody);
    
    var failing = [];
    var passing = [];
    var results = { failing: failing, passing: passing, values: values };
    
    var strategy = where.strategy(context.strategy || 
                                  (context.jasmine && 'jasmine') || 
                                  (context.QUnit && 'QUnit') || 
                                  (context.tape && 'tape') || 
                                  (context.mocha || 'mocha')); // default mocha
    var applyStrategy = strategy(context);
    
    var item, message, test, i;   

    // i is 1 to start with first data row (row 0 is the labels row)
    for (i = 1; i < values.length; i += 1) {
    
      test = { result: PASSED };
      
      applyStrategy(fnTest, test, values[i]);
      
      test.message = traceLabels + '\n [' + values[i].join(PAD) + '] (' + 
                     test.result + ')\n';
      
      if (test.result != PASSED) {
      
        failing.push(test);
        
        // always log failures
        console.log(test.message);
        
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
    
    // for use in further assertions
    return results;
  }
  
  
  /**
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
  
  /**
   * @private 
   * @method parseDataTable() accepts a function or string and extracts the data 
   *  table labels and row values as an array of arrays.  parseDataTable() enforces several 
   *  rules regarding row data - balanced borders, no empty columns, no duplicated column 
   *  headers, all rows identical length, at least one row of data after headers - and 
   *  converts numeric string data to pure/primitive number types.
   * @returns array of table row data arrays.
   */
  function parseDataTable(fnBody) {

    var fs = fnBody.toString();
    var table = fs.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//);
    var data = table[0].replace(/[\/\*]*[\r]*[\*\/]*/g, '').split('\n');
    var rows = [];
    
    var str, row, size, i;
    
    for (i = 0; i < data.length; i++) {

      str = data[i].replace(/[\|][\s*]/g,'|').replace(/[\s]*[\|]/g, '|');
      
      // skips empty rows
      if (str.match(/\S+/)) {

        str = str.replace(/\s+/g, '');
        
        // empty column
        if (str.match(/[\|][\|]/g)) {
          throw new Error('where-data table has unbalanced columns: ' + str);
        }
        
        row = balanceRowData(str);
        
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
  
  /**
   * @private 
   * @method balanceRowData() checks that row of data is properly formatted by 
   *  column separators
   * @param row string of values.
   * @returns row array of values
   */
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
  
  /**
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
  
  /**
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
  
  
  /**
   *
   */
  where.strategy = (function whereStrategy() {

    var registry = {};

    return function strategy(name, fn) {
    
      if (!(name in registry)) {
        if (fn && typeof fn == 'function') {
            registry[name] = fn;
        } else {
            throw new Error('where-strategy "' + name + '" is not defined.');
        }
      }
      return registry[name];
    };
  }());
  
  // STRATEGY for MOCHA, the default try-catch strategy
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
  where.strategy('jasmine', function jasmineStrategy(context) {

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
      addExpectationResult && (jasmine.Spec.prototype.addExpectationResult = function (passed, data) {
      
// TODO 29 JAN 2014 
// STILL TO BE TESTED VIA JAZZ 2
        
        if (!passed) {
          //failing.push(data.message);
          test.result = data.message;
        } else {
          //passing.push(data.message);
          addExpectationResult.call(result, passed, data);
        }          
      });
      
      /* execute with extreme prejudice */
      fnTest.apply(currentSpec, [context].concat(value));
    
      /* restore result api */
      
      /* jasmine 1.x.x. */ 
      addResult && (result.addResult = addResult);
      
      /* jasmine 2.x.x. */ 
      addExpectationResult && (jasmine.Spec.prototype.addExpectationResult = addExpectationResult);     
    };        
  });
  
  // STRATEGY for QUnit ~ surprisingly elegant!
  where.strategy('QUnit', function qunitStrategy(context) {
    
    var test;
    
    context.QUnit.log(function onResult(details) {
    
      if (!details.result) {
      
        test.result = 'Error: expected ' + details.actual + ' to be ' + 
                      details.expected;
                      
        if (!context.intercept) {
          // provide the QUnit sourceFromStacktrace() output
          test.result = test.result + '\n' + details.source;
        }
      }
    });
    
    return function testQUnit(fnTest, thisTest, value) {
      test = thisTest;
      fnTest.apply({}, [context].concat(value));
    };
  });
  
  // STRATEGY for TAPE ~ bit less elegant than QUnit (surprisingly) but tape's 
  // event-driven reporting allows us to intercept the test result and "skip" it 
  // due to James' foresight in re-using each tape/test function as an event
  // emitter AND using the 'result' event handler as a pre-reporting-processor.
  where.strategy('tape', function tapeStrategy(context) {
  
    return function testTape(fnTest, test, value) {
    
      context.tape.on('result', function onResult(result) {
      
        if (!result.ok) {
          result.skip = true;
          test.result = 'Error: expected ' + result.actual + ' to be ' + 
                        result.expected;
        }
        
        context.tape.removeListener('result', onResult);
      });
      
      fnTest.apply({}, [context].concat(value));
    };
  });
  
  

}());