const region_color = '#31a354';
const region_fill = '#a1d99b';
const prov_color = '#8856a7';
const prov_fill = '#9ebcda';
const com_color = '#de2d26';
const com_fill = '#fc9272';

var SelectablePolygon = L.GeoJSON.extend({
	selected: false,
	selectedStyle:{
		fillColor: region_fill,
		fillOpacity: 0.8,
		color: region_color,
		weight: 2,
		dashArray: ''
	},
	unselectedStyle:{
		fillColor: region_fill,
		fillOpacity: 0.2,
		color: region_color,
		weight: 2,
		dashArray: ''
	},
	highlightStyle:{
		fillColor: region_fill,
		fillOpacity: 0.8,
		color: region_color,
		weight: 4,
		dashArray: ''
	},
	init: function (){
		this.setStyle(this.unselectedStyle);
		this.on({
			click: this.toggleSelect,
			mouseover: this._highlight,
			mouseout: this._unhighlight
		});
	},
	toggleSelect: function (){
		if(this.selected){
			this.setStyle(this.unselectedStyle);
			this.selected = false;
		}
		else{
			this.setStyle(this.selectedStyle);
			this.selected = true;
		}
	},
	_highlight: function(e){
		e.target.setStyle(this.highlightStyle);
		info.update(this);
		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        	e.target.bringToFront();
   		}
	},
	_unhighlight: function(e){
		if(e.target.selected){
			e.target.setStyle(e.target.selectedStyle);
		}
		else{
			e.target.setStyle(e.target.unselectedStyle);
		}
		info.update();
	},
	_fUnhighlight(){
		if(this.selected){
			this.setStyle(this.selectedStyle);
		}
		else{
			this.setStyle(this.unselectedStyle);
		}
	},
	info_update(e){
		if(e.originalEvent.type=="mouseover")
			info.update(this);
		else
			info.update();
	},
});


/***********************************************************/
/******************** SELECTABLE REGION ********************/
/***********************************************************/


var SelectableRegion = SelectablePolygon.extend({
	p_data: null,
	provincias: null,
	name: null,
	id: null,
	choroValue: null,
	init: function (p_data,name,id){
		SelectablePolygon.prototype.init.call(this);
		//add mouse events:
		//-zoom and show provincias on double click
		//-zoomout and hide unselected provincias on rightclick(contextmenu)
		this.p_data = p_data;
		this.name = name;
		this.id = id;
		this.on({
			dblclick: this.expand
		});
	},
	toggleSelect: function (){
		if(!this.selected && this.provincias != null)
			this.fCollapse();
		else if(this.selected && this.provincias != null){
			for(var p in this.provincias){
				if(this.provincias[p]!=null){
					this.provincias[p].drawSelectedChildren();
					if(this.provincias[p].selected){
						this.provincias[p].addTo(mymap);
					}
				}
			}
			this.bringToFront();
		}
		SelectablePolygon.prototype.toggleSelect.call(this);
		//select todas las provincias
	},
	expand: function(fitBounds=true){
		if(!this.selected){
			if(fitBounds)
				mymap.fitBounds(this.getBounds());
			//draw provincias
			if(this.provincias==null){
				this.provincias = {};
				for(var i = 0; i < this.p_data.length; i++){
					this.provincias[this.p_data[i].id] = new SelectableProvincia(JSON.parse(this.p_data[i]['st_asgeojson']));
					this.provincias[this.p_data[i].id].init(this.p_data[i].comunas,this.p_data[i]['nombre'], this.p_data[i]['id'],this);
					this.provincias[this.p_data[i].id].addTo(mymap);
				}
			}
			else{
				for(var p in this.provincias){
					this.provincias[p].addTo(mymap);
					//unHighlight in case it stayed highlighted after contraction
					if(this.provincias[p].selected){
						this.provincias[p].setStyle(this.provincias[p].selectedStyle);
					}
					else{
						this.provincias[p].setStyle(this.provincias[p].unselectedStyle);
					}
				}
			}
			mymap.removeLayer(this);
			return this.provincias;
		}
	},
	choroExpand: function(fitBounds=true){
		if(fitBounds)
			mymap.fitBounds(this.getBounds());
		//draw provincias
		if(this.provincias==null){
			this.provincias = {};
			for(var i = 0; i < this.p_data.length; i++){
				this.provincias[this.p_data[i].id] = new SelectableProvincia(JSON.parse(this.p_data[i]['st_asgeojson']));
				this.provincias[this.p_data[i].id].init(this.p_data[i].comunas,this.p_data[i]['nombre'], this.p_data[i]['id'],this);
				this.provincias[this.p_data[i].id].addTo(mymap);
			}
		}
		else{
			for(var p in this.provincias){
				//Keeping Choropleth Style
				this.provincias[p].addTo(mymap);
			}
		}
		mymap.removeLayer(this);
		return this.provincias;
	},
	collapse: function(){
		for(var p in this.provincias){
			this.provincias[p].collapse();
			if(!this.provincias[p].selected){
				mymap.removeLayer(this.provincias[p]);
				//if(this.provincias[i].childless())
				//	this.provincias[i]=null;
			}
		}
		this.addTo(mymap);
		this.bringToFront();
	},
	fCollapse: function(){
		for(var p in this.provincias){
			if(this.provincias[p]!=null){
				this.provincias[p].fCollapse();
				mymap.removeLayer(this.provincias[p]);
			}
		}
		if(!mymap.hasLayer(this)){
			this.addTo(mymap);
			this.bringToFront();
		}
	},
	choroplethize(results, r_max_val, p_max_val, c_max_val){
		//Setting values
		this.setChoroValues(results, r_max_val, p_max_val, c_max_val);
		//unsetting mouse events
		this.off({
			dblclick: this.expand,
			click: this.toggleSelect,
			mouseover: this._highlight,
			mouseout: this._unhighlight
		});
		this.on({
			dblclick: this.finerGran,
			mouseout: this.info_update,
			mouseover: this.info_update
		});
	},
	unChoroplethize(){
		//Asumes its already choropletized
		this.off({
			dblclick: this.finerGran,
			mouseout: this.info_update,
			mouseover: this.info_update
		});
		this.on({
			dblclick: this.expand,
			click: this.toggleSelect,
			mouseover: this._highlight,
			mouseout: this._unhighlight
		});
		this._fUnhighlight();
		for(var p in this.provincias){
			this.provincias[p].unChoroplethize();
		}
	},
	setChoroValues(results, r_max_val, p_max_val, c_max_val){
		//Asumes its already choropletized
		var value = results.value;
		if(value!=undefined){
			var color_value = Math.floor(255-((results.value*255)/r_max_val));
			this.setStyle({
				fillColor: 'rgb(225,'+color_value.toString()+',30)',
				fillOpacity: 0.7,
				color: 'rgb(255,255,255)',
				weight: 2,
				dashArray: ''
			});
			this.choroValue = value;
		}
		else{
			this.setStyle({
				fillColor: 'rgb(200,200,200)',
				fillOpacity: 0.7,
				color: 'rgb(255,255,255)',
				weight: 2,
				dashArray: ''
			});
			this.choroValue = null;
		}
		//Setting children values
		if(this.provincias==null){
			this.choroExpand(false);
		}
		var p_results = results.p_choro_data;
		for(var p in this.provincias){
			var id = this.provincias[p].id;
			this.provincias[p].choroplethize(p_results[id],p_max_val,c_max_val);
		}
		this.fCollapse();
	},
	//util
	finerGran(){
		setGranProvincia();
	}
});


/**************************************************************/
/******************** SELECTABLE PROVINCIA ********************/
/**************************************************************/


var SelectableProvincia = SelectablePolygon.extend({
	c_data: null,
	comunas: null,
	parent: null,
	name: null,
	id: null,
	choroValue: null,
	selectedStyle:{
		fillColor: prov_fill,
		fillOpacity: 0.8,
		color: prov_color,
		weight: 2,
		dashArray: ''
	},
	unselectedStyle:{
		fillColor: prov_fill,
		fillOpacity: 0.2,
		color: prov_color,
		weight: 2,
		dashArray: ''
	},
	highlightStyle:{
		fillColor: prov_fill,
		fillOpacity: 0.8,
		color: prov_color,
		weight: 4,
		dashArray: ''
	},
	init: function(c_data, name, id, parent){
		SelectablePolygon.prototype.init.call(this);
		this.c_data = c_data;
		this.parent = parent;
		this.name = name;
		this.id = id;
		this.on({
			dblclick: this.expand,
			contextmenu: this.contract
		});
	},
	toggleSelect: function (){
		if(!this.selected && this.comunas != null)
			this.fCollapse();
		else if(this.selected && this.comunas != null){
			for(var c in this.comunas){
				if(this.comunas[c]!=null){
					if(this.comunas[c].selected)
						this.comunas[c].addTo(mymap);
				}
			}
			this.bringToFront();
		}
		SelectablePolygon.prototype.toggleSelect.call(this);
		//select todas las comunas
	},
	expand: function(fitBounds=true){
		if(!this.selected){
			if(fitBounds)
				mymap.fitBounds(this.getBounds());
			if(this.comunas == null){
				this.comunas = {};
				for(var i = 0; i < this.c_data.length; i++){
					this.comunas[this.c_data[i].id] = new SelectableComuna(JSON.parse(this.c_data[i]['st_asgeojson']));
					this.comunas[this.c_data[i].id].init(this.c_data[i]['nombre'],this.c_data[i]['id'],this);
					this.comunas[this.c_data[i].id].addTo(mymap);
				}
			}
			else{
				for(var c in this.comunas){
					this.comunas[c].addTo(mymap);
					//unHighlight in case it stayed highlighted after contraction
					if(this.comunas[c].selected){
						this.comunas[c].setStyle(this.comunas[c].selectedStyle);
					}
					else{
						this.comunas[c].setStyle(this.comunas[c].unselectedStyle);
					}		
				}
			}
			mymap.removeLayer(this);
			return this.comunas;
		}
	},
	choroExpand: function(fitBounds=true){
		if(fitBounds)
			mymap.fitBounds(this.getBounds());
		if(this.comunas == null){
			this.comunas = {};
			for(var i = 0; i < this.c_data.length; i++){
				this.comunas[this.c_data[i].id] = new SelectableComuna(JSON.parse(this.c_data[i]['st_asgeojson']));
				this.comunas[this.c_data[i].id].init(this.c_data[i]['nombre'],this.c_data[i]['id'],this);
				this.comunas[this.c_data[i].id].addTo(mymap);
			}
		}
		else{
			for(var c in this.comunas){
				this.comunas[c].addTo(mymap);	
			}
		}
		mymap.removeLayer(this);
		return this.comunas;
	},
	contract: function(){
		this.parent.collapse();
	},
	collapse: function(){
		for(var c in this.comunas){
			if(this.comunas[c]!=null && !this.comunas[c].selected)
				mymap.removeLayer(this.comunas[c]);
		}
		this.addTo(mymap);
		this.bringToFront();
	},
	fCollapse: function(){
		for(var c in this.comunas){
			if(this.comunas[c]!=null)
				mymap.removeLayer(this.comunas[c]);
		}
		if(!mymap.hasLayer(this)){
			this.addTo(mymap);
			this.bringToFront();
		}
	},
	childless: function (){
		for(var c in this.comunas){
			if(this.comunas[c]!=null)
				return false;
		}
		return true;
	},
	drawSelectedChildren: function(){
		for(var c in this.comunas){
			if(this.comunas[c]!=null){
				if(this.comunas[c].selected)
					this.comunas[c].addTo(mymap);
			}
		}
	},
	choroplethize(results, p_max_val, c_max_val){
		//Setting values
		this.setChoroValues(results, p_max_val, c_max_val);
		//unsetting mouse events
		this.off({
			dblclick: this.expand,
			click: this.toggleSelect,
			mouseover: this._highlight,
			mouseout: this._unhighlight,
			contextmenu: this.contract
		});
		this.on({
			dblclick: this.finerGran,
			mouseover: this.info_update,
			mouseout: this.info_update,
			contextmenu: this.coarserGran
		})
	},
	unChoroplethize(){
		//Asumes its already choropletized
		this.off({
			dblclick: this.finerGran,
			mouseover: this.info_update,
			mouseout: this.info_update,
			contextmenu: this.coarserGran
		});
		this.on({
			dblclick: this.expand,
			click: this.toggleSelect,
			mouseover: this._highlight,
			mouseout: this._unhighlight,
			contextmenu: this.contract
		});
		this._fUnhighlight();
		for(var c in this.comunas){
			this.comunas[c].unChoroplethize();
		}
	},
	setChoroValues(results, p_max_val, c_max_val){
		//Asumes its already choropletized
		var value = results.value;
		if(value!=undefined){
			var color_value = Math.floor(255-((value*255)/p_max_val));
			this.setStyle({
				fillColor: 'rgb(225,'+color_value.toString()+',30)',
				fillOpacity: 0.7,
				color: 'rgb(255,255,255)',
				weight: 2,
				dashArray: ''
			});
			this.choroValue = value;
		}
		else{
			this.setStyle({
				fillColor: 'rgb(200,200,200)',
				fillOpacity: 0.7,
				color: 'rgb(255,255,255)',
				weight: 2,
				dashArray: ''
			});
			this.choroValue = null;
		}
		//Setting children values
		if(this.comunas==null){
			this.choroExpand(false);
		}
		var c_results = results.c_choro_data;
		for(var c in this.comunas){
			var id = this.comunas[c].id;
			this.comunas[c].choroplethize(c_results[id],c_max_val);
		}
		this.fCollapse();
	},
	//util
	finerGran(){
		setGranComuna();
	},
	coarserGran(){
		setGranRegion();
	}
});


/***********************************************************/
/******************** SELECTABLE COMUNA ********************/
/***********************************************************/

var SelectableComuna = SelectablePolygon.extend({
	parent: null,
	name: null,
	id: null,
	choroValue: null,
	selectedStyle:{
		fillColor: com_fill,
		fillOpacity: 0.8,
		color: com_color,
		weight: 2,
		dashArray: ''
	},
	unselectedStyle:{
		fillColor: com_fill,
		fillOpacity: 0.2,
		color: com_color,
		weight: 2,
		dashArray: ''
	},
	highlightStyle:{
		fillColor: com_fill,
		fillOpacity: 0.8,
		color: com_color,
		weight: 4,
		dashArray: ''
	},
	init: function(name, id, parent){
		this.parent = parent;
		this.name = name;
		this.id = id;
		SelectablePolygon.prototype.init.call(this);
		this.on({
			contextmenu: this.contract
		});
	},
	contract: function(){
		this.parent.collapse();
	},
	choroplethize(value, c_max_val){
		//Setting own values
		this.setChoroValues(value,c_max_val);
		//unsetting mouse events
		this.off({
			click: this.toggleSelect,
			mouseover: this._highlight,
			mouseout: this._unhighlight,
			contextmenu: this.contract
		});
		this.on({
			mouseover: this.info_update,
			mouseout: this.info_update,
			contextmenu: this.coarserGran
		})
	},
	unChoroplethize(){
		//Asumes its already choropletized
		this.off({
			mouseover: this.info_update,
			mouseout: this.info_update,
			contextmenu: this.coarserGran
		});
		this.on({
			click: this.toggleSelect,
			mouseover: this._highlight,
			mouseout: this._unhighlight,
			contextmenu: this.contract
		});
		this._fUnhighlight();
	},
	setChoroValues(value, c_max_val){
		if(value!=undefined){
			var color_value = Math.floor(255-((value*255)/c_max_val));
			this.setStyle({
				fillColor: 'rgb(225,'+color_value.toString()+',30)',
				fillOpacity: 0.7,
				color: 'rgb(255,255,255)',
				weight: 1,
				dashArray: ''
			});
			this.choroValue = value;
		}
		else{
			this.setStyle({
				fillColor: 'rgb(200,200,200)',
				fillOpacity: 0.7,
				color: 'rgb(255,255,255)',
				weight: 1,
				dashArray: ''
			});
			this.choroValue = null;
		}
	},
	coarserGran(){
		setGranProvincia();
	}
});


/*****UTILITY******/

function expandAll(){
	for(var region of fe_regiones){
		if(!region.selected){
			provs = region.expand(false);
			for(var p in provs){
				if(!provs[p].selected)
					provs[p].expand(false);
			}
		}
	}
}

function collapseAll(){
	for(var region of fe_regiones)
			region.collapse();
}

