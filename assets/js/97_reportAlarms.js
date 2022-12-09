// Carica le funzioni globali
import * as tw from "./Global/Thingworx/thingworx_api_module.js"
import * as am from "./Global/amchart/amchart_functions.js"
import * as fb from "./Global/Firebase/firebase_auth_module.js"
import * as lang from "./Global/Common/Translation.js"
import * as common from "./Global/Common/commonFunctions.js"

// Recupera il nome dell'utente da firebase, controlla che sia loggato.
// Nel caso non fosse loggato richiama la pagina di login
fb.onAuthStateChanged_2()
// funzione per la traduzione
lang.getLanguage()

// Definisce le variabili come date
let timeStartHistory = new Date()
let timeEndHistory   = new Date()
// Imposta X giorni prima della data odierna
timeStartHistory.setDate(timeStartHistory.getDate() - 1)

let customerName = localStorage.getItem('global_customer')
let query = {
    "filters":{
        "type": "and",
        "filters":[{
            "type":"Between",
            "fieldName":"timestamp",
            "from": timeStartHistory.getTime(),
            "to": timeEndHistory.getTime()
        }
        ]
    }
}

if(customerName !== 'Storci'){
    let customerQuery = {
        "type":"EQ",
        "fieldName":"CustomerName",
        "value": customerName.replace(/_/g, ' ')
    }
    query.filters.filters.push(customerQuery)
}
console.log(query)

getAlertsReport(query)


// Imposta i 2 data picker con le date calcolate prima
// La funzione getDate ritorna solamente l'anno, il mese e il giorno
// yyyy-MM-dd
let disp_timeStart = common.getDate(timeStartHistory)
let disp_timeEnd = common.getDate(timeEndHistory)

$('#dateFilter').daterangepicker({
    "locale": {
        "format": "YYYY/MM/DD",
        "separator": " - ",
        "applyLabel": "Apply",
        "cancelLabel": "Cancel",
        "fromLabel": "From",
        "toLabel": "To",
        "customRangeLabel": "Custom",
        "weekLabel": "W",
        "daysOfWeek": [
            "Su",
            "Mo",
            "Tu",
            "We",
            "Th",
            "Fr",
            "Sa"
        ],
        "monthNames": [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ],
        "firstDay": 1
    },
    "startDate": disp_timeStart,
    "endDate": disp_timeEnd
}, function(start, end, label) {
    query.filters.filters[0].from = start._d.getTime();
    query.filters.filters[0].to = end._d.getTime();

    getAlertsReport(query)
})

// *******************************************
// ************** FUNZIONI *******************
// *******************************************

function getAlertsReport(query){
    $('#accordion').empty()
    // Recupera la lista di tutti gli allarmi, filtrati dalla query
    tw.service_11_AlertsReport(query)
    .then(list=>{
        console.log(list)
        const alarmCount = list.rows.filter(el => el.Type == 'ALM')
        const warningCount = list.rows.filter(el => el.Type == 'WRN')
        const messaggesCount = list.rows.filter(el => el.Type == 'MSG')
        const totalCount = alarmCount.length + warningCount.length + messaggesCount.length

        $('#totalCount').text(totalCount)
        $('#alarmCount').text(alarmCount.length)
        $('#warningCount').text(warningCount.length)
        $('#messaggesCount').text(messaggesCount.length)

        /* DIVISIONE ALLARMI PER MACCHINE */
        let machines = [...new Set(list.rows.map(x => x.MachineSub))]
        /* DIVIOSNE ALLARMI PER CLIENTI */
        let customers = [...new Set(list.rows.map(x => x.CustomerName))]

        machines.forEach(machine => {
            const machineAlertCount = list.rows.filter(el => el.MachineSub === machine && el.Type == 'ALM')

            const idCollapse     = machine
            const idCollapseBody = machine + '-collapse'
            const idAccordion    = machine + '-accordion'

            if(machineAlertCount.length > 0){
                let accordion = ''
                accordion += '<div class="accordion-item">'
                accordion +=     '<h2 class="accordion-header" id="' + idCollapse + '">'
                accordion +=        '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#' + idCollapseBody + '" aria-expanded="false" aria-controls="' + idCollapseBody + '">'
                accordion +=            '<div class="d-flex justify-content-between me-5 w-100" data-pg-collapsed>'
                accordion +=                '<label>' + machine + '</label>'
                accordion +=                '<label>' + machineAlertCount.length + '</label>'
                accordion +=            '</div>'
                accordion +=        '</button>'
                accordion +=     '</h2>'
                accordion +=     '<div id="' + idCollapseBody + '" class="accordion-collapse collapse" aria-labelledby="' + idCollapse + '" data-bs-parent="#accordion">'
                accordion +=         '<div class="accordion-body pt-0 pb-0 pe-0">'
                accordion +=             '<div class="accordion accordion-flush" id="' + idAccordion + '"></div>'
                accordion +=         '</div>'
                accordion +=     '</div>'
                accordion += '</div>'

                $('#accordion').append(accordion)

                customers.forEach(customer => {
                    const customerAlertCount = machineAlertCount.filter(el => el.CustomerName === customer)
                    const alarms = [...new Set(customerAlertCount.map(x => x.ID_AlertTable))]
                  /* if(customer){
                        customer = "Customer A"
                    }
                    else {
                        customer = "Customer B"
                        }*/
                     /*  switch(customer){
                           case customer == 'Lucano':
                            customer = 'customer 1';
                            break;
                            case customer == 'Canossa':
                                customer = 'customer 2';
                                break;
                            case customer == 'Pasta e Aromi':
                                customer = 'customer 3';
                                break;
                                default:
                                    'no esiste';

                        }*/

                    if(alarms.length > 0){
                        const idCustomerCollapse     = idCollapse + '-' + customer.replace(/ /g, '_')
                        const idCustomerCollapseBody = idCollapse + '-' + customer.replace(/ /g, '_') + '-collapse'
                        const idCustomerList         = idCollapse + '-' + customer.replace(/ /g, '_') + '-list'
                        const idCustomerAccordion    = '#' + idAccordion

                        let accordionCustomer = ''
                        accordionCustomer += '<div class="accordion-item">'
                        accordionCustomer +=     '<h2 class="accordion-header" id="' + idCustomerCollapse + '">'
                        accordionCustomer +=        '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#' + idCustomerCollapseBody + '" aria-expanded="false" aria-controls="' + idCustomerCollapseBody + '">'
                        accordionCustomer +=            '<div class="d-flex justify-content-between me-5 w-100" data-pg-collapsed>'
                        accordionCustomer +=                '<label>' + customer + '</label>'
                        accordionCustomer +=                '<label>' + customerAlertCount.length + '</label>'
                        accordionCustomer +=            '</div>'
                        accordionCustomer +=        '</button>'
                        accordionCustomer +=     '</h2>'
                        accordionCustomer +=     '<div id="' + idCustomerCollapseBody + '" class="accordion-collapse collapse" aria-labelledby="' + idCustomerCollapse + '" data-bs-parent="' + idCustomerAccordion + '">'
                        accordionCustomer +=         '<div class="accordion-body pt-0 pb-0 pe-0">'
                        accordionCustomer +=             '<ul id="' + idCustomerList + '" class="list-group list-group-flush"></ul>'
                        accordionCustomer +=         '</div>'
                        accordionCustomer +=     '</div>'
                        accordionCustomer += '</div>'

                        $(idCustomerAccordion).append(accordionCustomer)

                        alarms.forEach(alarm => {
                            const AlertCount = customerAlertCount.filter(el => el.ID_AlertTable === alarm)
                            const id = '#' + idCustomerList

                            let list = ''
                            list += '<li class="d-flex justify-content-between list-group-item">'
                            list +=     '<label>' + AlertCount[0].Message + '</label>'
                            list +=     '<span class="badge bg-danger rounded-pill">' + AlertCount.length + '</span>'
                            list += '</li> '

                            $(id).append(list)
                        })
                    }

                })
            }
        })
    })
}
