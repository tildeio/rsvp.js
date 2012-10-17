rsvp = require('../lib/rsvp');

function equal(actual, expected, desc) {
  if (actual === expected) {
    console.log('passed:', desc);
  } else {
    console.log('***failed***:', 'expected', expected, 'to equal', actual);
  }
}

testfunc = function(a, b, callback) {
  setTimeout(function(){
    callback(null, a, b);
  }, 1);
};

testfunc(1, 2, function(a, b, c){
  equal(a, null, 'called with first param');
  equal(b, 1, 'called with second param');
  equal(c, 2, 'called with third param');
});

ptest = rsvp.promisify(testfunc);

ptest(1, 2).then(function(values) {
  equal(values[0], 1, 'called with first param');
  equal(values[1], 2, 'called with second param');
});

