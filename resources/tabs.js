function showForm(event, form){
	
	var tabs = document.getElementsByClassName("search-form");

	for(t of tabs)
		t.style.display = "none";

	var tabbuttons = document.getElementsByClassName("tab-button");
	for(tb of tabbuttons)
		tb.className = tb.className.replace(" active","");

	document.getElementById(form).style.display = "block";

	event.currentTarget.className += " active";
}