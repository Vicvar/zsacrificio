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
			$cFilter = $this->multExactValuesFilter("cp1", "id_comuna", $comunas);

			$sDate = strtotime($timeSpan[0]);
			$eDate = strtotime($timeSpan[1]);

			$sDate = date('Y-m-d H:i:s', $sDate);
			$eDate = date('Y-m-d H:i:s', $eDate);

			$extraValues = $this->processExtraValues($extraKWValues);

			//echo "Parsed source specific values:<br>";
			//print_r($extraValues);
			//echo "<br>";

			$pgqs = "SELECT json_agg(res)
			FROM 
				(SELECT *, json_build_object('start', p.fecha_presentado, 'end', p.fecha_calificado) as time_span
				FROM seia.proyecto as p 
				INNER JOIN 
					(SELECT cp1.id_proyecto, json_agg(cp1.id_comuna) as comunas
					FROM seia.comunas_de_proyecto as cp1
					WHERE ".$cFilter." GROUP BY cp1.id_proyecto) as cp
				ON p.id_proyecto = cp.id_proyecto 
				WHERE p.fecha_presentado BETWEEN '".$sDate."' and '".$eDate."'
				".$extraValues.") as res;";

			//echo "<br>Query string: <br>".$pgqs;

			$result = pg_query($this->psql_con, $pgqs);
			
			return pg_fetch_all($result)[0]['json_agg'];
		}

		private function processExtraValues($extraKWValues){
			$str = "and p.nombre ILIKE '%".$extraKWValues['nombre']."%'
			and p.titular ILIKE '%".$extraKWValues['titular']."%'";

			if($extraKWValues['inversion']){
				$str .= "and p.inversion > ".$extraKWValues['inversion'];
			}

			$tipos = $extraKWValues['tipo'];
			if(count($tipos)>0)
				$str .= " and".$this->multExactValuesFilter("p", "tipo", $tipos);

			$estados = $extraKWValues['estado'];
			if(count($estados)>0)
				$str .= " and".$this->multExactValuesFilter("p", "estado", $estados);
			
			$sect_prod = $extraKWValues['sector-productivo'];
			if(count($sect_prod))
				$str .= " and".$this->multExactValuesFilter("p", "sector_productivo", $sect_prod);

			return $str;
		}

		private function multExactValuesFilter($tAlias, $attrName, $valueArr){
			$val_str = "";
			if(count($valueArr)>0){
				$val_str = " ".$tAlias.".".$attrName." in ('".array_shift($valueArr)."'";
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
			$cFilter = $this->getComunasFilter("c", $comunas);

			$comT = "";
			if(count($comunas)>0)
				$comT = ", public.comunas as c";


			$sDate = strtotime($timeSpan[0]);
			$eDate = strtotime($timeSpan[1]);

			$sDate = date('Y-m-d H:i:s', $sDate);
			$eDate = date('Y-m-d H:i:s', $eDate);


			$extraValues = $this->processExtraValues($extraKWValues);
			//echo $extraValues;

			$pgqs = "SELECT a.*
			FROM coes.accion as a".$comT."
			WHERE a.fecha_inicio BETWEEN '".$sDate."' and '".$eDate."'
			".$cFilter."
			".$extraValues.";";

			//echo "<br><br>".$pgqs;

			$result = pg_query($this->psql_con, $pgqs);

			return pg_fetch_all($result);
		}

		private function getComunasFilter($cAlias,$comunas){
			$str = "";

			if(count($comunas)>0){
				$str = "and ".$cAlias.".id IN (".array_shift($comunas);
				foreach ($comunas as $value) {
					$str .= ", ".$value;
				}
				$str .= ") and a.comuna=".$cAlias.".cut::integer";
			}
			return $str;
		}

		private function processExtraValues($extraValues){
			$str = "";

			$presencia_carabineros = $extraValues['carabineros'];
			$fuerzas_disuasivas = $extraValues['fuerzas-disuasivas'];
			$perjuicios = $extraValues['perjuicios-participantes'];
			
			$campos_conflictividad = $extraValues['campos-conflictividad'];
			$elementos_demanda = array_merge($extraValues['elementos-demanda'],$extraValues['otros-elementos-demanda']);
			$grupos_sociales = $extraValues['grupos-sociales'];
			$actores = $extraValues['actores'];

			if(count($presencia_carabineros)==1){
				$str .=" and a.presencia_carabineros='".$presencia_carabineros[0]."'";
			}

			if(count($fuerzas_disuasivas)==1 || count($fuerzas_disuasivas)==2){
				foreach ($fuerzas_disuasivas as $fd)
					$str .= " and a.".$fd."='1'";
			}

			if(count($perjuicios)==1 || count($perjuicios)==2){
				foreach ($perjuicios as $p)
					$str .= " and a.".$p."='1'";
			}

			$str .= $this->filterTableAttributes("campos_conflictividad_accion","cca","id_campo_conflictividad",$campos_conflictividad);
			$str .= $this->filterTableAttributes("elementos_demanda_accion","eda","id_elemento_demanda",$elementos_demanda);
			$str .= $this->filterTableAttributes("grupos_accion","gsa","id_grupo_social",$grupos_sociales);

			//actor can be in two tables
			if(count($actores)>0){
				$str .= " and a.id_accion in";
				$str .= "(SELECT actacc.id_accion FROM (SELECT * FROM coes.actores_demandantes UNION SELECT * FROM coes.actores_demandados) as actacc ";
				$str .= "WHERE actacc.id_actor IN (".array_shift($actores);
				foreach ($actores as $actor) {
					$str .= ", ".$actor;
				}
				$str .= ") GROUP BY actacc.id_accion)";
			}

			return $str;
		}

		private function filterTableAttributes($table, $tAlias, $attrName, $valueArr){
			$r_str = "";
			if(count($valueArr)>0){
				$r_str .= " and a.id_accion in";
				$r_str .= "(SELECT ".$tAlias.".id_accion FROM coes.".$table." as ".$tAlias." ";
				$r_str .= "WHERE ".$tAlias.".".$attrName." IN (".array_shift($valueArr);
				foreach ($valueArr as $value) {
					$r_str .= ", ".$value;
				}
				$r_str .= ") GROUP BY ".$tAlias.".id_accion)";
			}
			return $r_str;
		}
	}
?>