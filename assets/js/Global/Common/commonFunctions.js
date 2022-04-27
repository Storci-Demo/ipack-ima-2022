// Carica le funzioni globali
import * as tw from "../Thingworx/thingworx_api_module.js"
import * as tw_chart from "../Thingworx/thingworx_api_module_with_chart.js"
import * as am from "../amchart/amchart_functions.js"

// Funzione che ritorna l'anno il mese e il giorno
// partendo da una data completa.
// Il formato è YYYY-MM-DD
function getDate(date){
  // Recupera l'anno
	let year  = date.getFullYear()
  // Recupera il numero del mese - da 0 a 11
	let month = date.getMonth()
  // Recupera il giorno del mese - da 1 a 31
	let day   = date.getDate()
  // Converte la variabile month in number e ci somma 1
  // per portare il range da 1 a 12
	month = Number(month) + 1
  // Aggiunge lo zero nei numeri inferiori a 10, in modo da avere sempre 2 cifre
	month = month < 10 ? '0' + month : month
  // Aggiunge lo zero nei numeri inferiori a 10, in modo da avere sempre 2 cifre
  day = day < 10 ? '0' + day : day
  // Ritorna la stringa
	return year + '-' + month + '-' + day
}

// ********** FUNZIONI COMUNI PER LA CELLA **********
// La funzione recupera i dati da thingworx e li visualizza sul grafico
// della produzione attuale.
function actualDryerProduction(chart, query, entityName){
	// Recupera l'inizio e la fine della produzione attuale.
	// In questo caso la fine produzione è sempre l'ora attuale
	tw.getDryerTimeRange(entityName)
	.then(time => {
		// Definisce la query da inviare a influxdb
	  // Sostituisce le stringe con i parametri
		let subquery = query.replaceAll('{1}', time.start).replaceAll('{2}', time.end)
		// Recupera i dati da influxdb e li visualizza sul grafico
		am.setChartData(chart, subquery, '.lds-dual-ring.actual-production-trend')
		// Funzioni cicliche
		setInterval(am.setChartData, 1800000, chart, query, '.lds-dual-ring.actual-production-trend')	// ogni 30 min
	})
	.catch(e => console.error(e))
}
// La funzione recupera i dati da thingworx e li visualizza sul grafico
// della produzione storica.
function historyDryerProduction(chart, query, entityName){
	// Visualizza il widget che indica il valore in aggiornamento
	$('.lds-dual-ring.history-production-list').show()

	// Definisce le variabili come date
	let timeStartHistory = new Date()
	let timeEndHistory   = new Date()
	// Imposta X giorni prima della data odierna
	timeStartHistory.setDate(timeStartHistory.getDate() - 14)
	// Imposta i 2 data picker con le date calcolate prima
	// La funzione getDate ritorna solamente l'anno, il mese e il giorno
	// yyyy-MM-dd
	$('#IDTimeStart').val(getDate(timeStartHistory))
	$('#IDTimeEnd').val(getDate(timeEndHistory))
	// Recupera la lista delle produzioni con il time range impostato di default
	// Da data Attuale a data attuale - 14 giorni.
	// Per default viene visualizzata la prima produzione dell'elenco. (l'ultima produzione effettuata in ordine cronologico)
	tw_chart.getDryerHistoryProduction('#IDHistoryTableBody', entityName, timeStartHistory, timeEndHistory, chart, query)
	// Listener sul cambio di valore della data di inizio produzione
	// Al cambio di valore viene eseguita la funzione seguente.
	// Viene recuperata di nuovo la lista delle produzioni con il range time aggiornato
	$('#IDTimeStart').change(function() {
	  // Visualizza lo spinner per indicare il caricamento in corso
		$('.lds-dual-ring.history-production-list').show()
	  // Recupera i valori di inizio e fine produzione
		let timeStartHistory = new Date($(this).val())
		let timeEndHistory   = new Date($('#IDTimeEnd').val())
	  // Recupera la lista delle produzioni
	  // Per default viene visualizzata la prima produzione dell'elenco. (l'ultima produzione effettuata in ordine cronologico)
		tw_chart.getDryerHistoryProduction('#IDHistoryTableBody', entityName, timeStartHistory, timeEndHistory, chart, query)
	});
	// Listener sul cambio di valore della data di fine produzione
	// Al cambio di valore viene eseguita la funzione seguente.
	// Viene recuperata di nuovo la lista delle produzioni con il range time aggiornato
	$('#IDTimeEnd').change(function() {
	  // Visualizza lo spinner per indicare il caricamento in corso
		$('.lds-dual-ring.history-production-list').show()
		// Recupera i valori di inizio e fine produzione
	  let timeStartHistory = new Date($('#IDTimeStart').val())
		let timeEndHistory   = new Date($(this).val())
	  // Recupera la lista delle produzioni
	  // Per default viene visualizzata la prima produzione dell'elenco. (l'ultima produzione effettuata in ordine cronologico)
		tw_chart.getDryerHistoryProduction('#IDHistoryTableBody', entityName, timeStartHistory, timeEndHistory, chart, query)
	});

	// Abilita onclick sulla card
	$('tr').click(() => {
		console.log('click')
		// Aggiunge la classe table-primary alla riga seleziona e la rimuove dalle altre righe
		$(this).addClass('table-primary').siblings().removeClass('table-primary')
		// Definisce la query da inviare a influxdb
		let subquery = query.replaceAll('{1}', timestampStart).replaceAll('{2}', timestampEnd)
		// Recupera i dati da influxdb e li visualizza sul grafico
		am.setChartData(chart, subquery, '.lds-dual-ring.history-production-trend')
		// Nasconde l'icona del caricamento alla fine delle funzione + 1s dopo
		setTimeout(function() {	$('.lds-dual-ring.history-production-trend').hide() }, 1000)
	})

}


// ********** FUNZIONI COMUNI PER LA LINEA **********
// La funzione recupera i dati da thingworx e li visualizza sul grafico
// della produzione attuale.
function actualLineProduction(chart, query, entityName){
	// Recupera l'inizio e la fine della produzione attuale.
	// In questo caso la fine produzione è sempre l'ora attuale
	tw.getLineTimeRange(entityName)
	.then(time => {
		// Definisce la query da inviare a influxdb
	  // Sostituisce le stringe con i parametri
		let subquery = query.replaceAll('{1}', time.start).replaceAll('{2}', time.end)
		// Recupera i dati da influxdb e li visualizza sul grafico
		am.setChartData(chart, subquery, '.lds-dual-ring.actual-production-trend')
		// Funzioni cicliche
		setInterval(am.setChartData, 1800000, chart, query, '.lds-dual-ring.actual-production-trend')	// ogni 30 min
	})
	.catch(e => console.error(e))
}
// La funzione recupera i dati da thingworx e li visualizza sul grafico
// della produzione storica.
function historyLineProduction(chart, query, entityName){
	// Visualizza il widget che indica il valore in aggiornamento
	$('.lds-dual-ring.history-production-list').show()

	// Definisce le variabili come date
	let timeStartHistory = new Date()
	let timeEndHistory   = new Date()
	// Imposta X giorni prima della data odierna
	timeStartHistory.setDate(timeStartHistory.getDate() - 14)
	// Imposta i 2 data picker con le date calcolate prima
	// La funzione getDate ritorna solamente l'anno, il mese e il giorno
	// yyyy-MM-dd
	$('#IDTimeStart').val(getDate(timeStartHistory))
	$('#IDTimeEnd').val(getDate(timeEndHistory))
	// Recupera la lista delle produzioni con il time range impostato di default
	// Da data Attuale a data attuale - 14 giorni.
	// Per default viene visualizzata la prima produzione dell'elenco. (l'ultima produzione effettuata in ordine cronologico)
	tw_chart.getLineHistoryProduction('#IDHistoryTableBody', entityName, timeStartHistory, timeEndHistory, chart, query)
	// Listener sul cambio di valore della data di inizio produzione
	// Al cambio di valore viene eseguita la funzione seguente.
	// Viene recuperata di nuovo la lista delle produzioni con il range time aggiornato
	$('#IDTimeStart').change(function() {
	  // Visualizza lo spinner per indicare il caricamento in corso
		$('.lds-dual-ring.history-production-list').show()
	  // Recupera i valori di inizio e fine produzione
		let timeStartHistory = new Date($(this).val())
		let timeEndHistory   = new Date($('#IDTimeEnd').val())
	  // Recupera la lista delle produzioni
	  // Per default viene visualizzata la prima produzione dell'elenco. (l'ultima produzione effettuata in ordine cronologico)
		tw_chart.getLineHistoryProduction('#IDHistoryTableBody', entityName, timeStartHistory, timeEndHistory, chart, query)
	});
	// Listener sul cambio di valore della data di fine produzione
	// Al cambio di valore viene eseguita la funzione seguente.
	// Viene recuperata di nuovo la lista delle produzioni con il range time aggiornato
	$('#IDTimeEnd').change(function() {
	  // Visualizza lo spinner per indicare il caricamento in corso
		$('.lds-dual-ring.history-production-list').show()
		// Recupera i valori di inizio e fine produzione
	  let timeStartHistory = new Date($('#IDTimeStart').val())
		let timeEndHistory   = new Date($(this).val())
	  // Recupera la lista delle produzioni
	  // Per default viene visualizzata la prima produzione dell'elenco. (l'ultima produzione effettuata in ordine cronologico)
		tw_chart.getLineHistoryProduction('#IDHistoryTableBody', entityName, timeStartHistory, timeEndHistory, chart, query)
	});
}
// La funzione recupera i dati da thingworx e li visualizza sul grafico
// della relativa card.
function cardLineTrend(IDdivTrend, entityName, s1, s2='', um){
	let timestart = new Date()
	let timestop = new Date()

	timestart = timestart.getTime() - 3600000
	timestop = timestop.getTime()
	// Instanzia il grafico di amchart, i parametri sono:
	// - ID div dove viene visualizzato il grafico
	// - Indice del colore del grafico
	let chart = am.createXYChartNoLegend(IDdivTrend, 0);
	// Aggiunge la serie al grafico
	am.createLineSeries(chart, "PV", "time", "PV", um, 0, false, false, false, 0.7)
	if(s2) am.createLineSeries(chart, "SP", "time", "SP", um, 0, false, false, false, 0.7)
	// Definisce la query
	let query = 'SELECT '
	query += 'mean("' + s1 +'") as "PV" '
	if(s2) query += ', mean("' + s2 +'") as "SP" '
	query += 'FROM "' + entityName + '" '
	query += 'WHERE time > ' + timestart + 'ms and time < ' + timestop + 'ms GROUP BY time(10s) fill(previous)'

	console.log(query)
	// Setta i dati del grafico
	am.setChartData(chart, query, '.lds-dual-ring.general-info')
	// Funzioni cicliche
	setInterval(am.setChartData, 120000, chart, query, '.lds-dual-ring.general-info')

	/*
	// Recupera l'inizio e la fine della produzione attuale.
	// In questo caso la fine produzione è sempre l'ora attuale
	tw.getLineTimeRange(entityName)
	.then(time => {
		// Instanzia il grafico di amchart, i parametri sono:
	  // - ID div dove viene visualizzato il grafico
	  // - Indice del colore del grafico
	  let chart = am.createXYChartNoLegend(IDdivTrend, 0);
	  // Aggiunge la serie al grafico
		am.createLineSeries(chart, "PV", "time", "PV", um, 0, false, false, false, 0.7)
		if(s2) am.createLineSeries(chart, "SP", "time", "SP", um, 0, false, false, false, 0.7)
	  // Definisce la query
	  let query = 'SELECT '
		query += 'mean("' + s1 +'") as "PV" '
		if(s2) query += ', mean("' + s2 +'") as "SP" '
	  query += 'FROM "' + entityName + '" '
	  query += 'WHERE time > ' + time.start + 'ms and time < ' + time.end + 'ms GROUP BY time(10s) fill(previous)'
	  // Setta i dati del grafico
	  am.setChartData(chart, query, '.lds-dual-ring.general-info')
		// Funzioni cicliche
		setInterval(am.setChartData, 120000, chart, query, '.lds-dual-ring.general-info')
	})
	.catch(e => console.error(e))
	*/
}

export{
  getDate,
	actualDryerProduction,
	historyDryerProduction,
	actualLineProduction,
	historyLineProduction,
	cardLineTrend
}
