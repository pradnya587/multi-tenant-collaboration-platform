import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCWOJL2MrBZVKnftGL4SRbRW9-QBf1x6co",
  authDomain: "teamsync-49651.firebaseapp.com",
  projectId: "teamsync-49651",
  storageBucket: "teamsync-49651.firebasestorage.app",
  messagingSenderId: "394611235653",
  appId: "1:394611235653:web:07f9715c88caa1b61cbc2c"
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()