/**
 * Mongoose Multitenancy Plugin
 * Copyright(c) 2017 Matthieu Balmes <matthieu.balmes@gmail.com>
 * MIT Licensed
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function multitenancyPlugin(schema, options) {
  const account = 'account';

  if (!schema.path(account)) {
    schema.add({
      account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        index: true,
        required: true
      }
    });
  }
}

module.exports = multitenancyPlugin;
