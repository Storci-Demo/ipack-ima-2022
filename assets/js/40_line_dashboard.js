import * as tw from "./Global/Thingworx/thingworx_api_module.js"
import * as am from "./Global/amchart/amchart_functions.js"
import * as fb from "./Global/Firebase/firebase_auth_module.js"
import * as lang from "./Global/Common/Translation.js"

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

// definisce l'url di base della pagina attuale (in questo caso della pagina index.html).
// il risultato è http(s)://xxx.xxx.xxx.xxx:xxxx
// baseURL verrà utilizzato come base per il cambio pagina.
/*
let baseURL = window.location.protocol + "//" + window.location.host;
*/
/*
$('#IDDiv1').css("display", "none")
$('#IDRow1').css("display", "none")
$('#IDRow2').css("display", "none")
$('#IDRow3').css("display", "none")
$('#IDNavbar').css("display", "none")
$("#IDDivSpinning").css("display", "block")
*/

// Esegue il codice principale al caricamento della pagina
$("body").ready(async function(){
	// Definisce la variabile
	let user;
	// Recupera il nome dell'utente da firebase
	//await fb.onAuthStateChanged().then(result => user = result).catch(error => console.error(error))
	// Se l'utente non è loggato viene reindirizzato alla pagina di login
	//if(!user){ window.location.href = baseURL + "/General/login.html"	}

	// Recupera l'entity name della thing
	let entityName = urlParams.get('entityName')
	// Recupera il nome del cliente
	let selectedCustomer = localStorage.getItem("global_selected_customer")

	// Imposta il nome del cliente e il nome della linea nel breadcrumb
  let lineName = ''
	try{
		lineName = entityName.replace(".", " ")
	}catch(e){}
	$("#IDLineName").text(lineName);
	$("#IDBreadcrumbCustomer").text(selectedCustomer.replace(/_/g, " "));

	setCardsValue(entityName)
	// Funzioni cicliche
	setInterval(setCardsValue, 10000, entityName);	// ogni 10 sec

	// Definisce le variabili come date
	let timeStart = new Date()
	let timeEnd   = new Date()
	// Imposta l'ora a mezzanotte del giorno attuale
	timeStart.setHours(7,0,0,0)
	// Imposta i timestamp un'ora prima e un'ora dopo
	timeStart = Number(timeStart.getTime()) - 3600000
	timeEnd   = Number(timeEnd.getTime()) + 3600000
	// Definisce la variabile
	let query;

	// ***** GRAFICO PRODUZIONE ATTUALE *****
	// Instazia il grafico della linea

	let chartProduction = am.createXYChart("IDtrendProduction", 'IDLegendProduction', 0, 2, ['Produzione Oraria', 'Pressione Estrusore'])
	// Crea le series da visualizzare nel grafico
	am.createLineSeries(chartProduction, "PV - Impasto", "time", "PV_Impasto", "kg/h", 0, true, false, true, 0.77)
	am.createLineSeries(chartProduction, "SP - Impasto", "time", "SP_Impasto", "kg/h", 0, false, false, false, 0.77)
	am.createLineSeries(chartProduction, "PV - Pressione", "time", "PV_Pressione", "Bar", 1, false, false, false, 0.77)
	// Definisce la query da inviare a influxdb
	query  = 'SELECT '
	query += 'mean("Impasto_PV_Impasto_Totale") as "PV_Impasto", '
	query += 'mean("Impasto_SP_Impasto_Totale") as "SP_Impasto", '
	query += 'mean("Pressa_Motori_Estrusore_PV_Pressione") as "PV_Pressione" '
	query += 'FROM "' + entityName + '" '
	query += 'WHERE time > ' + timeStart + 'ms and time < ' + timeEnd + 'ms GROUP BY time(10s) fill(previous)'
	// Inserisce i dati nel grafico
	setChartData(chartProduction, query)
	// Funzioni cicliche
	setInterval(setChartData, 600000, chartProduction, query);	// ogni 10 min
	// Ricalcola la dimensione del div della legenda - viene eseguito ogni secondo
	setInterval(am.refreshLegendSize, 1000, chartProduction, 'IDLegendProduction')


	// ***** GRAFICO QUANTITA PRODUZIONE GIORNALIERA *****
	timeStart = new Date()
	// Imposta l'ora a mezzanotte del giorno attuale
	timeStart.setHours(0,0,0,0)
	// Imposta l'ora a mezzanotte del giorno attuale
	timeStart.setDate(-30)
	// Imposta i timestamp un'ora prima e un'ora dopo
	timeStart = Number(timeStart.getTime())
	// Instazia il grafico della linea
	let chart = am.createXYChart("IDtrendProductQuantity", 'IDLegendProductQuantity', 0);
	// Crea le series da visualizzare nel grafico
	am.createColumnSeries(chart, "Quantità Impasto", "time", "productQuantity", "kg")
	// Definisce la query da inviare a influxdb
	query  = 'SELECT '
	query += 'SUM("Impasto") as "productQuantity" '
	query += 'FROM ( SELECT mean("Impasto_PV_Impasto_Totale") / 60 as "Impasto" '
	query += 'FROM "' + entityName + '" '
	query += 'WHERE time > ' + timeStart + 'ms and time < ' + timeEnd + 'ms GROUP BY time(1m) fill(0)) '
	query += 'GROUP BY time(24h)'
	// Inserisce i dati nel grafico
	setChartData(chart, query)
	// Funzioni cicliche
	setInterval(setChartData, 600000, chart, query);	// ogni 10 min
	// Ricalcola la dimensione del div della legenda - viene eseguito ogni secondo
	setInterval(am.refreshLegendSize, 1000, chart, 'IDLegendProductQuantity')


	// ***** LISTA ALLARMI ATTIVI *****
  getAlertsActive('#IDListAlertsActive', entityName)

	// ***** LISTA ALLARMI ATTIVI *****
  //getListMachine('#IDListMachines', entityName)

	// Recupera la lingua utilizzata dall'utente e sostituisce tutti i testi
	lang.getLanguage()

/*
	$('#IDDiv1').fadeIn();
	$('#IDRow1').fadeIn();
	$('#IDRow2').fadeIn();
	$('#IDRow3').fadeIn();
	$('#IDNavbar').fadeIn();
	$("#IDDivSpinning").css("display", "none")
*/
	// Pulsanti per l'esportazione del grafico in png
	$('#IDButtonExportTrendActualProduction').click(el => { am.getExport(chartProduction) })
})


// Funzione che recupera i dati da thingworx e li visualizza nelle card della pagina.
// Prerequisiti: le label che si vogliono popolare con i valori da thingworx devono avere
// la seguente classe '.thingworx-property-value'.
// Inoltre ogni label deve avere una key chiamata 'propertyname', il valore della key deve essere
// uguale al nome della property di thingworx che ritorna il servizio.
async function setCardsValue(entityName){
	// Dichiara la variabile
	let info
	// Richiama il servizio di thingworx.
	await tw.getLineInfo(entityName)
		.then(result => info = result)
		.catch(error => console.error(error))
	// Assegna alle varie label il valore corretto recuperato da thingworx
	$('[propertyname]').each(function(){
		$(this).text(info[$(this).attr('propertyname')])
	})
}

// Recupera i dati da influxdb tramite query.
// Inserisce i dati recuperati nel trend.
async function setChartData(chart, query) {
	// Definisce la variabile come array
	let data = [];
	// recupera li dati da influxdb
	let response = await tw.influxQuery(query);
	// Aggiunge una riga all'array data
	response.results[0].series[0].values.forEach(el => {
		// Definisce la variabile come json object
		let obj  = {};
		// Aggiunge le chiavi-valore all'oggetto json obj
		// Le chiavi sono le colonne della query di influxdb
		response.results[0].series[0].columns.forEach((key, id) => {
			// controllo che il valore ritornato sia un numero
			if(typeof(el[id]) == "number"){
				// Riduco la precisione a 2 valori decimali
				el[id] = el[id].toFixed(2);
			}
			//Aggiungo il valore all'oggetto obj
			obj[key] = el[id];
		});
		// Aggiungi il json all'array
		data.push(obj);
	});
	// Inserisce i dati nel grafico
	chart.data = data;
	console.log(response.results[0].series[0].values.length)
}

// Funzione che recupera tutti gli allarmi attivi della linea.
// Effettua una chiamata a tw per il recupero degli allarmi,
// poi inserisce gli allarmi all'interno di una lista.
async function getAlertsActive(idList, entityName){
	let list
	await tw.getLineAlertsActive(entityName)
		.then(result => list = result)
		.catch(error => console.error(error))

	list.rows.forEach((item, i) => {
		let date = new Date(item.TimeStart)
		let msg = item.Message
		let color = 'rgba(255,255,255,0)'

		if(item.Type == 'MSG') { color = '#fdd83566'	}
		else if(item.Type == 'WRN') { color = '#fb8c0066'	}
		else if(item.Type == 'ALM') { color = '#e5393566'	}

		let row  = '<li class="list-group-item d-flex flex-column" '
		    row += 'style="background: ' + color + '; border-width: 0px;border-color: rgba(33,37,41,0);'
				row += 'border-bottom-width: 0px;border-bottom-color: var(--bs-heading-medium-emphasis);border-radius: 4px;margin-top: 8px;margin-bottom: 8px;">'
				row += '<span style="color: var(--bs-heading-medium-emphasis); font-size:12px;">' + date + '</span>'
				row += '<span style="color: var(--bs-heading-medium-emphasis); font-size:14px;">' + msg + '</span></li>'

		$(idList).append(row)
	});
}
