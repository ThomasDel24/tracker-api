require('dotenv').config();
const { MongoClient } = require('mongodb');

let db; //In the trial that we did for the driver, we used the connection to the database in a sequence of operations and closed it. In the application, instead, we will maintain the connection so that we can reuse it for many operations, which will be triggered from within API calls. So, we’ll need to store the connection to the database in a global variable. We do that and call the global database connection variable db

async function connectToDb(){ //This connects to the database, which initializes the global variable (db). We don't catch any errors in this function, instead, we let the caller deal with them.
    const url = process.env.DB_URL || 'mongodb://localhost/issuetracker'; //We can use any environment variable using process.env properties. Set to DB_URL from process.env and default it to the original localhost value if it is undefined
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB at', url);
    db = client.db();
}

async function getNextSequence(name) { //Takes the ID of the counter and return the next sequence. In this function, all we have to do is call findOneAndUpdate(). It identifies the counter to use using the ID supplied, increments the field called current, and returns the new value. The arguments to the method findOneAndUpdate() are (a) the filter or match, for which we used _id, then (b) the update operation, for which we used a $inc operator with value 1, and finally, (c) the options for the operation.
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name }, //Filter applied is by _id, with the name argument passed in ('jobs')
    { $inc: { current: 1 } }, //Operater $inc, the field to increment is current, 1 signifies to perform on this field, 0 is to not perform
    { returnOriginal: false }, //By default, the result of the findOneAndUpdate() method returns the original document. To make it return the new, modified document instead, the option returnOriginal has to be set to false.
  );
  return result.value.current;
} 

function getDb(){
    return db;
}

module.exports = { connectToDb, getNextSequence, getDb };
