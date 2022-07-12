const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
// Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
let value = params.key; // "some_value"

console.log(value);
makeKnApiRequest('GET', 51, 92, '/62b04d43dc757407519f1ee6', '').then(projects => {
    makeKnApiRequest('GET', 51, 93, '?rows_per_page=1000', '').then(milestones => {
        makeKnApiRequest('GET', 51, 94, '?rows_per_page=1000', '').then(tasks => {
            console.log(projects);
            // console.log(milestones.records);
            console.log(tasks.records);
            var testseries = [];
            //'/62b04d43dc757407519f1eea'

            // var oldestDate = new Date("2222-12-30");
            // var newestDate = new Date("1000-01-01");



            // projects.records.forEach(proj => {
            var projectdata = {
                name: projects.field_9,
                data: [{
                    name: projects.field_9,
                    id: projects.id,
                    Owner: projects.field_34_raw[0].identifier

                }]
            };
            // var projectdata = {
            //     name: "",
            //     data: [{
            //         name: "",
            //         id: "",
            //         Owner: ""

            //     }]
            // };

            // if (proj.field_77_raw) {
            //     let [month, day, year] = proj.field_77_raw.date.split('/');
            //     let dateToCheck = new Date(+year, month - 1, +day);

            //     if (dateToCheck < oldestDate) {
            //         oldestDate = dateToCheck;
            //     }
            //     if (dateToCheck > newestDate) {
            //         newestDate = dateToCheck;
            //     }
            // }

            // projectdata.name = proj.field_9;
            // projectdata.data[0].name = proj.field_9;
            // projectdata.data[0].Owner = proj.field_34_raw[0].identifier;
            // projectdata.data[0].id = proj.id;
            testseries.push(projectdata);
            // console.log(projObj);
            // });
            milestones.records.forEach(stone => {
                var milestoneData = {
                    name: "",
                    dependency: '',
                    id: "",
                    parent: "",
                    start: "",
                    milestone: true,
                    owner: ""
                };
                // if (stone.field_58_raw.date) {
                //     let [month, day, year] = stone.field_58_raw.date;
                //     let dateToCheck = new Date(+year, month - 1, +day);

                //     if (dateToCheck < oldestDate) {
                //         oldestDate = dateToCheck;
                //     }
                //     if (dateToCheck > newestDate) {
                //         newestDate = dateToCheck;
                //     }
                // }

                // console.log(milestoneData);
                milestoneData.name = stone.field_40;
                milestoneData.id = stone.id;
                milestoneData.parent = stone.field_62_raw[0].id;
                milestoneData.start = Math.floor(new Date(stone.field_58_raw.date).getTime());
                // milestoneData.end = new Date(stone.field_58_raw.date);
                milestoneData.owner = stone["field_62.field_34_raw"][0].identifier
                testseries.forEach(projec => {
                    if (stone.field_62_raw[0].identifier == projec.name) {
                        projec.data.push(milestoneData);
                    }
                });
            })
            tasks.records.forEach(tas => {
                var taskData = {
                    name: '',
                    id: '',
                    parent: '',
                    start: "",
                    end: "",
                    // milestone: true,
                    owner: ''
                };

                // console.log(taskData);
                taskData.name = tas.field_36;
                taskData.id = tas.id;
                taskData.parent = tas.field_66_raw[0].id;
                taskData.start = Math.floor(new Date(tas.field_99_raw.date).getTime());
                taskData.end = Math.floor(new Date(tas.field_100_raw.date).getTime());
                if (taskData.end == taskData.start) {
                    taskData.end = taskData.end + tas.field_75_raw;
                }
                // console.log(taskData.start);
                // console.log(taskData.end);

                // let [month, day, year] = tas.field_99_raw.date;
                // let dateToCheck = new Date(+year, month - 1, +day);

                // if (dateToCheck < oldestDate) {
                //     oldestDate = dateToCheck;
                // }
                // if (dateToCheck > newestDate) {
                //     newestDate = dateToCheck;
                // }

                if (tas["field_70.field_72_raw"]) {
                    taskData.owner = tas["field_70.field_72_raw"][0][0].identifier;
                } else {
                    taskData.owner = "John Smith";
                }

                // taskData.dependency = tas.field_65_raw[0].id;
                testseries.forEach(projec => {
                    if (tas.field_66_raw[0].identifier == projec.name) {
                        projec.data.push(taskData);
                    }

                });
                // console.log(taskData)
            })
            // console.log(oldestDate);
            // console.log(newestDate)
            console.log(testseries)

            function compare(a, b) {
                if (a.start < b.start) {
                    return -1;
                }
                if (a.start > b.start) {
                    return 1;
                }
                return 0;
            }

            testseries[0].data.sort(compare);
            createGantt(testseries);
            var url = (window.location != window.parent.location)
                ? document.referrer
                : document.location.href;
            console.log(url);
            // .contentWindow.location.href;
        })
    })
})
function createGantt(data) {
    var
        dateFormat = Highcharts.dateFormat,
        defined = Highcharts.defined,
        isObject = Highcharts.isObject;

    Highcharts.ganttChart("uniqueID", {
        series: data,
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
        title: {
            text: 'Gantt Project Management Using Knack Data'
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

sendWebhookData().then(result => {
    console.log(JSON.parse(result));
})


function makeKnApiRequest(type, scene, view, id, data) {
    return new Promise((resolve, reject) => {

        var headers = {
            'X-Knack-REST-API-Key': '3314e180-dda5-48ba-9c84-852a40f60585',
            'X-Knack-Application-Id': "62b04d390d7746001eeb95fd",
            'Content-Type': 'application/json'
        };
        $.ajax({
            url: 'https://api.knack.com/v1/pages/scene_' + scene + '/views/view_' + view + '/records' + id,
            type: type,
            headers: headers,
            data: JSON.stringify(data),


            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}


function sendWebhookData() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'https://hook.integromat.com/ucj3s2a4ryghge2o3v9utlq81tudedp9',
            type: 'POST',
            data: "62b04d43dc757407519f1ee6",
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
        });
    });

}

