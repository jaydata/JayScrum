

function DisplayBurndownChart() {
    var rawObject = JayScrum.app.selectedFrame().data().summaryList().SprintBurndownData();
    console.log(rawObject);

    // A couple flotr configuration options:
    var options = {
            xaxis:{
                min:0,
                max:rawObject.length-1
            },
            yaxis:{
                min:0,
                max:rawObject.remainingLine[rawObject.remainingLine.length-1][1]
            },
            grid:{
                minorVerticalLines:false
            }
        },
        i, graph;



    // Draw the graph:
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