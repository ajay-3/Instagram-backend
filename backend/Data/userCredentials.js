var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const userCredSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: false,
    required :true
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    unique: false,
    required :true
  }
});
userCredSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

userCredSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
module.exports  = mongoose.model('userCredentails', userCredSchema);
