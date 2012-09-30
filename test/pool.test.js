var underscore = require('underscore');

var helper = require('./support/helper')
  , Pool = require('../lib/pool');

describe('Pool', function() {
  it('calls ready event on all paths', function(done) {
    var paths = ['./test/cat.test.js', './test/tiger.test.js', './test/lion.test.js']
      , pool = new Pool(paths, 2);

    pool.on('done', function() {
      paths.length.should.eql(0);
      done();
    });
    pool.on('ready', function(path, callback) {
      paths = underscore.reject(paths, function(element) {
        return path === element;
      });
      return callback();
    });
    pool.start();
  });
});
