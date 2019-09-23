
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

function resultsTabHandler(button,tabContentId){
	tabHandler(button,tabContentId);
	var source = tabContentId.split('-')[0];
	setSource(source);
}