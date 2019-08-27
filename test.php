<?php
	ini_set('display_errors', 1);
	error_reporting(E_ALL ^ E_NOTICE);

	$a = array("hola", "que", "hace");


	$h = array_shift($a);
	$q = array_shift($a);

	foreach ($a as $arg) {
		echo $arg;
		trigger_error("doing something");
	}

	echo "ok";
?>