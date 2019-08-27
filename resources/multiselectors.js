/*
var template = new Vue({
	//el: '#dom-el-id',
	components:{
		'multiselect': window.VueMultiselect.default
	},
	data (){
		return {
			options: [
				{
					tipo: '',
					vals:[
						//valores
					]
				},
				{
					tipo: '',
					vals:[
						//valores
					]
				}
			],
			value: []
		}
	}
});
*/

var ed = new Vue({
	el: '#elementos-demanda',
	components:{
		'multiselect': window.VueMultiselect.default
	},
	data (){
		return {
			options: [
				{
					tipo: 'Educacion',
					vals:[
						'Educación en general',
						'Costos de educación, deudas educativas',
						'Cobertura, calidad y desigualdad educativa',
						'Educación gratuita, pública',
						'Beneficios asociados a condición de estudiante',
						'Faltas ético-legales. lucro en educación, irregularidades legales, coimas, etc.',
						'Aspectos curriculares y de contenidos',
						'Problemas vinculados a instituciones especificas',
						'Derechos o situación de profesores o funcionarios administrativos',
						'Otras demandas educativas'
					]
				},
				{
					tipo: 'Pueblos originarios',
					vals:[
						'Pueblos originarios en general',
						'Devolución de tierras',
						'Condiciones socioeconómicas, préstamos, programas de ayuda',
						'Condiciones legales, autonomía, representación política',
						'Represión policial, brutalidad policial',
						'Fallos de la justicia relativos a pueblos originarios',
						'Culturales (Amenazas a identidad y formas de vida, estigmas, discriminación)',
						'Otras demandas de pueblos originarios'
					]
				},
				{
					tipo: 'Laborales',
					vals:[
						'Laborales en general',
						'Salarios, indexación de salarios, reclamo de bonos o deudas',
						'Número y/o calidad de puestos de trabajo',
						'Condiciones de trabajo, horarios, accidentes o riesgos laborales',
						'Negociación colectiva, derechos colectivos de los trabajadores, mesas de diálogo',
						'Otras demandas laborales',
						'Pensiones, planes previsionales, sistema previsional'
					]
				},
				{
					tipo: 'Ecologista, ambientalista',
					vals:[
						'Ecologista/ambientalista en general',
						'Construcción de centrales energéticas, puentes, represas, carreteras, etc.',
						'Desechos y residuos que contaminan o dañan el hábitat, la biodiversidad y/o la salud',
						'Tratamiento de residuos, reciclaje',
						'Polución sonora',
						'Capa de ozono, calentamiento global y demás cuestiones globales',
						'Otras demandas ambientalistas'
					]
				},
				{
					tipo: 'Feminista, mujeres',
					vals:[
						'Feminista/mujeres en general',
						'Violencia contra mujeres',
						'Otras demandas feministas/de mujeres'
					]
				},
				{
					tipo: 'Salud',
					vals:[
						'Salud en general',
						'Costos de salud',
						'Calidad y desigualdad en salud',
						'Salud gratuita, pública',
						'Irregularidades legales, coimas, etc.',
						'Cobertura de salud y enfermedades específicas',
						'Problemas vinculados a instituciones específicas',
						'Demandas vinculadas a médicos y otros funcionarios de la salud',
						'Nutrición, hábitos saludables',
						'Otras demandas de salud'
					]
				},
				{
					tipo: 'Cuestiones "valoricas"',
					vals:[
						'Cuestiones "valóricas". en general',
						'Aborto',
						'Divorcio',
						'Píldora del día después',
						'Eutanasia',
						'Otras demandas en cuestiones valóricas'
					]
				},
				{
					tipo: 'Regionalistas, urbanas y/o locales',
					vals:[
						'Regionalistas, locales en general',
						'Proyectos energéticos en la zona (protesta al estilo "Not in my backyard").',
						'Desarrollo local: mejor legislación, más fondos y condiciones generales para regiones o localidades',
						'Contaminación en la zona',
						'Cambios de uso de suelo (plan regulador); edificación en altura, edificación de grandes proyectos comerciales, edificaciones edilicias',
						'Infraestructura urbana; carreteras, aeropuertos, corredores de transporte y problemas de desplazamiento (Transantiago, por ejemplo).',
						'Otras demandas regionalistas o locales'
					]
				},
				{
					tipo: 'Minorías sexuales',
					vals:[
						'Minorías sexuales en general',
						'Derechos de gays',
						'Derechos de lesbianas',
						'Derechos de transexuales',
						'Otras demandas de minorías sexuales'
					]
				},
				{
					tipo: 'Antiinmigrantes/grupos étnicos',
					vals:[
						'Antiinmigrantes/grupos étnicos en general',
						'Inmigrantes nacionales (migración dentro de Chile)',
						'Inmigrantes internacionales',
						'Otras demandas vinculadas a grupos étnicos o inmigrantes'
					]
				},
				{
					tipo: 'Régimen militar',
					vals:[
						'Régimen militar en general',
						'Personas, acontecimientos o símbolos ligados al régimen militar',
						'Investigación, esclarecimiento y/o procesamiento de militares ligados al régimen',
						'Acciones de grupos terroristas',
						'Conmemoraciones víctimas o fechas clave',
						'Otras demandas vinculadas a derechos humanos y régimen militar'
					]
				},
				{
					tipo: 'Vivienda',
					vals:[
						'Vivienda en general',
						'Deudas habitacionales',
						'Construcción de viviendas',
						'Alto costo de la vivienda',
						'Campamentos, falta o precariedad de viviendas, reconstrucción post-desastre',
						'Otras demandas de vivienda'
					]
				},
				{
					tipo: 'Sistema político',
					vals:[
						'Reforma del sistema político en general',
						'Cambio sistema binominal y otros cambios electorales',
						'Cambio constitucional',
						'Asamblea constituyente',
						'Leyes puntuales',
						'Solicitud de cambio en autoridad política',
						'Otras reformas en reglas políticas',
						'Corrupción'
					]
				},
				{
					tipo: 'Otros',
					vals:[
						'Anti globalización, anti empresas transnacionales, anti neoliberalismo',
						'Derechos de los animales, vegetarianismo',
						'Derechos de consumidores',
						'Derechos de discapacitados y/o enfermos crónicos',
						'Derechos de los adultos mayores',
						'Derechos de grupos deportivos',
						'Derechos de grupos religiosos',
						'Pobreza y hambre',
						'Demanda por reforma de algún aspecto de la economía.',
						'Abusos y crímenes sexuales',
						'Demandas anarquistas, okupas y/o libertarias',
						'Eventos o situaciones internacionales',
						'Conmemoraciones',
						'Seguridad ciudadana'
					]
				}
			],
			value: []
		}
	}
});

var gs = new Vue({
	el: '#grupos-sociales',
	components:{
		'multiselect': window.VueMultiselect.default
	},
	data (){
		return {
			options: [
				{
					tipo: 'Sexo/Edad',
					vals:[
						'Hombres',
						'Mujeres',
						'Jóvenes',
						'Adultos mayores'
					]
				},
				{
					tipo: 'Grupos étnicos',
					vals:[
						'Pueblos originarios: mapuche',
						'Pueblos originarios: no mapuche',
						'Pueblos originarios: Indeterminado',
						'Inmigrantes'
					]
				},
				{
					tipo: 'Estudiantes',
					vals:[
						'Estudiantes universitarios',
						'Estudiantes secundarios',
						'Estudiantes (indeterminado)'
					]
				},
				{
					tipo: 'Grupos laborales',
					vals:[
						'Trabajadores empleados en el sector público',
						'Trabajadores empleados en el sector privado',
						'Trabajadores por cuenta propia o de pymes',
						'Trabajadores indeterminados',
						'Desempleados, cesantes',
						'Jubilados, pensionistas',
						'Jefas de hogar'
					]
				},
				{
					tipo: 'Partidos, religión y deporte',
					vals:[
						'Grupos de simpatizantes o afiliados a partidos u organizaciones políticas',
						'Grupos religiosos',
						'Grupos relacionados a instituciones deportivas'
					]
				},
				{
					tipo: 'Consumidores y deudores',
					vals:[
						'Consumidores de vienes y servicios varios',
						'Deudores'
					]
				},
				{
					tipo: 'Grupos según vivenda/geografía',
					vals:[
						'Personas sin hogar',
						'Pobladores',
						'Residentes o vecinos de un barrio, localidad, comuna o región'
					]
				},
				{
					tipo: 'Grupos de género, ecologistas-animalistas, artistas',
					vals:[
						'Homosexuales/minorías sexuales/feministas',
						'Ecologistas/ambientalistas/animalistas',
						'Artistas, comunicadores,periodistas'
					]
				},
				{
					tipo: 'Clandestinos, presos, grupos de odio',
					vals:[
						'"Encapuchados", o cualquier grupo que intencionalmente oculte su identidad',
						'Grupos de "odio"',
						'Presos, detenidos',
						'Familiares de presos o detenidos',
						'Anarquistas, okupas, grupos libertarios'
					]
				},
				{
					tipo: 'Otros',
					vals:[
						'FAMILIARES',
						'APODERADOS',
						'NIÑOS',
						'EX MILITARES',
						'EMPRESARIOS',
						'ENFERMOS',
						'EX CONSCRIPTOS',
						'DISCAPACITADOS',
						'EX PRESOS POLÍTICOS',
						'BOMBEROS'
					]
				}
			],
			value: []
		}
	}
});