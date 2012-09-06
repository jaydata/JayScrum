

function DisplayBurndownChart() {
    var rawObject = JayScrum.app.selectedFrame().data().summaryList().SprintBurndownData();

    // A couple flotr configuration options:
    var options = {
            shadowSize: 0,
            colors: ['#ffa500', '#ffa500', '#da0134', '#24A0DA', '#24A0DA'],
            xaxis: {
                min: 0,
                max: rawObject.length-1,
                tickDecimals: 0,
                margin: true
            },
            yaxis: {
                min: 0,
                max: rawObject.remainingLine[rawObject.remainingLine.length - 1][1],
                tickDecimals: 1
            },
            grid: {
                color: '#fff',
                verticalLines: false,
                horizontalLines: false,
                backgroundColor: null,
                tickColor: '#fff',
                labelMargin: 10,
                outlineWidth: 1,
                outline: 'sw'
            }
        },
        i, graph;

        graph = Flotr.draw(
        $('#burndownChart')[0], // Container element
        [
            {data:rawObject.remainingLine, lines:{fill:true}},
            {data:rawObject.todoLine, lines:{fill:true}},
            rawObject.idealLine
        ], // Array of data series
        options     // Configuration options
    );

    return;
}