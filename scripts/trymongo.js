//Let’s also start a new Node.js program just to try out the different ways that the driver’s methods can be used. Let’s call this sample Node.js program trymongo.js and place it in a new directory called scripts, to distinguish it from other files that are part of the application.

require('dotenv').config();

const {  MongoClient} = require('mongodb'); //The first thing to do is make a connection to the database server. This can be done by first importing the object MongoClient from the driver

const url = process.env.DB_URL || 'mongodb://localhost/issuetracker'; //The URL should start with mongodb:// followed by the hostname or the IP address of the server to connect to. An optional port can be added using : as the separator, but it’s not required if the MongoDB server is running on the default port, 27017. issuetracker. Note that the MongoDB Node.js driver accepts the database name as part of the URL itself, and it is best to specify it this way.

// Atlas URL  - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb+srv://UUU:PPP@cluster0-XXX.mongodb.net/issuetracker?retryWrites=true';

// mLab URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb://UUU:PPP@XXX.mlab.com:33533/issuetracker';

function testWithCallbacks(callback) {
  console.log('\n--- testWithCallbacks ---');
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true }); //Creates a new client object from it using a URL that identifies a database to connect to. The client constructor takes in another argument with more settings for the client, one of which is whether to use the new style parser. We pass this also, to avoid a warning in the Node.js driver (version 3.1).
  client.connect((connErr) => { //Call the connect method on the client object. The connect() method is an asynchronous method and needs a callback to receive the result of the connection. The result is the client object itself. 
    if (connErr) { //Callback, function passed as argument will only run after outer function has
      callback(connErr);
      return;
    }
    console.log('Connected to MongoDB URL', url);

    const db = client.db(); //Within the callback, a connection to the database (as opposed a connection to the server) can be obtained by calling the db method of the client object.
    const collection = db.collection('employees'); //The connection to the database, db, is similar to the db variable we used in the mongo shell. In particular, it is the one that we can use to get a handle to a collection and its methods. We get a handle to the collection called employees that we were using in the previous section using the mongo shell.

    const employee = { id: 1, name: 'A. Callback', age: 23 };
    collection.insertOne(employee, (insertErr, result) => { //With this collection, we can do the same things we did with the mongo shell’s equivalent db.employees in the previous section. The methods are also very similar, except that they are all asynchronous. This means that the methods take in the regular arguments, but also a callback function that’s called when the operation completes. The convention in the callback functions is to pass the error as the first argument and the result of the operation as the second argument. We already saw this pattern of callback in the previous connection method.
      if (insertErr) { 
        client.close();
        callback(insertErr);
        return;
      }
      console.log('Result of insert:\n', result.insertedId); //We insert a document and read it back to see how these methods work within the Node.js driver. The insertion can be written using the insertOne method, passing in an employee document and a callback. Within the callback, we print the new _id that was created. Just as in the mongo shell insertOne command, the created ID is returned as part of the result object, in the property called insertedId. Note that accessing the collection and the insert operation can only be called within the callback of the connection operation, because only then do we know that the connection has succeeded.
      collection.find({ _id: result.insertedId }) //Within the callback of the insert operation, we read back the inserted document, using the ID of the result. We used the auto-generated MongoDB ID (_id).
        .toArray((findErr, docs) => {
        if (findErr) {
          client.close();
          callback(findErr);
          return;
        }
        console.log('Result of find:\n', docs);
        client.close(); //Now that we are done inserting and reading back the document, we can close the connection to the server. If we don’t do this, the Node.js program will not exit, because the connection object is waiting to be used and listening to a socket.
        callback(); //We pass a callback function to this function, which we will call from the testWithCallbacks() function once all the operations are completed. Then, if there are any errors, these can be passed to the callback function. And within each callback as a result of each of the operations, on an error, we need to do the following: Close the connection to the server, Call the callback, Return from the call, so that no more operations are performed. We also do the same when all operations are completed.
      });
    });
  });
}

async function testWithAsync() { //The callback paradigm is a bit unwieldy. But the advantage is that it works in the older JavaScript version (ES5), and therefore, older versions of Node.js. The callbacks are bit too deeply nested and the error handling makes for repetitive code. ES2015 started supporting Promises, which is supported by the Node.js MongoDB driver as well, and this was an improvement over callbacks. But in ES2017 and Node.js from version 7.6, full support for the async/await paradigm appeared, and this is the recommended and most convenient way to use the driver. 
  console.log('\n--- testWithAsync ---'); //Prints this first in the console
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect(); //All asynchronous calls with a callback can now be replaced by a call to the same method, but without supplying a callback. Using await before the method call will simulate a synchronous call by waiting for the call to complete and return the results. For example, instead of passing a callback to the connect() method, we can just wait for it to complete.  Right in the next line, we can do whatever needs to be done after the operation is completed, in this case, get a connection to the database.
    console.log('Connected to MongoDB URL', url); //Print after connected to database succesfully
    const db = client.db();
    const collection = db.collection('employees');

    const employee = { id: 2, name: 'B. Async', age: 16 };
    const result = await collection.insertOne(employee);
    console.log('Result of insert:\n', result.insertedId); //Prints id of new object after it has been added succesfully

    const docs = await collection.find({ _id: result.insertedId }).toArray();
    console.log('Result of find:\n', docs); //Prints the newly created object as an array
  } catch (err) {
    console.log(err); //Errors will be thrown and can be caught. We can place all the operations in a single try block and catch any error in one place (the catch block) rather than after each call. There is no need for the function to take a callback, because if the caller needs to wait for the result, an await can be added before the call to this function, and errors can be thrown.
  } finally {
    client.close();
  }
}

testWithCallbacks((err) => { //We make a call to the testWithCallbacks() function from the main section, supply it a callback to receive any error, and print it if any.
  if (err) { //The function passed into test with callbacks will take any errors that have resulted and console.log() that error, notice that within testWithCallbacks() there are functions with the error passed as an argument callback(error) 
    console.log(err); 
  }
  testWithAsync(); //We modify the main part of the program to call testWithAsync() within the callback that handles the return value from testWithCallbacks():
});

//To test the trial program we just created. It can be executed like this: node scripts/trymongo.js




