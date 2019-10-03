<?php
ini_set('display_errors', 1);
error_reporting(E_ALL ^ E_NOTICE);
//This should be better abstracted, could be done via ajax, and adding a loadscreen
require_once "vendor/autoload.php";

$pgconnection = pg_connect("host=localhost dbname=zonas_sacrificio user=postgres password=contraseña") or die ("SEIA Adapter Connecion error");

$mdb_audiencias = (new MongoDB\Client)->datos_lobby->audiencias;


$simpl_tol = 0.0075;

//MAP info -- this can be done faster just ask for everything and then process

//Method 1 query for regiones, then for each region, then for each provincia
/*
$t1 = microtime(true);
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

echo "method 1 time:".(microtime(true)-$t1)."s<br>";*/

//Method 2 query for all the tables and then process (storing same as method 1 but could be better)
$t2 = microtime(true);
$rqs = "SELECT r.nombre, r.id, ST_AsGeoJSON(ST_Simplify(r.geom,$simpl_tol))
	FROM public.regiones as r
	WHERE r.id<16;";
$pqs = "SELECT p.nombre, p.id, p.id_region, ST_AsGeoJSON(ST_Simplify(p.geom,$simpl_tol))
	FROM public.provincias as p
	WHERE p.id_region<16;";
$cqs = "SELECT c.nombre, c.id, c.id_provincia, ST_AsGeoJSON(ST_Simplify(c.geom,$simpl_tol))
	FROM public.comunas as c
	WHERE c.id_provincia NOT IN (56,57,58,59);";

$r_res = pg_query($pgconnection, $rqs);
$p_res = pg_query($pgconnection, $pqs);
$c_res = pg_query($pgconnection, $cqs);

$r = pg_fetch_all($r_res);
$p = pg_fetch_all($p_res);
$c = pg_fetch_all($c_res);

$provincias2 = array();
foreach ($r as $reg) {
	$provincias2[$reg['nombre']] = [];
	foreach($p as $key => $prov){
		if($prov['id_region']==$reg['id']){
			$provincias2[$reg['nombre']][] = $prov;
			unset($p[$key]);
		}
	}
}
//echo print_r($p)."<br>";
$p = pg_fetch_all($p_res);

$comunas2 = array();
foreach ($p as $prov) {
	$comunas2[$prov['nombre']] = [];
	foreach ($c as $key => $com) {
		if($com['id_provincia']==$prov['id']){
			$comunas2[$prov['nombre']][] = $com;
			unset($c[$key]);
		}
	}
}

//echo "method 2 time:".(microtime(true)-$t2)."s<br>";
//print_r($r);
//print_r($p);
//print_r($c);

/*
//Method 3 query to get json object directly
$t3 = microtime(true);
$improve_this_maybe = "SELECT r.id, ST_AsGeoJSON(ST_Simplify(r.geom,$simpl_tol)), json_agg(p1.provincias) as provincias
	FROM public.regiones as r
	INNER JOIN
		(SELECT p.id, p.id_region, json_agg(json_build_object('id',p.id,'st_asgeojson',ST_AsGeoJSON(ST_Simplify(p.geom,$simpl_tol)),'comunas',c1.comunas)) as provincias
		FROM public.provincias as p
		INNER JOIN
			(SELECT c.id_provincia, json_agg(json_build_object('id',c.id,'st_asgeojson',ST_AsGeoJSON(ST_Simplify(c.geom,$simpl_tol)))) as comunas
			FROM public.comunas as c
			GROUP BY c.id_provincia) as c1
		ON p.id = c1.id_provincia
		GROUP BY p.id, p.id_region) as p1
	ON r.id=p1.id_region
	GROUP BY r.id , ST_AsGeoJSON(ST_Simplify(r.geom,0.0075))";

$m3_result = pg_query($pgconnection, $improve_this_maybe);

echo "method 3 time:".(microtime(true)-$t3)."s<br>";*/


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

//Lobby query info
$materias = array();
$materias_c = $mdb_audiencias->aggregate([
	['$unwind'=>'$materias'],
	['$group'=>['_id'=>'$materias.nombre']],
	['$sort'=>['_id'=>1]]
]);

foreach($materias_c as $c){
	array_push($materias, $c['_id']);
}

?>