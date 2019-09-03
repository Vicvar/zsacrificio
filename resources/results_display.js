function displayResults(data, markers){
	for(source in data){
		var val_comunas = {};
		var max_val = 0;
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
				if(val_comunas[c] > max_val)
					max_val = val_comunas[c];
			}
		}
		//aquí se podría dividir por la superficie de cada comuna
		//mapear a 255
		for(var val in val_comunas){
			val_comunas[val] = Math.floor((val_comunas[val]*255)/max_val);
		}
		for(region of fe_regiones){
			region.choropletize(val_comunas);
		}
		mymap.addLayer(markers);
	}
};