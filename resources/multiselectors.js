//To store multiselectors as propperties by source name like
//{ seia:[multis1, miltis2,...], coes:[multism, multisn,...], ...}
var ms_by_source = {};
ms_by_source.coes = [];

function createVueMultiselect(element, options){
	var vue_ms = {
		el: element,
		components:{
			'multiselect': window.VueMultiselect.default
		},
		data(){
			return{
				options: options,
				value: []	
			}
		},
		methods:{
			getValues(){
				values = [];
				//checking if iterable
				if(typeof this.value[Symbol.iterator] === 'function'){
					for(v of this.value)
						values.push(v.value);
					return values;
				}
				else{
					return this.value.value;
				}
			},
			resetValues(){
				this.value = [];
			},
			getDomName(){
				return this.$el.attributes.name;
			}
		}
	};

	return new Vue(vue_ms);
}


//****************************COES******************************

//Campos de conflictividad

var cc_options = [];

for(cc of campos_conflictividad){
	var cc_op = {
		value: cc.id_campo_conflictividad,
		label: cc.nombre
	};
	cc_options.push(cc_op);
}

var campos_conflictividad = createVueMultiselect('#campos-conflictividad', cc_options);

ms_by_source.coes.push(campos_conflictividad);

//Elementos de demanda

var elements_in_type = new Map();

for(ed of elementos_demanda){
	if(elements_in_type[ed.tipo]==undefined)
		elements_in_type[ed.tipo] = [];
	var element = {
		value: ed.id_elemento_demanda,
		label: ed.nombre
	};
	elements_in_type[ed.tipo].push(element);
}

var ed_options = [];
var otros_ed = [];

for(tipo of tipos_elemento_demanda){
	var id_tipo = tipo.id_tipo_elemento_demanda
	
	if(id_tipo==99){
		for(el of elements_in_type[id_tipo])
			otros_ed.push(el);
	}
	
	var option = {
		type: tipo.nombre,
		elements: []
	};

	for(el of elements_in_type[id_tipo])
		option.elements.push(el);

	ed_options.push(option);
}

var elementos_demanda = createVueMultiselect('#elementos-demanda', ed_options);

ms_by_source.coes.push(elementos_demanda);

//Otros elementos de demanda

var otros_elementos_demanda = createVueMultiselect('#otros-elementos-demanda', otros_ed);

ms_by_source.coes.push(otros_elementos_demanda);

//Grupos sociales

var gs_in_type = new Map();

for(gs of grupos_sociales){
	if(gs_in_type[gs.tipo]==undefined)
		gs_in_type[gs.tipo] = [];
	var element = {
		value: gs.id_grupo_social,
		label: gs.nombre
	};
	gs_in_type[gs.tipo].push(element);
}

var gs_options = [];

for(tipo of tipos_grupo_social){
	var id_tipo = tipo.id_tipo_grupo_social;

	var option = {
		type: tipo.nombre,
		elements: []
	};

	for(gs of gs_in_type[id_tipo])
		option.elements.push(gs);

	gs_options.push(option);
}

var grupos_sociales = createVueMultiselect('#grupos-sociales', gs_options);

ms_by_source.coes.push(grupos_sociales);

//Actores
var actores_n = [];

for(actor of actores){
	var act = {
		value: actor.id_actor,
		label: actor.nombre
	}
	actores_n.push(act);
}

var actores = createVueMultiselect('#actores', actores_n);

ms_by_source.coes.push(actores);

//Presencia de carabineros
var car_op = [
	{
		value: 0,
		label: "no"
	},
	{
		value: 1,
		label: "si"
	}
]

var carabineros = createVueMultiselect('#carabineros', car_op);

ms_by_source.coes.push(carabineros);

//Fuerzas disuasivas

var fd_op = [
	{
		value:"fuerza_cuerpo",
		label:"Cuerpo a cuerpo"
	},
	{
		value:"fuerza_antidisturbios",
		label:"Elementos antidisturbios"
	},
	{
		value:"fuerza_fuego",
		label:"Armas de fuego"
	}
];

var fuerzas_disuasivas = createVueMultiselect('#fuerzas-disuasivas', fd_op);

ms_by_source.coes.push(fuerzas_disuasivas);

//Perjuicios a participantes

var pp_op =[
	{
		value:"presencia_arrestos",
		label:"Arrestos"
	},
	{
		value:"presencia_heridos",
		label:"Heridos"
	},
	{
		value:"presencia_muertos",
		label:"Muertos"
	}
];

var perjuicios_participantes = createVueMultiselect('#perjuicios-participantes', pp_op);

ms_by_source.coes.push(perjuicios_participantes);

/*********************SEIA****************************/

//Estado
var estado_op = [];

for(e of estado){
	var op={
		value: e.estado,
		label: e.estado
	}
	estado_op.push(op);
}

var estado = createVueMultiselect('#estado',estado_op);

//Tipo de presentacion
var tipo_op = [];

for(t of tipo_pres){
	var op={
		value:t.tipo,
		label:t.tipo
	}
	tipo_op.push(op);
}

var tipo = createVueMultiselect('#tipo',tipo_op);

//Sector Productivo
var sp_op =[];

for(sp of sector_productivo){
	var op={
		value: sp.sector_productivo,
		label: sp.sector_productivo
	}
	sp_op.push(op);
}

var sector_productivo = createVueMultiselect('#sector-productivo',sp_op);

//Lobby

var mat_op = [];

for(mat of materias){
	var op ={
		value: mat,
		label:mat
	}
	mat_op.push(op);
}

var materias_audiencia = createVueMultiselect('#materias',mat_op);

var fa_op = [
	{
		value: "P",
		label: "Presencial"
	},
	{
		value: "V",
		label: "Virtual"
	}
];

var forma_audiencias = createVueMultiselect('#forma-audiencias',fa_op);