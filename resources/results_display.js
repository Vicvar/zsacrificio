function displayResults(source, data){
	if(source==0){
		for(d of data){
			var marker = L.marker([d['latitud'],d['longitud']]);
			marker.bindPopup(d['nombre']);
			markers.addLayer(marker);
		}
	}
	else if (source==1){
		for(d of data){
			document.getElementById('resultados').innerHTML += d;
		}
	}
};