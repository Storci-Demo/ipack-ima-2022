self.addEventListener('push', event => {
  let payload = event.data.json()
  clients.matchAll({includeUncontrolled: true, type: 'window'})
  .then(function(c) {
    if (c.length == 0) {
      payload.notification.body += ' background'
      self.registration.showNotification(payload.notification.title, payload.notification)
    } else {
      // Send a message to the page to update the UI
      payload.notification.body += ' foreground'
      self.registration.showNotification(payload.notification.title, payload.notification)
    }
  })
})
