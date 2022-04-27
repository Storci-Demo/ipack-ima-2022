import * as tw from "../Thingworx/thingworx_api_module.js"
import * as fb from "./firebase_auth_module.js"

navigator.serviceWorker.register('./firebase-messaging-sw.js').then(registration => {
  firebase.messaging().useServiceWorker(registration)

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

})
