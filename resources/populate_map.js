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
	fe_regiones[i].init(provincias_reg,region_vect[i]['nombre']);
	fe_regiones[i].addTo(mymap);

}

var info = L.control();

//Controll to display areas names and contents

var provinciasInRegion = function(props){
	var res = '';
	for(p in props.p_data)
		res+=props.p_data[p]['nombre']+'<br>';
	return res;
};

var comunasInProvinca = function(props){
	var res = '';
	for(c in props.c_data)
		res+=props.c_data[c]['nombre']+'<br>';
	return res;
}

info.update = function(props){
	this._div.innerHTML = 
	(props ? '<h3>'+props.name+'</h3>'+
	(props.c_data ? '<h4>Comunas</h4>'+comunasInProvinca(props):'')+
	(props.p_data ? '<h4>Provincias</h4>'+provinciasInRegion(props):'') : 'Información de zona');

};

info.onAdd = function(mymap){
	this._div = L.DomUtil.create('div','info');
	this.update();
	return this._div;
};

info.addTo(mymap);