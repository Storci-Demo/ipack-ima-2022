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


let customerName = localStorage.getItem('global_customer')

// Cancella tutte le righe della tabella
$("#IDAlertActualBody").empty()

// Sorting function
let direction = true
$("th").click(function() {
	let icon = "#" + $(this)[0].children[0].children[1].id
	$(".icon-table").addClass("d-none")
  $(icon).removeClass("d-none")

	if(direction){
		$(icon).text("expand_more")
	}else{
		$(icon).text("expand_less")
	}

	let column = $(this).index()
	let table = $("#IDAlertActualBody")

	insertionSort(table[0], column, direction)

	direction = !direction
})


$('#modal1').modal("show")
// richiamo della funzione
getAlarmsNotifications("*", false,customerName);

// Funzione di ricerca nella tabella
$("#filter").on("keyup", function(){
  let value = $(this).val().toLowerCase()
	let btn_value = $('.filter-btn.active').attr('data-filter')

	if(btn_value == "All"){
		$("#alert_container li").filter(function(){
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
		})
	}else{
		$("#alert_container li").filter(function(){
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1 && $(this).hasClass(btn_value))
		})
	}
})


/**** Funzione per il filtro Rapido della lista attraverso la pressione del pulsante */
$('.filter-btn').click(function(){
	let value = $('#filter').val().toLowerCase()
	let btn_value = $(this).attr('data-filter')
	let color = '#C2DAFF'

	if(btn_value == 'Warning'){
		color = "#fb8c0066"
	}
	else if(btn_value == "Alarm"){
		color = "#e5393566"
	}
	else if(btn_value =="Message"){
		color = '#fdd83566'
	}

	$(this).addClass('active').css("backgroundColor", color).siblings().removeClass('active').css("backgroundColor", '#F0F1F2')

	if(btn_value == "All"){
		$("#alert_container li").filter(function(){
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
		})
	}else{
		$("#alert_container li").filter(function(){
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1 && $(this).hasClass(btn_value))
		})
	}
})

// *******************************************
// ************** FUNZIONI *******************
// *******************************************

function convertDate(s){
	let sdate = s
	sdate = sdate.split(", ")
	let date = sdate[0]
	date = date.split("/")
	let time = sdate[1]

	let day = date[0]
	let month = date[1]
	let year = date[2]

	return Date.parse(year + "/" + month + "/" + day + " " + time)
}

// Funzione per il riordino delle colonne
function insertionSort(table, column, dir){
	let rows = 	table.children
	let parent = table

	for(let i=1; i<rows.length; i++){
		for(let j=i-1; j>-1; j--){
			let value1 = rows[j].getElementsByTagName("TD")[column].innerHTML
			let value2 = rows[j+1].getElementsByTagName("TD")[column].innerHTML

			if(column == 0 || column == 1){
				value1 = convertDate(value1)
				value2 = convertDate(value2)
			}

			if(dir){
				if(value2 < value1){
					parent.insertBefore(rows[j+1], rows[j])
				}
			}else{
				if(value2 > value1){
					parent.insertBefore(rows[j+1], rows[j])
				}
			}
		}
	}
}
// Funzione per recuperare i dati da tw per mettere nella tabella
function getAlarmsNotifications(filter, getHistory,customerName){
	tw.service_10_getAlerts("","",filter, getHistory,customerName)
	.then((list)=>{
		console.log(list)
		$("#IDAlertActualBody").empty()
		if(list.rows.length == 0){
			let row = '<tr class="alert" role="alert">'
			row    += '    <td ></td>'
			row    += '    <td ></td>'
			row    += '    <td ></td>'
			row    += '    <td ></td>'
			row    += '    <td >Nessun allarme trovato</td>'
			row    += '</tr>'
			// Aggiunge la riga alla tabella
			$('#IDAlertActualBody').append(row);
		}
		setTimeout(function() {	$('#modal1').modal("hide") }, 500);

		list.rows.forEach(el =>{
			let timeStart = new Date(el.TimeStart).toLocaleString();
			let color = 'rgba(255,255,255,0)'
			let icon
			let filter_type = ''

			if(el.Type== 'WRN'){
				color = "#fb8c0066"
				icon = 'warning_amber'
				filter_type = 'Warning'
			}
			else if(el.Type == "ALM"){
				color = "#e5393566"
				icon = 'error_outline'
				filter_type = 'Alarm'
			}
			else if(el.Type =="MSG"){
				color = '#fdd83566'
				icon  = 'info'
				filter_type = 'Message'
			}
			if(el.CustomerName == 'Canossa' || el.customerName == 'Lucano'){
				el.CustomerName = "Customer 1"
			}
			else{
				el.CustomerName = "Customer 2"
			}
			/****Lista generata */
			let lista = '<li class="alert_list list-group-item mb-2 ' + filter_type + '"'
			lista +='style="background: ' + color + '">'
			lista +='<div class="card"> '
			lista +='<div class="alert_body card-body ">'
			lista +='<div class="align-items-center d-flex me-5">'
			lista += '<span class="material-icons-outlined">'+icon+'</span>'
			lista +='</div> '
			lista +='<div class="row row-cols-2 row-cols-lg-3 w-100">'
			lista +='<div class="mb-2"> '+ el.CustomerName +'</div>'
			lista +='<div class="mb-2"> '+ el.MachineName +'</div>'
			lista +='<div class="col-12 mb-2">'+ timeStart +'</div>'
			//lista +='<div class="mb-2">'+ timeEnd +'</div>'
			//lista +='<div> '+ el.Gravity+'</div>'
			lista +='<div class="col-12 mt-2"> '+ el.Message+'</div>'
			lista +='</div>'
			lista +='</div>'
			lista +='</div>'
			lista +='</li> '
			$('#alert_container').append(lista);

		})
	})
	.catch((err)=>{
		console.log('promise rejected', err)
	})
}
