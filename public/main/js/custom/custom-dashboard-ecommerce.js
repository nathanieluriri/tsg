/*
-------------------------------------------
    : Custom - Dashboard Ecommerce js :
-------------------------------------------
*/
"use strict";
$(document).ready(function() {
    
    var columnChart1 = function (chartData) {
        var options = {
            series: [{
                name: 'Donations',
                data: Object.values(chartData)
            }],
            chart: {
                type: 'bar',
                height: 200,
                toolbar: {
                    show: false,
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '40%',
                    borderRadius: 5,
                    colors: {
                        backgroundBarColors: ['blue'],
                        backgroundBarOpacity: 1,
                        backgroundBarRadius: 5,
                    },
                },
            },
            colors: ['var(--primary)'],
            xaxis: {
                show: false,
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                labels: {
                    show: true,
                    style: {
                        colors: '#000000',
                        fontSize: '14px',
                        fontFamily: 'Poppins',
                        fontWeight: 'light',
                        cssClass: 'apexcharts-xaxis-label',
                    },
                },
                crosshairs: {
                    show: false,
                },
                categories: Object.keys(chartData)
            },
            yaxis: {
                show: true
            },
            grid: {
                show: true,
            },
            toolbar: {
                enabled: false,
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false
            },
            fill: {
                opacity: 1
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    legend: {
                        position: 'bottom',
                        offsetX: -10,
                        offsetY: 0
                    }
                }
            }],
            tooltip: {
                style: {
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    fontWeight: 'light',
                    color: '#000'
                }
            }
        };
    
        var chart = new ApexCharts(document.querySelector("#apex-area-chart"), options);
        chart.render();
    };


    // Fetch data from Laravel endpoint
    $.ajax({
        url: '/donations-data',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            // Extract values from the fetched data
            var chartData = Object.values(data);
            console.log(chartData);
            // Call the chart function with the fetched data
            columnChart1(data);
        },
        error: function (error) {
            console.error('Error fetching data:', error);
        }
    });

});