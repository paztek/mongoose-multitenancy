/**
 * Mongoose Multitenancy Plugin
 * Copyright(c) 2017 Matthieu Balmes <matthieu.balmes@gmail.com>
 * MIT Licensed
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function multitenancyPlugin(schema, options) {
  options = options || {};
  const path = options.path || 'account';
  const ref = options.ref || 'Account';

  if (!schema.path(path)) {
    const attributes = {};
    attributes[path] = {
      type: Schema.Types.ObjectId,
      ref: ref,
      index: true,
      required: true
    };
    schema.add(attributes);
  }
}

module.exports = multitenancyPlugin;
