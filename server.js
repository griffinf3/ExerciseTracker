const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var shortid = require('shortid');
//var ShortId = require('mongoose-shortid');
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', { useNewUrlParser: true });
//mongoose.connect("mongodb://localhost:27017/YourDB", { useNewUrlParser: true });

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


//var ShortId = require('id-shorter');
//var ShortId = require('mongoose-shortid');
//var mongoDBId = ShortId({
  //  isFullId: true
//});
//var shortId = mongoDBId.encode('565ffd0edf3d990540b3134c');

//{ 
 // _id: {
     //   type: ShortId,
      //  len: 9,
     //   alphabet: 'fubar'
   // },


var userSchema = new mongoose.Schema({
  shortid: {
  'type': String,
  'default': shortid.generate
},
  username: { type: String, unique: true, required: true},  
}); 
                                     
var workoutSchema = new mongoose.Schema({
  shortid: {type: String},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  date2: {type: Number},
  date:{type: String},
  date3: {type: Date}});
//, idshort: {type: String}
// required: true
var User = mongoose.model('User', userSchema);
var Workout = mongoose.model('Workout', workoutSchema);

app.post('/api/exercise/new-user', (req, res) => {
 console.log('creatingnow');
   //username: req.body.username});
  let username = req.body.username.toString();
  User.find({username: username}, function (err, doc) {
    if (err) res.json({err});
    else if (doc.length > 0) {res.json({message: 'The username entered already exists.', doc: doc})}
    else 
    {
      
  User.create({username: username}, function (err, username) {
  if (err) res.json({username: 'wehaveaneerr', error: err});
    User.findOne({username: req.body.username.toString()}, function (err, data) {
  if (err) res.json({username: 'wehaveanerror', data: data, error: err});
      //let shorterid = mongoDBId.encode('565ffd0edf3d990540b3134c');
    res.json({data});
  })  
  // saved!
})}})});

app.post('/api/exercise/add', (req, res) => {
 console.log('addingnow');
  let userid = req.body.userId.toString();

    User.find({shortid: userid}, function (err, data) {
  if (err) res.json({userid: 'wehaveanerror', error: err});
      //let shorterid = mongoDBId.encode('565ffd0edf3d990540b3134c');
      else if (data.length > 0)
      
      {console.log('userfound');
       console.log(data[0].username);
        let un = data[0].username;
        let des = req.body.description;
      let dur = req.body.duration;
       console.log(req.body.date);
       let date = req.body.date || new Date();
      let date2 = new Date(date).getTime();
       let event = new Date(date);
       let date3= event.toDateString()
       //let user = data[0].username;
       //console.log('user:'+ data[0].username);
       console.log(userid+ ':'+  des + ':' + dur + ':' + date);
       
     if (des.length == 0 || dur.length == 0)
     {res.json('please complete required fields');}
       
     else  
     {  
    var workout = new Workout({
    shortid: userid,
    description: des,
    duration: dur,
    date: date3,
    date2: date2
        });
    console.log(workout);
  workout.save((err, data) => {
    let sid= data.shortid;
    if (err)
      res.json({error: err});
    else res.json({username: un, description: des, duration: dur, userId:sid, date: date});
  });
     }   
  }
     else  res.json('unknown userId');
  // saved!
});});

app.get('/api/exercise/log?', (req, res) => {
  //userId
  //from
  //to
  //limit
  let userId = req.query.userId;
  let fromDate=  parseInt(new Date(req.query.from).getTime()) || 0;
  console.log(fromDate);
  let toDate =  parseInt(new Date(req.query.to).getTime()) || Date.now();
  let limit = parseInt(req.query.limit) || 100000000;
  //console.log('toDate' + toDate);
  //{field: {$gte: value} }
  User.findOne({shortid: userId}, function (err, doc) {
    if (err) res.json({err});
    else if (doc) {
      let username = doc.username;
         Workout.find(
         
         
         {
         
         
         $and:[
         
         {shortid: userId},
           
           {date2: {$gte: fromDate}},
           {date2: {$lte: toDate}}
         
         
         
         
         ]
         
         
         
         },
           {'description': 1, 'duration': 1, 'date':1, '_id':0}
         
  
         ).limit(limit).exec(function (err, data) {
  if (err) res.json({error: err});
    else 
      
      
    {
      //{shortid: userId, date2: {$gte: fromDate||0}, date2: {$lte:toDate||0}})
      //console.log('difference:'+ 
                 
                 //(new Date(req.query.to))>(data[0].date).getTime()
                
               // );
    // console.log((new Date(req.query.to)));
    // console.log(data[0].date);
      //new Date(toDate)
      res.json({userId: userId, username: username, count: data.length, log: data});}
         
         });}
    else {
      
      
      res.json('unknown userId');
    
         }
    ;
    
  //var foodToSearch = "burrito";
    //shortid: userId, 
  
  })
  
  //res.json({userId: userId, fromDate: fromDate, toDate: toDate, limit: limit});
  //{userId}[&amp;from][&amp;to][&amp;limit]
});

    //return done(null, data);
//createAndSavePerson();
//findPeopleByName (req.body.username);

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
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
})
