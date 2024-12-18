// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {GoogleAuthProvider, signInWithPopup,getAuth} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCbWY245PjNRQMqsYASfIFqpinQFtsJqYc",
  authDomain: "bloggin-36eee.firebaseapp.com",
  projectId: "bloggin-36eee",
  storageBucket: "bloggin-36eee.firebasestorage.app",
  messagingSenderId: "321130836653",
  appId: "1:321130836653:web:a175a5e0b5e3e5b9e20c24",
  measurementId: "G-5V96BLFTDW"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle=async()=>
{
    let user = null;

    await signInWithPopup(auth,provider)
    .then(result=>
    {
        user = result.user
    }
    )
    .catch(err=>
    {
        console.log(err);
    }
    )

    return user;
}