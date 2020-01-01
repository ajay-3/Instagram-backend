const express            = require('express');
const cors               = require('cors');
const path               = require('path');
const mongoose           = require('mongoose')
const bodyParser         = require('body-parser');
const userCredentials    = require('./Data/userCredentials.js');
const userProfiles       = require('./Data/userProfile');
const userPosts          = require('./Data/userPosts');
const userFollowers      = require('./Data/userFollow');
const randomPosts        = require('./Data/randomPosts')
const upload             = require("./services/file-upload");
const jwt                = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
const singleUpload       = upload.single('image');


app.post("/api/register",async (req,res)=>{
  try{
  var exists = await userCredentials.findOne({userName:req.body.Name});
  if(exists){
    res.json("userName Already exists")
  }
  var user = new userCredentials({
  userName:req.body.Name,
  email :req.body.Email,
  password:req.body.Password 
  });
  await user.save();
  res.json("user created Successfully");
  }
  catch(err){
  res.json({message:err});
  }
});
    
app.post("/api/login",async (req,res)=>{
  try {
    var user = await userCredentials.findOne({ userName: req.body.Name }).exec();
    if(!user) {
      return res.json({ message: "The username does not exist" ,validity:"false"});
    }
    user.comparePassword(req.body.Password, (error, match) => {
        if(!match) {
          return res.json({ message: "The password is invalid" ,validity:"false"});
        }
        res.json({ message: "The username and password combination is correct!" ,validity:"true"});
    });     
  } catch (err) {
    res.json({message:err}); 
    }
  });

app.post("/api/imageUpload", function(req, res) {
  singleUpload(req, res, function(err) {
    if (err) {
      return res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}] });
    }
    return res.send({'imageUrl': req.file.location});  
  });
});

app.post("/api/userProfile", async(req, res) =>{
  try{
    const user = new userProfiles({
    userName :req.body.userName,
    firstName:req.body.firstName,
    details :req.body.details,
    imageUrl :req.body.imageUrl
    });
    const userProfile = await user.save();
    res.json(userProfile);
  }catch(err){
    res.json({message:err})
  }
 });

app.get("/api/userProfile",async(req,res)=>{
   try{
     const user = await userProfiles.findOne({"userName": req.headers.username});
     if(user){
      res.json(user);
     }else{
       res.json("NoUser");
     } 
   }catch(err){
    res.json({message:err})
   }
});

app.post("/api/follow",async(req,res)=>{
  try{
      const user = await userFollowers.findOne({userName:req.headers.username});
      if(user){
        console.log("enterd")
       await userFollowers.update({"userName":req.headers.username},{$push:{"following":req.body.searchUserName}});
       await userFollowers.update({"userName":req.body.searchUserName},{$push:{"followers":req.headers.username}});
       res.json(true); 
      }
      else{
       const newUser = new userFollowers({
          userName:req.headers.username,
          following:req.body.searchUserName
        });
        await newUser.save();
        await userFollowers.update({"userName":req.body.searchUserName},{$push:{"followers":req.headers.username}});
        res.json(true);
       }
  }catch(error){
    res.json({message:error})
  }
});

app.post("/api/unfollow",async(req,res)=>{
  try{
  await userFollowers.update({"userName":req.headers.username},{$pull:{"following":req.body.searchUserName}});
  await userFollowers.update({"userName":req.body.searchUserName},{$pull:{"followers":req.headers.username}});
  res.json(true);
  }catch(error){
    res.json({message:error});
  }
});

app.get("/api/follow",async(req,res)=>{
  try{
    const following = await userFollowers.findOne({userName:req.headers.username},{following:1});
    res.json(following);
  }catch(error){
       res.json({message:error});
  }
});

app.get("/api/count",async(req,res)=>{
  try{
       const user = await userFollowers.findOne({userName:req.headers.username});
       res.json(user);
  }catch(err){
    res.json({message:error})
  }
})

app.post("/api/posts",async(req,res)=>{
  try{
    const user = await userPosts.findOne({userName:req.headers.username});
    console.log(req.body);
    if(user){
     const userPost=await userPosts.update({"userName":req.headers.username},{$push:{"posts": req.body}});
      const user1 = await userPosts.findOne({userName:req.headers.username});
      console.log(user1);
    }else{
      const userpost = new userPosts({
      userName : req.headers.username,
      posts:req.body
    }) 
    const userPt=await userpost.save();
    console.log(userPt);
  }}catch(err){
    res.json({message:err});
  }
});

app.get("/api/posts",async(req,res)=>{
  const posts = await userPosts.findOne({userName:req.headers.username});
  res.json(posts);
});

app.put("/api/like",async(req,res)=>{
  try{
    console.log(req.body);
     await userPosts.updateOne({"userName":req.body.postUserName,"posts.imageUrl":req.body.imageUrl},
      {$inc:{"posts.$.likes":1}});
      var updated = await userPosts.findOne({"userName":req.body.postUserName},{"posts":1});
      res.json(updated);
  }catch(error){
    res.json({message:error});
  }
});

app.put("/api/comment",async(req,res)=>{
  try{
    console.log(req.body);
    console.log(req.headers);
    await userPosts.updateOne({"userName":req.body.postUserName,"posts.imageUrl":req.body.imageUrl},
    {$push:{"posts.$.comment":{"userName":req.headers.username,"comment":req.body.comment}}});
    var updated = await userPosts.findOne({"userName":req.body.postUserName},{"posts":1});
      res.json(updated);
  }catch(error){
    res.json({message:error});
  }
})



app.get("/api/newsfeed",async(req,res)=> {
  try{
    const newsfeed=[];
    const userfollowing = await userFollowers.findOne({"userName":req.headers.username},{following:1});
    if(!userfollowing.following){
      res.json("The user is not following anyone");
    }
    for(let i=0;i<userfollowing.following.length;i++){
      const imagesArray =  await userPosts.find({"userName":userfollowing.following[i]},{posts:1});
      var length=imagesArray[0].posts.length; 
      var post = imagesArray[0].posts[length-1];
      newsfeed.push({"userName":userfollowing.following[i],"post":post});
    }
    res.json(newsfeed);
  }catch(error){
    res.json({message:error});
  }
});

// $project:{post:{ $arrayElemAt: [ "posts", -1 ] }}
app.get("/api/randomNewsfeed", async(req,res) => {
    try{
        res.json(randomPosts);
    }catch(error){
      res.json({message:error})
    }
});

var url = 'mongodb://127.0.0.1/Instagram';
mongoose.connect(url,{useNewUrlParser:true});
var db = mongoose.connection;
db.on('connected',()=>{console.log("The connection has been established")})
db.on('error', (err)=>{console.log("There has been an error which is" +err)});

app.listen(3000,()=>{console.log("server started at 3000" )})