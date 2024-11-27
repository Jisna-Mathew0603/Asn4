// Load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MovieSchema = new Schema({
    Movie_ID: { type: Number, unique: true },  // Ensure this matches the type in your data
    Title: { type: String, required: true },   // Ensure this matches the type in your data
    Released: { type: String },
    Genre: { type: String },
    Rating: { type: Number }
});
// Export the model
// Create and export the Movie model
module.exports = mongoose.model('Movie', MovieSchema, 'movieCollection');
