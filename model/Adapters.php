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
			$sComunas .= $this->multExactValuesFilter("cp1", "id_comuna", $comunas);

			if(count($comunas)>0)
				$cFilter = "(SELECT *
				FROM seia.proyecto as p1
				WHERE p1.id_proyecto in (SELECT id_proyecto
					FROM seia.comunas_de_proyecto as cp1
					WHERE ".$sComunas."
					GROUP BY cp1.id_proyecto))";
			else
				$cFilter = "seia.proyecto";

			$sDate = strtotime($timeSpan[0]);
			$eDate = strtotime($timeSpan[1]);

			$sDate = date('Y-m-d H:i:s', $sDate);
			$eDate = date('Y-m-d H:i:s', $eDate);

			$extraValues = $this->processExtraValues($extraKWValues);

			//echo "Parsed source specific values:<br>";
			//print_r($extraValues);
			//echo "<br>";

			/* OLD QUERY GETS ONLY SELECTED COMUNAS OF PROJECTS
			$pgqs = "SELECT json_agg(res)
			FROM 
				(SELECT *, json_build_object('start', p.fecha_presentado, 'end', p.fecha_calificado) as time_span
				FROM seia.proyecto as p 
				INNER JOIN 
					(SELECT cp1.id_proyecto, json_agg(cp1.id_comuna) as comunas
					FROM seia.comunas_de_proyecto as cp1
					".$cFilter." GROUP BY cp1.id_proyecto) as cp
				ON p.id_proyecto = cp.id_proyecto 
				WHERE p.fecha_presentado BETWEEN '".$sDate."' and '".$eDate."'
				".$extraValues.") as res;";*/

			$pgqs = "SELECT json_agg(res)
			FROM (SELECT p.id_proyecto, p.nombre, p.tipo, p.tipologia, p.titular, p.inversion, p.estado, p.fecha_presentado, p.fecha_calificado, p.sector_productivo, p.latitud, p.longitud, json_build_object('start', p.fecha_presentado, 'end', p.fecha_calificado) as time_span, json_agg(cp.id_comuna) as comunas
			FROM ".$cFilter." as p
				INNER JOIN seia.comunas_de_proyecto as cp
				ON p.id_proyecto = cp.id_proyecto
			WHERE p.fecha_presentado BETWEEN '".$sDate."' and '".$eDate."' ".$extraValues."
			GROUP BY p.id_proyecto, p.nombre, p.tipo, p.tipologia, p.titular, p.inversion, p.estado, p.fecha_presentado, p.fecha_calificado, p.sector_productivo, p.latitud, p.longitud) as res;";

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


			$accionValues = $this->extraAccionValues($extraKWValues);
			$tableValues = $this->extraTableValues($extraKWValues);
			//echo $extraValues;

			//OLD QUERY, NOT WORKING
			/*
			$pgqs = "SELECT a.*
			FROM coes.accion as a".$comT."
			WHERE a.fecha_inicio BETWEEN '".$sDate."' and '".$eDate."'
			".$cFilter."
			".$extraValues.";";*/

			$pgqs = "SELECT json_agg(res)
				FROM (SELECT a.*,
				(SELECT json_agg(act1.nombre) from coes.actores_demandados as ados inner join coes.actor as act1 on ados.id_actor=act1.id_actor where ados.id_accion = a.id_accion) as actores_demandados,
				(SELECT json_agg(act2.nombre) from coes.actores_demandantes as antes inner join coes.actor as act2 on antes.id_actor=act2.id_actor where antes.id_accion = a.id_accion) as actores_demandantes,
				(SELECT json_agg(cc.nombre) from coes.campos_conflictividad_accion as cca inner join coes.campo_conflictividad as cc on cca.id_campo_conflictividad=cc.id_campo_conflictividad where cca.id_accion = a.id_accion) as campos_conflictividad,
				(SELECT json_agg(ed.nombre) from coes.elementos_demanda_accion as eda inner join coes.elemento_demanda as ed on eda.id_elemento_demanda=ed.id_elemento_demanda where eda.id_accion = a.id_accion) as elementos_demanda,
				(SELECT json_agg(gs.nombre) from coes.grupos_accion as ga inner join coes.grupo_social as gs on ga.id_grupo_social=gs.id_grupo_social where ga.id_accion = a.id_accion) as grupos_sociales,
				(SELECT json_agg(o.nombre) from coes.organizaciones_accion as oa inner join coes.organizacion as o on o.id_organizacion=oa.id_organizacion where oa.id_accion = a.id_accion) as organizaciones,
				(SELECT json_agg(tp.nombre) from coes.tacticas_protesta_accion as tpa inner join coes.tactica_protesta as tp on tpa.id_tactica_protesta=tp.id_tactica_protesta where tpa.id_accion = a.id_accion) as tacticas_protesta,
				json_build_object('start',a.fecha_inicio,'end',a.fecha_fin) as time_span,
				json_build_array(c.id) as comunas
				FROM public.comunas as c, ".$tableValues." 
				    
				WHERE a.fecha_inicio BETWEEN '".$sDate."' and '".$eDate."' ".$accionValues." ".$cFilter." and a.comuna=c.cut::integer and c.valid_until is NULL) as res;";

			//echo "<br><br>".$pgqs;

			$result = pg_query($this->psql_con, $pgqs);

			return pg_fetch_all($result)[0]['json_agg'];
		}

		private function getComunasFilter($cAlias,$comunas){
			$str = "";

			if(count($comunas)>0){
				$str = "and ".$cAlias.".id IN (".array_shift($comunas);
				foreach ($comunas as $value) {
					$str .= ", ".$value;
				}
				$str .= ")";
			}
			return $str;
		}

		private function extraAccionValues($extraValues){
			$str = "";

			$presencia_carabineros = $extraValues['carabineros'];
			$fuerzas_disuasivas = $extraValues['fuerzas-disuasivas'];
			$perjuicios = $extraValues['perjuicios-participantes'];

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

			return $str;
		}

		private function extraTableValues($extraValues){

			$str = "(SELECT a1.* 
				FROM coes.accion as a1
				WHERE a1.id_accion in (";

			$inters = 0;

			$campos_conflictividad = $extraValues['campos-conflictividad'];
			$elementos_demanda = array_merge($extraValues['elementos-demanda'],$extraValues['otros-elementos-demanda']);
			$grupos_sociales = $extraValues['grupos-sociales'];
			$actores = $extraValues['actores'];

			if(count($campos_conflictividad)==0 && count($elementos_demanda)==0 && count($grupos_sociales)==0 && count($actores)==0)
				return "coes.accion as a";

			if(count($campos_conflictividad)>0){
				$str .= $this->filterTableAttributes("campos_conflictividad_accion","cca","id_campo_conflictividad",$campos_conflictividad);
				$inters = 1;
			}
			if(count($elementos_demanda)){
				if($inters)
					$str .= " INTERSECT ";
				else
					$inters = 1;
				$str .= $this->filterTableAttributes("elementos_demanda_accion","eda","id_elemento_demanda",$elementos_demanda);
			}
			if(count($grupos_sociales)>0){
				if($inters)
					$str .= " INTERSECT ";
				else
					$inters = 1;
				$str .= $this->filterTableAttributes("grupos_accion","gsa","id_grupo_social",$grupos_sociales);
			}
			if(count($actores)){
				if($inters)
					$str .= " INTERSECT ";
				else
					$inters = 1;
				$str .= "(".$this->filterTableAttributes("actores_demandados","ados","id_actor",$actores);
				$str .= " UNION ";
				$str .= $this->filterTableAttributes("actores_demandantes","antes","id_actor",$actores).")";
			}

			$str .= ")) as a";
			return $str;
		}

		private function filterTableAttributes($table, $tAlias, $attrName, $valueArr){
			$r_str = "";
			if(count($valueArr)>0){
				$r_str .= "(SELECT id_accion FROM coes.".$table." as ".$tAlias." \n";
				$r_str .= "WHERE ".$tAlias.".".$attrName." IN (".array_shift($valueArr);
				foreach ($valueArr as $value) {
					$r_str .= ", ".$value;
				}
				$r_str .= ")\n GROUP BY ".$tAlias.".id_accion)\n";
			}
			return $r_str;
		}
	}
?>