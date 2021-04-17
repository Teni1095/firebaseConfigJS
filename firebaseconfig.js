import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyAcv9WPOlPb2ZKIz0pyrHGBhg8j9PoMPvA",
    authDomain: "backendapp-3fbc3.firebaseapp.com",
    projectId: "backendapp-3fbc3",
    storageBucket: "backendapp-3fbc3.appspot.com",
    messagingSenderId: "532366068277",
    appId: "1:532366068277:web:c17863edea42b377157f7c",
    measurementId: "G-1HBC69LWK4"
  };
  
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var auth = firebase.auth();


class User{
  constructor (email, name){
    this.email = email;
    this.name = name;
  }
}

async function getCurrentUser(){
  var user = auth.currentUser;
  if(user!=null){
  var userData;
  var snapshot = await db.collection("users").where("email", "==", user.email).get();
  snapshot.docs.forEach((userVal)=>{
    userData = new User(userVal.data()["email"], userVal.data()["name"]);
  });
  return userData;
  }
  else{
    console.log("Null val");
  }
}

async function getCurrentUserRef(){
  var user = auth.currentUser;
  if(user!=null){
  var ref;
  var snapshot = await db.collection("users").where("email", "==", user.email).get();
  snapshot.docs.forEach((userVal)=>{
    ref = userVal.ref;
  });
  return ref;
  }
  else{
    console.log("Null val");
  }
}

async function check_if_user_exists(email) {

  var length = 0;
  await db.collection("users").where("email", "==", email)
  .get()
  .then((querySnapshot) => {
      length = querySnapshot.docs.length;
  })
  .catch((error) => {
      console.log("Error getting documents: ", error);
  });
  if(length === 0){
    return false;
  }
  else 
  return true;
}

async function signIn() { //Use this function to sign in via Google
  var provider = new firebase.auth.GoogleAuthProvider();
	await firebase.auth().signInWithPopup(provider).then(async (result) => {
    /** @type {firebase.auth.OAuthCredential} */
    
  var user = result.user;
  var userExists = await check_if_user_exists(user.email);
	if(!userExists){
	var db = firebase.firestore();  
	db.collection("users").doc().set({
    email: user.email,
    name:user.displayName
})
.then(() => {
    console.log("Document successfully written!");
})
.catch((error) => {
    console.error("Error writing document: ", error);
});}
    // ...
  });  // The function returns the product of p1 and p2
}

class Title{
  constructor (title, description){
    this.title = title;
    this.description = description;
  }
}

export  {signIn, getCurrentUser};
