const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const multitenancy = require('../index');

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

    it('references a custom model if provided in the options', function() {
      const userSchema = new Schema({
        username: String
      });
      const User = mongoose.model('User', userSchema);

      schema.plugin(multitenancy, { ref: 'User' });

      const path = schema.path('account');
      should.exist(path);
      path.instance.should.eq('ObjectID');
      path.isRequired.should.eq(true);
      path.options.ref.should.eq('User');
    });
  });
});
