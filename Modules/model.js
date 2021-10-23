'use strict'
const mongoose = require ('mongoose'); 
let bookschema = require('./schema.js');  
//Set up schema 
const bookmodel = mongoose.model('booksdatabase', bookschema); 

module.exports=bookmodel;  