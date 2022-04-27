// Carica le funzioni globali
import * as tw from "./Global/Thingworx/thingworx_api_module.js"
import * as fb from "./Global/Firebase/firebase_auth_module.js"
import * as lang from "./Global/Common/Translation.js"

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
// Recupera l'entity name della thing
let entityName = urlParams.get('entityName')
let selectedCustomer = localStorage.getItem("global_selected_customer")

// definisce l'url di base della pagina attuale (in questo caso della pagina index.html).
// il risultato è http(s)://xxx.xxx.xxx.xxx:xxxx
// baseURL verrà utilizzato come base per il cambio pagina.
/*
let baseURL = window.location.protocol + "//" + window.location.host
let pageURL = window.location.href
*/
// Recupera il nome dell'utente da firebase, controlla che sia loggato.
// Nel caso non fosse loggato richiama la pagina di login
//fb.onAuthStateChanged_2(baseURL, pageURL)
// Recupera dei dati dalle local storage

// Imposta il nome del cliente nella breadcrumb
// Vengono sostituiti tutti gli underscore presenti nel nome
//$("#IDBreadcrumbCustomer").text(selectedCustomer.replace(/_/g, ' '));
// Recupera la lingua utilizzata dall'utente e sostituisce tutti i testi
// ATTENZIONE - Questa istruzione traduce solamente i testi statici e non
// i testi caricati dalle funzioni.
lang.getLanguage()

// Recupera tutte le celle installate dal cliente
tw.getCustomerCells(selectedCustomer)
.then(cellsGroup => {
	// Genera html della card del gruppo celle
	createCellCard(cellsGroup);
	// Esegue la funzione dopo la creazione delle card.
	// La funzione recupera i valori da TW da visualizzare nelle card
	getCellInfo(cellsGroup, selectedCustomer)
	// Esegue la funzione ogni 30 sec
	setInterval(getCellInfo, 30000, cellsGroup, selectedCustomer);

})
.catch(error => console.error(error))

// ******************** FUNCTION ********************
// Definisce il codice html delle card e le aggiunge all'elemento ROW
// Ad ogni card viene associata la funzoine onClick per aprire la pagina corrispondente
function createCellCard(cellsGroup){
	// Effettua un ciclo per ogni gruppo celle trovato [normalmente tutte le celle sono in un unico gruppo]
	cellsGroup.array.forEach((el, i) => {
		// Genera un id per la singola card
		let id = "IDCardCellGroup" + i;
		// Definisce il codice html
		//style="border-color: rgba(0,0,0,0);"
		let card = '<div class="col col-customer" style="margin: 0px; margin-top: 1rem !important">'
		card    += 	   '<div id="' + id + '" class="card h-100 card_cells card-border">'
		card    += 	   		'<div class="card-body card-hover ' + id + 'Body" style="padding: 0px;border-radius: 4px;border-width: 1px;border-color: rgba(33,37,41,0);">'
		card    += 	   			'<div class="row" style="margin: 0px;padding-top: 10px;padding-bottom: 5px;">'
		card    += 	   				'<div class="col" style="padding: 0px;padding-right: 12px;padding-left: 12px;">'
		card    += 	   					'<h4 style="margin: 0px;color: var(--bs-heading-high-emphasis);">'
		card    += 	   						'<span class="' + id + 'Title" style="margin-right: 5px; color: var(--bs-heading-high-emphasis);" translate_id="dryer">Cella</span>'
		card    += 	   						'<span id="' + id + 'Nome_Cella" class="' + id + 'Title" style="margin-right: 5px; color: var(--bs-heading-high-emphasis);">1</span>'
		card    += 	   					'</h4>'
		card    += 	   				'</div>'
		card    += 	   				'<div class="col d-flex justify-content-end align-items-center">'
		card    += 	   				'<h6 class="d-flex justify-content-end" style="margin: 0px;color: var(--bs-heading-high-emphasis);">'
		card    += 	   					'<span id="' + id + 'Numero_Carrelli" ' + id + 'Value" style="margin-right: 5px;">6</span>'
		card    += 	   				  '<span class="' + id + 'Value" translate_id="trolleys">Carrelli</span>'
		card    += 	   				'</h6>'
		card    += 	   				'</div>'
		card    += 	   			'</div>'
		card    += 	   			'<div class="row ' + id + 'rowdark" style="margin: 0px;padding-bottom: 5px;">'
		card    += 	   				'<div class="col" style="padding: 0px;padding-right: 12px;padding-left: 12px;">'
		card    += 	   					'<h6 id="' + id + 'Stato_Cella" class="' + id + 'Value" style="margin: 0px;color: var(--bs-heading-medium-emphasis);font-size: 14px;">In essicazione</h6>'
		card    += 	   				'</div>'
		card    += 	   			'</div>'
		card    += 	   			'<div class="row" style="margin: 0px;margin-bottom: 30px;margin-top: 30px;">'
		card    += 	   				'<div class="col d-flex flex-column justify-content-top align-items-start" style="padding: 0px;padding-right: 12px;padding-left: 12px;">'
		card    += 	   					'<h6 class="' + id + 'Label" style="margin: 0 0 8px 0;color: var(--bs-heading-medium-emphasis);font-size: 14px;" translate_id="recipe">Recipe</h6>'
		card    += 	   					'<h6 id="' + id + 'Ricetta_in_Uso" class="' + id + 'Value" style="margin: 0px;color: var(--bs-heading-high-emphasis);font-size: 14px;">Pasta Lunga</h6>'
		card    += 	   				'</div>'
		card    += 	   				'<div class="col d-flex flex-column justify-content-top align-items-start" style="padding: 0px;padding-right: 12px;padding-left: 12px;">'
		card    += 	   					'<h6 class="' + id + 'Label" style="margin: 0 0 8px 0;color: var(--bs-heading-medium-emphasis);font-size: 14px;" translate_id="recipe_time">Recipe time</h6>'
		card    += 	   					'<h6 id="' + id + 'Tempo_Pianificato" class="' + id + 'Value" style="margin: 0px;color: var(--bs-heading-high-emphasis);font-size: 14px;">20 ore</h6>'
		card    += 	   				'</div>'
		card    += 	   				'<div class="col d-flex flex-column justify-content-top align-items-start" style="padding: 0px;padding-right: 12px;padding-left: 12px;">'
		card    += 	   					'<h6 class="' + id + 'Label" style="margin: 0 0 8px 0;color: var(--bs-heading-medium-emphasis);font-size: 14px;" translate_id="worked_time">Work time</h6>'
		card    += 	   					'<h6 id="' + id + 'Tempo_in_Lavorazione" class="' + id + 'Value" style="margin: 0px;color: var(--bs-heading-high-emphasis);font-size: 14px;">5 ore</h6>'
		card    += 	   				'</div>'
		card    += 	   			'</div>'
		card    += 	   		'</div>'
		card    += 	   '</div>'
		card    += '</div>'
		// Aggiunge la card alla row
		$("#IDRow").append(card)
	})
}
// Funzione che recupera i dati del cliente da TW
function getCellInfo(cellsGroup, selectedCustomer){
	// Esegue il ciclo per ogni cliente presente
	cellsGroup.array.forEach((el, i) => {
		// Genera l'id che identifica i campi della singola card da valorizzare
		let ID				 = "#IDCardCellGroup" + i;
		let ClassTitle = ".IDCardCellGroup" + i + "Title"
		let ClassLabel = ".IDCardCellGroup" + i + "Label"
		let ClassValue = ".IDCardCellGroup" + i + "Value"

		let ID_Numero_Carrelli   = "#IDCardCellGroup" + i + "Numero_Carrelli"
		let IDnomeCella          = "#IDCardCellGroup" + i + "Nome_Cella"
		let IDstatoCella 		 		 = "#IDCardCellGroup" + i + "Stato_Cella"
		let IDricettaInUso 	     = "#IDCardCellGroup" + i + "Ricetta_in_Uso"
		let IDtempoPianificato   = "#IDCardCellGroup" + i + "Tempo_Pianificato"
		let IDtempoInLavorazione = "#IDCardCellGroup" + i + "Tempo_in_Lavorazione"

		tw.getCustomerCells(selectedCustomer)
			.then(cellInfo => {
				$(ID_Numero_Carrelli).text(cellInfo.array[i].numero_carrelli)
				$(IDnomeCella).text(cellInfo.array[i].name)
				$(IDstatoCella).text(cellInfo.array[i].stato)
				$(IDricettaInUso).text(cellInfo.array[i].ricetta)
				$(IDtempoPianificato).text(cellInfo.array[i].durata)
				$(IDtempoInLavorazione).text(cellInfo.array[i].tempoLavoro)

				//Bianco
				$(ID).css("background-color","var(--bs-card-background-default)")
				$(ClassTitle).css("color","var(--bs-primary-color-label)")
				$(ClassLabel).css("color","var(--bs-heading-medium-emphasis)")
				$(ClassValue).css("color","var(--bs-heading-high-emphasis)")

				if(cellInfo.array[i].stato == "Running"){
					// VERDE
					$(ID).css("background-color","var(--bs-card-background-green)")
					$(ClassTitle).css("color","var(--bs-card-title-green)")
					$(ClassLabel).css("color","var(--bs-card-label-green)")
					$(ClassValue).css("color","var(--bs-card-value-green)")
				}
				if(cellInfo.array[i].stato == "Stand By"){
					// Arancione
					$(ID).css("background-color","var(--bs-card-background-yellow)")
					$(ClassTitle).css("color","var(--bs-card-title-yellow)")
					$(ClassLabel).css("color","var(--bs-card-label-yellow)")
					$(ClassValue).css("color","var(--bs-card-value-yellow)")
				}
				if(cellInfo.array[i].stato == "undefined"){
					// Grigio
					$(ID).css("background-color","var(--bs-card-background-undefined)")
					$(ClassTitle).css("color","var(--bs-card-title-undefined)")
					$(ClassLabel).css("color","var(--bs-card-label-undefined)")
					$(ClassValue).css("color","var(--bs-card-value-undefined)")
				}
				/*
				if(i == 8){
					// Rosso
					$(ID).css("background-color","var(--bs-card-background-red)")
					$(ClassTitle).css("color","var(--bs-card-title-red)")
					$(ClassLabel).css("color","var(--bs-card-label-red)")
					$(ClassValue).css("color","var(--bs-card-value-red)")
				}
				*/
			})
			.catch(error => console.error(error))
	})
}
