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
		var r_table = document.getElementById(source + "-table");
		//r_table.innerHTML= "";

		var t_data=[];
		for(var result of data[source]){
			var table_row = [
				result.name,
				new Date(result.time_span.start).toLocaleDateString(),
				(result.time_span.fin ? new Date(result.time_span.fin).toLocaleDateString() : "-"),
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
			perPageSelect: false,
			labels:{
				placeholder:"Buscar...",
				perPage:"{select} filas por página",
				noRows:"No se obtuvieron resultados",
				info:"{start} - {end} de {rows}"
			}
		});

		var rowsData = dataTable.rows().dt;

		for(var ar in rowsData.data){
			var id = rowsData.data[ar].lastChild.data;

			rowsData.activeRows[ar].name = id;
			rowsData.activeRows[ar].source = source;
			
			var rowName = rowsData.activeRows[ar].firstElementChild;
			rowName.title = rowName.innerHTML;

			var onClick = function(){
				var httpR = new XMLHttpRequest();
				var id = this.name;
				var source = this.source;
				var rUrl = "controller/detailsQ.php?id="+id+"&s="+source;

				httpR.onreadystatechange = function(){
					if(this.readyState == 4 && this.status == 200){
						try{
							var details = JSON.parse(this.responseText);
							window.displayDetails(details,source);
						}
						catch(err){
							console.log(err);
							console.log(this.responseText);
						}
					}
				}
				httpR.open("GET",rUrl,true);
				httpR.send();
			};
			
			rowsData.activeRows[ar].addEventListener("click",onClick);
		}
		window.result_tables[source] = dataTable;
	}
}