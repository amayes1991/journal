const mongoose = require('mongoose')
var LocalStrategy = require('passport-local');
const passportLocalMongoose = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
  email:String,
  password: String,
  blog:[
    {
      title : String,
      content: String


  }
]
});



const User = new mongoose.model("User", userSchema)



module.exports = User
