const mongoose = require("mongoose");
const User = require("./models/User"); // Assuming the user schema is defined in User.js
const Message = require("./models/Message"); // Assuming the message schema is defined in Message.js

const profileImgsNameList = [
  "Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel",
  "Bob", "Mia", "Coco", "Gracie", "Bear", "Bella", "Abby", "Harley",
  "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki"
];
const profileImgsCollectionsList = [
  "notionists-neutral", "adventurer-neutral", "fun-emoji"
];

const getRandomProfileImage = () => {
  const randomCollection = profileImgsCollectionsList[Math.floor(Math.random() * profileImgsCollectionsList.length)];
  const randomName = profileImgsNameList[Math.floor(Math.random() * profileImgsNameList.length)];
  return `https://api.dicebear.com/6.x/${randomCollection}/svg?seed=${randomName}`;
};

// Function to initialize dummy data
const initializeDummyData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Message.deleteMany({});

    // Create dummy users
    const dummyUsers = [];
    for (let i = 0; i < 10; i++) {
      dummyUsers.push({
        personal_info: {
          fullname: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          password: `password${i + 1}`,
          username: `user${i + 1}`,
          bio: `This is a bio for User ${i + 1}`,
          profile_img: getRandomProfileImage(),
        },
        social_links: {
          youtube: "",
          instagram: "",
          facebook: "",
          twitter: "",
          github: "",
          website: "",
        },
        account_info: {
          total_posts: Math.floor(Math.random() * 100),
          total_reads: Math.floor(Math.random() * 1000),
        },
      });
    }

    // Save users to database
    const savedUsers = await User.insertMany(dummyUsers);
    console.log("Users initialized:", savedUsers.length);

    // Create dummy messages between users
    const messages = [];
    for (let i = 0; i < 20; i++) {
      const sender = savedUsers[Math.floor(Math.random() * savedUsers.length)];
      const recipient = savedUsers[Math.floor(Math.random() * savedUsers.length)];

      // Avoid sending messages to self
      if (sender._id.toString() !== recipient._id.toString()) {
        messages.push({
          sender: sender._id,
          recipient: recipient._id,
          content: `Hello from ${sender.personal_info.fullname} to ${recipient.personal_info.fullname}`,
          read: Math.random() < 0.5, // Randomly mark some messages as read
        });
      }
    }

    // Save messages to database
    const savedMessages = await Message.insertMany(messages);
    console.log("Messages initialized:", savedMessages.length);
  } catch (err) {
    console.error("Error initializing dummy data:", err);
  }
};

// Call the function
initializeDummyData();
