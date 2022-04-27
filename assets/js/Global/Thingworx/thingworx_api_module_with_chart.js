import * as am from "../amchart/amchart_functions.js"
import * as tw from "./thingworx_api_module.js"

// Recupera la lista delle produzioni effettuate
// In base al range time impostato.
function getDryerHistoryProduction(idTable, entityName, timeStart, timeEnd, chart, query){
	// Recupera lo storico delle lavorazioni effettuate dalla cella
	tw.getCellHistoryProductions(entityName, timeStart, timeEnd, '')
	.then(recipe => {
		// Cancella tutte le righe della tabella
		$(idTable).empty()
		// Per ogni ricetta trovata genera una nuova riga nella tabella
		recipe.rows.forEach((el, i) => {
			// Converte il timestamp in Date
			let timeStart = new Date(el.timeStart).toLocaleString();
			let timeEnd = new Date(el.timeEnd).toLocaleString();
			// Definisce l'id della riga della tabella
			let id = "IDHistoryTableRow" + i;
			// Definisce l'html della riga da aggiungere
			let row = '<tr id=' + id + ' class="hover_tr" style="border-style: none;background: var(--bs-table-bg);">'
			row    += '    <td style="font-size: 12px;border-style: none;">' + timeStart  + '</td>'
			row    += '    <td style="font-size: 12px;border-style: none;">' + timeEnd    + '</td>'
			row    += '    <td style="font-size: 12px;border-style: none;">' + el.ricetta + '</td>'
			row    += '    <td style="font-size: 12px;border-style: none;">' + el.durata  + '</td>'
			row    += '</tr>'
			// Aggiunge la riga alla tabella
			$(idTable).append(row)
			// Imposta i timestamp di inizio e fine essiccazione (il range temporale è allargato 30 min prima dell'inizio e 30 min dopo la fine)
			let timestampStart = el.timeStart - 1800000
			let timestampEnd   = el.timeEnd + 1800000
			// Controlla se la data è invalida, nel caso l'essiccazione è in corso e carica la data attuale
			if(timestampEnd == undefined || timestampEnd == null || timestampEnd == '' || Number.isNaN(timestampEnd)){
				timestampEnd = Date.now() + 1800000
			}

			// Abilita onclick sulla card
			document.getElementById(id).onclick = function(){
				// Aggiunge la classe table-primary alla riga seleziona e la rimuove dalle altre righe
				$(this).addClass('table-primary').siblings().removeClass('table-primary')
				// Definisce la query da inviare a influxdb
				let subquery = query.replaceAll('{1}', timestampStart).replaceAll('{2}', timestampEnd)
				// Recupera i dati da influxdb e li visualizza sul grafico
				am.setChartData(chart, subquery, '.lds-dual-ring.history-production-trend')
				// Nasconde l'icona del caricamento alla fine delle funzione + 1s dopo
				setTimeout(function() {	$('.lds-dual-ring.history-production-trend').hide() }, 1000)
			}

		})
    // Recupera la prima riga della tabella
		let elem = document.getElementById('IDHistoryTableRow0')
    // Definisce la variabile come click event
		let clickEvent = new Event('click');
    // Esegue l'evento dell'elemento, in questo modo simula il click
    // sulla prima riga della tabella, e viene caricato il grafico
		elem.dispatchEvent(clickEvent)
    // Finita la funzione aspetta un secondo prima di nascondere il widget dell'aggiornamento
    setTimeout(function() {	$('.lds-dual-ring.history-production-list').hide() }, 1000);
	})
	.catch(error => console.error(error))
}

// Recupera la lista delle produzioni effettuate
// In base al range time impostato.
function getLineHistoryProduction(idTable, entityName, timeStart, timeEnd, chart, query){
	// Recupera lo storico delle lavorazioni effettuate dalla cella
	tw.getLineDoughHistoryProduction('', entityName, timeStart, timeEnd)
	.then(recipe => {
		// Cancella tutte le righe della tabella
		$(idTable).empty()
		// Per ogni ricetta trovata genera una nuova riga nella tabella
		recipe.rows.forEach((el, i) => {
			// Converte il timestamp in Date
			let timeStart = new Date(el.timeStart).toLocaleString();
			let timeEnd = new Date(el.timeEnd).toLocaleString();
			// Definisce l'id della riga della tabella
			let id = "IDHistoryTableRow" + i;
			// Definisce l'html della riga da aggiungere
			let row = '<tr id=' + id + ' class="hover_tr" style="border-style: none;background: var(--bs-table-bg);">'
			row    += '    <td style="font-size: 12px;border-style: none;">' + timeStart  + '</td>'
			row    += '    <td style="font-size: 12px;border-style: none;">' + timeEnd    + '</td>'
			row    += '    <td style="font-size: 12px;border-style: none;">' + el.ricetta + '</td>'
			row    += '    <td style="font-size: 12px;border-style: none;">' + el.durata  + '</td>'
			row    += '</tr>'
			// Aggiunge la riga alla tabella
			$(idTable).append(row)
			// Imposta i timestamp di inizio e fine essiccazione (il range temporale è allargato 30 min prima dell'inizio e 30 min dopo la fine)
			let timestampStart = el.timeStart - 1800000
			let timestampEnd   = el.timeEnd + 1800000
			// Controlla se la data è invalida, nel caso l'essiccazione è in corso e carica la data attuale
			if(timestampEnd == undefined || timestampEnd == null || timestampEnd == '' || Number.isNaN(timestampEnd)){
				timestampEnd = Date.now() + 1800000
			}
			// Abilita onclick sulla card
			document.getElementById(id).onclick = function(){
				// Aggiunge la classe table-primary alla riga seleziona e la rimuove dalle altre righe
				$(this).addClass('table-primary').siblings().removeClass('table-primary')
				// Definisce la query da inviare a influxdb
				let subquery = query.replaceAll('{1}', timestampStart).replaceAll('{2}', timestampEnd)
				// Recupera i dati da influxdb e li visualizza sul grafico
				am.setChartData(chart, subquery, '.lds-dual-ring.history-production-trend')
				// Nasconde l'icona del caricamento alla fine delle funzione + 1s dopo
				setTimeout(function() {	$('.lds-dual-ring.history-production-trend').hide() }, 1000)
			}
		})
    // Recupera la prima riga della tabella
		let elem = document.getElementById('IDHistoryTableRow0')
    // Definisce la variabile come click event
		let clickEvent = new Event('click');
    // Esegue l'evento dell'elemento, in questo modo simula il click
    // sulla prima riga della tabella, e viene caricato il grafico
		elem.dispatchEvent(clickEvent)
    // Finita la funzione aspetta un secondo prima di nascondere il widget dell'aggiornamento
    setTimeout(function() {	$('.lds-dual-ring.history-production-list').hide() }, 1000);
	})
	.catch(error => console.error(error))
}

export{
  getDryerHistoryProduction,
  getLineHistoryProduction
}
