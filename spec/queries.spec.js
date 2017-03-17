const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const async = require('async');

const multitenancy = require('../index');

describe('Queries', function() {

  /*
  var userSchema = new Schema({
    username: String
  });
  var User = mongoose.model('User', userSchema);
  */

  before(function(done) {
    mongoose.connect('mongodb://localhost/mongoose-multitenancy', function(err) {
      if (err) {
        console.error('MongoDB error: ' + err.message);
        console.error('A running MongoDB server is necessary to run these tests');
      }
      done(err);
    });
  });

  after(function(done) {
    mongoose.connection.close(done);
  });

  context('With default options', function() {
    var accountSchema = new Schema({
      name: String
    });
    var Account = mongoose.model('Account', accountSchema);

    var account1 = new Account({ name: 'Account 1' });
    var account2 = new Account({ name: 'Account 2' });

    var schema = new Schema({
      color: String,
      brand: String
    });
    schema.plugin(multitenancy);

    var Car = mongoose.model('Car', schema);

    beforeEach(function(done) {
      // Remove all cars
      Car.remove({}, done);
    });

    beforeEach(function(done) {
      // Insert a few cars on both accounts
      var car11 = new Car({ account: account1, color: 'red', brand: 'Renault' });
      var car12 = new Car({ account: account1, color: 'blue', brand: 'Renault' });
      var car13 = new Car({ account: account1, color: 'blue', brand: 'Peugeot' });

      var car21 = new Car({ account: account2, color: 'black', brand: 'Peugeot' });
      var car22 = new Car({ account: account2, color: 'red', brand: 'Mercedes' });

      async.eachSeries([car11, car12, car13, car21, car22], function(car, callback) { car.save(callback); }, done);
    });

    context('When no account is provided', function() {

      context('`find` method', function() {

        it('doesn\'t scope the query', function(done) {
          Car.find({ color: 'red' }, function(err, cars) {
            cars.length.should.eq(2);
            done();
          });
        });

        it('keeps the other arguments of the query', function(done) {
          Car.find({ color: 'red' }, 'brand', function(err, cars) {
            const car = cars[0];
            should.not.exist(car.color);
            done();
          });
        });

        it('is still chainable', function(done) {
          Car.find({ color: 'red' }).sort({ brand: 1 }).exec(function(err, cars) {
            const car = cars[0];
            car.brand.should.eq('Mercedes');
            done();
          });
        });
      });
    });

    context('When an account is provided', function() {

      context('`find` method', function() {

        it('scopes the query', function(done) {
          Car.find(account1, { color: 'red' }, function(err, cars) {
            cars.length.should.eq(1);
            done();
          });
        });

        it('keeps the other arguments of the query', function(done) {
          Car.find(account1, { color: 'red' }, 'brand', function(err, cars) {
            const car = cars[0];
            should.not.exist(car.color);
            done();
          });
        });

        it('is still chainable', function(done) {
          Car.find(account1, { color: 'blue' }).sort({ brand: 1 }).exec(function(err, cars) {
            const car = cars[0];
            car.brand.should.eq('Peugeot');
            done();
          });
        });
      });
    });

  });
});
