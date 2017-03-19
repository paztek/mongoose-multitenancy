[![Build status](https://travis-ci.org/paztek/mongoose-multitenancy.svg?branch=master)](https://travis-ci.org/paztek/mongoose-multitenancy.svg?branch=master)

# Mongoose Multitenancy plugin

Simple plugin for [Mongoose](https://github.com/LearnBoost/mongoose) which adds an `account` attribute on your model
and overrides query methods to scope queries to the specified account.

## Disclaimer

As opposed to some other mongoose plugins attempting to provide multitenancy,
this plugin doesn't do any fancy stuff with collections or databases.

Instead, this plugin provides syntactic sugar for model methods like `find`, `findOneAndUpdate`, `count`, `update`, etc...

## How it works

This plugin adds a `account` property to the schema of the model on which you want to enable multitenancy.

Then, it provides syntactic sugar on top of the most used query methods to prevent forgetting about the `{ account: ObjectId("507f191e810c19729de860ea") }` where clause.

## Installation

`npm install mongoose-plugin-multitenancy`

## Usage

### Defining the tenant

If you want to provide multitenancy to one of your Models, you first need to define the mongoose model
that will act as your tenant. For instance `Account` or `User`.
 
There is nothing special about this.

```
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
    name: String
});
const Account = mongoose.model('Account', accountSchema);
```

### Enabling multitenancy on one of your models

```
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const multitenancy = require('mongoose-plugin-multitenancy');

const schema = new Schema({
    color: String,
    brand: String
});
schema.plugin(multitenancy);

const Car = mongoose.model('Car', schema);
```

By default, the plugin expects a model named `Account` to be defined first. And it adds an `account` property on your model.

These defaults can be overriden by passing options like:

```
schema.plugin(multitenancy, {
    path: 'owner',
    ref: 'User'
});
```

### Queries

This plugin overrides the following methods to optionnally scope the query to the correct account:

- find
- findOne
- findOneAndUpdate,
- count,
- update,
- remove,
- findOneAndRemove

```
// Insert multiple accounts
const account1 = new Account({ name: 'Account 1' });
const account2 = new Account({ name: 'Account 2' });

// Insert a few cars on both accounts
const car11 = new Car({ account: account1, color: 'red', brand: 'Renault' });
const car12 = new Car({ account: account1, color: 'blue', brand: 'Renault' });
const car13 = new Car({ account: account1, color: 'blue', brand: 'Peugeot' });

const car21 = new Car({ account: account2, color: 'black', brand: 'Peugeot' });
const car22 = new Car({ account: account2, color: 'red', brand: 'Mercedes' });

// ... Save the documents...

// Query methods work as before when no account is specified
Car.find({ color: 'red' }, function(err, cars) {
    // Here we get the 2 red cars, across all accounts
    // ...
});

// Query methods scope the query to the correct account when an account or an _id (ObjectId or string) is passed as first argument
Car.find(account1, { color: 'red' }, function(err, cars) {
    // Here we only get the cars of the first account, here only one
    // ...
});

// You can also only provide the account _id
Car.count(account1._id, { color: 'red' }, function(err, count) {
    // Here count = 1
    // ...
});
```

## License

Copyright (c) 2017 Matthieu Balmes <matthieu.balmes@gmail.com>

Licensed under the MIT license.