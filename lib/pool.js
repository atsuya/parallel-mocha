var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , DoneCriteria = require('done-criteria')
  , underscore = require('underscore');

function Pool(paths, workers) {
  EventEmitter.call(this);

  this.paths = paths;
  this.workers = workers;
}

util.inherits(Pool, EventEmitter);

Pool.prototype.start = function() {
  var self = this
    , doneCriteria = new DoneCriteria(this.paths, function() {
        self.emit('done');
      });

  self.on('next', function() {
    self.next(function(path) {
      doneCriteria.done(path);
    });
  });
  underscore.range(this.workers).forEach(function() {
    self.next(function(path) {
      doneCriteria.done(path);
      self.emit('next');
    });
  });
};

Pool.prototype.next = function(callback) {
  var path = this.paths.shift();
  if (path) {
    this.emit('ready', path, function() {
      return callback(path);
    });
  }
};

module.exports = Pool;
