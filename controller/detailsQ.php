<?php
	ini_set('display_errors', 1);
	error_reporting(E_ALL ^ E_NOTICE);

	include_once "../model/Adapters.php";
	//se llama desde si mismo

	$source = $_REQUEST['s'];
	$id = $_REQUEST['id'];

	switch ($source) {
		case 'seia':
			$db = new SeiaAdapter();
			break;
		case 'coes':
			$db = new CoesAdapter();
			break;
		case 'lobby':
			$db = new LobbyAdapter();
			break;
		default:
			trigger_error("Unknown source for detailsQ");
			break;
	}

	$result = $db->idQuery($id);

	$db->closeConnection();

	echo json_encode($result);
?>