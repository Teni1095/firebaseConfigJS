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
  constructor (email, name, id){
    this.email = email;
    this.name = name;
    this.id = id;
  }
}

//returns current user
async function getCurrentUser(){ 
  var user = auth.currentUser;
  if(user!=null){
  var userData;
  var snapshot = await db.collection("users").where("email", "==", user.email).get();
  snapshot.docs.forEach((userVal)=>{
    userData = new User(userVal.data()["email"], userVal.data()["name"], userVal.id);
  });
  return userData;
  }
  else{
    console.log("Null val");
  }
}

//returns current user id
async function getCurrentUserId(){
  var user = auth.currentUser;
  if(user!=null){
  var ref = null;
  var snapshot = await db.collection("users").where("email", "==", user.email).get();
  snapshot.docs.forEach((userVal)=>{
    ref = userVal.ref.id;
  });
  return ref;
  }
  else{
    console.log("Null val");
  }
}


async function checkIfUserExists(email) {
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

//Use this function to sign in via Google
async function signIn() { 
  var provider = new firebase.auth.GoogleAuthProvider();
	await firebase.auth().signInWithRedirect(provider).then(async (result) => {
    /** @type {firebase.auth.OAuthCredential} */
    
  var user = result.user;
  var userExists = await checkIfUserExists(user.email);
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
  
  });  
}

class Topic{

  constructor (title, description, owner, id, viewCount = 0){
    this.title = title;
    this.description = description;
    this.owner = owner;
    this.id = id;
    this.viewCount = viewCount;
  }
}

//Can be used to increase view count
async function increaseViewCount(id){
  await db.collection("topics").doc(id).update({viewCount:firebase.firestore.FieldValue.increment(1)});
}

//Create a post topic
async function createTopic(title, description) { //for creating a topic
  var owner = await getCurrentUserId();
  var coll = await db.collection("topics").add({
    title:title,
    description:description,
    owner:owner,
    viewCount: 0
  });
  var topic = new Topic(title, description, owner, coll.id);
  return topic;
}

//Get a topic from ID
async function getTopic(id) { //for creating a topic
  var coll = await db.collection("topics").doc(id).get();
  var data = coll.data();
  var topic = new Topic(data["title"], data["description"], data["owner"], coll.id);
  return topic;
}

//Get a topic for people to choose and join
async function getAllTopics() { 
  var list = [];
  var coll = await db.collection("topics").get();
  coll.docs.forEach((topic)=>{
    var data = topic.data();
    var newTopic = new Topic(data["title"], data["description"], data["owner"], data.id);
    list.push(newTopic);
  });
  return list;
}

//Get a topic where user is owner
async function getAllOwnerTopics() { 
  var owner = await getCurrentUserId();
  var list = [];
  var coll = await db.collectionGroup("topics").where("owner", "==", owner).get();
  coll.docs.forEach((topic)=>{
    var data = topic.data();
    var newTopic = new Topic(data["title"], data["description"], data["owner"], topic.id);
    list.push(newTopic);
  });
  console.log(list);
  return list;
}

//Get a topic where user is a member
async function getAllMemberTopics() { 
  var userId = await getCurrentUserId();
  var list = [];
  var topicMembers = await db.collectionGroup("members").where("memberId", "==", userId).get();
  topicMembers.docs.forEach(async (members)=>{
    var topic = await getTopic(members.data()["topicId"]);
    list.push(topic);
  });
  return list;
}

class TopicMember {
  constructor (topicId, memberId, id){
    this.topicId = topicId;
    this.memberId = memberId;
    this.id = id;
  }
}

//Add user to be a member (or to get involved)
async function addMember (topicId, memberId) {
  var doc = await db.collection("topics").doc(topicId).collection("members").add({
    topicId : topicId,
    memberId : memberId,
  });
  var member = new TopicMember(topicId, memberId, doc.id);
  return member;
}

class GetInvolved {
  constructor(fromUser, toTopic, id){
    this.fromUser = fromUser;
    this.toTopic = toTopic;
    this.id = id;
  }
}

//Sends a request to get involved to the owner of the topic
async function getInvolved(toTopicId){
  var userId = await getCurrentUserId();
  var owner = (await getTopic(toTopicId)).owner;
  var doc = await db.collection("users").doc(owner).collection("getInvolvedRequests").add({
    fromUser : userId,
    toTopic : toTopicId    
  });
  var request = new GetInvolved(userId, toTopicId, doc.id);
  return request;
}

//Deletes the request
async function deleteGetInvolvedRequest(requestId){
  var userId = await getCurrentUserId();
  await db.collection("users").doc(userId).collection("getInvolvedRequests").doc(requestId).delete();
}

//Gets all requests for the user
async function getAllRequests() { 
  var list = [];
  var userId = await getCurrentUserId();
  var coll = await db.collection("users").doc(userId).collection("getInvolvedRequests").get()
  coll.docs.forEach((request)=>{
    var data = request.data();
    var newRequest = new GetInvolved(data["fromUser"], data["toTopic"], data.id);
    list.push(newRequest);
  });
  return list;
}

export  {signIn, getCurrentUser,createTopic, getTopic, getAllTopics,increaseViewCount, getInvolved, addMember, getAllRequests, deleteGetInvolvedRequest, getAllMemberTopics, getAllOwnerTopics};
