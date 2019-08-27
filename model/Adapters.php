<?php
	interface Target{
		public function __construct();
		public function closeConnection();
		public function query($comunas, $timeSpan, $extraKWValues);
	}

	class SeiaAdapter implements Target{
		private $psql_con;

		public function __construct(){
			$this->psql_con = pg_connect("host=localhost dbname=zonas_sacrificio user=postgres password=contraseña") or die ("SEIA Adapter Connecion error");
		}

		public function closeConnection(){
			return pg_close($this->psql_con);
		}

		public function query($comunas, $timeSpan, $extraKWValues){
			$cFilter = $this->multiExactValuesFilter("cp", "id_comuna", $comunas);

			$sDate = strtotime($timeSpan[0]);
			$eDate = strtotime($timeSpan[1]);

			$sDate = date('Y-m-d H:i:s', $sDate);
			$eDate = date('Y-m-d H:i:s', $eDate);

			$extraValues = $this->parseExtraValues($extraKWValues);

			//echo "Parsed source specific values:<br>";
			//print_r($extraValues);
			//echo "<br>";

			$pgqs = "SELECT * 
			FROM seia.proyecto as p, seia.comunas_de_proyecto as cp 
			WHERE p.fecha_presentado BETWEEN '".$sDate."' and '".$eDate."'
			".$cFilter."
			".$extraValues."
			and p.id_proyecto = cp.id_proyecto;";

			echo "<br>Query string: <br>".$pgqs;

			$result = pg_query($this->psql_con, $pgqs);
			
			return pg_fetch_all($result);
		}

		private function parseExtraValues($extraKWValues){
			$str = "and p.nombre ILIKE '%".$extraKWValues['nombre']."%'
			and p.titular ILIKE '%".$extraKWValues['titular']."%'";

			if($extraKWValues['inversion']){
				$str .= "and p.inversion > ".$extraKWValues['inversion'];
			}

			$tstr = $this->multiExactValuesFilter("p", "tipo", $extraKWValues['tipo']);
			$estr = $this->multiExactValuesFilter("p", "estado", $extraKWValues['estado']);
			$spstr = $this->multiExactValuesFilter("p", "sector_productivo", $extraKWValues['sector productivo']);

			$str .= $tstr.$estr.$spstr;	

			return $str;
		}

		private function multiExactValuesFilter($tAlias, $attrName, $valueArr){
			$val_str = "";
			if(count($valueArr)>0){
				$val_str = " and ".$tAlias.".".$attrName." in ('".array_shift($valueArr)."'";
				foreach ($valueArr as $value) {
					$val_str .= ", '".$value."'";
				}
				$val_str .= ")";
			}
			return $val_str;
		}
	}

	class CoesAdapter implements Target{
		private $psql_con;

		function __construct(){
			$this->psql_con = pg_connect("host=localhost dbname=zonas_sacrificio user=postgres password=contraseña") or die ("SEIA Adapter Connecion error");
		}

		function closeConnection(){
			return pg_close($this->psql_con);
		}

		function query($comunas, $timeSpan, $extraKWValues){
			$cFilter = "(cp.id_comuna=".$comunas[0];

			for ($i=1; $i < count($comunas); $i++) { 
				$cFilter .= " or cp.id_comuna=".$comunas[$i];
			}

			$cFilter .= ")";

			$pgqs = "SELECT a.*
			FROM coes.accion as a, public.comunas as c
			WHERE ".$cFilter."
			";
		}
	}
?>