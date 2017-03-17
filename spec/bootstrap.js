var mongoose = require('mongoose');
var Promise = require('bluebird');

mongoose.Promise = Promise;

var chai = require('chai');
global.should = chai.should();
