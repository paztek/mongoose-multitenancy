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

  context('Definition', function() {

    var schema;

    beforeEach(function() {
      schema = new Schema({
        firstName: String,
        lastName: String
      });
    });

    it('adds a required `account` property on the model', function () {
      schema.plugin(multitenancy);

      var path = schema.path('account');
      should.exist(path);
      path.instance.should.eq('ObjectID');
      path.isRequired.should.eq(true);
    });
  });
});
