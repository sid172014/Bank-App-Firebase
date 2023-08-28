import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,

} from 'firebase/auth'

import {
    getFirestore,
    collection,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
    getDoc,
    updateDoc, setDoc // Importing the 'getFirestore' function from the firestore module
} from 'firebase/firestore'

import { getStorage, ref, uploadBytes } from 'firebase/storage'

const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: "project-firebase-bank-app.firebaseapp.com",
    projectId: "project-firebase-bank-app",
    storageBucket: "project-firebase-bank-app.appspot.com",
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId
};


// Initializing the Firebase App
initializeApp(firebaseConfig);

//Initialize the Firebase Services
const db = getFirestore();
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("user logged in!");
        console.log(user);

    } else {
        console.log("user signed out!");
    }
})

// Adding user up  
const signupForm = document.querySelector('#register-user-form');
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;
    signupForm['register-button'].textContent = "Registering....";
    signupForm['register-button'].style.color = "green";


    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        console.log(cred.user);

        signupForm.reset();
        location.assign('./profile.html');
    } catch (e) {
        console.log(e);

    }
});




// Adding user up - using Google Account
const loginWithGoogleButton = document.querySelector('#googleLogin');
loginWithGoogleButton.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const googleProvider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, googleProvider);
        location.assign('./profile.html');
    } catch (e) {
        console.log(e);
    }
});

//Logging users out
const logoutUsers = document.querySelector('#logout');
logoutUsers.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        location.assign('./index.html');
    } catch (e) {
        console.log(e);
    }
})

// Login Form 
const loginForm = document.querySelector('#login-user-form');
loginForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const email = document.querySelector('#login-email').value;
    const password = document.querySelector('#login-password').value;
    try{
        const cred = await signInWithEmailAndPassword(auth,email,password);
        document.querySelector('#login-button').textContent = "Logging in...";
        document.querySelector('#login-button').style.color = "green";
        location.assign('./transanction.html');
    }catch(e){
        console.log(e);
    }
})

// Login Form using Google
const googleLogin = document.querySelector('#googleLogin2');
googleLogin.addEventListener('click', async(e) => {
    e.preventDefault();
    e.preventDefault();
    try {
        const googleProvider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, googleProvider);
        location.assign('./transanction.html');
    } catch (e) {
        console.log(e);
    }

})

// Profile uploads
const button = document.querySelector('#save');
button.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
        // For storing profile photo inside the storage of firebase
        const storage = getStorage();
        const file = document.querySelector('#profile-pic').files[0];
        const path = `${auth.currentUser.uid}/${file.name}`;
        const storageRef = ref(storage, path);
        const metaData = {
            contentType: file.type
        }
        const uploadTask = uploadBytes(storageRef, file, metaData);

        // For storing the name and bank amount in firestore 
        const name = document.querySelector('#name').value;
        const amount = document.querySelector('#amount').value;

        const docRef = doc(db, 'users', auth.currentUser.uid);

        await setDoc(docRef, {
            name: name,
            amount: amount
        })
        document.querySelector('#save').style.color = "green";
        document.querySelector('#save').textContent = "Saving....";

        location.assign('./transanction.html');

    } catch (e) {
        console.log(e);
    }
})



// Transaction Page JS

const collectionReference = collection(db, 'users');
const queryCollection = query(collectionReference);
const transfer = document.querySelector('#selection');
transfer.addEventListener('click', (e) => {
    e.preventDefault();

    onSnapshot(queryCollection, (snap) => {
        snap.docs.forEach((doc) => {
            if (doc.id != auth.currentUser.uid) {
                transfer.innerHTML = transfer.innerHTML + `<option value="${doc.id}">${doc.data().name}</option>`
            }
        })
    })
});


const transferAmount = document.querySelector('#transfer-button');
transferAmount.addEventListener('click', async (e) => {
    e.preventDefault();
    document.querySelector('#transfer-button').style.color = 'green';
    document.querySelector('#transfer-button').textContent = "Transfering...";
    const selected = document.querySelector('#selection').value;

    const transferAmount = document.querySelector('#amounttopay').value;

    const docRef2 = doc(db, 'users', auth.currentUser.uid);
    const docSnap2 = await getDoc(docRef2);
    const newAmount2 = String(Number(docSnap2.data().amount) - Number(transferAmount));
    if (Number(newAmount2) >= 0) {
        await updateDoc(docRef2, {
            amount: newAmount2
        })

        const docRef1 = doc(db, 'users', selected);
        const docSnap = await getDoc(docRef1);
        const newAmount = String(Number(docSnap.data().amount) + Number(transferAmount));
        await updateDoc(docRef1, {
            amount: newAmount
        })

    document.querySelector('#transfer-button').textContent = "Successfull!";
    document.getElementById('transfer-button').disabled = true;
    }else{
        document.querySelector('#transfer-button').textContent = "Insufficient Balance";
        
    }

})

// Transaction JS ends here

// Login JS starts here


// Login JS ends here