
function tabHandler(button,tabContentId){
	var tbuttons = button.parentElement.children;

	for(b of tbuttons)
		b.className = b.className.replace(" active","");

	var tab = document.getElementById(tabContentId);
	var tabs = tab.parentElement.children;

	for(t of tabs)
		t.style.display = "none";

	tab.style.display = "block";
	button.className += " active";
}


//Deprecated
/*
function showForm(event, form){
	
	var tabs = document.getElementsByClassName("search-form");

	for(t of tabs)
		t.style.display = "none";

	var tabbuttons = document.getElementsByClassName("tab-button");
	for(tb of tabbuttons)
		tb.className = tb.className.replace(" active","");

	document.getElementById(form).style.display = "block";

	event.currentTarget.className += " active";
}*/