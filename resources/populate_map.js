//Needed to have them globally(?)

//Creating SelectablePolygons

//stores region objects
var n_regiones = region_vect.length;
var fe_regiones = Array(n_regiones);

for(var i=0; i < n_regiones; i++){
	var region = JSON.parse(region_vect[i]['st_asgeojson']);
	var provincias_reg = provincia_vect[region_vect[i]['nombre']];

	for(x in provincias_reg){
		provincias_reg[x].comunas = comuna_vect[provincias_reg[x].nombre];
	}

	fe_regiones[i] = new SelectableRegion(region);
	fe_regiones[i].init(provincias_reg,region_vect[i]['nombre'],region_vect[i]['id']);
	fe_regiones[i].addTo(mymap);

}

//Control to display areas names and contents

var info = L.control({position:'bottomleft'});

var provinciasInRegion = function(props){
	var res = '';
	var first = true;
	for(p in props.p_data){
		if(!first)
			res+=', '
		else
			first = false;
		res+=firstLetterUpperCase(props.p_data[p]['nombre']);
	}
	res2 = res.substring(0,50);
	if(res.substring(50,51))
		res2 += '...';
	return res2;
};

var comunasInProvinca = function(props){
	var res = '';
	var first = true;
	for(c in props.c_data){
		if(!first)
			res+=', '
		else
			first = false;
		res+=firstLetterUpperCase(props.c_data[c]['nombre']);
	}
	res2 = res.substring(0,50);
	if(res.substring(50,51))
		res2 += '...';
	return res2;
}

info.update = function(props){
	this._div.innerHTML = 
	(props ? '<h3>'+firstLetterUpperCase(props.name)+'</h3>'+
	(props.c_data ? '<h4>Comunas</h4>'+comunasInProvinca(props):'')+
	(props.p_data ? '<h4>Provincias</h4>'+provinciasInRegion(props):'')+
	(props.choroValue ? '<br><b>N° de resultados: </b>'+props.choroValue:'') : '<h4>Información de zona</h4>');

};

info.onAdd = function(mymap){
	this._div = L.DomUtil.create('div','info');
	this.update();
	return this._div;
};

//choropleth color legend

info.addTo(mymap);

var choroInfo = L.control({position: 'bottomright'});

choroInfo.onAdd = function(mymap){
	this._div = L.DomUtil.create('div','info legend');
	this.update(choropleth_objects[currSource].r_max_val,"región");
	return this._div;
}

choroInfo.update = function(max_value, currGran){
	var v1 = max_value/5;
	var grades = [0,v1,2*v1,3*v1,4*v1,max_value];

	this._div.innerHTML = "<h4># "+labels[currSource].toLowerCase()+" <br>por "+currGran+"<br><br></h4>";

	for (var i = 0; i < grades.length; i++) {
		this._div.innerHTML +=
			'<i style="background: rgb(225,' + Math.floor(255-(grades[i]*255)/max_value).toString() + ',30)"></i> ' +
			Math.floor(grades[i])+'<br>';
	}

	return this._div;
}

//Layer selector

//control para mapa

var CustomControl = L.Control.Layers.extend({
	onAdd: function () {
		this._initLayout();
		this._addGranControl();
		this._update();
		return this._container;
	},
	_addGranControl() {
		var elements = this._container.getElementsByClassName('leaflet-control-layers-list');
		var granControl = L.DomUtil.create('div','gran-control',elements[0]);
		var separator = L.DomUtil.create('div','leaflet-control-layers-separator',granControl);

		granControl.id = 'cg-control';
		granControl.innerHTML += 'Granularidad resultados<br>';

		var rLabel = L.DomUtil.create('label','gs-label',granControl);
		var pLabel = L.DomUtil.create('label','gs-label',granControl);
		var cLabel = L.DomUtil.create('label','gs-label',granControl);

		var granR = L.DomUtil.create('input','gran-selector',rLabel);
		var granP = L.DomUtil.create('input','gran-selector',pLabel);
		var granC = L.DomUtil.create('input','gran-selector',cLabel);

		var rText = L.DomUtil.create('span','',rLabel);
		var pText = L.DomUtil.create('span','',pLabel);
		var cText = L.DomUtil.create('span','',cLabel);

		rText.innerHTML = 'Región';
		pText.innerHTML = 'Provincia';
		cText.innerHTML = 'Comuna';

		granR.name = 'choroGran';
		granR.type = 'radio';
		granP.name = 'choroGran';
		granP.type = 'radio';
		granC.name = 'choroGran';
		granC.type = 'radio';

		L.DomEvent.on(granR,'click',this._setGranR,this);
		L.DomEvent.on(granP,'click',this._setGranP,this);
		L.DomEvent.on(granC,'click',this._setGranC,this);

		granControl.hidden = true;
	},
	showGControl(){
		this._container.getElementsByClassName('gran-control')[0].hidden = false;
	},
	hideGControl(){
		this._container.getElementsByClassName('gran-control')[0].hidden = true;
	},
	toggleGControl(){
		gcont = this._container.getElementsByClassName('gran-control')[0];
		if(gcont.hidden)
			gcont.hidden=false;
		else
			gcont.hidden=true;
	},
	_setGranR(){
		setGranRegion();
	},
	_setGranP(){
		setGranProvincia();
	},
	_setGranC(){
		setGranComuna();
	}
});

//Base maps
var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

baseMaps ={
	"Politico": poli,
	"CartoDB DarkMatter":CartoDB_DarkMatter,
	"Esri_WorldImagery": Esri_WorldImagery
} 

var layerSelector =  new CustomControl(baseMaps);

layerSelector.addTo(mymap);


//UTIL
function firstLetterUpperCase(string){
	var splits = string.split(" ");
	var res = "";
	var first = true;
	for(s of splits){
		if(!first)
			res += " ";
		else
			first = false;
		if(s!="DE"&&s!="DEL"&&s!="LA"&&s!="LAS"&&s!="LOS"&&s!="Y")
			res += s[0].toUpperCase() + s.slice(1).toLowerCase();
		else
			res += s.toLowerCase();
	}
	return res;
}