const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const async = require('async');

const multitenancy = require('../index');

const Account = require('./models/Account');
const User = require('./models/User');

describe('Queries', function() {

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

    const account1 = new Account({ name: 'Account 1' });
    const account2 = new Account({ name: 'Account 2' });

    const schema = new Schema({
      color: String,
      brand: String
    });
    schema.plugin(multitenancy);

    const Car = mongoose.model('Car', schema);

    beforeEach(function(done) {
      // Remove all cars
      Car.remove({}, done);
    });

    beforeEach(function(done) {
      // Insert a few cars on both accounts
      const car11 = new Car({ account: account1, color: 'red', brand: 'Renault' });
      const car12 = new Car({ account: account1, color: 'blue', brand: 'Renault' });
      const car13 = new Car({ account: account1, color: 'blue', brand: 'Peugeot' });

      const car21 = new Car({ account: account2, color: 'black', brand: 'Peugeot' });
      const car22 = new Car({ account: account2, color: 'red', brand: 'Mercedes' });

      async.eachSeries([car11, car12, car13, car21, car22], function(car, callback) { car.save(callback); }, done);
    });

    context('When no tenant is provided', function() {

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

    context('When a tenant is provided', function() {

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

  context('With custom options', function() {

    const user1 = new User({ username: 'user1' });
    const user2 = new User({ username: 'user2' });

    const schema = new Schema({
      color: String,
      brand: String
    });
    schema.plugin(multitenancy, { path: 'owner', ref: 'User' });

    const Voiture = mongoose.model('Voiture', schema);

    beforeEach(function(done) {
      // Remove all cars
      Voiture.remove({}, done);
    });

    beforeEach(function(done) {
      // Insert a few cars on both accounts
      const voiture11 = new Voiture({ owner: user1, color: 'red', brand: 'Renault' });
      const voiture12 = new Voiture({ owner: user1, color: 'blue', brand: 'Renault' });
      const voiture13 = new Voiture({ owner: user1, color: 'blue', brand: 'Peugeot' });

      const voiture21 = new Voiture({ owner: user2, color: 'black', brand: 'Peugeot' });
      const voiture22 = new Voiture({ owner: user2, color: 'red', brand: 'Mercedes' });

      async.eachSeries([voiture11, voiture12, voiture13, voiture21, voiture22], function(voiture, callback) { voiture.save(callback); }, done);
    });

    context('When no tenant is provided', function() {

      context('`find` method', function() {

        it('doesn\'t scope the query', function(done) {
          Voiture.find({ color: 'red' }, function(err, voitures) {
            voitures.length.should.eq(2);
            done();
          });
        });

        it('keeps the other arguments of the query', function(done) {
          Voiture.find({ color: 'red' }, 'brand', function(err, voitures) {
            const voiture = voitures[0];
            should.not.exist(voiture.color);
            done();
          });
        });

        it('is still chainable', function(done) {
          Voiture.find({ color: 'red' }).sort({ brand: 1 }).exec(function(err, voitures) {
            const voiture = voitures[0];
            voiture.brand.should.eq('Mercedes');
            done();
          });
        });
      });
    });

    context('When a tenant is provided', function() {

      context('`find` method', function() {

        it('scopes the query', function(done) {
          Voiture.find(user1, { color: 'red' }, function(err, voitures) {
            voitures.length.should.eq(1);
            done();
          });
        });

        it('keeps the other arguments of the query', function(done) {
          Voiture.find(user1, { color: 'red' }, 'brand', function(err, voitures) {
            const voiture = voitures[0];
            should.not.exist(voiture.color);
            done();
          });
        });

        it('is still chainable', function(done) {
          Voiture.find(user1, { color: 'blue' }).sort({ brand: 1 }).exec(function(err, voitures) {
            const voiture = voitures[0];
            voiture.brand.should.eq('Peugeot');
            done();
          });
        });
      });
    });
  });
});
