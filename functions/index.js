const functions = require('firebase-functions');
const admin=require('firebase-admin')
const app=require('express')()
admin.initializeApp()
var config = {
    apiKey: "AIzaSyDfuUF39ZL0S-WKPENPrBEIKkWzhhN2Ccc",
    authDomain: "socialape-b5256.firebaseapp.com",
    databaseURL: "https://socialape-b5256.firebaseio.com",
    projectId: "socialape-b5256",
    storageBucket: "socialape-b5256.appspot.com",
    messagingSenderId: "32135937965",
    appId: "1:32135937965:web:a04caeafaed4cc6b"
  };


const firebase=require('firebase')
firebase.initializeApp(config)
const db=admin.firestore()


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
app.get('/screams',(req,res)=>{
    db.collection('screams').orderBy('createdAt','desc').get()
    .then(data=>{
        console.log(data)
        let screams=[];
        data.forEach(doc=>{
            screams.push({
                screamId:doc.id,
                body:doc.data().body,
                userHandle:doc.data().userHandle,
                createdAt:doc.data().createdAt
            })
        })
        return res.json(screams);
    }).catch(err=>{
        console.error(err)
    })
})


app.post('/scream',(req,res)=>{
    
    let scream={
        user:req.body.userHandle,
        body:req.body.body,
        createdAt:new Date().toISOString(),
    }
    
    db.collection('screams').add(scream)
    .then((doc=>{
        res.json({message:`document ${doc.id} created succesfully`})
    }))
    .catch(err=>{
        res.status(500).json({error:'something went wrong!!'})
    })
})

//signup route
app.post('/signup',(req,res)=>{
    const newUser={
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        handle:req.body.handle

    };
//validating data
    //geting the document reference by passing handle 
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
       db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already is use' });
      } else {
        return res
          .status(500)
          .json({ general: 'Something went wrong, please try again' });
      }
    });
})
exports.api=functions.https.onRequest(app)