<?php
	//This should be better abstracted, could be done via ajax, and adding a loadscreen

	$pgconnection = pg_connect("host=localhost dbname=zonas_sacrificio user=postgres password=contraseña") or die ("SEIA Adapter Connecion error");

	//MAP info -- this can be done faster just ask for everything and then process
	$simpl_tol = 0.0075;

	$regiones_q = "SELECT r.nombre, r.id, ST_AsGeoJSON(ST_Simplify(r.geom,$simpl_tol)) FROM public.regiones as r WHERE r.id < 16;";

	$regiones_r = pg_query($pgconnection,$regiones_q);

	$regiones = pg_fetch_all($regiones_r);

	$provincias = array();
	for($i = 0; $i < count($regiones); $i++){

		$provincias_q = "SELECT p.nombre, p.id, ST_AsGeoJSON(ST_Simplify(p.geom,$simpl_tol)) FROM public.provincias as p WHERE p.id_region=".$regiones[$i]['id'].";";

		$provincias_r = pg_query($pgconnection,$provincias_q);

		$provincias[$regiones[$i]['nombre']] = pg_fetch_all($provincias_r);
	}

	$comunas = array();
	foreach($provincias as $r => $ps){
		for($i = 0; $i < count($ps); $i++){
			$comunas_q = "SELECT c.nombre, c.id, ST_AsGeoJSON(ST_Simplify(c.geom,$simpl_tol)) FROM public.comunas as c WHERE c.id_provincia =".$ps[$i]['id'].";";

			$comunas_r = pg_query($pgconnection, $comunas_q);

			$comunas[$ps[$i]['nombre']] = pg_fetch_all($comunas_r);
		}
	}

	function getTable($sche, $tabl, $conn){
		$query = "SELECT * FROM ".$sche.".".$tabl.";";
		$result = pg_query($conn, $query);
		return pg_fetch_all($result);
	}

	function getTableSelect($sche, $tabl, $atts, $conn){
		$selection = "";
		foreach ($atts as $attr) {
			$selection.=" ".$tabl.".".$attr;
		}
		$query = "SELECT".$selection." FROM ".$sche.".".$tabl.";";
		$result = pg_query($conn, $query);
		return pg_fetch_all($result);
	}

	function getPossibleValues($sche, $tabl, $attr, $conn){
		$query = "SELECT ".$sche.".".$tabl.".".$attr."
		FROM ".$sche.".".$tabl."
		GROUP BY ".$sche.".".$tabl.".".$attr.";";
		$result = pg_query($conn, $query);
		return pg_fetch_all($result);
	}

	//SEIA query info
	$tipo_presentacion = getPossibleValues("seia","proyecto","tipo",$pgconnection);
	$estado = getPossibleValues("seia","proyecto","estado",$pgconnection);
	$sector_productivo = getPossibleValues("seia","proyecto","sector_productivo",$pgconnection);


	//COES query info
	$elemento_demanda = getTable("coes", "elemento_demanda",$pgconnection);

	$tipo_elemento_demanda = getTable("coes", "tipo_elemento_demanda",$pgconnection);

	$grupo_social = getTable("coes","grupo_social",$pgconnection);

	$actor = getTable("coes", "actor", $pgconnection);

	$tipo_grupo_social = getTable("coes","tipo_grupo_social",$pgconnection);

	$campo_conflictividad = getTable("coes", "campo_conflictividad", $pgconnection);

	$tactica_protesta = getTable("coes", "tactica_protesta", $pgconnection);

	$medio = getTable("coes", "medio", $pgconnection);
?>