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
            tooltipFormat: 'll',
            displayFormats:{
                day: 'DD MM YYY',
                week: 'll',
                month: 'MMM YYYY',
                year:'YYYY'
            }
        },
        scales:{
            xAxes: [{
                type:"time",
                scaleLabel: {
                    display:     false,
                    labelString: 'Fecha'
                },
                distribution: 'linear'
            }],
            yAxes: [{
                scaleLabel: {
                    display:     false,
                    labelString: '#'
                },
                ticks:{
                    beginAtZero: true
                }
            }]
        },
        ticks:{
            source: 'data'
        }
    }
});