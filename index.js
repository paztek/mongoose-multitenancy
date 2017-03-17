/**
 * Mongoose Multitenancy Plugin
 * Copyright(c) 2017 Matthieu Balmes <matthieu.balmes@gmail.com>
 * MIT Licensed
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

function multitenancyPlugin(schema, options) {
  options = options || {};
  const path = options.path || 'account';
  const ref = options.ref || 'Account';

  const Model = mongoose.model(ref);

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

  /**
   * Hook into count, find, findOne, findOneAndRemove, findOneAndUpdate, remove and update functions
   * to allow specifying an account object or ID and scope the query
   */
  _.each(['find', 'findOne', 'count', 'update', 'findOneAndUpdate', 'remove', 'findOneAndRemove'], function(method) {
    schema.statics[method] = function() {
      const args = [].slice.call(arguments);

      if (args.length > 0) {
        if (args[0] instanceof Model) {
          // If the first argument is an account, we remove it from the list of arguments
          const account = args.shift();

          if (args.length > 0) {
            // Next argument can be either null, the query or the callback function if no query was provided
            if (_.isFunction(args[0])) {
              args.unshift({ account: account });
            } else if (_.isPlainObject(args[0])) {
              args[0].account = account;
            } else {
              args[0] = { account: account };
            }
          } else {
            args.unshift({ account: account });
          }
        } else if (args[0] instanceof mongoose.Types.ObjectId || _.isString(args[0])) {
          // If the first argument is an account ID, we remove it from the list of arguments
          const accountId = args.shift();

          if (args.length > 0) {
            // Next argument can be either null, the query or the callback function if no query was provided
            if (_.isFunction(args[0])) {
              args.unshift({ account: accountId });
            } else if (_.isPlainObject(args[0])) {
              args[0].account = accountId;
            } else {
              args[0] = { account: accountId };
            }
          } else {
            args.unshift({ account: accountId });
          }
        }
      }

      return Model[method].apply(this, args);
    };
  });
}

module.exports = multitenancyPlugin;
