const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
require('dotenv/config')

var LocalStrategy = require('passport-local');

const methodOverride = require('method-override')


const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose")

const app = express();

const postRoute = require("./route/posts")

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {

    let method = req.body._method
    delete req.body._method
    return method
  }
}))

app.use(session({
  note: "Your notes.",
  firstName: "First Name",
  title: "Title",
  content: "Content",
  secret: "somevalue",
  resave: false,
  saveUninitailized: false

}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_CONNECTION, {useNewUrlParser: true});


const userSchema = new mongoose.Schema({
  firstName: String,
  lastName:String,
  email:String,
  password: String,
  book:[
    {
      title : String,
      content: String


  }
]
});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get("/", function(req, res){
  res.render("home")

})

app.get("/compose", function(req, res){
    if(req.isAuthenticated()){
      res.render("compose")
  } else {
    res.redirect("/login");
  }

})

app.post("/compose", function(req, res){

  const submittedNote = req.body
  // console.log(submittedNote)
  console.log(req)

  const note = {"title": req.body.bookTitle, "content": req.body.bookContent}


  User.findById(req.user.id, function(err, foundUser){
    if(err){
      console.log(err)
    } else{
      if(foundUser){
        foundUser.book.push(note)

        foundUser.save(function(){
          res.redirect("/userhome")
        })
      }
    }
  })
  })


app.get("/about", function(req, res){
  res.render("about")
})

app.get("/getting-started", function(req, res){
  res.render("getting-started")
})

app.get("/userhome", function(req, res){

  if(req.isAuthenticated()){
    User.findById(req.user.id, function(err, foundUser){

      if(err){
        console.log(err)
      } else{
        if(foundUser){
          res.render("userhome",{
            foundUser: foundUser.book,
            logId: foundUser.id,
            firstName: foundUser.firstName,


          })

        }
      }
    })
  }

})

app.post("/userhome", function(req, res){
  res.redirect("/userhome")
})


app.get("/notes", function(req, res){



})

app.get("/userhome/notes/:notesId", function(req, res){




const userId = req.user.id

const notes = req.user.book.id

  const reqestedNotesId = req.params.notesId

  User.findById(req.user.id, function(err, foundNote){
    console.log(foundNote.id)
    const book = foundNote.book

    const filterBook = book.find((e) => e._id == reqestedNotesId)

    if(err){
      console.log(err)
    } else{
      if(foundNote){

        res.render("notes",{
            title: filterBook.title,
            content: filterBook.content,
            book_id: reqestedNotesId,
            user_id: foundNote.id


        })

      }
    }
});
})


app.route("/api")
.get(function(req, res){

  User.find(function(err, foundBooks){
    if(!err){
        res.send(foundBooks);
    } else {
      res.send(err);
    }

  })

})
.post(function(req, res){

  const newBook = new Book({
  title: req.body.title,
  content: req.body.content
})
newArticle.save(function(err){
  if(!err){
    res.send("Successful")
  } else{
    res.send(err)
  }
})

})


app.route("/api/:ids/:bookID")

.put(function(req, res){

  console.log(req)

  const updateUser = User.findOne({'book._id' :req.params.id});

  let user_id = req.params.ids
  let book_id = req.params.bookID



  const next_UpdateUser = User.findOne({'book._id': req.params.ids});



  User.update({'book._id': book_id},
     {'$set': {
            'book.$.title': req.body.title, 'book.$.content' : req.body.content
    }},
         function(err,model) {
     if(err){
         console.log(err);
         return res.send(err);
       }
       return res.redirect("/userhome");
});
})
.delete(function(req, res){

  let user_id = req.params.ids
  let book_id = req.params.bookID
  //


User.updateOne({"username" : req.user.username}, {$pull: {"book" : {"title" : req.body.button }}}, function(err, log){

res.redirect("/userhome")
})

})


app.get("/register", function(req, res){

  res.render("register")

})


app.post("/register", function(req, res){

  console.log(req)

  User.register({username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/userhome")
      })
    }
  })
})


app.get("/login", function(req, res){
  res.render("login")
})

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/")
})

app.post("/login", function(req, res){

const user = new User({
 username : req.body.username,
 password : req.body.password
})

req.login(user, function(err){
  if(err){
    console.log(err)
  } else{
    passport.authenticate("local")(req, res, function(){
      res.redirect("/userhome")
    })
  }
})
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server started on port 3000")
})
