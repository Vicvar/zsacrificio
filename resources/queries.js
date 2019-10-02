/************Time Selection************/
function timestamp(str) {
	return new Date(str).getTime();
}

var dSlider = document.getElementById('nouislider');
var startD = document.getElementById('f-inicio');
var endD = document.getElementById('f-fin');

noUiSlider.create(dSlider,{
	range:{
		min: timestamp('1992'),
		max: timestamp('2019')
	},
	step: 24 * 60 * 60 * 1000,
	start:[timestamp('2010'),timestamp('2015')],
	connect: true,
	format: wNumb({
		decimals:0
	}),
	pips:{
		mode:'count',
		format:{
			to: toDate,
			from: Number
		},
		values:14,
		density:4
	}
});

function toDate(value){
	return new Date(value).getFullYear();
}

dSlider.noUiSlider.on('update', function (values, handle) {
	var date = new Date(+values[handle]);

	var day = ("0" + date.getDate()).slice(-2);
	var month = ("0" + (date.getMonth() + 1)).slice(-2);

	var value = date.getFullYear()+"-"+(month)+"-"+(day);

	if(handle){
		endD.value = value;
	}
	else{
		startD.value = value;
	}
});

startD.addEventListener('change', function(){
	var date = new Date(this.value);
	dSlider.noUiSlider.set([date.getTime(),null]);
});

endD.addEventListener('change',function(){
	var date = new Date(this.value);
	dSlider.noUiSlider.set([null,date.getTime()]);
});

/************Space Selection************/

//Dictionaries to transform areas names to comunas ids

//region -> provincias
var region_to_provincias = new Map();
for(r in provincia_vect){
	//console.log(r,provincia_vect[r]);
	var r_prov= [];
	for(p of provincia_vect[r])
		r_prov.push(p.nombre);
	region_to_provincias.set(r,r_prov);
}
//console.log(region_to_provincias);

//provincia -> comunas
var provincia_to_comunas = new Map();
//comuna -> comuna id
var comuna_to_id = new Map();

for(p in comuna_vect){
	var p_com = [];
	for(c of comuna_vect[p]){
		p_com.push(c.nombre);
		comuna_to_id.set(c.nombre,c.id);
	}
	provincia_to_comunas.set(p,p_com);
}
//console.log(provincia_to_comunas);


//Get all selected areas

//"Flag" for initial granularity
//0: region, 1: provincia, 2: comuna
var initChoroGran;
var timeChartGran;

var getSelected = function(){
	initChoroGran = 0;
	var selected_comunas = [];
	var selected_comunas_ids =[];

	//Want to store everything selected as comuna ids
	//selected comunas stores comuna names
	for(var fer of fe_regiones){
		if(fer.selected){
			//get provincias of selected regiones
			//for each, get their comunas and add them to selected comunas
			var fer_provincias = region_to_provincias.get(fer.name);
			for(p of fer_provincias)
				selected_comunas = selected_comunas.concat(provincia_to_comunas.get(p));
		}
		else if(fer.provincias!=null){
			for(var p in fer.provincias){
				var fep = fer.provincias[p];
				if(fep.selected){
					selected_comunas = selected_comunas.concat(provincia_to_comunas.get(fep.name));
					if(initChoroGran<1)
						initChoroGran = 1;
				}
				else if(fep.comunas!=null){
					for(var c in fep.comunas){
						var fec = fep.comunas[c];
						if(fec.selected){
							selected_comunas_ids.push(comuna_to_id.get(fec.name));
							if(initChoroGran<2)
								initChoroGran = 2;
						}
					}
				}
			}
		}
	}

	for(sc of selected_comunas){
		selected_comunas_ids.push(comuna_to_id.get(sc));
	}
	return selected_comunas_ids;
};
	
var clearResults = function(){
	document.getElementById('results').innerHTML='<h3>Resultados</h3>';
};

//testing AJAX


var fuentes = ['seia','coes'];

function validateForms(){
	//to do
	return true;
}

function requestUrlString(){
	base_url = "controller/aQuery.php";

	//selected Comunas
	c = JSON.stringify(getSelected());

	//selected time span
	time_span = [document.getElementById('f-inicio').value, document.getElementById('f-fin').value+ ('T23:59:59')];
	
	//get time span for granularity
	var dayDiff = Math.floor((new Date(time_span[1]) - new Date(time_span[0]))/(1000*60*60*24));
	if(dayDiff < 56)
		timeChartGran = 0;
	else if(dayDiff < 365)
		timeChartGran = 1;
	else if(dayDiff < 1460)
		timeChartGran = 2;
	else
		timeChartGran = 3;

	t = JSON.stringify(time_span);

	//selected sources
	sources = [];
	for(cb of document.querySelectorAll('.source-cb')){
		if(cb.checked)
			sources.push(cb.value);
	}
	if(sources.length==0){
		alert("Se debe seleccionar alguna fuente");
		return false;
	}

	s = JSON.stringify(sources);

	//source specific attribute values (for all sources, in an object)
	var ss_attr_vals = {}
	for(f of fuentes){

		//checks if the source checkbox is selected
		var selected = document.getElementById(f).getElementsByClassName('source-cb')[0].checked;
		//empty object for consistency(?)
		if(selected){
			ss_attr_vals[f]={};
			for(input of document.getElementById(f).getElementsByTagName('input')){
				if(input.type == 'checkbox' && input.name != ""){
					if(input.checked){
						if(ss_attr_vals[f][input.name]==undefined)
							ss_attr_vals[f][input.name]=Array(0);
						ss_attr_vals[f][input.name].push(input.value);
					}
				}
				else if(input.type != 'checkbox' && input.name != ''){
					ss_attr_vals[f][input.name] = input.value;
				}
			}
			for(ms of document.getElementById(f).getElementsByClassName('multi-select')){
				ss_attr_vals[f][ms.id]=ms.__vue__.getValues();
			}
		}
	}

	ekw = JSON.stringify(ss_attr_vals);

	//console.log(ss_attr_vals);
	//console.log(JSON.stringify(ss_attr_vals));
	return base_url+"?c="+c+"&t="+t+"&s="+s+"&ekw="+ekw;
}

function search(){

	if(!validateForms)
		return;
	
	var phttp = new XMLHttpRequest();
	var rurl = requestUrlString();
	if(!rurl)
		return;

	phttp.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200){
			try{
				var q_results = JSON.parse(this.responseText);
				displayResults(q_results);
				//Hide, enable/disable and click buttons
				var res_tab = document.getElementById('results-tab-button');
				var bts = document.getElementById('back-to-sel');
				var search_but = document.getElementById('search-button');
				var gran_temp = document.getElementById('date-gran-cont');
				var ini = document.getElementById('f-inicio');
				var fin = document.getElementById('f-fin');

				res_tab.disabled = false;
				bts.hidden = false;
				search_but.hidden = true;
				gran_temp.hidden = false;
				ini.disabled = true;
				fin.disabled = true;

				tabHandler(res_tab,'result-tabs');
				//Hide time range and show date table
				document.getElementById('date-range').hidden = true;
				document.getElementById('time-chart').hidden = false;
			}
			catch(err){
				console.log(err);
				console.log(this.responseText);
			}
			//console.log(q_results);
			//console.log('Empty responseText');
		}
	};
	//console.log(rurl);
	phttp.open("GET",rurl,true);
	phttp.send();
}
