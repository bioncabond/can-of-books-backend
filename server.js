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

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

var client = jwksClient({
  //jwksUri: Account specific:  settings -> advanced settings -> endpoint -> JSON Web Key Set
  jwksUri: 'https://dev-3hgg7hjn.us.auth0.com/.well-known/jwks.json'
});
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

//Create a collection called booksdatabase
mongoose.connect(process.env.MONGO_CONNECTION_STRING,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

//Bring in modules and setting up the database
let bookModel = require('./Modules/model.js');
let bookSchema = require('./Modules/schema.js');
const DatabaseEntry = mongoose.model('booksdatabase', bookSchema);

//assign connection to a variable
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));

db.once('open', () => console.log('mongo database is connected!'));



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
// app.get('/find', searchDatabase);
app.get('/books', getBooks);

app.post('/books', postBooks);
app.delete('/books/:id', deleteBooks);
app.put('/books/:id', putBooks);


app.get('*', ((request, response) => response.status(400).send('no route')));

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

//Find All the entries in the database
// DatabaseEntry.find((err, item) => {
//   if (err) return console.error(err);
//   // console.log(item);
// })

//test data manually entered and seed the database
function seed(req, res) {
  const seedArr = [
    {
      title: 'The Color Purple by Alice Walker', description: 'A story about a woman finding herself.', status: 'Lit', email: 'bionca@aol.com',
    },
    {
      title: 'Eragon', description: 'A boy finds a dragon egg and adventures unfold.', status: 'Fantasy', email: 'wethebestmusic@gmail.net',
    },
    {
      title: 'Ghostbusters', description: 'People go exorcise ghosts with cool technologies and a strong team spirit.', status: 'Ghostbuster', email: 'jp@teachers-R-us.com',
    },
  ]
  seedArr.forEach(user => {
    let entry = new DatabaseEntry(user);
    entry.save();
  })
  res.status(200).send('Seeded Database');
}

//make searchDatabase function to get the email 
// async function searchDatabase(req, res) {
//   console.log(req)
//   if (req.query.email) {
//     let { email } = req.query;
//     let filterQuery = {};
//     filterQuery.email = email;
//     const item = await DatabaseEntry.find(filterQuery);
//     res.status(200).send(item);
//   }
//   else {
//     res.status(200).send([]);
//   }
// }

async function getBooks(request, response) {
  try {
    let filterQuery = {};
    if (req.query.email) {
      let { email } = req.query;
      filterQuery.email = email;
    }
    const item = await DatabaseEntry.find(filterQ);
    let token = '';
    if (!req.headers.authorization) token = '';
    else {
      token = req.headers.authorization.split([' '])[1];
    }

    jwt.verify(token, getKey, {}, function (err, user) {
      if (err) res.status(500).send(`Auth Machine Broke: ${err.message}`);
      else {
        res.status(200).send(item);
      }
    })

  }
  catch (error) {
    res.status(500).send(`error retrieving books data:${error.message}`);
  }
}
// app.get('/books', (request, response) => {

//   DatabaseEntry.find((err, item) => {
//     if (err) return response.status(500).send(err);
//     else {
//       response.status(200).send(item);
//     }
//   });
// });

//Create postBooks function 
async function postBooks(req, res) {
  try {
    let bookInfo = req.body;
    console.log(bookInfo);
    //If the data is what you want, put into the database directly, if not going to message.
    let postedBook = await bookModel.create(bookInfo);
    postedBook.save();
    console.log('postedBook: ', postedBook);
    res.status(200).send(postedBook);
  }
  catch (err) {
    res.status(500).send('post machine broke: ', err.message);
  }
}

//Make deleteBooks function
async function deleteBooks(req, res) {
  try {
    let id = req.params.id;
    console.log(id);
    // postEquip
    //delete the object
    let deletedBook = await DatabaseEntry.findByIdAndDelete(id);
    res.status(200).send(deletedBook);
  }
  catch (err) {
    res.status(500).send(err.message);
  }
}

//Make the putBooks function
async function putBooks(req, res) {
  let updatedBookInfo = req.body;
  console.log('putBody:', updatedBookInfo);
  let id = req.params.id;
  console.log('putParam:', id);
  try {
    const updatedBook = await bookModel.findByIdAndUpdate(id, updatedBookInfo, { new: true, overwrite: true });
    console.log(updatedBook);
    res.status(200).send(updatedBook);
  }
  catch (err) {
    res.status(500).send(`PUT machine broke: ${err.message}`);
  }
}