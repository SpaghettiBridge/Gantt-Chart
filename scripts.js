const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

let value = params.key;
let app = params.app;



console.log(app);
console.log(value);
sendWebhookData(value, app).then(result => {

    data = JSON.parse(result)
    // console.log(data);
    var testseries2 = [];
    var projectdata2 = {
        name: data[0].field_9,
        data: [{
            name: data[0].field_9,
            id: data[0].id,
            Owner: data[0].field_34_raw[0].identifier
        }]
    };
    testseries2.push(projectdata2);

    data[0].Milestones.forEach(stone => {
        testseries2.forEach(projec => {

            if (stone.parent == projec.data[0].id) {
                projec.data.push(stone);
            }
        });
    })

    data[0].Tasks.forEach(task => {
        testseries2[0].data.push(task);
    })

    function compare(a, b) {
        if (a.start < b.start) {
            return -1;
        }
        if (a.start > b.start) {
            return 1;
        }
        return 0;
    }
    console.log(testseries2);
    testseries2[0].data.sort(compare);
    createGantt(testseries2);
})

function createGantt(data) {
    var
        dateFormat = Highcharts.dateFormat,
        defined = Highcharts.defined,
        isObject = Highcharts.isObject;

    let chart = Highcharts.ganttChart("uniqueID", {
        series: data,
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: ["printChart", "separator", "downloadPNG", "downloadJPEG", "downloadPDF", "downloadSVG"]
                },
                printButton: {
                    text: 'Active',
                    onclick: function () {
                        var j = 0;
                        console.log(chart);
                        let input = "active",
                            points = chart.series[0].points,
                            filteredPoint = points.filter(point => point.Status == input);
                        if (j == 0) {
                            // if (filteredPoint.length) {
                            console.log("filtering by active");
                            // newData[filteredPoint[0].index] = filteredPoint[0].y
                            // newData.push(null) //--- extra null as a workaround for bug
                            // chart.series[0].update({
                            //     data: filteredPoint
                            // })
                            j = 1;
                            // }

                        } else if (j == 1) {
                            console.log("Reset to all tasks");
                            // chart.series[0].update({
                            //     data: data
                            // })
                            j = 0;
                        }
                    }
                }
            }
        },
        tooltip: {
            pointFormatter: function () {
                var point = this,
                    format = '%e. %b',
                    options = point.options,
                    completed = options.completed,
                    amount = isObject(completed) ? completed.amount : completed,
                    status = ((amount || 0) * 100) + '%',
                    lines;

                lines = [{
                    value: point.name,
                    style: 'font-weight: bold;'
                }, {
                    title: 'Start',
                    value: dateFormat(format, point.start)
                }, {
                    visible: !options.milestone,
                    title: 'End',
                    value: dateFormat(format, point.end)
                }, {
                    title: 'Status',
                    value: point.Status
                }, {
                    title: 'Owner',
                    value: options.owner || 'unassigned'
                }];

                return lines.reduce(function (str, line) {
                    var s = '',
                        style = (
                            defined(line.style) ? line.style : 'font-size: 0.8em;'
                        );
                    if (line.visible !== false) {
                        s = (
                            '<span style="' + style + '">' +
                            (defined(line.title) ? line.title + ': ' : '') +
                            (defined(line.value) ? line.value : '') +
                            '</span><br/>'
                        );
                    }
                    return str + s;
                }, '');
            }
        },

        xAxis: {
            currentDateIndicator: true,
            // min: new Date(oldDate),
            // max: new Date(newDate),
        },
        accessibility: {
            keyboardNavigation: {
                seriesNavigation: {
                    mode: 'serialize'
                }
            },
            point: {
                descriptionFormatter: function (point) {
                    var completedValue = point.completed ?
                        point.completed.amount || point.completed : null,
                        completed = completedValue ?
                            ' Task ' + Math.round(completedValue * 1000) / 10 + '% completed.' :
                            '',
                        dependency = point.dependency &&
                            point.series.chart.get(point.dependency).name,
                        dependsOn = dependency ? ' Depends on ' + dependency + '.' : '';

                    return Highcharts.format(
                        point.milestone ?
                            '{point.yCategory}. Milestone at {point.x:%Y-%m-%d}. Owner: {point.owner}.{dependsOn}' :
                            '{point.yCategory}.{completed} Start {point.x:%Y-%m-%d}, end {point.x2:%Y-%m-%d}. Owner: {point.owner}.{dependsOn}',
                        { point, completed, dependsOn }
                    );
                }
            }
        },
        lang: {
            accessibility: {
                axis: {
                    xAxisDescriptionPlural: 'The chart has a two-part X axis showing time in both week numbers and days.'
                }
            }
        }
    });
}

function filterFunction() {
    console.log(document.getElementById('myInput').value)
    let input = document.getElementById('myInput'),
        points = chart.series[1].points,
        filteredPoint = points.filter(point => point.category == input.value);

    if (filteredPoint.length) {
        let newData = [];
        for (let i in data) {
            newData.push(null)
        }

        newData[filteredPoint[0].index] = filteredPoint[0].y
        newData.push(null) //--- extra null as a workaround for bug

        chart.series[0].update({
            data: newData
        })
    } else {
        chart.series[0].update({
            data: data
        })
    }
}


function sendWebhookData(project, app) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'https://hook.integromat.com/ucj3s2a4ryghge2o3v9utlq81tudedp9',
            type: 'POST',
            data: {
                project: project,
                app: app
            },
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });

}

