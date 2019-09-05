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
var choropleth_objects = {};
var currSource;


function displayResults(data, markers){
	for(source in data){
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

		var c_max_val = 0;
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
		}
		console.log(val_comunas);
		//aquí se podría dividir por la superficie de cada comuna
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

		console.log('r_max_val',r_max_val);
		console.log('p_max_val',p_max_val);
		console.log('c_max_val',c_max_val);

		//mapear a 255
		/*for(var val in val_comunas){
			val_comunas[val] = Math.floor((val_comunas[val]*255)/max_val);
		}*/

		console.log(choropleth_objects[source]);

		mymap.addLayer(markers);
	}
	//last processed in data
	currSource = source;
	choroplethize(currSource);
}


function choroplethize(source){
	var results = choropleth_objects[source].results;
	var r_max_val = choropleth_objects[source].r_max_val;
	var p_max_val = choropleth_objects[source].p_max_val;
	var c_max_val = choropleth_objects[source].c_max_val;
	collapseAll();
	for(reg of fe_regiones)
		reg.choroplethize(results[reg.id],r_max_val,p_max_val,c_max_val);
}

function unChoroplethize(){
	for(reg of fe_regiones)
		reg.unChoroplethize();
	collapseAll();
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


//For source selection (could be bound to tab)

function setSource(source){

}