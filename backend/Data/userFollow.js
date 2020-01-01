var mongoose = require('mongoose');
const userFollowerSchema = new mongoose.Schema({
    userName: {
      type: String,
      unique: true,
    },
    followers:{
        type:Array,
        unique:false
    },
    following:{
        type:Array,
        unique:false
    }
  });
  module.exports  = mongoose.model('userFollowers', userFollowerSchema);