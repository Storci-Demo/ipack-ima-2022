import * as tw from "../Global/Thingworx/thingworx_api_module.js"
import * as am from "../Global/amchart/amchart_functions.js"
import * as fb from "../Global/Firebase/firebase_auth_module.js"
import * as common from "../Global/Common/commonFunctions.js"

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

// Recupera l'entity name della thing
let entityName = urlParams.get('entityname')

// - Array con le unità di misura
let arrayUM = ['Produzione (kg/h)', 'Pressione Estrusore (Bar)']
let chartActualProduction = am.createXYChart("IDTrendActualProduction", 'IDLegendActualProduzione', 0, 2, arrayUM)

// Crea le series da visualizzare sul grafico
am.createLineSeries(chartActualProduction, "PV - Impasto", "time", "PV_Impasto", "kg/h", 0, false, true, true)
am.createLineSeries(chartActualProduction, "SP - Impasto", "time", "SP_Impasto", "kg/h", 0, false, true)
am.createLineSeries(chartActualProduction, "PV - Pressione", "time", "PV_Pressione", "Bar", 1, false, false)
am.createLineSeries(chartActualProduction, "PV - Canne al Minuto", "time", "PV_Canne_Minuto", "Canne/min", 1, false, true)
am.createLineSeries(chartActualProduction, "SP - Canne Prodotte", "time", "PV_Canne_Prodotte", "", 1, false, true)
am.createLineSeries(chartActualProduction, "PV - Peso Canna", "time", "PV_Peso_Canna", "kg", 1, false, true)
am.createLineSeries(chartActualProduction, "SP - Tempo Canna", "time", "PV_Tempo_Canna", "sec", 1, false, true)

// Ricalcola la dimensione del div della legenda - viene eseguito ogni secondo
setInterval(am.refreshLegendSize, 1000, chartActualProduction, 'IDLegendActualProduzione')

let query  = 'SELECT '
query += 'mean("Impasto_PV_Impasto_Totale") as "PV_Impasto", '
query += 'mean("Impasto_SP_Impasto_Totale") as "SP_Impasto", '
query += 'mean("Pressa_Motori_Estrusore_PV_Pressione") as "PV_Pressione", '
query += 'mean("Stenditrice_PV_Canne_Minuto") as "PV_Canne_Minuto", '
query += 'mean("Stenditrice_PV_Canne_Prodotto") as "PV_Canne_Prodotte", '
query += 'mean("Stenditrice_PV_Peso_Canna") as "PV_Peso_Canna", '
query += 'mean("Stenditrice_PV_Tempo_Canna") as "PV_Tempo_Canna" '
query += 'FROM "' + entityName + '" '
query += 'WHERE time > {1}ms and time < {2}ms GROUP BY time(1m) fill(previous)'

// ******************** GRAFICO PRODUZIONE ATTUALE ********************
common.actualLineProduction(chartActualProduction, query, entityName)


$('#backToPrev').click(function(){
    //let url ='60_cellGrapHistory.html?'+'entityName='+ entityName  +'&timeStart=' + timeStartZoom  + '&timeEnd=' + timeEndZoom
    let url ='../49_line_spreader.html?'+'entityName='+ entityName  
    window.open(url, '_blank')
})