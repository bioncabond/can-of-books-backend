'use strict'
const mongoose = require ('mongoose'); 
//let bookschema = require('./modules/schema.js'); 

const bookSchema = new mongoose.Schema({
    title: {type: String}, 
    description: {type: String}, 
    status: {type: String},
    email: {type: String} 
  })
module.exports=bookSchema;