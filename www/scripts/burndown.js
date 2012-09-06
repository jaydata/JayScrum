function DisplayBurndownChart() {
    var rawObject = JayScrum.app.selectedFrame().data().summaryList().SprintBurndownData();
    var xMaxvalue = Math.max.apply(null, rawObject.remainingLine.map(function(item){return item[1]}));
    xMaxvalue = xMaxvalue + (xMaxvalue*0,1);
    // A couple flotr configuration options:
    var options = {
            shadowSize: 0,
            colors: ['#24A0DA', '#ffa500', '#da0134'],
            xaxis: {
                min: 0,
                max: (rawObject.length-1)+0.5,
                tickDecimals: 0,
                margin: true
            },
            yaxis: {
                min: 0,
                max: xMaxvalue,
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