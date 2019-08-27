var SelectablePolygon = L.GeoJSON.extend({
	selected: false,
	init: function (){
		this.setStyle({
			fillColor: '#bdd7e7',
			fillOpacity: 0.2,
			color: '#2171b5',
			weight: 2,
			dashArray: '',
		});
		this.on({
			click: this.toggleSelect,
			mouseover: this._highlight,
			mouseout: this._unhighlight
		});
	},
	toggleSelect: function (){
		if(this.selected){
			this.setStyle({
				fillColor: '#bdd7e7',
				fillOpacity: 0.2,
				color: '#2171b5',
				weight: 3,
				dashArray: '',
			});
			this.selected = false;
		}
		else{
			this.setStyle({
				fillColor: '#6baed6',
				fillOpacity: 0.7,
				color: '#2171b5',
				weight: 4,
				dashArray: '',
			});
			this.selected = true;
		}
	},
	_highlight: function(e){
		e.target.setStyle({
			fillColor: '#6baed6',
			fillOpacity: 0.7,
			color: '#2171b5',
			weight: 4,
			dashArray: '',
		});
		info.update(this);
		if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        	e.target.bringToFront();
   		}
	},
	_unhighlight: function(e){
		if(e.target.selected){
			e.target.setStyle({
				fillColor: '#6baed6',
				fillOpacity: 0.7,
				color: '#2171b5',
				weight: 3,
				dashArray: '',
			});
		}
		else{
			e.target.setStyle({
				fillColor: '#bdd7e7',
				fillOpacity: 0.2,
				color: '#2171b5',
				weight: 2,
				dashArray: '',
			});
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
	expand: function(){
		if(!this.selected){
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
						this.provincias[i].setStyle({
							fillColor: '#6baed6',
							fillOpacity: 0.7,
							color: '#2171b5',
							weight: 3,
							dashArray: '',
						});
					}
					else{
						this.provincias[i].setStyle({
							fillColor: '#bdd7e7',
							fillOpacity: 0.2,
							color: '#2171b5',
							weight: 2,
							dashArray: '',
						});
					}
				}
			}
			mymap.removeLayer(this);
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
	}
});

var SelectableProvincia = SelectablePolygon.extend({
	c_data: null,
	comunas: null,
	parent: null,
	name: null,
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
	expand: function(){
		if(!this.selected){
			mymap.fitBounds(this.getBounds());
			for(var i=0; i<this.c_data.length; i++){
				if(this.comunas[i]==null){
					this.comunas[i] = new SelectableComuna(JSON.parse(this.c_data[i]['st_asgeojson']));
					this.comunas[i].init(this,this.c_data[i]['nombre']);
					this.comunas[i].addTo(mymap);
				}
				else{
					this.comunas[i].addTo(mymap);
					//unHighlight in case it stayed highlighted after contraction
					if(this.comunas[i].selected){
						this.comunas[i].setStyle({
							fillColor: '#6baed6',
							fillOpacity: 0.7,
							color: '#2171b5',
							weight: 3,
							dashArray: '',
						});
					}
					else{
						this.comunas[i].setStyle({
							fillColor: '#bdd7e7',
							fillOpacity: 0.2,
							color: '#2171b5',
							weight: 2,
							dashArray: '',
						});
					}
				}
			}
			mymap.removeLayer(this);
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
	init: function(parent,name){
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