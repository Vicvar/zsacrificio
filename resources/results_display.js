function displayResults(data){
	console.log(data);
	for(source in data){
		for(d of data[source]){
			if(source=='seia'){
				var marker = L.marker([d['latitud'],d['longitud']]);
				marker.bindPopup(d['nombre']);
				markers.addLayer(marker);
				//document.getElementById('results').innerHTML+='<br>'+d.nombre;
			}
			else{
				//?
			}
		}
	}
};