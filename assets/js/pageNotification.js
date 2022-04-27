import * as tw from "./Global/Thingworx/thingworx_api_module.js"
import * as fb from "./Global/Firebase/firebase_auth_module.js"

const messaging = firebase.messaging()

messaging.requestPermission()
.then(function() {
  console.log("permission granted")
  messaging.getToken().then(function(token) {
    console.log(token)
    firebase.auth().onAuthStateChanged(user => {
      tw.service_98_setFirebaseToken(user.email, token)
    })
  })
})
.catch(function(err) {
  console.warn("No permission to send push: ", err);
})
