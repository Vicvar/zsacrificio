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

//system state variables

var lastMarkerGroup;


function displayResults(data){
	//console.log(data);
	//console.log(timeChartGran);

	//Reseting global result variables
	//choropleth
	choropleth_objects = {};
	currSource = null;
	choroplethized = false;
	//timechart
	timechart_objects = {};
	lastMarkerGroup = null;
	var firstSource = true;

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

		document.getElementById(source+'-resTabButton').disabled = false;

		if(firstSource){
			document.getElementById(source+'-resTabButton').className += " active";
			document.getElementById(source+'-results').className += " active";
			firstSource=false;
			//console.log(timechart_objects);
			//console.log(choropleth_objects);

			//last processed in data
			currSource = source;

			//timeChart
			setTimechartData(currSource, timeChartGran);

			//Choropleth
			choroplethize(currSource);
			if(initChoroGran == 1)
				setGranProvincia();
			else if(initChoroGran == 2)
				setGranComuna();

			if(choropleth_objects[currSource].markerLayer.getLayers().length>0){
				lastMarkerGroup = choropleth_objects[currSource].markerLayer;
				layerSelector.addOverlay(lastMarkerGroup,"Marcadores");
			}
		}

	}
	setTables(data);
}


function choroplethize(source){
	var results = choropleth_objects[source].results;
	var r_max_val = choropleth_objects[source].r_max_val;
	var p_max_val = choropleth_objects[source].p_max_val;
	var c_max_val = choropleth_objects[source].c_max_val;
	collapseAll();
	for(reg of fe_regiones)
		reg.choroplethize(results[reg.id],r_max_val,p_max_val,c_max_val);

	layerSelector.showGControl();

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

	layerSelector.hideGControl();

	var ec = document.getElementsByClassName('sel-ec');
	for(var b of ec)
		b.disabled = false;

	choroInfo.remove(mymap);

	choroplethized = false;
}


//For granularity selection

//Choropleth

//Functions in populate_map.js
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

function setTimechartData(source, granularity){
	if(granularity==0)
		setGranDay(source);
	else if(granularity==1)
		setGranWeek(source);
	else if(granularity==2)
		setGranMonth(source);
	else if(granularity==3)
		setGranYear(source);
	else
		alert('Undefined Timechart granularity');
}

function setGranDay(source){
	myChart.data.datasets = [timechart_objects[source].byDay];
	delete myChart.options.time.unit;
	myChart.update();
}

function setGranWeek(source){
	myChart.data.datasets = [timechart_objects[source].byWeek];
	myChart.options.time.unit = 'week';
	myChart.update();
}

function setGranMonth(source){
	myChart.data.datasets = [timechart_objects[source].byMonth];
	myChart.options.time.unit = 'month';
	myChart.update();
}

function setGranYear(source){
	myChart.data.datasets = [timechart_objects[source].byYear];
	myChart.options.time.unit = 'year';
	myChart.update();
}

//Go back to selection
function resetSelector(){
	if(!choroplethized){
		alert('No hay resultados');
		return;
	}
	else{
		if(lastMarkerGroup!=undefined){
			layerSelector.removeLayer(lastMarkerGroup);
			mymap.removeLayer(lastMarkerGroup);
		}
		unChoroplethize();
		var source_res_tabs = document.getElementsByClassName('result-tab');
		for(var srt of source_res_tabs){
			srt.disabled = true;
			srt.className = srt.className.replace(" active","");
		}
		var source_res = document.getElementsByClassName('result-content');
		for(var sr of source_res){
			sr.className = sr.className.replace(" active","");
		}
		var res_tab = document.getElementById('results-tab-button');
		var stb = document.getElementById('search-tab-button');
		var bts = document.getElementById('back-to-sel');
		var search_but = document.getElementById('search-button');
		res_tab.disabled = true;
		bts.hidden = true;
		search_but.hidden = false;
		tabHandler(stb,'search-tabs');
	}
}


//For source selection (could be bound to results tab)

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
		if(lastMarkerGroup!=undefined){
			layerSelector.removeLayer(lastMarkerGroup);
			mymap.removeLayer(lastMarkerGroup);
			layerSelector.showGControl();
		}
		//desseleccionar checkbox doc.getElement... (?)

		currSource = source;
		//updateMarkers(currSource);
		if(choropleth_objects[currSource].markerLayer.getLayers().length>0){
			lastMarkerGroup = choropleth_objects[currSource].markerLayer;
			layerSelector.addOverlay(lastMarkerGroup,"Marcadores");
			layerSelector.showGControl();
		}


		choroplethize(currSource);
		if(initChoroGran == 1)
			setGranProvincia();
		else if(initChoroGran == 2)
			setGranComuna();
		setTimechartData(currSource, timeChartGran);
	}
}

//Handler for detail displaying from the results table
function displayDetails(details, source){
	//console.log(details,source);
	//Hide results div
	var results = document.getElementById(source+"-table-div");
	results.hidden = true;
	//Create details table
	var d_table = document.getElementById(source+"-details");
	d_table.innerHTML += "<tbody></tbody>";
	var d_table_body = d_table.firstElementChild;
	for(var data in details[0]){
		d_table_body.innerHTML += "<tr><td>"+usToFLUC(data.toString())+"</td><td>"+(details[0][data]?details[0][data].toString():"-")+"</td></tr>";
	}
	//show details div
	var details = document.getElementById(source+"-details-div");
	details.hidden = false;
}

function usToFLUC(str){
	var splits = str.split("_");
	var res = "";
	var first = true;
	for(s of splits){
		if(!first){
			res += " ";
			res += s.toLowerCase();
		}
		else{
			first = false;
			res += s[0].toUpperCase() + s.slice(1).toLowerCase();
		}
	}
	return res;
}

//"back" button handler
function backToResults(source){
	var details = document.getElementById(source+"-details-div");
	var d_table = document.getElementById(source+"-details");
	var results = document.getElementById(source+"-table-div");

	d_table.innerHTML = "";
	details.hidden = true;
	results.hidden = false;
}