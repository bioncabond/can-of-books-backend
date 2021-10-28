'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

//Bring in the Mongo 
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3001;


//Create a collection called booksdatabase
mongoose.connect(process.env.MONGO_CONNECTION_STRING,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

//Bring in modules and setting up the database
let bookModel = require('./Modules/model.js');
let bookSchema = require('./Modules/schema.js');
const DatabaseEntry = mongoose.model('booksdatabase', bookSchema);


//Route set-up 
app.get('/', (request, response) => response.status(200).send('This is the root. It works!'));
app.get('/test', (request, response) => {
  response.send('test request received')
})
app.post('/test/:info', (req, res) => {
  try {
    console.log('\nQuery:', req.query, '\nParams:', req.params, '\nBody:', req.body);
    res.status(200).send('Posted!');

  }
  catch (e) {
    console.log('error:', e.message);
  }
}
);
app.get('/clear', bombTheBase);
app.get('/seed', seed);
app.get('/find', searchDatabase);
app.get('/books', (request, response) => {
  console.log(request.query);
  DatabaseEntry.find((err, item) => {
    if (err) return response.status(500).send(err);
    else {
      response.status(200).send(item);
    }
  });
});

app.post('/books', postBooks);
app.delete('/books/:id', deleteBooks);

//assign connection to a variable
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));

db.once('open', () => console.log('mongo database is connected!'));

app.listen(PORT, () => console.log(`listening on ${PORT}`));


//clear the database
async function bombTheBase(req, res) {
  try {
    await DatabaseEntry.deleteMany({});
    console.log('Database cleared')
      ;
    res.status(200).send('cleared');
  }
  catch (e) {
    console.log('error:', e.message);
  }
}

//Create postBooks function 
async function postBooks(req, res) {
  let postObj = req.body;
  console.log(postObj);
  //If the data is what you want, put into the database directly, if not going to message.
  try {
    let postEntry = DatabaseEntry(postObj);
    console.log(postObj);
    postEntry.save();
    res.status(200).send(postObj);
  }
  catch (err) {
    res.status(500).send('psot machine broke: ', err.message);
  }
}

//make deleteBooks function
async function deleteBooks(req, res) {
  let { id } = req.params;
  console.log(id);

  try {
    //delete the object
    let deletedObj = await EquipModel.findByIdAndDelete(id);
    res.status(200).send(deletedObj);
  }
  catch (err) {
    res.status(500).send('delete machine broke:', err.message);
  }
}

//Find All the entries in the database
DatabaseEntry.find((err, item) => {
  if (err) return console.error(err);
  // console.log(item);
})

//test data manually entered and seed the database
function seed(req, res) {
  const seedArr = [
    {
      name: 'Bionca', description: 'Baller', status: 'struggling', email: 'bionca@aol.com',
    },
    {
      name: 'Jae', description: 'avid reader', status: 'still here', email: 'wethebestmusic@gmail.net',
    },
    {
      name: 'JP', description: 'flawless', status: 'ghostbuster', email: 'jp@teachers-R-us.com',
    },
  ]
  seedArr.forEach(user => {
    let entry = new DatabaseEntry(user);
    entry.save();
  })
  res.status(200).send('Seeded Database');
}

//make searchDatabase function to get the email 
async function searchDatabase(req, res) {
  console.log(req)
  if (req.query.email) {
    let { email } = req.query;
    let filterQuery = {};
    filterQuery.email = email;
    const item = await DatabaseEntry.find(filterQuery);
    res.status(200).send(item);
  }
  else {
    res.status(200).send([]);
  }
}


