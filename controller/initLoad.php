<?php
	$pgconnection = pg_connect("host=localhost dbname=zonas_sacrificio user=postgres password=contraseña") or die ("SEIA Adapter Connecion error");

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
?>