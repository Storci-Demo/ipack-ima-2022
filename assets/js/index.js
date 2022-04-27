import * as fb from "./Global/Firebase/firebase_auth_module.js";
import * as tw from "./Global/Thingworx/thingworx_api_module.js";

// Recupera il nome dell'utente da firebase, controlla che sia loggato.
// Nel caso non fosse loggato richiama la pagina di login
fb.onAuthStateChanged()
	.then(user => {
		tw.getUser(user.email)
		.then(customerRow => {
			let global_customer = customerRow.rows[0].Customer
			// Definizione globale del customer a cui l'utente è associato.
			localStorage.setItem('global_customer', global_customer)
			// salvo il customer selezionato
			localStorage.setItem('global_selected_customer', global_customer)

		  // Controllo nel caso l'utente faccia parte della Storci.
		  // Se è un utente storci viene reindirizzato alla pagina /Storci/selectCustomer.html.
		  // Se non è un utente storci viene reindirizzato alla pagina /Customer/Customer_Info.html.
		  if(global_customer.includes("Storci")){
		  	// Carica la pagina.
				window.location.href = './01_Customers.html'
		  }else{
		  	// Carica la pagina.
		  	window.location.href = './02_Dashboard.html'
		  }
		})
	})
		.catch(error => {
			console.warn(error)
			window.location.href = './90_signIn.html'
	})
