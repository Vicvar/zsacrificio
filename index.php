<!DOCTYPE HTML>
<html>
<head>
	<title>Zonas de Sacrificio Ambiental</title>
	<!--Leaflet-->
	<script src="resources/leaflet/leaflet.js"></script>
	<link rel="stylesheet" href="resources/leaflet/leaflet.css">
	<!--Leaflet map-->
	<script src="resources/fe_territorio.js"></script>
	<!--Double slider-->
	<script src="resources/nouislider/nouislider.js"></script>
	<script src="resources/nouislider/wNumb.js"></script>
	<link rel="stylesheet" href="resources/nouislider/nouislider.css">
	<!--Vue Multiselect(CDN, change later)-->
	<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
	<script src="https://unpkg.com/vue-multiselect@2.1.0"></script>
	<link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
	<!--Custom style-->
	<link rel="stylesheet" type="text/css" href="resources/style.css">
</head>

<body>
	<div id="wrapper">
		<?php 
			$start = microtime(true);
			include "controller/initLoad.php";
			$end = microtime(true);
		?>

		<div id="side-bar">
			<div id="global-selector">
				<p>Selector de granularidad de resultados y mapa: res/sol</p>
				<div id="sel-fuente">
					Fuente:<br>
					<input type="radio" name="fuente" value="0" checked=""> SEIA<br>
					<input type="radio" name="fuente" value="1"> COES
						<button type="button" onclick="clearResults()">Limpiar resultados</button>
						<button type="button" onclick="aTest()">Buscar</button>
				</div>
			</div>
			<div id="search-tabs">
				<div class="tabs">
					<button class="tab-button" onclick="showForm(event,'seia')">SEIA</button>
					<button class="tab-button active" onclick="showForm(event,'coes')">COES</button>
					<button class="tab-button" onclick="showForm(event,'lobby')">Lobby</button>
				</div>
				<div id="search">
					<!--Formularios-->
					<div id="seia" class="search-form">
						<h4>Sistema de Evaluación de Impacto Ambiental</h4>
						<br>
						
						<label><input class="source-cb" type="checkbox" value="seia"> Usar fuente </label>
						<br><br>
						<hr>
						<div class="form-field">
							Nombre del Proyecto:
							<input class="text-input" type="text" name="nombre">
						</div>
						<hr>
						<div class="form-field">
							Nombre del titular:
							<input class="text-input" type="text" name="titular">
						</div>
						<hr>
						<div class="form-field">
							Monto minimo de inversión:
							<input class="text-input" type="number" name="inversion" value="0">
						</div>
						<hr>
						<div id="tipo" class="multi-select">
							<label class="ms-label">Tipo de presentación:</label>
							<multiselect v-model="value" :options="options" :multiple="true" placeholder="Buscar en el selector" closeOnSelect="false" track-by="value" label="label"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
							<div class="clearbutton">
								<button onclick="tipo.resetValues()">Borrar Filtro</button>
							</div>
						</div>
						<hr>
						<div id="estado" class="multi-select">
							<label class="ms-label">Estado:</label>
							<multiselect v-model="value" :options="options" :multiple="true" placeholder="Buscar en el selector" closeOnSelect="false" track-by="value" label="label"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
							<div class="clearbutton">
								<button onclick="estado.resetValues()">Borrar Filtro</button>
							</div>
						</div>
						<hr>
						<div id="sector-productivo" class="multi-select">
							<label class="ms-label">Sector productivo:</label>
							<multiselect v-model="value" :options="options" :multiple="true" placeholder="Buscar en el selector" closeOnSelect="false" track-by="value" label="label"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
							<div class="clearbutton">
								<button onclick="sector_productivo.resetValues()">Borrar Filtro</button>
							</div>
						</div>
					</div>
					<div id="coes" class="search-form active">
						<h4>Observatorio de conflictos sociales</h4>
						<br>
						<label><input class="source-cb" type="checkbox" value="coes"> Usar fuente </label>
						<br><br>

						<div id="campos-conflictividad" class="multi-select">
							<label class="ms-label">Campos de conflictividad:</label>
							<multiselect v-model="value" :options="options" :multiple="true" placeholder="Buscar en el selector" closeOnSelect="false" track-by="value" label="label"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
							<div class="clearbutton">
								<button onclick="campos_conflictividad.resetValues()">Borrar Filtro</button>
							</div>
						</div>

						<div id="elementos-demanda" class="multi-select">
							Elementos de demanda:
							<multiselect class="multisel" v-model="value" :options="options" :multiple="true" group-values="elements" group-label="type" :group-select="true" placeholder="Buscar en el selector" closeOnSelect="false" track-by="value" label="label"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
							<div class="clearbutton">
								<button onclick="elementos_demanda.resetValues()">Borrar Filtro</button>
							</div>
						</div>

						<div id="otros-elementos-demanda" class="multi-select">
							Otros elementos de demanda:
							<multiselect v-model="value" :options="options" :multiple="true" placeholder="Buscar en el selector" closeOnSelect="false" track-by="value" label="label"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
							<div class="clearbutton">
								<button onclick="otros_elementos_demanda.resetValues()">Borrar Filtro</button>
							</div>
						</div>

						<div id="grupos-sociales" class="multi-select">
							<label class="typo__label">Grupos sociales:</label>
							<multiselect v-model="value" :options="options" :multiple="true" group-values="elements" group-label="type" :group-select="true" placeholder="Buscar en el selector" closeOnSelect="false" track-by="value" label="label"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
							<div class="clearbutton">
								<button onclick="grupos_sociales.resetValues()">Borrar Filtro</button>
							</div>
						</div>

						<div id="actores" class="multi-select">
							Actores involucrados:
							<multiselect v-model="value" :options="options" :multiple="true" track-by="value" label="label" placeholder="Buscar en el selector" closeOnSelect="false"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
							<div class="clearbutton">
								<button onclick="actores.resetValues()">Borrar Filtro</button>
							</div>
						</div>

						<div id="carabineros" class="multi-select">
							<label class="typo__label">Presencia de carabineros:</label>
							<multiselect v-model="value" :options="options" :multiple="true" track-by="value" label="label" placeholder="Buscar en el selector" closeOnSelect="false"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
							<div class="clearbutton">
								<button onclick="carabineros.resetValues()">Borrar Filtro</button>
							</div>
						</div>

						<div id="fuerzas-disuasivas" class="multi-select">
							<label class="typo__label">Fuerzas disuasivas:</label>
							<multiselect v-model="value" :options="options" :multiple="true" track-by="value" label="label" placeholder="Buscar en el selector" closeOnSelect="false"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
							<div class="clearbutton">
								<button onclick="fuerzas_disuasivas.resetValues()">Borrar Filtro</button>
							</div>
						</div>

						<div id="perjuicios-participantes" class="multi-select">
							<label class="typo__label">Perjuicios a participantes:</label>
							<multiselect v-model="value" :options="options" :multiple="true" track-by="value" label="label" placeholder="Buscar en el selector" closeOnSelect="false"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
							<div class="clearbutton">
								<button onclick="perjuicios_participantes.resetValues()">Borrar Filtro</button>
							</div>
						</div>



					</div>
					<div id="lobby" class="search-form">
						<h4>Datos Ley de lobby</h4>
						<br>
						<label><input class="source-cb" type="checkbox" > Usar fuente </lalbel>
						<br><br>
						<hr>
					</div>
				</div>
			</div>
			<div id="results">
				<h3>Resultados</h3>
				<!--Debug echoes-->
				<?php echo 'Db time '.($end-$start).'s'; ?>
			</div>
		</div>

		<div id="selection">
			<div id="selector">
				<div id="date-range">
					<div id="nouislider"></div>
					<div id="input-f">
						<div id="fechas">
							<input type="date" id="f-inicio" name="f-inicio">
							<input type="date" id="f-fin" name="f-fin">
						</div>
					</div>	
				</div>
			</div>

			<div id="mapid"></div>
		</div>
		<script>
			//Map creation

			var mymap = L.map('mapid',{doubleClickZoom:false}).setView([-36.830056, -73.036926],6);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(mymap);

			//Getting territorial divisions from inital DB load used in populate_map.js

			var region_vect = <?php echo json_encode($regiones)?>;
			var provincia_vect = <?php echo json_encode($provincias)?>;
			var comuna_vect = <?php echo json_encode($comunas)?>;

			var n_regiones = <?php echo count($regiones)?>;
			var fe_regiones = Array(n_regiones); //stores region objects

			//table data for SEIA
			var tipo_pres = <?php echo json_encode($tipo_presentacion) ?>;
			var estado = <?php echo json_encode($estado) ?>;
			var sector_productivo = <?php echo json_encode($sector_productivo) ?>;
			console.log(estado);

			//Getting table data for selectors used in multiselectors.js
			var elementos_demanda = <?php  echo json_encode($elemento_demanda)?>;
			var tipos_elemento_demanda = <?php echo json_encode($tipo_elemento_demanda) ?>;

			var grupos_sociales = <?php echo json_encode($grupo_social)?>;
			var tipos_grupo_social = <?php echo json_encode($tipo_grupo_social) ?>;

			var actores = <?php echo json_encode($actor) ?>;

			var campos_conflictividad = <?php echo json_encode($campo_conflictividad) ?>;

			var tacticas_protesta = <?php echo json_encode($tactica_protesta) ?>;

			var medios = <?php echo json_encode($medio) ?>;


		</script>
		<script src="resources/populate_map.js"></script>
		<script src="resources/tabs.js"></script>
		<script src="resources/multiselectors.js"></script>
		<script src="resources/queries.js"></script>
		<script src="resources/results_display.js"></script>

	</div>
</body>
</html>