// Carica le funzioni globali
import * as tw from "./Global/Thingworx/thingworx_api_module.js"
import * as fb from "./Global/Firebase/firebase_auth_module.js"

// recupera il nome dell'entity (selezionata, se utente storci)
// il nome dell'entity permette di recuperare le macchine presenti
// per un determinato cliente e visualizzarle nella sidebar.

let entityName = localStorage.getItem('global_entityName')
try{
  let customer = localStorage.getItem('global_selected_customer')
  if(customer.includes('Canossa')){
    customer = 'Pastificio 1'
  } else if(customer.includes('El_Wattania')){
    customer = 'Pastificio 2'
  } else if(customer.includes('Pasta_E_Aromi')){
    customer = 'Pastificio 3'
  } else {
    customer = 'STORCI'
  }

  $('#id-customer-name').text(customer)
}catch(e){}

if(localStorage.getItem('global_customer').includes("Storci")){
  $('#id-nav-customers-list').removeClass('d-none')
}

// Recupera l'url della pagina visualizzata
// Effettua uno split dell'url recuperato dividendo la stringa tramite lo /
// recupera il nome della pagina
let pageURL = window.location.href
    pageURL = pageURL.split('\/')
let pageName = pageURL[pageURL.length-1]

// recupera il nome dell'utente loggato.
// il nome viene visualizzato nella sidebar.
// se l'utente è loggato, viene nascosto il tasto di login
fb.onAuthStateChanged()
  .then(user => {
    $('#id-username').text(user.email)
    $('#id-user-login').addClass('d-none')
  })
  .catch(error => {})
// controlla quando viene premuto il tasto di logout
// alla pressione del tasto, l'utente viene reindirizzato alla pagina di login
$('#id-user-logout').click(() => { fb.signOut() })

// Recupera i nomi delle macchine installate dal cliente.
// vengono recuperate sia le celle che le linee.
tw.service_90_sidebar(entityName)
  .then(res => {
    // ****************************
    // ********** DRYERS **********
    // ****************************
    try{
      // Controlla se sono presenti delle celle
      if(JSON.stringify(res.dryers) !== '[]'){
        // pagine
        let href_dashboard         = '30_dryers_general_dashboard.html'
        let href_history           = '31_dryers_history.html'
        // id
        let idAccordion            = '#id-accordion-dryers'
        let idBtnAccordion         = '#id-btn-accordion-dryers'
        let idCollapsePanel        = '#id-collapse-panel-dryers'
        // link
        let nav_dashboard_link     = '#id-nav-dashboard-dryer a'
        let nav_history_link       = '#id-nav-history-dryer a'

        // Visualizza il menu delle celle
        $(idAccordion).removeClass('d-none')
        // controlla che la pagina in visualizzazione sia una pagina delle celle (30_*, 31_*, 32_*)
        // se la pagina corrisponde, allora viene aperto il menù delle celle.

        if(pageName.includes('_dryer')){
          $(idBtnAccordion).attr('aria-expanded', 'true')
          $(idBtnAccordion).removeClass('collapsed')
          $(idCollapsePanel).addClass('show')
        }

        // Controlla nello specifico quale pagina è in visualizzazione
        // se la pagina della dashboard o dello storico
        if(pageName == href_dashboard){ $(nav_dashboard_link).addClass('active') }
        if(pageName == href_history)  { $(nav_history_link).addClass('active') }


        // Visualizza le celle presenti dal cliente.
        // Nella sidebar sono presenti 16 celle, nascoste tramite la classe d-none
        // Modifica l'href da richiamare quando si preme il pulsante del menu
        // ref deve passare alla pagina 30_Dryer_Dashboard.html l'entityName della cella
        // In questo modo la pagina riesce a recuperare i dati dalla cella corretta
        for(let i=1; i<=res.dryers.length; i++){
          // genera il percorso da aprire quando viene premuto il pulsante relativo ad una cella
          // il percorso punta alla pagina 32_dryer_dashboard.html, con l'aggiunta del parametro entityName
          let href         = '32_dryer_dashboard.html?entityName=' + res.dryers[i-1].entityName
          let id_nav_dryer = '#id-nav-dryer-' + i
          let nav_link     = id_nav_dryer + ' a'
          let span_status  = id_nav_dryer + ' div a :last-child'

          // effettua modifiche agli elementi sottostanti
          $(span_status).text(res.dryers[i-1].status)
          $(id_nav_dryer).removeClass('d-none')
          $(nav_link).attr('href', href)

          // imposta il link come attivo se la pagina in visualizzazione corrisponde ad una cella
          if(pageName == href){ $(nav_link).addClass('active') }
        }
      }
    }catch(e){ console.error(e) }

    // ***************************
    // ********** LINES **********
    // ***************************
    try{
      // Controlla se sono presenti delle celle
      if(JSON.stringify(res.lines) !== '[]'){
        // Visualizza le celle presenti dal cliente.
        // Nella sidebar sono presenti 16 celle, nascoste tramite la classe d-nome
        // Modifica l'href da richiamare quando si preme il pulsante del menu
        // ref deve passare alla pagina 30_Dryer_Dashboard.html l'entityName della cella
        // In questo modo la pagina riesce a recuperare i dati dalla cella corretta
        for(let i=1; i<=res.lines.length; i++){
          // definisce gli id dell'accordion della linea
          // il ciclo for permette di selezionare il menù corretto in base alla linea in scansione
          // All'interno del div idCollapsePanel sono contenuti tutti i link alle pagine delle linea
          let idAccordion           = '#id-accordion-line-' + i
          let idBtnAccordion        = '#id-btn-accordion-line-' + i
          let idCollapsePanel       = '#id-collapse-panel-line-' + i

          // Effettua un ciclo per ogni elemento 'li' contenuto nel div idCollapsePanel
          $(idCollapsePanel).children('li').each((j, elem) => {
            // Recupera href impostato nell'elemento a
            let href = $(elem).children('a').attr('href')
            // Aggiunge il parametro da passare alla pagina
            href += '?entityName=' + res.lines[i-1].entityName
            // Imposta l'elememento con il nuovo href
            $(elem).children('a').attr('href', href)
            // Aggiunge la classe active se ci troviamo in una pagina della linea
            if(pageName == href){ $(elem).children('a').addClass('active') }
          })

          // id link
          let id_nav_dashboard_line = '#id-nav-dashboard-line-' + i
          let span_status           = id_nav_dashboard_line + 'div a :last-child'
          $(span_status).text(res.lines[i-1].status)

          getListMachine(res.lines[i-1].entityName)

          // Visualizza il menu delle celle
          $(idAccordion).removeClass('d-none')
          // controlla che la pagina in visualizzazione sia una pagina delle celle (30_*, 31_*, 32_*)
          // se la pagina corrisponde, allora viene aperto il menù delle celle.
          if(pageName.includes('line')){
            $(idBtnAccordion).attr('aria-expanded', 'true')
            $(idBtnAccordion).removeClass('collapsed')
            $(idCollapsePanel).addClass('show')
          }
        }
      }
    }catch(e){ console.error(e) }

  $('body').removeClass('d-none')
})
  .catch(err => console.error(err))


refreshStatus(entityName)
// imposta il servizio refreshStatus in loop
setInterval(refreshStatus, 10000, entityName)
// il servizio recupera gli stati delle macchine installate.
// gli stati sono visualizzati nella sidebar a fianco di ogni nome.
function refreshStatus(entityName){
  // Recupera i dati generali delle celle installate dal cliente
  tw.service_90_sidebar(entityName)
  .then(res => {
    // Controlla se sono presenti delle celle
    if(JSON.stringify(res.dryers) !== '[]'){
      for(let i=1; i<=res.dryers.length; i++){
        let span_status = '#id-nav-dryer-' + i + ' a > span:last-child'
        $(span_status).text(res.dryers[i-1].status)
      }
    }

    if(JSON.stringify(res.lines) !== '[]'){
      for(let i=1; i<=res.lines.length; i++){
        let span_status = '#id-nav-dashboard-line-' + i + ' a > span:last-child'
        $(span_status).text(res.lines[i-1].status)
      }
    }
  })
  .catch(err => console.error(err))
}


// Funzione che recupera le macchine presenti nella linea
// Effettua una chiamata a tw per il recupero del nome delle macchine,
// poi inserisce le macchine all'interno di una lista.
function getListMachine(entityName){
	tw.getCustomerLineMachine(entityName)
	.then(list => {
    list.rows.forEach((item, i) => {
  		switch(item.name){
  			case 'Impasto'					 : $('#id-nav-dough-line-1').removeClass('d-none'); break
  			case "Stenditrice"			 : $('#id-nav-spreader-line-1').removeClass('d-none'); break
  			case "Pasta Instant"		 : $('#id-nav-pasta-instant-line-1').removeClass('d-none'); break
  			case "Avanzamento Telai" : $('#id-nav-tray-feeder-line-1').removeClass('d-none'); break
  			case "Robot Deimpilatore": $('#id-nav-destacker-line-1').removeClass('d-none'); break
  			case "Omnidryer"				 : $('#id-nav-omnidryer-line-1').removeClass('d-none'); break
  			case "Pressa"						 : $('#id-nav-extruder-line-1').removeClass('d-none'); break
  			case "Impilatore"			   : $('#id-nav-stacker-line-1').removeClass('d-none'); break
  			case "Trabatto"				   : $('#id-nav-predryer-line-1').removeClass('d-none'); break
        case "Nidi_Lasagna" 	   : $('#id-nav-nests_lasagna-line-1').removeClass('d-none'); break
  		}
  	})
  })
	.catch(error => console.error(error))
}
