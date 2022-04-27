// Carica le funzioni globali
import * as tw from "./Global/Thingworx/thingworx_api_module.js"
import * as am from "./Global/amchart/amchart_functions.js"
import * as fb from "./Global/Firebase/firebase_auth_module.js"
import * as lang from "./Global/Common/Translation.js"
import * as common from "./Global/Common/commonFunctions.js"

// definisce l'url di base della pagina attuale (in questo caso della pagina index.html).
// il risultato è http(s)://xxx.xxx.xxx.xxx:xxxx
// baseURL verrà utilizzato come base per il cambio pagina.
/*
let baseURL = window.location.protocol + "//" + window.location.host
let pageURL = window.location.href
if(window.location.protocol == 'https:'){
  baseURL += '/pwa'
}
*/
// Recupera il nome dell'utente da firebase, controlla che sia loggato.
// Nel caso non fosse loggato richiama la pagina di login
//fb.onAuthStateChanged_2()
// Recupera dei dati dalle local storage
let selectedCustomer = localStorage.getItem("global_selected_customer")
let selectedLine 		 = localStorage.getItem("global_selected_line")
let entityName			 = localStorage.getItem('global_entityName')
// Toglie gli underscore dal nome e li visualizza nel campo
$('#IDCustomerName').text(selectedCustomer.replace(/_/g, " "))
// Imposta il nome del cliente nella breadcrumb
// Vengono sostituiti tutti gli underscore presenti nel nome
$("#IDBreadcrumbCustomer").text(selectedCustomer.replace(/_/g, ' '));
// Recupera la lingua utilizzata dall'utente e sostituisce tutti i testi
// ATTENZIONE - Questa istruzione traduce solamente i testi statici e non
// i testi caricati dalle funzioni.
lang.getLanguage()
$('#id-nav-dashboard').addClass('active')

// Recupera i dati generali delle celle installate dal cliente
tw.service_01_getDryersGeneralInfo(entityName)
.then(res => {
  if(JSON.stringify(res) !== '{}'){
    // Crea i div per visualizzare le celle
    createDivDryers('#IDdivDryers', entityName)
    setDryersCardsValue(entityName)
    setInterval(setDryersCardsValue, 10000, entityName)

    let arrayUM = ['Consumo Giornaliero (kcal)', 'Celle Attive']
    let id = 'ID' + res.entityName.replace(/\./g, '')
    let idLegend = id + 'Legend'
    let idTrend = id + 'Trend'

    let chart = am.createXYChart(idTrend, idLegend, 0, 2, arrayUM)

    am.createColumnSeries(chart, "Celle attive", "time", "dryers_actived", '', 1)
    am.createLineSeries(chart, "Consumo Giornaliero", "time", "kcal", "kcal", 0, true, false, false, 0.77)

    setInterval(am.refreshLegendSize, 1000, chart, idLegend)

    let dryersEntityName = '/' + entityName + '.*.Cella.*/'
    // Definisce la query da inviare a influxdb
    // I parametri da sostituire sono indicati da {1}, {2}, ecc...
    // Invece l'entityName è sempre comune per tutte le query
    let query = 'SELECT '
    query += 'mean("Dati_Aggiuntivi_Kcal_H") as "kcal" '
    query += 'FROM ' + dryersEntityName + ' '
    query += 'WHERE time >= now() - 5d and time <= now() '
    query += 'GROUP BY time(24h) fill(0)'

    setDryersTrend(chart, query)

    $('[chart="chartDryers"]').click(function() {
      let days = $(this).attr('value')

      $(this).addClass('active').siblings().removeClass('active')

      let query = 'SELECT '
      query += 'mean("Dati_Aggiuntivi_Kcal_H") as "kcal" '
      query += 'FROM ' + dryersEntityName + ' '
      query += 'WHERE time >= now() - ' + days + 'd and time <= now() '
      query += 'GROUP BY time(24h) fill(0)'

      setDryersTrend(chart, query)
    })
  }else{
    $('#IDdivDryers').addClass('d-none')
  }
})
.catch(e => {
  $('#IDdivLinee').addClass('d-none')
})

// Recupera i dati generali delle linee installate dal cliente
tw.service_02_getLinesGeneralInfo(entityName)
.then(res => {
  if(res.array.length > 0){
    res.array.forEach((item, i) => {
      createDivLine('#IDdivLinee', item.entityName)
      setLineCardsValue(entityName)
      setInterval(setLineCardsValue, 10000, entityName)

      let arrayUM = ['Produzione (kg)']
      let id = 'ID' + item.entityName.replace(/\./g, '')
      let idLegend = id + 'Legend'
      let idTrend = id + 'Trend'
      let chart = am.createXYChart(idTrend, idLegend, 0, 1, arrayUM)

      am.createColumnSeries(chart, "Produzione Giornaliera", "time", "daily_production", "kg")

      setInterval(am.refreshLegendSize, 1000, chart, idLegend)

      // Definisce la query da inviare a influxdb
      // I parametri da sostituire sono indicati da {1}, {2}, ecc...
      // Invece l'entityName è sempre comune per tutte le query
      let query = 'SELECT '
      query += 'SUM("Impasto") as "daily_production"'
      query += 'FROM (SELECT mean("Impasto_PV_Impasto_Totale") / 60 as "Impasto" '
      query += 'FROM "' + item.entityName + '" '
      query += 'WHERE time >= now() - 5d and time <= now() '
      query += 'GROUP BY time(1m) fill(0)) GROUP BY time(24h)'

      am.setChartData(chart, query, '')

      $('[chart="chartLine"]').click(function() {
        let days = $(this).attr('value')

        $(this).addClass('active').siblings().removeClass('active')

        let query = 'SELECT '
        query += 'SUM("Impasto") as "daily_production"'
        query += 'FROM (SELECT mean("Impasto_PV_Impasto_Totale") / 60 as "Impasto" '
        query += 'FROM "' + item.entityName + '" '
        query += 'WHERE time >= now() - ' + days + 'd and time <= now() '
        query += 'GROUP BY time(1m) fill(0)) GROUP BY time(24h)'

        am.setChartData(chart, query, '')
      })
    })
  }else{
    $('#IDdivLinee').addClass('d-none')
  }
})
.catch(e => {
  console.warn(e)
  $('#IDdivLinee').addClass('d-none')
})

// ******************** FUNCTION ********************
// Funzione che recupera i dati da thingworx e li visualizza nelle card della pagina.
// Prerequisiti: le label che si vogliono popolare con i valori da thingworx devono avere
// la seguente classe '.thingworx-property-value'.
// Inoltre ogni label deve avere una key chiamata 'propertyname', il valore della key deve essere
// uguale al nome della property di thingworx che ritorna il servizio.
function setLineCardsValue(entityName){
	// Richiama il servizio di thingworx.
	tw.service_02_getLinesGeneralInfo(entityName)
		.then(result => {
      // Assegna alle varie label il valore corretto recuperato da thingworx
      result.array.forEach((item, i) => {
        let keyProperty = item.entityName.replace(/\./g, '')
        keyProperty = keyProperty.toLowerCase()
        let key = '[' + keyProperty + ']'
        $(key).each(function(){
          $(this).text(item[$(this).attr(keyProperty)])
        })
      })
    })
		.catch(error => console.error(error))
}


function setDryersCardsValue(entityName){
	// Richiama il servizio di thingworx.
	tw.service_01_getDryersGeneralInfo(entityName)
		.then(result => {
      // Assegna alle varie label il valore corretto recuperato da thingworx
        let keyProperty = result.entityName.replace(/\./g, '')
        keyProperty = keyProperty.toLowerCase()
        let key = '[' + keyProperty + ']'
        $(key).each(function(){
          $(this).text(result[$(this).attr(keyProperty)])
        })
      })
		.catch(error => console.error(error))
}

function setDryersTrend(chart, query){
  tw.influxQuery(query)
  .then(response => {
    // Dichiara la variabile
    let data = [];
    // Ciclo for che somma tutti i consumi delle celle per ogni giorno selezionato dalla query
    // Il ciclo principale è definito dal numero di giorni selezionati (response.results[0].series[0].values ha tanti elementi quanti sono i giorni)
    response.results[0].series[0].values.forEach((el, id) => {
      // Resetta il totale giornaliero delle kcal di tutte le celle
      let kcal_day_total = 0
      let dryers = 0
      // Ciclo che recupera il consumo giornaliero di ogni cella (il giorno è indicato dal ciclo for padre)
      response.results[0].series.forEach(serie => {
        // somma i consumi di tutte le celle per il giorno selezionato
        // Controlla se i consumi di una cella siano stati maggiore di zero,
        // nel caso viene sommata una cella nel conteggio delle celle in funzione
        // e le kcal usate da quella cella
        if(serie.values[id][1] > 0){
          dryers += 1
          kcal_day_total += serie.values[id][1]
        }
      })
      // aggiunge il consumo totale giornaliero nel dataset del grafico
      data.push({
        time: el[0],
        kcal: kcal_day_total.toFixed(0),
        dryers_actived: dryers
      });
    })
    // Aggiorna il grafico con i dati recuperati
    chart.data = data;
  })
}

function createDivLine(IDdiv, entityName){
  let keyProperty = entityName.replace(/\./g, '')
  let id = 'ID' + entityName.replace(/\./g, '')
  let html = ''

  html += '<div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom" data-pg-collapsed>'
  html += '<h1 class="h2" ' + keyProperty + '="nome_linea">Linea</h1>'
  html +=   '<div class="btn-toolbar mb-2 mb-md-0">'
  html +=       '<div class="btn-group me-2"></div>'
  html +=   '</div>'
  html += '</div>'
 /*
  html += '<div class="divClientiConnessi" style="margin-top: 50px;">'
  html +=     '<h5 style="margin: 0;padding-right: 12px;padding-left: 12px;color: var(--bs-heading-medium-emphasis);font-size: 1.2rem;" ' + keyProperty + '="nome_linea">LINEA</h5>'
  html += '</div>'
  */
  html += '<div id="IDdivLineData" class="row g-0 row-cols-1 row-cols-lg-3 gy-3" style="min-height: 300px;">'
  html +=     '<div class="col col-customer" style="padding-right: 12px;">'
  html +=         '<div class="card card-h-100" style="border-radius: 0px;">'
  html +=             '<div class="card-body" style="padding: 1.5rem;">'
  html +=                 '<h6 class="text-muted card-subtitle mb-2" style="color: var(--bs-heading-medium-emphasis);font-size: 1rem;" translate_id="actual_alarms">Stato Macchina</h6>'
  html +=                 '<h4 class="card-title" ' + keyProperty + '="stato_linea" style="color: var(--bs-heading-high-emphasis);font-size: 1.2rem;">Title</h4>'
  html +=             '</div>'
  html +=         '</div>'
  html +=     '</div>'
  html +=     '<div class="col col-customer" style="padding-right: 12px;">'
  html +=         '<div class="card card-h-100" style="border-radius: 0px;">'
  html +=             '<div class="card-body" style="padding: 1.5rem;">'
  html +=                 '<h6 class="text-muted card-subtitle mb-2" style="color: var(--bs-heading-medium-emphasis);font-size: 1rem;" translate_id="actual_alarms">Ricetta Impostata</h6>'
  html +=                 '<h4 class="card-title" ' + keyProperty + '="nome_ricetta" style="color: var(--bs-heading-high-emphasis);font-size: 1.2rem;">Title</h4>'
  html +=             '</div>'
  html +=         '</div>'
  html +=     '</div>'
  html +=     '<div class="col col-customer" style="padding: 0px;">'
  html +=         '<div class="card card-h-100" style="border-radius: 0px;">'
  html +=             '<div class="card-body" style="padding: 1.5rem;">'
  html +=                 '<h6 class="text-muted card-subtitle mb-2" style="color: var(--bs-heading-medium-emphasis);font-size: 1rem;" translate_id="actual_alarms">Numero Allarmi Presenti</h6>'
  html +=                 '<h4 class="card-title" style="color: var(--bs-heading-high-emphasis);font-size: 1.2rem;" ' + keyProperty + '="numero_allarmi">Title</h4>'
  html +=             '</div>'
  html +=         '</div>'
  html +=     '</div>'
  html +=     '<div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 col-customer" style="padding: 0px;">'
  html +=         '<div class="card card-h-100" style="border-radius: 0px;">'
  html +=             '<div class="card-body" style="padding: 0px;padding-top: 16px;">'
  html +=                 '<div style="padding-right: 16px;padding-left: 16px;">'
  html +=                     '<h6 class="text-muted mb-2" style="color: var(--bs-heading-medium-emphasis);margin: 0px;font-size: 1rem;" translate_id="daily_production">Produzione Giornaliera</h6>'
  html +=                 '</div>'
  html +=                 '<div id="' + id + 'Legend"></div>'
  html +=                 '<div id="' + id + 'Trend" style="min-height: 300px;max-height: 100%;"></div>'
  html +=                 '<div class="d-flex justify-content-center" style="width: 100%;">'
  html +=                   '<button id="' + id + '5d" class="btn btn-outline-primary active" type="button" style="margin: 5px; font-size: 12px;color: var(--bs-heading-medium-emphasis);" '
  html +=                   'value="5" chart="chartLine"><span style="margin-right: 5px;font-size: 0.6rem;">5</span><span translate_id="days" style="font-size: 0.6rem;">Days</span></button>'
  html +=                   '<button id="' + id + '10d" class="btn btn-outline-primary" type="button" style="margin: 5px; font-size: 12px;color: var(--bs-heading-medium-emphasis);" '
  html +=                   'value="10" chart="chartLine"><span style="margin-right: 5px;font-size: 0.6rem;">10</span><span translate_id="days" style="font-size: 0.6rem;">Days</span></button>'
  html +=                   '<button id="' + id + '30d" class="btn btn-outline-primary" type="button" style="margin: 5px; font-size: 12px;color: var(--bs-heading-medium-emphasis);" '
  html +=                   'value="30" chart="chartLine"><span style="margin-right: 5px;font-size: 0.6rem;">30</span><span translate_id="days" style="font-size: 0.6rem;">Days</span></button>'
  html +=                 '</div>'
  html +=             '</div>'
  html +=         '</div>'
  html +=     '</div>'
  html += '</div>'
  //html += '<div style="padding-right: 20px;padding-left: 20px;margin-bottom: 80px;"><button id="IDLinkLine" entityname="' + entityName + '" class="btn btn-primary" type="button" style="min-width: 100%;">LINEA DASHBOARD</button></div>'

  $(IDdiv).append(html)

/*
  let navitem = ''
  navitem += '<li class="nav-item">'
  navitem +=   '<a class="nav-link" href="#">'
  navitem +=      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file">'
  navitem +=          '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>'
  navitem +=          '<polyline points="13 2 13 9 20 9"></polyline>'
  navitem +=      '</svg>'
  navitem +=      '<span class="ms-1" ' + keyProperty + '="nome_linea">Linea</span>'
  navitem +=   '</a>'
  navitem += '</li>'

  let idnav = '#IDNavPrimary'
  $(idnav).append(navitem)

  */
/*
  $('#IDLinkLine').click(function() {
    localStorage.setItem('global_selected_line_entityName', $(this).attr('entityname'))
    // Carica la pagina.
    window.location.href = baseURL + "/Customers/CustomerInfo/Lines/LinesInfo.html"
  })*/
}


function createDivDryers(IDdiv, entityName){
  let keyProperty = entityName.replace(/\./g, '')
  let id = 'ID' + entityName.replace(/\./g, '')
  let html = ''

  html += '<div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom" data-pg-collapsed>'
  html += '<h1 class="h2">Celle</h1>'
  html +=   '<div class="btn-toolbar mb-2 mb-md-0">'
  html +=       '<div class="btn-group me-2"></div>'
  html +=   '</div>'
  html += '</div>'
  /*
  html += '<div id="IDdivNameDryers" class="divClientiConnessi">'
  html +=     '<h5 style="margin: 0;padding-right: 12px;padding-left: 12px;color: var(--bs-heading-medium-emphasis);font-size: 1.2rem;">CELLE</h5>'
  html += '</div>'
  */
  html += '<div id="IDDryersData" class="row g-0 row-cols-1 row-cols-lg-4 d-flex gy-3" style="min-height: 300px;">'
  html +=     '<div class="col col-customer" style="padding-right: 12px;">'
  html +=         '<div class="card card-h-100" style="border-radius: 0px;">'
  html +=             '<div class="card-body" style="padding: 1.5rem;">'
  html +=                 '<h6 class="text-muted card-subtitle mb-2" style="color: var(--bs-heading-medium-emphasis);font-size: 1rem;" translate_id="actual_alarms">Celle attive</h6>'
  html +=                 '<h4 class="card-title thingworx-property-value" ' + keyProperty + '="celle_attive" style="color: var(--bs-heading-high-emphasis);font-size: 1.2rem;">Title</h4>'
  html +=             '</div>'
  html +=         '</div>'
  html +=     '</div>'
  html +=     '<div class="col col-customer" style="padding-right: 12px;">'
  html +=         '<div class="card card-h-100" style="border-radius: 0px;">'
  html +=             '<div class="card-body" style="padding: 1.5rem;">'
  html +=                 '<h6 class="text-muted card-subtitle mb-2" style="color: var(--bs-heading-medium-emphasis);font-size: 1rem;" translate_id="actual_alarms">Temperatura Ambiente</h6>'
  html +=                 '<h4 class="card-title thingworx-property-value" ' + keyProperty + '="temperatura_ambiente" style="color: var(--bs-heading-high-emphasis);font-size: 1.2rem;">Title</h4>'
  html +=             '</div>'
  html +=         '</div>'
  html +=     '</div>'
  html +=     '<div class="col col-customer" style="padding-right: 12px;">'
  html +=         '<div class="card card-h-100" style="border-radius: 0px;">'
  html +=             '<div class="card-body" style="padding: 1.5rem;">'
  html +=                 '<h6 class="text-muted card-subtitle mb-2" style="color: var(--bs-heading-medium-emphasis);font-size: 1rem;" translate_id="actual_alarms">Umidità Ambiente</h6>'
  html +=                 '<h4 class="card-title thingworx-property-value" ' + keyProperty + '="umidita_ambiente" style="color: var(--bs-heading-high-emphasis);font-size: 1.2rem;">Title</h4>'
  html +=             '</div>'
  html +=         '</div>'
  html +=     '</div>'
  html +=     '<div class="col col-customer" style="padding: 0px;">'
  html +=         '<div class="card card-h-100" style="border-radius: 0px;">'
  html +=             '<div class="card-body" style="padding: 1.5rem;">'
  html +=                 '<h6 class="text-muted card-subtitle mb-2" style="color: var(--bs-heading-medium-emphasis);font-size: 1rem;" translate_id="actual_alarms">Numero Allarmi Presenti</h6>'
  html +=                 '<h4 class="card-title thingworx-property-value" ' + keyProperty + '="allarmi_attivi" style="color: var(--bs-heading-high-emphasis);font-size: 1.2rem;">Title</h4>'
  html +=             '</div>'
  html +=         '</div>'
  html +=     '</div>'
  html +=     '<div class="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12 col-customer" style="padding: 0px;">'
  html +=         '<div class="card card-h-100" style="border-radius: 0px;">'
  html +=             '<div class="card-body" style="padding: 0px;padding-top: 16px;">'
  html +=                 '<div style="padding-right: 16px;padding-left: 16px;">'
  html +=                     '<h6 class="text-muted mb-2" style="color: var(--bs-heading-medium-emphasis);margin: 0px;font-size: 1rem;" translate_id="daily_production">Consumo Giornaliero</h6>'
  html +=                 '</div>'
  html +=                 '<div id="' + id + 'Legend"></div>'
  html +=                 '<div id="' + id + 'Trend" style="min-height: 300px;max-height: 100%;"></div>'
  html +=                 '<div class="d-flex justify-content-center" style="width: 100%;">'
  html +=                    '<button id="' + id + '5d" class="btn btn-outline-primary active" type="button" style="margin: 5px; font-size: 12px;color: var(--bs-heading-medium-emphasis);" '
  html +=                   'value="5" chart="chartDryers"><span style="margin-right: 5px;font-size: 0.6rem;">5</span><span translate_id="days" style="font-size: 0.6rem;">Days</span></button>'
  html +=                   '<button id="' + id + '10d" class="btn btn-outline-primary" type="button" style="margin: 5px; font-size: 12px;color: var(--bs-heading-medium-emphasis);" '
  html +=                   'value="10" chart="chartDryers"><span style="margin-right: 5px;font-size: 0.6rem;">10</span><span translate_id="days" style="font-size: 0.6rem;">Days</span></button>'
  html +=                   '<button id="' + id + '30d" class="btn btn-outline-primary" type="button" style="margin: 5px; font-size: 12px;color: var(--bs-heading-medium-emphasis);" '
  html +=                   'value="30" chart="chartDryers"><span style="margin-right: 5px;font-size: 0.6rem;">30</span><span translate_id="days" style="font-size: 0.6rem;">Days</span></button>'
  html +=                 '</div>'
  html +=             '</div>'
  html +=         '</div>'
  html +=     '</div>'
  html += '</div>'
//  html += '<div style="padding-right: 20px;padding-left: 20px;margin-bottom: 80px;"><button id="IDLinkDryers" entityname="' + entityName + '" class="btn btn-primary" type="button" style="min-width: 100%;">CELLE DASHBOARD</button></div>'

  $(IDdiv).append(html)

/*
  let navitem = ''
  navitem += '<li class="nav-item">'
  navitem +=   '<a class="nav-link" href="#">'
  navitem +=      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file">'
  navitem +=          '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>'
  navitem +=          '<polyline points="13 2 13 9 20 9"></polyline>'
  navitem +=      '</svg>'
  navitem +=      '<span class="ms-1">Celle</span>'
  navitem +=   '</a>'
  navitem += '</li>'

  let idnav = '#IDNavPrimary'
  $(idnav).append(navitem)
  */
/*
  $('#IDLinkDryers').click(function() {
    // Carica la pagina.
    window.location.href = baseURL + "/Customers/CustomerInfo/Dryers/DryersInfo.html";
  })
  */
}
