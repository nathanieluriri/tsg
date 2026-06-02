/*
---------------------------------
    : Custom - Apex Charts js :
---------------------------------
*/
"use strict";
$(document).ready(function() {
    
    /* -----  Apex Area Chart ----- */
    var options = {
        chart: {
            height: 300,
            type: 'area',
            toolbar: {
                show: false
            },
            zoom: {
              type: 'x',
              enabled: false,
              autoScaleYaxis: true
            },
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
        },
        colors: ['#1ba4fd', '#3dcd8b'],
        series: [{
            name: 'Inward',
            data: [31, 40, 28, 51, 42, 109, 100]
        }],
        legend: {
            show: false,
        },
        xaxis: {
            type: 'datetime',
            categories: ["2018-09-19T00:00:00", "2018-09-19T01:30:00", "2018-09-19T02:30:00", "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00", "2018-09-19T06:30:00"],
            axisBorder: {
                show: true, 
                color: 'rgba(0,0,0,0.05)'
            },
            axisTicks: {
                show: true, 
                color: 'rgba(0,0,0,0.05)'
            }
        },
        grid: {
            row: {
                colors: ['transparent', 'transparent'], opacity: .2
            },
            borderColor: 'rgba(0,0,0,0.05)'
        },
        tooltip: {
            x: {
                format: 'dd/MM/yy HH:mm'
            },
        }
    }
    var chart = new ApexCharts(
        document.querySelector("#apex-area-chart"),
        options
    );
    chart.render();
    
    

});