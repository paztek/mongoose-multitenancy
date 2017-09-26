const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const multitenancy = require('../index');

const Account = require('./models/Account');
const User = require('./models/User');

describe('Schema', function() {

  context('Definition', function() {

    var schema;

    beforeEach(function() {
      schema = new Schema({
        color: String,
        age: Number
      });
    });

    it('adds a required `account` property on the model', function () {
      schema.plugin(multitenancy, { model: Account });

      const path = schema.path('account');
      should.exist(path);
      path.instance.should.eq('ObjectID');
      path.isRequired.should.eq(true);
      path.options.ref.should.eq('Account');
    });

    it('uses the custom path if provided in the options', function() {
      schema.plugin(multitenancy, { model: Account, path: 'owner' });

      const path = schema.path('owner');
      should.exist(path);
      path.instance.should.eq('ObjectID');
      path.isRequired.should.eq(true);
      path.options.ref.should.eq('Account');
    });

    it('references a custom model if provided in the options (1)', function() {
      schema.plugin(multitenancy, { ref: 'User' });

      const path = schema.path('account');
      should.exist(path);
      path.instance.should.eq('ObjectID');
      path.isRequired.should.eq(true);
      path.options.ref.should.eq('User');
    });

    it('references a custom model if provided in the options (2)', function() {
      schema.plugin(multitenancy, { model: User });

      const path = schema.path('account');
      should.exist(path);
      path.instance.should.eq('ObjectID');
      path.isRequired.should.eq(true);
      path.options.ref.should.eq('User');
    });
  });
});
