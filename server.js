'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
//Bring in the Mongo 
const mongoose = require ('mongoose'); 
const PORT = process.env.PORT || 3001;

//Create a collection called booksdatabase
mongoose.connect(process.env.MONGO_CONNECTION_STRING,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

//assign connection to a variable
const db = mongoose.connection; 

//Bring in modules
let bookModel = require('./modules/model.js');
let bookSchema = require('./modules/schema.js'); 


//Testing Route set-up 
app.get('/test', (request, response) => {
  response.send('test request received') 
})

app.listen(PORT, () => console.log(`listening on ${PORT}`));
 


