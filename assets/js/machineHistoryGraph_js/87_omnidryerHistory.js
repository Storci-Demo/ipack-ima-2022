// Carica le funzioni globali
import * as tw from "../Global/Thingworx/thingworx_api_module.js"
import * as am from "../Global/amchart/amchart_functions.js"
import * as fb from "../Global/Firebase/firebase_auth_module.js"
import * as lang from "../Global/Common/Translation.js"
import * as common from "../Global/Common/commonFunctions.js"

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

// Recupera l'entity name della thing
// Recupera l'entity name della thing
// Recupera l'entity name della thing
let entityName = urlParams.get('entityName')
let timeStartZoom = urlParams.get('timeStart')
console.log(timeStartZoom)
let timeEndZoom = urlParams.get ('timeEnd')
console.log(timeEndZoom)
// Istanzia i grafici dell'attuale e d

let arrayUM = ['Produzione (kg/h)', 'Pressione Estrusore (Bar)']
let chartHistoryProduction = am.createXYChart("IDTrendHistoryProduction", 'IDLegendHistoryProduction', 6, 2, arrayUM)

// Crea le series da visualizzare sul grafico
am.createLineSeries(chartHistoryProduction, "PV - Impasto", "time", "PV_Impasto", "kg/h", 0, false, true, true)
am.createLineSeries(chartHistoryProduction, "SP - Impasto", "time", "SP_Impasto", "kg/h", 0, false, true)
am.createLineSeries(chartHistoryProduction, "PV - Pressione", "time", "PV_Pressione", "Bar", 1, false, false)
am.createLineSeries(chartHistoryProduction, "PV - Temperatura 1", "time", "PV_Temp_Tunnel_1", "°C", 1, false, false)
am.createLineSeries(chartHistoryProduction, "PV - Temperatura 2", "time", "PV_Temp_Tunnel_2", "°C", 1, false, false)
am.createLineSeries(chartHistoryProduction, "PV - Temperatura 3", "time", "PV_Temp_Tunnel_3", "°C", 1, false, false)
am.createLineSeries(chartHistoryProduction, "SP - Temperatura 1", "time", "SP_Temp_Tunnel_1", "°C", 1, false, true)
am.createLineSeries(chartHistoryProduction, "SP - Temperatura 2", "time", "SP_Temp_Tunnel_2", "°C", 1, false, true)
am.createLineSeries(chartHistoryProduction, "SP - Temperatura 3", "time", "SP_Temp_Tunnel_3", "°C", 1, false, true)
am.createLineSeries(chartHistoryProduction, "PV - Umidità 1", "time", "PV_Hum_Tunnel_1", "%H", 1, false, false)
am.createLineSeries(chartHistoryProduction, "PV - Umidità 2", "time", "PV_Hum_Tunnel_2", "%H", 1, false, false)
am.createLineSeries(chartHistoryProduction, "PV - Umidità 3", "time", "PV_Hum_Tunnel_3", "%H", 1, false, false)
am.createLineSeries(chartHistoryProduction, "SP - Umidità 1", "time", "SP_Hum_Tunnel_1", "%H", 1, false, true)
am.createLineSeries(chartHistoryProduction, "SP - Umidità 2", "time", "SP_Hum_Tunnel_2", "%H", 1, false, true)
am.createLineSeries(chartHistoryProduction, "SP - Umidità 3", "time", "SP_Hum_Tunnel_3", "%H", 1, false, true)

// Ricalcola la dimensione del div della legenda - viene eseguito ogni secondo
setInterval(am.refreshLegendSize, 1000, chartHistoryProduction, 'IDLegendHistoryProduction')

// Definisce la query da inviare a influxdb
// I parametri da sostituire sono indicati da {1}, {2}, ecc...
// Invece l'entityName è sempre comune per tutte le query
let query  = 'SELECT '
query += 'mean("Impasto_PV_Impasto_Totale") as "PV_Impasto", '
query += 'mean("Impasto_SP_Impasto_Totale") as "SP_Impasto", '
query += 'mean("Pressa_Motori_Estrusore_PV_Pressione") as "PV_Pressione", '
query += 'mean("Omnidryer_Tunnel_PV_Temperatura_1") as "PV_Temp_Tunnel_1", '
query += 'mean("Omnidryer_Tunnel_PV_Temperatura_2") as "PV_Temp_Tunnel_2", '
query += 'mean("Omnidryer_Tunnel_PV_Temperatura_3") as "PV_Temp_Tunnel_3", '
query += 'mean("Omnidryer_Tunnel_SP_Temperatura_1") as "SP_Temp_Tunnel_1", '
query += 'mean("Omnidryer_Tunnel_SP_Temperatura_2") as "SP_Temp_Tunnel_2", '
query += 'mean("Omnidryer_Tunnel_SP_Temperatura_3") as "SP_Temp_Tunnel_3", '
query += 'mean("Omnidryer_Tunnel_PV_Umidità_1") as "PV_Hum_Tunnel_1", '
query += 'mean("Omnidryer_Tunnel_PV_Umidità_2") as "PV_Hum_Tunnel_2", '
query += 'mean("Omnidryer_Tunnel_PV_Umidità_3") as "PV_Hum_Tunnel_3", '
query += 'mean("Omnidryer_Tunnel_SP_Umidità_1") as "SP_Hum_Tunnel_1", '
query += 'mean("Omnidryer_Tunnel_SP_Umidità_2") as "SP_Hum_Tunnel_2", '
query += 'mean("Omnidryer_Tunnel_SP_Umidità_3") as "SP_Hum_Tunnel_3" '
query += 'FROM "' + entityName + '" '
query += 'WHERE time > '+ timeStartZoom + 'ms and time < '+ timeEndZoom + 'ms GROUP BY time(10s) fill(previous)'

// ******************** STORICO PRODUZIONI ********************
common.actualLineProduction(chartHistoryProduction, query, entityName)

$('#backToPrev').click(function(){
    //let url ='60_cellGrapHistory.html?'+'entityName='+ entityName  +'&timeStart=' + timeStartZoom  + '&timeEnd=' + timeEndZoom
    let url ='../52_line_omnidryer.html?'+'entityName='+ entityName  
    window.open(url, '_blank')
})