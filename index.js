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

  var ref;
  var Tenant;
  if (options.model) {
    Tenant = options.model;
    ref = Tenant.modelName;
  } else {
    ref = options.ref || 'Account';
    Tenant = mongoose.model(ref);
  }

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

      var query = {};

      if (args.length > 0) {
        if (args[0] instanceof Tenant) {
          // If the first argument is a tenant, we remove it from the list of arguments
          const tenant = args.shift();

          if (args.length > 0) {
            // Next argument can be either null, the query or the callback function if no query was provided
            if (_.isFunction(args[0])) {
              query[path] = tenant;
              args.unshift(query);
            } else if (_.isPlainObject(args[0])) {
              args[0][path] = tenant;
            } else {
              query[path] = tenant;
              args[0] = query;
            }
          } else {
            query[path] = tenant;
            args.unshift(query);
          }
        } else if (args[0] instanceof mongoose.Types.ObjectId || _.isString(args[0])) {
          // If the first argument is a tenant ID, we remove it from the list of arguments
          const tenantId = args.shift();

          if (args.length > 0) {
            // Next argument can be either null, the query or the callback function if no query was provided
            if (_.isFunction(args[0])) {
              query[path] = tenantId;
              args.unshift(query);
            } else if (_.isPlainObject(args[0])) {
              args[0][path] = tenantId;
            } else {
              query[path] = tenantId;
              args[0] = query;
            }
          } else {
            query[path] = tenantId;
            args.unshift(query);
          }
        }
      }

      return Tenant[method].apply(this, args);
    };
  });
}

module.exports = multitenancyPlugin;
