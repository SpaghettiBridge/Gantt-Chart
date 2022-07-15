const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
// Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
let value = params.key; // "some_value"
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
            // console.log(stone.parent);
            // console.log(projec.data[0].id);
            if (stone.parent == projec.data[0].id) {
                projec.data.push(stone);
            }
        });
    })
    console.log(testseries2);
    data[0].Tasks.forEach(task => {
        testseries2.forEach(projec => {
            // console.log(task);
            // console.log(projec);
            if (task.parent == projec.data[0].id) {
                projec.data.push(task);
            }
        });
    })
    console.log(testseries2)
    function compare(a, b) {
        if (a.start < b.start) {
            return -1;
        }
        if (a.start > b.start) {
            return 1;
        }
        return 0;
    }

    testseries2[0].data.sort(compare);
    createGantt(testseries2);
})

function createGantt(data) {
    var
        dateFormat = Highcharts.dateFormat,
        defined = Highcharts.defined,
        isObject = Highcharts.isObject;

    Highcharts.ganttChart("uniqueID", {
        series: data,
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: ["printChart", "separator", "downloadPNG", "downloadJPEG", "downloadPDF", "downloadSVG"]
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
                    title: 'Completed',
                    value: status
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

