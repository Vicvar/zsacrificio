//funcion que agrega resultados a la tabla.
//recibe un arreglo de objetos que tienen id, name, time_span, comunas, latitud y longitud (pueden ser null).
import {DataTable} from "https://unpkg.com/simple-datatables?module"

window.result_tables ={
	seia:null,
	coes:null
};

//Solo debería cambiar el contenido de la pestaña de resultados, a lo más "activarla"
window.setTables =  function(data){
	for(source in data){
		if(result_tables[source]!=null)
			result_tables[source].destroy();
		var r_table_id = source + "-table";
		var r_table = document.getElementById(r_table_id);

		var t_data=[];
		for(var result of data[source]){
			var table_row = [
				result.name,
				result.time_span.start,
				(result.time_span.fin ? result.time_span.fin : "-"),
				result.id
			];
			t_data.push(table_row);
		}
		var dataTable = new DataTable(r_table,{
			columns:[
				{
					select:0,
					sortable: false
				},
				{
					select:[1,2],
					type: "date",
					format: "DD/MM/YYY"
				},
				{
					select:3,
					hidden:true
				}
			],
			data:{
				"headings":[
					"Nombre",
					"Fecha inicio",
					"Fecha fin",
					"id"
				],
				"data":t_data
			},
			perPage: 10,
			perPageSelect: false
		});
		window.result_tables[source] = dataTable;
	}
}