var mongoose = require('mongoose');
const userPostsSchema = new mongoose.Schema({
    userName: {
      type: String,
      unique: true,
    },
    posts: {
        type:Array
      } 
  });
  module.exports  = mongoose.model('userPosts', userPostsSchema);