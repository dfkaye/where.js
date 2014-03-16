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
  var SPACE = ' ';
  var PAD = SPACE + SEP + SPACE;
  var PASSED = 'Passed';
  var FAILED = 'Failed';
  
  /**
   * The where() function processes a function with a commented data-table and 
   * any expectations into a data array, passing each array row into a new 
   * Function() that contains the original function body's expectation 
   * statements.
   *
   * In ES5 environments supporting the "use strict"; declaration, undeclared 
   * variables in the function body will result in an error; for example:
   *    "ReferenceError: assignment to undeclared variable <varname>"
   *
   * Function accepts a second optional context argument for specifying 
   * non-global expectation methods into the test (e.g., expect: expect), a 
   * strategy or test runner (e.g., strategy: 'qunit'), and output flags (e.g., 
   * intercept: 1, log: 1).
   *
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
   * @throws {ReferenceError} in ES5 environments for un-var'd variables in the 
   *  body of the fn argument.
   */
  function where(fn, context) {

    if (typeof fn != 'function') {
      throw new Error('where(param) expected param should be a function');
    }
    
    context = context || {};
    
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

    var data = parseDataTable(fnBody);   
    var labels = data.labels;
    var values = data.values;

    // ES5 environments only
    // see http://caniuse.com/use-strict
    fnBody = '"use strict";\n' + fnBody;
    
    /*
     * labels array is toString'd so values become param symbols in new Function.
     * fnBody is what's left of the original function, mainly the expectation, 
     * plus any context attributes.
     */
    var fnTest = new Function('context,' + labels.toString(), fnBody);
    
    var failing = [];
    var passing = [];
    var results = { failing: failing, passing: passing, data: data };
    
    /*
     * Search the strategy cache for the corresponding method to apply to each
     * test row.  The default strategy is "mocha" which uses a try+catch 
     * approach.  If a strategy method is not found, an error is thrown.  If a 
     * strategy method is returned, it is immediately invoked with the context 
     * object and returns the seeded "applyStrategy" method for the given 
     * strategy.
     */
    var applyStrategy = (function findStrategy(context) {
    
      var list = where.strategy.list();
      var name;
      
      for (var i = 0; i < list.length;  i += 1) {

        if (context[list[i]] || context.strategy === list[i]) {
          name = list[i];
          break;
        }
      }

      return where.strategy(name || 'mocha')(context);
    }(context));

    // apply the strategy to test each row of data
    for (var test, i = 0; i < values.length; i += 1) {
    
      test = { result: PASSED };
      
      applyStrategy(fnTest, test, values[i]);
      
      // each strategy modifies test.result if the test fails.
      test.message = formatMessage(labels, values[i], test.result);
      
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

    // produce the failing error state if not intercepting messages
    if (!context.intercept && failing.length > 0) {
      throwFailingResults(failing);
    }
    
    return results;
  }
  
  
  // HELPER METHODS
 
    
  /**
   * This method accepts a given label, values and result message, and formats 
   * them into tabular form, with padded aligned columns.  Output is returned as 
   * a string.
   *
   * @private 
   * @function formatMessage
   * @param {Array} of labels
   * @param {Array} of test values
   * @param {String} test result
   * @returns {String} formatted message
   */
  function formatMessage(labels, rowValues, result) {
      
    for (var value, type, diff, i = 0; i < labels.length; i++) {
    
      value = rowValues[i];
      type = typeof value;
      
      if (type == 'undefined' || value === null) {
        value = '';
      } else if (type != 'string') {
        value = String(value);
      }
      
      diff = labels[i].length - value.length;
      
      if (diff > 0) {
        // pad row value      
        rowValues[i] = value + Array(diff + 1).join(SPACE);
      }
      if (diff < 0) {
        // pad label
        diff = diff * -1;
        labels[i] = labels[i] + Array(diff + 1).join(SPACE);
      }
    }
        
    return '\n [' + labels.join(PAD)    + '] : ' + 
           '\n [' + rowValues.join(PAD) + '] (' + result + ') \n';
  }
  
  
  /**
   * Iterates over array of failing items, concatenates their messages, and 
   * throws an error with the merged messages.
   *
   * @private 
   * @function throwFailingResults
   * @param {Array} row of failing tests.
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
   * @returns {Object} data containing labels and values arrays.  
   */
  function parseDataTable(fnBody) {

    var table;
    var data;
    var str, row, size, i;
    var rows = [];    
    var fs = fnBody.toString();
    
    // find data table
    
    // try to match on compiled coffeescript first
    table = fs.match(/[\"][^\n]+[\n]?[^\n]+[\"][\;]/);
    
    if (table) {
    
      // match on compiled multiline string in coffeescript
      // submitted by jason karns
      // https://github.com/dfkaye/where.js/issues/6
      
      data = table[0].replace(/[\"]/, '') // remove leading coffee quote
                     .replace(/[\"][\;]/, '') // remove closing coffee quote
                     .replace(/[\#][^\\n]+/g, '') // remove line comments...
                     .split('\\n'); // and split by escaped newline
    } else {
    
      // match asterisk style multiline strings      
      table = fs.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//);
      
      // let it fail normally after this
      
      data = table[0].replace(/\/\/[^\r]*/g, '') // remove line comments...
                     .replace(/(\/\*+)*[\r]*(\*+\/)*/g, '') // ...block comments
                     .split('\n'); // and split by newline
    }
    
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
    
    return { labels: rows[0], values: rows.slice(1) };
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
   * Replaces un-quoted values with null, undefined, true, false or numeric type 
   * values. Values containing quotes are not replaced.
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
      }
            
      if (v.match(/\d+/g) && v.search(/[\'|\"]/g) === -1) {
      
        // convert un-quoted numerics
        // "support numeric strings #2" bug from johann-sonntagbauer      
        v = v.replace(/\,/g,'');
        isNaN(v) || (row[i] = Number(v));
      }
    }
  }
    
  // STRATEGY
  
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
   * where.strategy also exposes the registry object, and a list() method that 
   * returns the names of any strategies registered.
   * 
   * @function strategy
   * @memberof where
   * @static
   * @param {String} name
   * @param {function} [fn] - The seed function to be associated with the given
   *  name.  If provided, the strategy() call acts as a setter. If not provided, 
   *  strategy() acts as a getter.
   * @returns {Function} the lookup function for getting and setting a strategy.
   * @throws {Error} when a 'set' call is made on a name already registered.
   */
  where.strategy = (function whereStrategy(/* IFFE named only for tests */) {
  
    /**
     * @private
     */
    var registry = {};
    
    /**
     * @private
     * @returns {Array} of entries in the strategy registry.
     */
    function list() {
      var list = [];
      for (var k in registry) {
        if (registry.hasOwnProperty(k)) {
          list.push(k);
        }
      }
      return list;
    };
    
    return function lookup(name, fn) {
            
      if (!(name in registry)) {
        if (fn && typeof fn == 'function') {
          registry[name] = fn;
        } else {
          throw new Error('where.strategy ["' + name + '"] is not defined.');
        }
      }
      /////////////////////////////////////
      // expose the list API, refresh in case it was deleted
      lookup.registry !== registry && (lookup.registry = registry);
      lookup.list !== list && (lookup.list = list);
      /////////////////////////////////////      
      return registry[name];
    };
  }());
  
  
  // STRATEGY for MOCHA, the default try-catch strategy
  // does not require a context argument with a strategy
  where.strategy('mocha', function mochaStrategy(context) {
  
    return function testMocha(fnTest, test, value) {
      try {
        fnTest.apply({}, [context].concat(value));
      } catch(err) {

        /* 
         * johann sonntagbauer fix 15 MAR 2015
         * the strategy will be called initial with test.result = 'Passed' 
         * therefore reset the test result
         */
         
        if (test.result === 'Passed') {
            test.result = '';
        }
        
        test.result += err.name + ': ' + err.message;
      }
    };
  });
  
}());