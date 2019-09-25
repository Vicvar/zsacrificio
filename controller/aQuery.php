<?php 
	ini_set('display_errors', 1);
	error_reporting(E_ALL ^ E_NOTICE);

	include_once "../model/Adapters.php";
	//se llama desde si mismo

	$comunas = json_decode($_REQUEST['c']);
	$timeSpan = json_decode($_REQUEST['t']);
	$extraKW = json_decode($_REQUEST['ekw'],true);
	$sources = json_decode($_REQUEST['s']);

	//echo "KW values from url:<br>";
	//print_r($extraKW);
	//echo "<br>";

	function querySource($source, $comunas, $timeSpan, $extraKW){
		switch ($source) {
			case 'seia':
				$db = new SeiaAdapter();
				break;
			case 'coes':
				$db = new CoesAdapter();
				break;
			default:
				trigger_error("Unknown source for aQuery: ".$source);
				break;
		}
		$result = $db->query($comunas, $timeSpan, $extraKW);
		$db->closeConnection();
		return $result;
	}

	$results = array();

	foreach($sources as $source){
		$result = querySource($source, $comunas, $timeSpan, $extraKW[$source]);
		$results[$source] = json_decode($result);
	}

	//print_r($results);

	echo json_encode($results);
?>