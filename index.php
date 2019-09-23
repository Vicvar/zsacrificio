<!DOCTYPE HTML>
<html>
<head>
	<title>Zonas de Sacrificio Ambiental</title>
	<!--Leaflet-->
	<script src="resources/leaflet/leaflet.js"></script>
	<link rel="stylesheet" href="resources/leaflet/leaflet.css">
	<!--Leaflet map-->
	<script src="resources/fe_territorio.js"></script>
	<!--Marker Cluster-->
	<script src="resources/markerCluster/leaflet.markercluster.js"></script>
	<link rel="stylesheet" href="resources/markerCluster/MarkerCluster.css">
	<link rel="stylesheet" href="resources/markerCluster/MarkerCluster.Default.css">
	<!--Double slider-->
	<script src="resources/nouislider/nouislider.js"></script>
	<script src="resources/nouislider/wNumb.js"></script>
	<link rel="stylesheet" href="resources/nouislider/nouislider.css">
	<!--Vue Multiselect(CDN, change later)-->
	<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
	<script src="https://unpkg.com/vue-multiselect@2.1.0"></script>
	<link rel="stylesheet" href="https://unpkg.com/vue-multiselect@2.1.0/dist/vue-multiselect.min.css">
	<!--ChartJS-->
	<script src="resources/chartjs/Chart.bundle.js"></script>
	<!--<link rel="stylesheet" href="resources/chartjs/Chart.css">-->
	<link href="https://cdn.jsdelivr.net/npm/simple-datatables@latest/dist/style.css" rel="stylesheet" type="text/css">
	<script src="https://unpkg.com/simple-datatables" type="text/javascript"></script>
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
			<div class="tabs">
				<button id="search-tab-button" class="tab-button active" onclick="tabHandler(this,'search-tabs')">Búsqueda</button>
				<button disabled id="results-tab-button" class="tab-button" disabled onclick="tabHandler(this,'result-tabs')">Resultados</button>
				<button hidden type="button" id="back-to-sel" class="control-button" onclick="resetSelector()">Volver a la selección</button>
				<button type="button" id="search-button" class="control-button" onclick="search()">Buscar</button>
			</div>
			<div>
				<div id="search-tabs" class="tab-content nested active">
					<div class="tabs">
						<button class="tab-button active" onclick="tabHandler(this,'seia')">SEIA</button>
						<button class="tab-button" onclick="tabHandler(this,'coes')">COES</button>
						<button class="tab-button" onclick="tabHandler(this,'lobby')">Lobby</button>
					</div>
					<div id="search" class="tab-container">
						<!--Formularios-->
						<div id="seia" class="tab-content active">
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
						<div id="coes" class="tab-content">
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
						<div id="lobby" class="tab-content">
							<h4>Datos Ley de lobby</h4>
							<br>
							<label><input class="source-cb" type="checkbox" > Usar fuente </lalbel>
							<br><br>
							<hr>
						</div>
					</div>
				</div>
				<div id="result-tabs" class="tab-content nested">
					<div class="tabs">
						<button disabled id="seia-resTabButton" class="tab-button result-tab" onclick="resultsTabHandler(this,'seia-results')">SEIA</button>
						<button disabled id="coes-resTabButton" class="tab-button result-tab" onclick="resultsTabHandler(this,'coes-results')">COES</button>
						<button disabled id="lobby-resTabButton" class="tab-button result-tab" onclick="resultsTabHandler(this,'lobby-results')">Lobby</button>
					</div>
					<div class="tab-container">
						<div id="seia-results" class="tab-content result-content">
							<div id="seia-table-div">
								<table  id="seia-table" class="resultTable">
									<colgroup>
										<col class="name-col" >
										<col span="2" class="date-col">
									</colgroup>
								</table>
							</div>
							<div hidden="true" id="seia-details-div">
								<button type="button" class="back-button" onclick="backToResults('seia')">&larr;</button>
								<table  id="seia-details"></table>
							</div>
						</div>
						<div id="coes-results" class="tab-content result-content">
							<div id="coes-table-div">
								<table id="coes-table" class="resultTable">
									<colgroup>
										<col class="name-col" >
										<col span="2" class="date-col">
									</colgroup>
								</table>
							</div>
							<div hidden="true" id="coes-details-div">
								<button type="button" class="back-button" onclick="backToResults('coes')">&larr;</button>
								<table id="coes-details"></table>
							</div>
						</div>
						<div id="lobby-results" class="tab-content result-content">
							<div id="lobby-table-div">
								<table id="lobby-table" class="resultTable">
									<colgroup>
										<col class="name-col" >
										<col span="2" class="date-col">
									</colgroup>
								</table>
							</div>
							<div hidden="true" id="lobby-details-div">
								<button type="button" class="back-button" onclick="backToResults('lobby')">&larr;</button>
								<table id="lobby-details"></table>
							</div>
						</div>
					</div>
					<h3>Resultados</h3>
					<!--Debug echoes-->
					<?php echo 'Db time '.($end-$start).'s'; ?>
				</div>
			</div>
		</div>

		<div id="selection">
			<div id="selector">

				<div onclick="this.hidden=true;" id="date-range" style="background-color: orange">
					<div id="nouislider"></div>
				</div>

				<div id="input-f">
					<div id="fechas">
						<input type="date" id="f-inicio" name="f-inicio">
						<div>
							<label><input type="radio" name="date-gran" onclick = "setGranDay()">Día</label>
							<label><input type="radio" name="date-gran" onclick = "setGranWeek()">Semana</label>
							<label><input type="radio" name="date-gran" onclick = "setGranMonth()">Mes</label>
							<label><input type="radio" name="date-gran" onclick = "setGranYear()">Año</label>
						</div>
						<input type="date" id="f-fin" name="f-fin">
					</div>
				</div>
				
			</div>

			<div id="mapid"></div>

			<div id="time-chart">
				<canvas id="myChart"></canvas>
			</div>

		</div>
		<script>
			//Map creation

			var poli = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				});


			var mymap = L.map('mapid',{
				doubleClickZoom:false,
			}).setView([-36.830056, -73.036926],6);

			mymap.addLayer(poli);


			//Getting territorial divisions from inital DB load used in populate_map.js

			var region_vect = <?php echo json_encode($r)?>;
			var provincia_vect = <?php echo json_encode($provincias2)?>;
			var comuna_vect = <?php echo json_encode($comunas2)?>;
			//console.log("region_vect:",region_vect,"provincia_vect:",provincia_vect,"comuna_vect:",comuna_vect);

			//table data for SEIA
			var tipo_pres = <?php echo json_encode($tipo_presentacion) ?>;
			var estado = <?php echo json_encode($estado) ?>;
			var sector_productivo = <?php echo json_encode($sector_productivo) ?>;

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
		<script src="resources/results_list.js" type="module"></script>
		<script src="resources/results_display.js"></script>
		<script src="resources/timechart.js"></script>
	</div>
</body>
</html>