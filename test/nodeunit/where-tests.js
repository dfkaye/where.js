// where-tests.js
// another nice surprise - nodeunit is commonjs+this friendly

this.whereTests = {
  
  'assert where' : function (test) {
    test.ok(typeof where != 'undefined', 'where exists');
    test.done();
  },
  
  'where-nodeunit-strategy': function (test) {
  
    var results = where(function () {
      /***
      a | b | c
      1 | 2 | 3
      4 | 5 | 9
      // shouldn't see this
      ***/
      test.equal(a + b, c, (a + ' + ' + b + ' = ' + c));
      
    }, { strategy: 'nodeunit', test: test });
  
    test.equal(results.passing.length, 2, 'should be 2 passing');
    test.equal(results.failing.length, 0, 'should be 0 failing');
    test.done();
  },
  
  'should not throw on failed assertions': function (test) {
  
    test.doesNotThrow(function() {
      where(function () {
        /***
        a | b | c
        x | y | z  // 'xy' == 'z' should fail
        ***/
        test.equal(a + b, c, (a + ' + ' + b + ' = ' + c));
        
      }, { strategy: 'nodeunit', test: test });
    });

    test.done();
  },
  
  'should suppress stack trace with intercept': function (test) {
  
    var results = where(function () {
      /***
      a | b | c
      1 | 2 | 3
      4 | 5 | 7 // check the console
      // shouldn't see this
      ***/
      test.equal(a + b, c, (a + ' + ' + b + ' = ' + c));
      
    }, { strategy: 'nodeunit', intercept: 1, test: test });
  
    test.equal(results.passing.length, 1, 'should be 1 passing');
    test.equal(results.failing.length, 1, 'should be 1 failing');
    test.done();
  },
  
  'should display passing test with log': function (test) {
  
    var results = where(function () {
      /***
      a | b | c
      1 | 2 | 3 // should see (passed) in console
      4 | 5 | 7
      //shouldn't see this
      ***/
      test.equal(a + b, c, (a + ' + ' + b + ' = ' + c));
      
    }, { strategy: 'nodeunit', log: 1, test: test });
  
    test.equal(results.passing.length, 1, 'should be 1 passing');
    test.equal(results.failing.length, 1, 'should be 1 failing');
    test.done();
  },
  
  'should return well-formatted messages': function (test) {
  
    var results = where(function () {
      /*** 
        leftInput |    b  |  andTheAnswerIs
          1000    |  1000 |  1000
           12     |    24 |  24
        451       |  2    |  4451
        4         |  8    |  7
      ***/
      
      test.equal(Math.max(leftInput, b), andTheAnswerIs, 'max(leftInput, b)');

      // nodeunit allows this second assertion to run,
      // but if it fails, it will *overwrite* the previous assertion
      test.ok(b != 2, 'b != 2');

      }, { strategy: 'nodeunit', test: test, intercept: 1 });

    var passing = results.passing[0].message.split('\n');
    
    test.equal(passing[1], ' [leftInput | b    | andTheAnswerIs] : ');
    test.equal(passing[2], ' [1000      | 1000 | 1000          ] (Passed) ');
    
    var failing = results.failing[0].message.split('\n');
    
    test.equal(failing[1], ' [leftInput | b    | andTheAnswerIs] : ');
    test.equal(failing[2], ' [451       | 2    | 4451          ]' + 
                           ' (AssertionError: max(leftInput, b):' +
                           ' Expected 451 to be 4451) ');

    test.done();    
  }
};

