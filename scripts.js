const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});

let value = params.key;
let app = params.app;

function compare(a, b) {
    if (a.start < b.start) {
        return -1;
    }
    if (a.start > b.start) {
        return 1;
    }
    return 0;
}

// console.log(app);
// console.log(value);

var gData = sendWebhookData(value, app).then(result => {
    console.log(result);
    var data = result
    // console.log(data);
    var testseries2 = [];
    var projectdata2 = {
        name: data.GanttData[0].Name,
        data: [{
            name: data.GanttData[0].Name,
            id: data.GanttData[0].id,
            Owner: data.GanttData[0].ProjectManager_raw[0].identifier,
            Status: data.GanttData[0].Status
        }]
    };
    testseries2.push(projectdata2);

    data.GanttData[2].milestones.forEach(stone => {
        testseries2.forEach(projec => {

            if (stone.parent == projec.data[0].id) {
                projec.data.push(stone);
            }
        });
    })

    data.GanttData[1].Actions.forEach(task => {
        testseries2[0].data.push(task);
    })


    // console.log(testseries2);
    testseries2[0].data.sort(compare);

    return testseries2;
})

async function getData() {
    let d = await gData;
    // console.log(d);
    createGantt(d);
}

getData();



function createGantt(data) {

    var
        dateFormat = Highcharts.dateFormat,
        defined = Highcharts.defined,
        sortedData = data,
        isObject = Highcharts.isObject,
        j = 0;
    var activeOnly = [{
        name: "Active Data",
        data: []
    }];
    var i = 1;
    sortedData[0].data.forEach(point => {
        if (point.status !== "complete") {
            /* console.log(point); */
            activeOnly[0].data.push(point);
            i = i + 1;
        } else { i = i + 1; }
    })
    console.log(sortedData);
    console.log(activeOnly);

    let chart = Highcharts.ganttChart("uniqueID", {
        series: sortedData,
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: ["printChart", "separator", "downloadPNG", "downloadJPEG", "downloadPDF", "downloadSVG"]
                },
                printButton: {
                    text: 'Active',
                    onclick: function () {
                        // if (j == 0) {
                        chart.series[0].update({

                            data: activeOnly[0].data

                        });
                        // j = 1
                        // } else if (j == 1) {
                        //     chart.update({
                        //         series: {
                        //             data: sortedData[0].data,
                        //         }
                        //     }, true, true);
                        //     j = 0;
                        // }
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
                    status = point.status,
                    lines;
                // console.log(point);

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
            url: 'https://n8n.quay-tech.co.uk/webhook/365f15ec-1cd9-4b80-9bac-ad7810f623a9',
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

