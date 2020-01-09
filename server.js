const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
require('dotenv').config();



const cors = require('cors')

//const mongoose = require('mongoose')
//mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});




// //db set up
// const db = require("./db");
// const dbName = "exercise_tracker";
// const collectionName = "users";

// << db init >>
// db.initialize(dbName, collectionName, function (dbCollection) { // successCallback
//   // get all items
//   dbCollection.find().toArray(function (err, result) {
//     if (err) throw err;
//     console.log(result);
//     console.log('connected to %c collection ', collectionName);
//   });

//   //register new user
//   app.post('/api/exercise/new-user', (req, res, next) => {
//     let username = req.body.username;




//     dbCollection.findOne({ 'username': username })
//       .then((err, user) => {
//         if (user == null) {
//           dbCollection.insertOne({ 'username': username }, (err, data) => {
//             if (err) { return next(err); }
//             console.log(data.ops);
//             console.log('here', username);
//             dbCollection.findOne({ 'username' : username})
//               .then((err,data ) => {
//                 if (err) { return next(err); }
//                 console.log( err.username);
//                 return res.json({ 'username': 'hiba', 'Id': 'id' });

//               })
//           })
//         }
//         else if (user !== null) { return res.json({ 'Err': 'UserName Existed before' }) }

//       });

//     });


//     //end db
//   });

var CONNECTION_URL= process.env.MONGOLAB_URI;
    var DATABASE_NAME='exercise_tracker';

    MongoClient.connect(CONNECTION_URL,  (error, client) => {
      if(error) {
          throw error;
      }
      database = client.db(DATABASE_NAME);
      collection = database.collection("users");
      console.log("Connected to `" + DATABASE_NAME + "`!");
     
//db end
  });

//check users 
app.get('/users', (req, res, next)=>{
  collection.find().toArray(function (err, result) {
    if (err) throw err;
    //console.log(result);
    res.json({'resp': result});
})
});  

app.post('/api/exercise/new-user', (req, res, next) => {

let username = req.body.username;
collection.findOne({'username': username})
.then((user)=>{
  console.log(user);
 if(user) {res.json({'Err': "username Taken"});}
 collection.insertOne({ 'username': username })
 .then( (data) => {
   console.log(data.ops);
   res.json({ 'username': data.ops[0].username, 'Id': data.ops[0]._id });
 })

})

});


app.post('/api/exercise/add', (req, res, next) =>{
  let userId = req.body.userId;
  //console.log(userId);
  let desc = req.body.description;
  let durr = req.body.duration;
  let date = req.body.date;
  collection.findOneAndUpdate({ _id: ObjectId(userId)}, 
  { $push:  {sport: { "Description": desc, "Duration": durr, "date": new Date(date).toUTCString() } } }, {new:true});
  
   
    collection.findOne({"_id": ObjectId(userId)})
     .then((user)=>{
    //  console.log(user);
    res.json({user: user})
     
    }).catch((err)=> console.error(err));
});



app.get('/api/exercise/log', (req, res, next)=>{
  let userId = req.query.userId;
  if(!userId){ res.json({"Err": "Invalid userId"}); }
  collection.findOne({"_id": ObjectId(userId)})
     .then((user)=>{
    //  console.log(user);
    res.json({User_Name: user.username  ,Excercises: user.sport});
     
    }).catch((err)=> console.error(err));
  

});


  //Not found middleware
  app.use((req, res, next) => {
    return next({status: 404, message: 'not found'})
  })

  //Error Handling middleware
  app.use((err, req, res, next) => {
    let errCode, errMessage

    if (err.errors) {
      // mongoose validation error
      errCode = 400 // bad request
      const keys = Object.keys(err.errors)
      // report the first validation error
      errMessage = err.errors[keys[0]].message
    } else {
      // generic or custom error
      errCode = err.status || 500
      errMessage = err.message || 'Internal Server Error'
    }
    res.status(errCode).type('txt')
      .send(errMessage)
  })

  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
    
  });

  
