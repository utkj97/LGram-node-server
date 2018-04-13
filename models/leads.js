const mongoose = require('mongoose');

//Schema of User model that stores data related to a particular IP
var userSchema =  new mongoose.Schema({
  ip_address: String,
  times_viewed: Number,
  timestamp_of_views: Array,
  source: Array,
  campaign: Array,
  location: Array
});

//Schema of View model that stores data related to total number of clicks
var viewSchema = new mongoose.Schema({
  unique_views: Number,
  return_views: Number,
});

//Models for the schemas created
var Views = mongoose.model('Views', viewSchema);
var Users = mongoose.model('Users', userSchema);

//Models exported for API use
module.exports.Views = Views;
module.exports.Users = Users;
