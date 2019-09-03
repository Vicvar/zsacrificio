var SelectablePolygon = L.GeoJSON.extend({
	selected: false,
	selectedStyle:{
		fillColor: '#a6cee3',
		fillOpacity: 0.8,
		color: '#1f78b4',
		weight: 3,
		dashArray: ''
	},
	unselectedStyle:{
		fillColor: '#a6cee3',
		fillOpacity: 0.2,
		color: '#1f78b4',
		weight: 2,
		dashArray: ''
	},
	highlightStyle:{
		fillColor: '#a6cee3',
		fillOpacity: 0.8,
		color: '#1f78b4',
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
			e.target.setStyle(this.selectedStyle);
		}
		else{
			e.target.setStyle(this.unselectedStyle);
		}
		info.update();
	}
});

var SelectableRegion = SelectablePolygon.extend({
	p_data: null,
	provincias: null,
	name: null,
	init: function (p_data,name){
		SelectablePolygon.prototype.init.call(this);
		//add mouse events:
		//-zoom and show provincias on double click
		//-zoomout and hide unselected provincias on rightclick(contextmenu)
		this.p_data = p_data;
		this.provincias = new Array(p_data.length);
		this.name = name;
		this.on({
			dblclick: this.expand
		});
	},
	toggleSelect: function (){
		if(!this.selected && this.provincias != null)
			this.fCollapse();
		else if(this.selected && this.provincias != null){
			for(var i = 0; i < this.provincias.length; i++){
				if(this.provincias[i]!=null){
					this.provincias[i].drawSelectedChildren();
					if(this.provincias[i].selected){
						this.provincias[i].addTo(mymap);
					}
				}
			}
			this.bringToFront();
		}
		SelectablePolygon.prototype.toggleSelect.call(this);
		//select todas las provincias
	},
	expand: function(fitBounds){
		if(!this.selected){
			if(fitBounds)
				mymap.fitBounds(this.getBounds());
			//draw provincias
			for(var i =0 ; i < this.p_data.length; i++){
				if(this.provincias[i]==null){
					this.provincias[i] = new SelectableProvincia(JSON.parse(this.p_data[i]['st_asgeojson']));
					this.provincias[i].init(this.p_data[i].comunas,this.p_data[i]['nombre'],this);
					this.provincias[i].addTo(mymap);
				}
				else{
					this.provincias[i].addTo(mymap);
					//unHighlight in case it stayed highlighted after contraction
					if(this.provincias[i].selected){
						this.provincias[i].setStyle(this.provincias[i].selectedStyle);
					}
					else{
						this.provincias[i].setStyle(this.provincias[i].unselectedStyle);
					}
				}
			}
			mymap.removeLayer(this);
			return this.provincias;
		}
	},
	collapse: function(){
		for(var i = 0; i < this.provincias.length; i++){
			this.provincias[i].collapse();
			if(!this.provincias[i].selected){
				mymap.removeLayer(this.provincias[i]);
				//if(this.provincias[i].childless())
				//	this.provincias[i]=null;
			}
		}
		this.addTo(mymap);
		this.bringToFront();
	},
	fCollapse: function(){
		for(var i = 0; i < this.provincias.length; i++){
			if(this.provincias[i]!=null){
				this.provincias[i].fCollapse();
				mymap.removeLayer(this.provincias[i]);
			}
		}
	},
	choropletize(val_comunas){
		return;
	}
});

var SelectableProvincia = SelectablePolygon.extend({
	c_data: null,
	comunas: null,
	parent: null,
	name: null,
	selectedStyle:{
		fillColor: '#b2df8a',
		fillOpacity: 0.8,
		color: '#33a02c',
		weight: 3,
		dashArray: ''
	},
	unselectedStyle:{
		fillColor: '#b2df8a',
		fillOpacity: 0.2,
		color: '#33a02c',
		weight: 2,
		dashArray: ''
	},
	highlightStyle:{
		fillColor: '#b2df8a',
		fillOpacity: 0.8,
		color: '#33a02c',
		weight: 4,
		dashArray: ''
	},
	init: function(c_data, name, parent){
		SelectablePolygon.prototype.init.call(this);
		this.c_data = c_data;
		this.comunas = new Array(c_data.length);
		this.parent = parent;
		this.name = name;
		this.on({
			dblclick: this.expand,
			contextmenu: this.contract
		});
	},
	toggleSelect: function (){
		if(!this.selected && this.comunas != null)
			this.fCollapse();
		else if(this.selected && this.comunas != null){
			for(var i = 0; i < this.comunas.length; i++){
				if(this.comunas[i]!=null){
					if(this.comunas[i].selected)
						this.comunas[i].addTo(mymap);
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
			for(var i=0; i<this.c_data.length; i++){
				if(this.comunas[i]==null){
					this.comunas[i] = new SelectableComuna(JSON.parse(this.c_data[i]['st_asgeojson']));
					this.comunas[i].init(this.c_data[i]['nombre'],this);
					this.comunas[i].addTo(mymap);
				}
				else{
					this.comunas[i].addTo(mymap);
					//unHighlight in case it stayed highlighted after contraction
					if(this.comunas[i].selected){
						this.comunas[i].setStyle(this.comunas[i].selectedStyle);
					}
					else{
						this.comunas[i].setStyle(this.comunas[i].unselectedStyle);
					}
				}
			}
			mymap.removeLayer(this);
			return this.comunas;
		}
	},
	contract: function(){
		this.parent.collapse();
	},
	collapse: function(){
		for(var i = 0; i < this.comunas.length; i++){
			if(this.comunas[i]!=null && !this.comunas[i].selected)
				mymap.removeLayer(this.comunas[i]);
		}
		this.addTo(mymap);
		this.bringToFront();
	},
	fCollapse: function(){
		for(var i = 0; i < this.comunas.length; i++){
			if(this.comunas[i]!=null)
				mymap.removeLayer(this.comunas[i]);
		}
	},
	childless: function (){
		for(var i = 0; i< this.comunas.length; i++){
			if(this.comunas[i]!=null)
				return false;
		}
		return true;
	},
	drawSelectedChildren: function(){
		for(var i = 0; i < this.comunas.length; i++){
			if(this.comunas[i]!=null){
				if(this.comunas[i].selected)
					this.comunas[i].addTo(mymap);
			}
		}
	}
});

var SelectableComuna = SelectablePolygon.extend({
	parent: null,
	name: null,
	selectedStyle:{
		fillColor: '#fb9a99',
		fillOpacity: 0.8,
		color: '#e31a1c',
		weight: 3,
		dashArray: ''
	},
	unselectedStyle:{
		fillColor: '#fb9a99',
		fillOpacity: 0.2,
		color: '#e31a1c',
		weight: 2,
		dashArray: ''
	},
	highlightStyle:{
		fillColor: '#fb9a99',
		fillOpacity: 0.8,
		color: '#e31a1c',
		weight: 4,
		dashArray: ''
	},
	init: function(name, parent){
		this.parent = parent;
		this.name = name;
		SelectablePolygon.prototype.init.call(this);
		this.on({
			contextmenu: this.contract
		});
	},
	contract: function(){
		this.parent.collapse();
	}
});


/*****UTILITY******/

function expandAll(){
	for(var region of fe_regiones){
		if(!region.selected){
			provs = region.expand(false);
			for(var prov of provs){
				if(!prov.selected)
					prov.expand(false);
			}
		}
	}
}

function collapseAll(){
	for(var region of fe_regiones){
		if(!region.selected)
			region.collapse();
	}
}