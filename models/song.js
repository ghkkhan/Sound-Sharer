// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
// Require Mongoose
var mongoose = require('mongoose');

// Define a schema
var Schema = mongoose.Schema;

var Song = new Schema({
    title: String
});

// Export function to create "Song" model class
module.exports = mongoose.model('Song', Song);