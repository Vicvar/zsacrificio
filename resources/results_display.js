//object to pass values regiones
function getTerrHierObj(){
	var regiones = {};
	for(r of region_vect){
		regiones[r.id] = {
			value: null,
			p_choro_data : {}
		};
	}

	var aux_provs = {};
	for(var cs in comuna_vect){
		c_data = {};
		for(var com of comuna_vect[cs])
			c_data[com.id] = null;
		
		aux_provs[comuna_vect[cs][0].id_provincia] = c_data;
	}

	for(var ps in provincia_vect){
		for(var prov of provincia_vect[ps]){
			var id_region = prov.id_region;
			var id_provincia = prov.id;
			var p_data = {
				value: null,
				c_choro_data: aux_provs[id_provincia]
			}
			regiones[id_region].p_choro_data[id_provincia] = p_data;
		}
	}
	return regiones;
}

//console.log('regiones',regiones);
//console.log('aux_provs',aux_provs);
//Result variables

//choropleth
var choropleth_objects = {};
var currSource;
var choroplethized = false;

//timechart

var ctx = document.getElementById('myChart');

var timechart_objects = {};
var colors = {
	seia: 'rgba(54, 162, 235,',
	coes: 'rgba(255, 99, 132,'
}

var labels = {
	seia: 'Proyectos',
	coes: 'Protestas'
}


function displayResults(data){
	//console.log(data);
	for(source in data){
		var markers = new L.layerGroup();
		var val_comunas = {};
		//init selected comunas
		var selected_comunas = getSelected();
		if(selected_comunas.length==0){
			for(var cs in comuna_vect){
				for(var com of comuna_vect[cs])
					selected_comunas.push(com.id);
			}
		}
		
		for(sc of selected_comunas)
			val_comunas[sc] = 0;

		var agg_dates = {};
		var date_data = [];

		var c_max_val = 0;
		if(data[source]==null){
			alert('No se obtuvieron resultados para la fuente ',source);
			continue;
		}

		for(d of data[source]){
			if('latitud' in d && 'longitud' in d){
				var marker = L.marker([d['latitud'],d['longitud']]);
				marker.bindPopup(d['nombre']);
				markers.addLayer(marker);
				//document.getElementById('results').innerHTML+='<br>'+d.nombre;
			}

			//aggregar info en comunas.
			for(c of d.comunas){
				if(val_comunas[c] == undefined)
					val_comunas[c] = 1;
				else
					val_comunas[c]++;
				if(val_comunas[c] > c_max_val)
					c_max_val = val_comunas[c];
			}

			//agregar info en fechas
			date_t = d.time_span.start;
			date = date_t.substring(0,10);
			if(agg_dates[date]==undefined)
				agg_dates[date]=1;
			else
				agg_dates[date]++;
		}

		for(d in agg_dates){
			var dat ={
				t: d,
				y: agg_dates[d]
			}
			date_data.push(dat);
		}

		var r_max_val = 0;
		var p_max_val = 0;
		var results = getTerrHierObj();

		for(var r in results){
			var region = results[r];
			var r_has_undefined = false;
			var r_value = 0;

			for(var p in region.p_choro_data){
				var provincia = region.p_choro_data[p];
				var p_has_undefined = false;
				var p_value = 0;
				for(var c in provincia.c_choro_data){
					var c_value = val_comunas[c];
					if(c_value!=undefined){
						provincia.c_choro_data[c] = c_value;
						p_value += c_value;
					}
					else{
						p_has_undefined = true;
						r_has_undefined = true;
					}
				}
				if(!p_has_undefined){
					provincia.value = p_value;
					r_value += p_value;
					if(p_value>p_max_val)
						p_max_val = p_value;
				}
			}
			if(!r_has_undefined){
				region.value = r_value;
				if(r_value>r_max_val)
					r_max_val = r_value;
			}
		}

		var choropleth_obj = {
			results: results,
			r_max_val: r_max_val,
			p_max_val: p_max_val,
			c_max_val: c_max_val
		};
		
		choropleth_objects[source] = choropleth_obj;
		choropleth_objects[source].markerLayer = markers;

		var timechart_obj = {
			label: labels[source],
			data: date_data,
			backgroundColor: colors[source]+' 0.2)',
			borderColor: colors[source]+' 0.9)',
			borderWidth:1
		}

		timechart_objects[source] = timechart_obj;

		document.getElementById(source+'-display').disabled = false;
	}
	//last processed in data
	currSource = source;
	myChart.data.datasets = [timechart_objects[currSource]];
	myChart.update();
	choroplethize(currSource);
	if(granularityFlag == 1)
		setGranProvincia();
	else if(granularityFlag == 2)
		setGranComuna();
	//console.log(timechart_objects);
}


function choroplethize(source){
	var results = choropleth_objects[source].results;
	var r_max_val = choropleth_objects[source].r_max_val;
	var p_max_val = choropleth_objects[source].p_max_val;
	var c_max_val = choropleth_objects[source].c_max_val;
	collapseAll();
	for(reg of fe_regiones)
		reg.choroplethize(results[reg.id],r_max_val,p_max_val,c_max_val);
	
	//To be changed
	var radios = document.getElementsByClassName('gran-selector');
	var rflag = true;
	for(var r of radios){
		if(rflag){
			r.checked = true;
			r.disabled = false;
			rflag = false;
		}
		r.disabled = false;
	}

	var ec = document.getElementsByClassName('sel-ec');
	for(var b of ec)
		b.disabled = true;

	choroInfo.addTo(mymap);
	choroplethized = true;
}

function unChoroplethize(){
	for(reg of fe_regiones)
		reg.unChoroplethize();
	collapseAll();

	//To be changed
	var radios = document.getElementsByClassName('gran-selector');
	for(r of radios)
		r.disabled = true;

	var ec = document.getElementsByClassName('sel-ec');
	for(var b of ec)
		b.disabled = false;

	choroInfo.remove(mymap);

	choroplethized = false;
}


//For granularity selection

function setGranRegion(){
	for(var reg of fe_regiones)
		reg.fCollapse();
	choroInfo.update(choropleth_objects[currSource].r_max_val);
}

function setGranProvincia(){
	for(var reg of fe_regiones)
		reg.fCollapse();
	for(var reg of fe_regiones)
		reg.choroExpand(false);
	choroInfo.update(choropleth_objects[currSource].p_max_val);
}

function setGranComuna(){
	for(var reg of fe_regiones)
		reg.fCollapse();
	for(var reg of fe_regiones){
		reg.choroExpand(false);
		var provs = reg.provincias;
		for(var p in provs){
			provs[p].choroExpand(false);
		}
	}
	choroInfo.update(choropleth_objects[currSource].c_max_val);
}

//markers helper functions
var markers_shown = false;

function toggleMarkers(){
	if(markers_shown){
		mymap.removeLayer(choropleth_objects[currSource].markerLayer);
		markers_shown = false;
	}
	else{
		choropleth_objects[currSource].markerLayer.addTo(mymap);
		markers_shown = true;
	}
}

function updateMarkers(source){
	if(markers_shown){
		mymap.removeLayer(choropleth_objects[currSource].markerLayer);
		choropleth_objects[source].markerLayer.addTo(mymap);
	}
}

//Go back to selection
function resetSelector(){
	if(!choroplethized){
		alert('No hay resultados');
		return;
	}
	else{
		if(markers_shown)
			toggleMarkers;
		unChoroplethize();
	}
}


//For source selection (could be bound to tab)

function setSource(source){
	if(source == currSource){
		alert('Fuente ya seleccionada');
		return;
	}
	else if(choropleth_objects[source]==undefined){
		alert('Fuente no disponible');
		return;
	}
	else{
		updateMarkers(source);
		choroplethize(source);
		currSource = source;
	}
}