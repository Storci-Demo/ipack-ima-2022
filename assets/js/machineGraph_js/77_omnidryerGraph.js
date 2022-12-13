import * as tw from "../Global/Thingworx/thingworx_api_module.js"
import * as am from "../Global/amchart/amchart_functions.js"
import * as fb from "../Global/Firebase/firebase_auth_module.js"
import * as common from "../Global/Common/commonFunctions.js"

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

// Recupera l'entity name della thing
let entityName = urlParams.get('entityName')
// Recupera l'entity name della thing
// Istanzia i grafici dell'attuale e dello storico
// I grafici devono essere istanziati una volta solamente
// La funzione am.createXYChart ha i seguenti parametri di ingresso
// - ID del div che contiene il grafico
// - ID del div che contiene la legenda
// - ID per la colorazione delle series
// - Numero di assi Y associate al GRAFICO
// - Array con le unità di misura
let arrayUM = ['Produzione (kg/h)', 'Pressione Estrusore (Bar)']
let chartActualProduction = am.createXYChart("IDTrendActualProduction", 'IDLegendActualProduzione', 6, 2, arrayUM)

// Crea le series da visualizzare sul grafico
am.createLineSeries(chartActualProduction, "PV - Impasto", "time", "PV_Impasto", "kg/h", 0, false, true, true)
am.createLineSeries(chartActualProduction, "SP - Impasto", "time", "SP_Impasto", "kg/h", 0, false, true)
am.createLineSeries(chartActualProduction, "PV - Pressione", "time", "PV_Pressione", "Bar", 1, false, false)
am.createLineSeries(chartActualProduction, "PV - Temperatura 1", "time", "PV_Temp_Tunnel_1", "°C", 1, false, false)
am.createLineSeries(chartActualProduction, "PV - Temperatura 2", "time", "PV_Temp_Tunnel_2", "°C", 1, false, false)
am.createLineSeries(chartActualProduction, "PV - Temperatura 3", "time", "PV_Temp_Tunnel_3", "°C", 1, false, false)
am.createLineSeries(chartActualProduction, "SP - Temperatura 1", "time", "SP_Temp_Tunnel_1", "°C", 1, false, true)
am.createLineSeries(chartActualProduction, "SP - Temperatura 2", "time", "SP_Temp_Tunnel_2", "°C", 1, false, true)
am.createLineSeries(chartActualProduction, "SP - Temperatura 3", "time", "SP_Temp_Tunnel_3", "°C", 1, false, true)
am.createLineSeries(chartActualProduction, "PV - Umidità 1", "time", "PV_Hum_Tunnel_1", "%H", 1, false, false)
am.createLineSeries(chartActualProduction, "PV - Umidità 2", "time", "PV_Hum_Tunnel_2", "%H", 1, false, false)
am.createLineSeries(chartActualProduction, "PV - Umidità 3", "time", "PV_Hum_Tunnel_3", "%H", 1, false, false)
am.createLineSeries(chartActualProduction, "SP - Umidità 1", "time", "SP_Hum_Tunnel_1", "%H", 1, false, true)
am.createLineSeries(chartActualProduction, "SP - Umidità 2", "time", "SP_Hum_Tunnel_2", "%H", 1, false, true)
am.createLineSeries(chartActualProduction, "SP - Umidità 3", "time", "SP_Hum_Tunnel_3", "%H", 1, false, true)

// Ricalcola la dimensione del div della legenda - viene eseguito ogni secondo
setInterval(am.refreshLegendSize, 1000, chartActualProduction, 'IDLegendActualProduzione')

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
query += 'WHERE time > {1}ms and time < {2}ms GROUP BY time(1m) fill(previous)'

// ******************** GRAFICO PRODUZIONE ATTUALE ********************
common.actualLineProduction(chartActualProduction, query, entityName)

$('#backToPrev').click(function(){
    //let url ='60_cellGrapHistory.html?'+'entityName='+ entityName  +'&timeStart=' + timeStartZoom  + '&timeEnd=' + timeEndZoom
    let url ='../52_line_omnidryer.html?'+'entityName='+ entityName  
    window.open(url, '_blank')
})