require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors =require("cors")
const admin = require('firebase-admin');
const serviceAccountKey = require("./bloggin-36eee-firebase-adminsdk-qlmfx-59b94bb48f.json")
const {getAuth} = require("firebase-admin/auth")


const User = require("./Schema/User.js");

const server = express();
let PORT = 3000;
admin.initializeApp(
    {
       credential:admin.credential.cert(serviceAccountKey)
    }
)
let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const dbUrl = process.env.MONGODB_URL;
async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

server.use(express.json());
server.use(cors())

const formatDataSend=(user)=>{
    const access_token = jwt.sign({id:user._id},process.env.SECRET_ACCESS_KEY);
    return {
        access_token,
        profile_img:user.personal_info.profile_img,
        username : user.personal_info.username,
        fullname:user.personal_info.fullname
    }
}

// Signup route
server.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  // Validate fullname length
  if (fullname.length < 3) {
    return res.status(400).json({ "error": "Fullname must be at least 3 letters long" });
  }

  // Validate email
  if (!email) {
    return res.status(400).json({ "error": "Email is required" });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ "error": "Please enter a valid email" });
  }

  // Validate password
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ "error": "Password should be 6 to 20 characters long with at least 1 numeric, 1 lowercase, and 1 uppercase letter" });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ "personal_info.email": email });
    if (existingUser) {
      return res.status(400).json({ "error": "Email already exists" });
    }

    // Hash password
    bcrypt.hash(password, 10, async (err, hashedPass) => {
      if (err) {
        return res.status(500).json({ "error": "Error hashing password" });
      }

      // Generate username from email
      const username = email.split("@")[0];

      const newUser = new User({
        personal_info: {
          fullname,
          email,
          password: hashedPass,
          username,
        },
      });

      // Save user to database
      await newUser.save()
        .then((user) => {
          return res.status(200).json(formatDataSend(user));
        })
        .catch((err) => {
          return res.status(500).json({ "error": err.message });
        });
    });

  } catch (err) {
    return res.status(500).json({ "error": err.message });
  }
});

server.post("/signin",async(req,res)=>
{
    let {email,password}=req.body;
   
    console.log(email);
   let user =await User.findOne({"personal_info.email":email});
   
    if(!user)
    {
        return res.status(403).json({"error":"email not found"});
    }
    
   await bcrypt.compare(password,user.personal_info.password,(err,result)=>
    {
        if(err)
        {
            return res.status(403).json({"error":"some error occured please try again"});
        }

        if(!result)
        {
            return res.status(403).json({"error":"incorrect password"});
        }
        else
        {
            return res.status(200).json(formatDataSend(user))
        }

    })
    
    

})

server.post("/google-auth",async (req,res)=>
{
    
    let {access_token}= req.body;
     
    getAuth().verifyIdToken(access_token)

    .then(async(decodedUser)=>
    {
       let {email,name,picture}=decodedUser;

    //    picture = picture.replace("s96-c","s384-c");
     
       let user = await User.findOne({"personal_info.email":email})
       
      

       if(user){
           if(!user.google_auth)
           {
             return res.status(403).json({"error":"this email was signed up withput google. please log in with password to access the account"})
           }
       }
       else
           {

            
             let username = email.split("@")[0];
             user = new User({
                personal_info:{
                    fullname:name,
                    email,
                    profile_img :picture,
                    username
                },
                google_auth:true
             })

             await user.save()
             .then(u=>
             {
                  user = u;
                 
             })
             .catch(err=>
             {
                 return res.status(500).json({"error":err.message});
                 
             }
             )
           }

           return res.status(200).json(formatDataSend(user));
    })
    .catch(err=>
    {
        return res.status(500).json({"error":"failed to authenticate , try some other method"});
    }
    )
})

server.listen(PORT, () => {
  console.log(`Server is connected on port ${PORT}`);
});
