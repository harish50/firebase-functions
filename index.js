const functions = require('firebase-functions');
let admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.sendPush = functions.database.ref('/registeredUsers/{userId}/chat/{receiverId}').onUpdate((event, context) => {
    let afterSnapshot = event.after.toJSON();
    const keys = Object.keys(afterSnapshot);
    const newMessage = afterSnapshot[keys[keys.length - 1]];
    const id = newMessage._id;
    const sender = context.params.userId;
    const receiver = context.params.receiverId;
    if (id === 1) {
        return 0;
    }
    console.log(newMessage, sender, receiver);
    admin.database().ref('registeredUserProfileInfo').child(receiver).once("value", (snapshot) => {
        const token = snapshot.toJSON().pushToken;
        const payload = {
            notification: {
                title: sender,
                body: newMessage.text,
            },
            data: {
                sender: sender,
                receiver: receiver
            }
        }
        return admin.messaging().sendToDevice(token, payload);
    });
    return 0;
});