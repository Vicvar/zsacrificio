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

function getMonday(date){
	var day = date.getDay() || 7;
	if( day !== 1 )
		date.setHours(-24 * (day - 1));
	return date;
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
	console.log(timeChartGran);
	for(source in data){
		var markers = new L.MarkerClusterGroup();
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

		var agg_dates = {
			byDay:{},
			byWeek:{},
			byMonth:{},
			byYear:{}
		};

		var date_data = {
			byDay:[],
			byWeek:[],
			byMonth:[],
			byYear:[]
		};

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
			var date_t = d.time_span.start;
			var date_s = date_t.substring(0,10);
			var date = new Date(date_t);

			//por día
			if(agg_dates.byDay[date_s]==undefined)
				agg_dates.byDay[date_s]=1;
			else
				agg_dates.byDay[date_s]++;
			
			//por semana
			var week_monday = getMonday(date);
			var week = week_monday.getFullYear().toString()+'-'+(week_monday.getMonth()+1).toString()+'-'+week_monday.getDate().toString();

			if(agg_dates.byWeek[week]==undefined)
				agg_dates.byWeek[week] = 1;
			else
				agg_dates.byWeek[week]++;

			//por mes
			var month = date.getFullYear().toString()+'-'+(date.getMonth()+1).toString()+'-'+'01';
			
			if(agg_dates.byMonth[month]==undefined)
				agg_dates.byMonth[month] = 1;
			else
				agg_dates.byMonth[month]++;

			//por año
			var year = date.getFullYear().toString()+'-01-01';

			if(agg_dates.byYear[year]==undefined)
				agg_dates.byYear[year] = 1;
			else
				agg_dates.byYear[year]++;
		}

		for(g in agg_dates){
			for(d in agg_dates[g]){
				var dat = {
					t: d,
					y: agg_dates[g][d]
				};
				date_data[g].push(dat);
			}
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

		var timechart_obj = {};

		for(g in date_data){
			timechart_obj[g] = {
				label: labels[source],
				data: date_data[g],
				backgroundColor: colors[source]+' 0.2)',
				borderColor: colors[source]+' 0.9)',
				borderWidth:1
			};
		}


		timechart_objects[source] = timechart_obj;

		document.getElementById(source+'-display').disabled = false;
	}
	console.log(timechart_objects);

	//last processed in data
	currSource = source;

	if(timeChartGran ==0)
		setGranDay();
	else if(timeChartGran == 1)
		setGranWeek();
	else if(timeChartGran == 2)
		setGranMonth();
	else if(timeChartGran == 3)
		setGranYear();
	myChart.update();

	choroplethize(currSource);
	if(initChoroGran == 1)
		setGranProvincia();
	else if(initChoroGran == 2)
		setGranComuna();
	if(choropleth_objects[currSource].markerLayer.getLayers().length>0)
		layerSelector.addOverlay(choropleth_objects[currSource].markerLayer,"Marcadores");
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

//Choropleth

function setGranRegion(){
	for(var reg of fe_regiones)
		reg.fCollapse();
	choroInfo.update(choropleth_objects[currSource].r_max_val, "región");
}

function setGranProvincia(){
	for(var reg of fe_regiones)
		reg.fCollapse();
	for(var reg of fe_regiones)
		reg.choroExpand(false);
	choroInfo.update(choropleth_objects[currSource].p_max_val, "provincia");
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
	choroInfo.update(choropleth_objects[currSource].c_max_val, "comuna");
}

//TimeChart

function setGranDay(){
	myChart.data.datasets = [timechart_objects[currSource].byDay];
	delete myChart.options.time.unit;
}

function setGranWeek(){
	myChart.data.datasets = [timechart_objects[currSource].byWeek];
	myChart.options.time.unit = 'week';
}

function setGranMonth(){
	myChart.data.datasets = [timechart_objects[currSource].byMonth];
	myChart.options.time.unit = 'month';
}

function setGranYear(){
	myChart.data.datasets = [timechart_objects[currSource].byYear];
	myChart.options.time.unit = 'year';
}

//markers helper functions (deprecated)
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
		layerSelector.removeLayer(choropleth_objects[currSource].markerLayer);
		//desseleccionar checkbox doc.getElement... (?)

		currSource = source;
		//updateMarkers(currSource);
		if(choropleth_objects[currSource].markerLayer.getLayers().length>0)
			layerSelector.addOverlay(choropleth_objects[currSource].markerLayer,"Marcadores");
		choroplethize(currSource);
		if(initChoroGran == 1)
			setGranProvincia();
		else if(initChoroGran == 2)
			setGranComuna();
		myChart.data.datasets = [timechart_objects[currSource]];
		myChart.update();
	}
}
