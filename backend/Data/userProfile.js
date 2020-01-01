var mongoose = require('mongoose');
const userProfileSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
  },
  firstName: {
    type: String,
    unique: false,
  },
  details: {
    type: String,
    unique: false,
  },
  imageUrl:{
      type:String,
      unique:false
  }
});
module.exports  = mongoose.model('userProfiles', userProfileSchema);