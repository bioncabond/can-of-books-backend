'use strict'
const mongoose = require('mongoose');
let bookSchema = require('./schema.js');
//Set up schema 
const bookModel = mongoose.model('booksdatabase', bookSchema);

module.exports = bookModel;