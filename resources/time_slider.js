function timestamp(str) {
	return new Date(str).getTime();
}

var dSlider = document.getElementById('nouislider');
var startD = document.getElementById('f-inicio');
var endD = document.getElementById('f-fin');

noUiSlider.create(dSlider,{
	range:{
		min: timestamp('1992'),
		max: timestamp('2019')
	},
	step: 24 * 60 * 60 * 1000,
	start:[timestamp('2013'),timestamp('2017')],
	connect: true,
	format: wNumb({
		decimals:0
	})
});

dSlider.noUiSlider.on('update', function (values, handle) {
	var date = new Date(+values[handle]);

	var day = ("0" + date.getDate()).slice(-2);
	var month = ("0" + (date.getMonth() + 1)).slice(-2);

	var value = date.getFullYear()+"-"+(month)+"-"+(day);

	if(handle){
		endD.value = value;
	}
	else{
		startD.value = value;
	}
});

startD.addEventListener('change', function(){
	var date = new Date(this.value);
	dSlider.noUiSlider.set([date.getTime(),null]);
});

endD.addEventListener('change',function(){
	var date = new Date(this.value);
	dSlider.noUiSlider.set([null,date.getTime()]);
});