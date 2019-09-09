var ctx = document.getElementById('myChart');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        datasets: null
    },
    options: {
        responsive:true,
        maintainAspectRatio: false,
        time:{
            parser:'YYYY-MM-DD',
            tooltipFormat: 'll'
        },
        scales:{
            xAxes: [{
                type:       "time",
                scaleLabel: {
                    display:     false,
                    labelString: 'Fecha'
                }
            }],
            yAxes: [{
                scaleLabel: {
                    display:     false,
                    labelString: '#'
                }
            }]
        }
    }
});