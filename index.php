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
					<button class="tab-button active" onclick="showForm(event,'seia')">SEIA</button>
					<button class="tab-button" onclick="showForm(event,'coes')">COES</button>
					<button class="tab-button" onclick="showForm(event,'lobby')">Lobby</button>
				</div>
				<div id="search">
					<!--Formularios-->
					<div id="seia" class="search-form active">
						<h4>Sistema de Evaluación de Impacto Ambiental</h4>
						<br>
						
						<input class="source-cb" type="checkbox" value="seia"> Usar fuente <br><br>
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
						<div class="form-field">
							Tipo de presentación:
							<div class="s-checkboxes">
								<label><input type="checkbox" id="DIA" name="tipo" checked="" value="DIA">DIA</label>
								<label><input type="checkbox" id="EIA" name="tipo" checked="" value="EIA">EIA</label>
							</div>
						</div>
						<hr>
						<div class="form-field">
							Estado:
							<ul class="checkboxes">
								<li><label><input type="checkbox" name="estado" checked="" value="En Calificación">En calificación</label></li>
								<li><label><input type="checkbox" name="estado" checked="" value="Aprobado">Aprobado</label></li>
								<li><label><input type="checkbox" name="estado" checked="" value="Rechazado">Rechazado</label></li>
								<li><label><input type="checkbox" name="estado" checked="" value="No Admitido a Tramitación">No admitido a tramitación</label></li>
								<li><label><input type="checkbox" name="estado" checked="" value="Desistido">Desistido</label></li>
								<li><label><input type="checkbox" name="estado" checked="" value="Revocado">Revocado</label></li>
								<li><label><input type="checkbox" name="estado" checked="" value="No calificado">No calificado</label></li>
								<li><label><input type="checkbox" name="estado" checked="" value="Abandonado">Abandonado</label></li>
								<li><label><input type="checkbox" name="estado" checked="" value="Caducado">Caducado</label></li>
							</ul>
						</div>
						<hr>
						<div class="form-field">
							Sector<br>productivo:
							<ul class="checkboxes">
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Agropecuario">Agropecuario</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Energía">Energía</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Equipamiento">Equipamiento</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Forestal">Forestal</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Infraestructura de Transporte">Infraestructura de transporte</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Infraestructura Hidráulica">Infraestructura hidráulica</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Infraestructura Portuaria">Infraestructura portuaria</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Inmobiliarios">Inmobiliarios</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Instalaciones fabriles varias">Instalaciones fabriles varias</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Minería">Minería</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Pesca y Acuicultura">Pesca y acuicultura</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Planificación Territorial e Inmobiliarios en Zonas">Planificación territorial e inmobiliarios en zonas</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Saneamiento Ambiental">Saneamiento ambiental</label></li>
								<li><label><input type="checkbox" name="sector productivo" checked="" value="Otros">Otros</label></li>
							</ul>
						</div>
					</div>
					<div id="coes" class="search-form">
						<h4>Observatorio de conflictos sociales</h4>
						<br>
						<label><input class="source-cb" type="checkbox" value="coes"> Usar fuente </label>
						<br><br>
						<div id="elementos-demanda">
							<label class="typo__label">Elementos de demanda:</label>
						  <multiselect v-model="value" :options="options" :multiple="true" group-values="vals" group-label="tipo" :group-select="true" placeholder="Type to search" closeOnSelect="false"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
						  <pre class="language-json"><code>{{ value  }}</code></pre>
						</div>
						<div class="form-field">
							Otros elementos de demanda:
							<input type="text" name="">
						</div>
						<div id="grupos-sociales">
							<label class="typo__label">Grupos sociales:</label>
						  <multiselect v-model="value" :options="options" :multiple="true" group-values="vals" group-label="tipo" :group-select="true" placeholder="Type to search" closeOnSelect="false"><span slot="noResult">No hay elementos que concuerden con la búsqueda</span></multiselect>
						  <pre class="language-json"><code>{{ value  }}</code></pre>
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

			//Getting territorial divisions from inital DB load

			var region_vect = <?php echo json_encode($regiones)?>;
			var provincia_vect = <?php echo json_encode($provincias)?>;
			var comuna_vect = <?php echo json_encode($comunas)?>;

			var n_regiones = <?php echo count($regiones)?>;
			var fe_regiones = Array(n_regiones); //stores region objects

		</script>
		<script src="resources/populate_map.js"></script>
		<script src="resources/queries.js"></script>
		<script src="resources/results_display.js"></script>
		<script src="resources/tabs.js"></script>
		<script src="resources/multiselectors.js"></script>

	</div>
</body>
</html>