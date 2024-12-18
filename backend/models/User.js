const mongoose = require("mongoose");

// List of profile image names and collections for generating a default profile image
const profile_imgs_name_list = [
  "Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel", "Bob", "Mia", "Coco", "Gracie", 
  "Bear", "Bella", "Abby", "Harley", "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki"
];

const profile_imgs_collections_list = [
  "notionists-neutral", "adventurer-neutral", "fun-emoji"
];

// User Schema
const userSchema = new mongoose.Schema(
  {
    personal_info: {
      fullname: {
        type: String,
        lowercase: true,
        required: [true, "Fullname is required"],
        minlength: [3, "Fullname must be at least 3 characters long"],
        set: function(value) {
          // Capitalize the first letter of each word in the fullname
          return value
            .split(' ') // Split the fullname into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join the words back into a single string
        }
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],  // Added email validation
      },
      password: {
        type: String,
        minlength: [6, "Password must be at least 6 characters long"], // Added password length requirement
      },
      username: {
        type: String,
        required: [true, "Username is required"],
        minlength: [3, "Username must be at least 3 characters long"],
        unique: true,
      },
      bio: {
        type: String,
        maxlength: [200, "Bio must not exceed 200 characters"],
        default: "",
      },
      profile_img: {
        type: String,
        default: () => {
          // Generate a random profile image URL from the list
          const randomCollection = profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)];
          const randomName = profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)];
          return `https://api.dicebear.com/6.x/${randomCollection}/svg?seed=${randomName}`;
        },
      },
      role: { type: String, enum: ['user', 'admin'], default: 'user' } 
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    social_links: {
      youtube: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    account_info: {
      total_posts: { type: Number, default: 0 },
      total_reads: { type: Number, default: 0 },
    },
    google_auth: {
      type: Boolean,
      default: false,
    },
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model for the sender
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now, // Default to the current time when the message is created
      },
      read: {
        type: Boolean,
        default: false, // Default to false, indicating the message has not been read
      },
    }],
  },
  {
    timestamps: {
      createdAt: "joinedAt",
    },
  }
);

// Error handling for unique fields
userSchema.post("save", (error, doc, next) => {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("Email or Username already exists"));
  } else {
    next(error);
  }
});

module.exports = mongoose.model("users", userSchema);
