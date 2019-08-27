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
	start:[timestamp('2013'),timestamp('2017')],
	connect: true,
	format: wNumb({
		decimals:0
	})
});

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


//Get all selected areas

var getSelected = function(){
	var selected_comunas = [];
	var selected_comunas_ids =[];

	//Want to store everything selected as comuna ids
	//selected comunas stores comuna names
	for(fer of fe_regiones){
		if(fer.selected){
			//get provincias of selected regiones
			//for each, get their comunas and add them to selected comunas
			var fer_provincias = region_to_provincias.get(fer.name);
			for(p of fer_provincias)
				selected_comunas = selected_comunas.concat(provincia_to_comunas.get(p));
		}
		else{
			//selected provincias from unselected regiones transformed to comunas and added to selected comunas
			for(fep of fer.provincias){//fep is an empty array since region init
				if(fep!=null){
					if(fep.selected)
						selected_comunas = selected_comunas.concat(provincia_to_comunas.get(fep.name));
					else if(fep.comunas!=null){
						for(fec of fep.comunas){//pushing directly to id
							if(fec!=null){
								if(fec.selected){
									selected_comunas_ids.push(comuna_to_id.get(fec.name));
								}
							}
						}
					}
				}
			}
		}
	}

	for(sc of selected_comunas){
		selected_comunas_ids.push(comuna_to_id.get(sc));
	}
	return JSON.stringify(selected_comunas_ids);
};
	
var clearResults = function(){
	markers.clearLayers();
	document.getElementById('results').innerHTML='<h3>Resultados</h3>';
};

//testing AJAX

var markers = new L.layerGroup();

var fuentes = ['seia','coes'];

function validateForms(){
	//to do
	return true;
}

function requestUrlString(){
	base_url = "controller/aQuery.php";

	//selected Comunas
	c = getSelected();

	//selected time span
	time_span = [document.getElementById('f-inicio').value, document.getElementById('f-fin').value];
	t = JSON.stringify(time_span);

	//selected sources
	sources = [];
	for(cb of document.querySelectorAll('.source-cb')){
		if(cb.checked)
			sources.push(cb.value);
	}
	s = JSON.stringify(sources);

	//source specific attribute values (for all sources, in an object)
	var ss_attr_vals = {}
	for(f of fuentes){
		var selected = document.getElementById(f).getElementsByClassName('source-cb')[0].checked;
		//empty object for consistency
		ss_attr_vals[f]={};
		if(selected){
			for(input of document.getElementById(f).getElementsByTagName('input')){
				if(input.type == 'checkbox' && input.name != ""){
					if(input.checked){
						if(ss_attr_vals[f][input.name]==undefined)
							ss_attr_vals[f][input.name]=Array(0);
						ss_attr_vals[f][input.name].push(input.value);
					}
				}
				else if(input.type != 'checkbox'){
					ss_attr_vals[f][input.name] = input.value;
				}
			}
			for(ms of document.getElementById(f).getElementsByTagName('multiselect')){
				console.log(ms.value);
			}
		}
	}

	ekw = JSON.stringify(ss_attr_vals);

	//console.log(ss_attr_vals);
	//console.log(JSON.stringify(ss_attr_vals));
	return base_url+"?c="+c+"&t="+t+"&s="+s+"&ekw="+ekw;
}

function aTest(){

	if(!validateForms)
		return;
	
	var phttp = new XMLHttpRequest();
	var rurl = requestUrlString();
	
	markers.clearLayers();

	phttp.onreadystatechange = function(){
		if (this.readyState == 4 && this.status == 200) {
			console.log(this.responseText);
			var q_results = JSON.parse(this.responseText);
			//console.log(q_results);
			document.getElementById('results').innerHTML+='<br>Número de resultados: '+q_results.length;
			//displayResults(source,q_results);
			mymap.addLayer(markers);
			//console.log('Empty responseText');
		}
	};
	console.log(rurl);
	phttp.open("GET",rurl,true);
	phttp.send();
}
