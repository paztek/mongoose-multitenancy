const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const multitenancy = require('../index');

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
        color: String,
        age: Number
      });
    });

    it('adds a required `account` property on the model', function () {
      schema.plugin(multitenancy);

      const path = schema.path('account');
      should.exist(path);
      path.instance.should.eq('ObjectID');
      path.isRequired.should.eq(true);
      path.options.ref.should.eq('Account');
    });

    it('uses the custom path if provided in the options', function() {
      schema.plugin(multitenancy, { path: 'owner' });

      const path = schema.path('owner');
      should.exist(path);
      path.instance.should.eq('ObjectID');
      path.isRequired.should.eq(true);
      path.options.ref.should.eq('Account');
    });
  });
});
