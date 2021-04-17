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

async function check_if_user_exists(email) {
  var db = firebase.firestore(); 
  var length = 0;
  await db.collection("users").where("email", "==", email)
  .get()
  .then((querySnapshot) => {
      length = querySnapshot.docs.length;
  })
  .catch((error) => {
      console.log("Error getting documents: ", error);
  });
  if(length == 0){
    return false;
  }
  else 
  return true;
}

async function signIn() { //Use this function to sign in via Google
  var provider = new firebase.auth.GoogleAuthProvider();
	await firebase.auth().signInWithPopup(provider).then(async (result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;

    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = credential.accessToken;
    // The signed-in user info.
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

export  {firebase, signIn};