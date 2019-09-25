<?php

	ini_set('display_errors', 1);
	error_reporting(E_ALL ^ E_NOTICE);

	require_once "./vendor/autoload.php";

	$audiencias = (new MongoDB\Client)->datos_lobby->audiencias;
	$psql_con = pg_connect("host=localhost dbname=zonas_sacrificio user=postgres password=contraseña") or die ("SEIA Adapter Connecion error");

	//test if all comunas have a corresponding name in psql
	$comunas = $audiencias->distinct("comuna");
	$pgqs = "SELECT count(*) FROM public.comunas as c WHERE c.valid_until is null and c.nombre ILIKE ";

	//print_r($comunas);

	foreach ($comunas as $comuna) {
		$cinpsql = pg_fetch_row(pg_query($psql_con,$pgqs."'".$comuna."';"))[0];
		if($cinpsql!=1)
			echo $comuna.$cinpsql."<br>";
	}

	//The other way around
	$pgqs2 = "SELECT c.nombre FROM public.comunas as c WHERE c.valid_until is null;";
	$comunas_pg = pg_fetch_all(pg_query($psql_con,$pgqs2));

	foreach ($comunas_pg as $comuna) {
		echo $audiencias->aggregate([
			['$match'=>['comuna'=>$comuna['nombre']]],
			['$group'=>['_id'=>]]
		]);
	}

	print_r($comunas_pg);
	echo "";
	//{'$regex':$comuna['nombre'],'$options':'i'}
?>