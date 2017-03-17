var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var multitenancy = require('../index');

describe('Schema', function() {

  var connection;

  before(function() {
    connection = mongoose.createConnection('mongodb://localhost/mongoose-multitenancy');
    connection.on('error', function (err) {
      console.error('MongoDB error: ' + err.message);
      console.error('A running MongoDB server is necessary to run these tests');
    });
  });

  after(function() {
    connection.close();
  });

  it('should pass', function() {
    true.should.be.true;
  });
});
