const mongoose = require("mongoose");

let profile_imgs_name_list = ["Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel", "Bob", "Mia", "Coco", "Gracie", "Bear", "Bella", "Abby", "Harley", "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki"];
let profile_imgs_collections_list = ["notionists-neutral", "adventurer-neutral", "fun-emoji"];

const userSchema = new mongoose.Schema(
  {
    personal_info: {
      fullname: {
        type: String,
        lowercase: true,
        required: [true, "Fullname is required"],
        minlength: [3, "Fullname must be at least 3 characters long"],
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        unique: true,
      },
      password: {
        type: String,
      },
      username: {
        type: String,
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
          const randomCollection = profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)];
          const randomName = profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)];
          return `https://api.dicebear.com/6.x/${randomCollection}/svg?seed=${randomName}`;
        },
      },
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
    blogs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "blogs",
      default: [],
    },
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
