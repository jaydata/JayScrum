

function DisplayBurndownChart() {
    var rawObject = JayScrum.app.selectedFrame().data().summaryList().SprintBurndownData();
    var r = new Raphael($('#burndownChart')[0]);
    var rDataPoint = rawObject.remainingLine.map(function(item, index){return index;});
    if(rDataPoint.length == 1){
        rDataPoint.push(rDataPoint[0]+1);
        rawObject.remainingLine.push(0);
    }
    var tDataPoint = rawObject.todoLine.map(function(item, index){return index;});
    if(tDataPoint.length == 1){
        tDataPoint.push(tDataPoint[0]+1);
        rawObject.todoLine.push(0);
    }
    var iDataPoint = [0, rawObject.length];
//    for(var i=0;i<rawObject.length;i++){dataPoint.push(i)};
    var lines = r.linechart(5, 15, 270, 300,
        [
            rDataPoint,
            tDataPoint,
            iDataPoint
        ],
        [
            rawObject.remainingLine,
            rawObject.todoLine,
            rawObject.idealLine
        ],
        {
            nostroke: false,
            axis: "0 0 1 1",
            axisxstep: 1,
            axisystep: 1,
            colors: ["#24A0DA", "#ffa500", "#fff"],
            smooth: false,
            shade: true
        });

    for (var i = 0, l = lines.axis.length; i < l; i++) {
        var chart = lines;

        // change the axis and tick-marks 
        chart.axis[i].attr("stroke", "#fff");
        chart.axis[i].attr("opacity", "0.5");

        // change the axis labels 
        var axisItems = chart.axis[i].text.items
        for (var ii = 0, ll = axisItems.length; ii < ll; ii++) {
            axisItems[ii].attr("fill", "#fff");
        }
    }

    lines.shades[0].attr("opacity", "0.7");
    lines.shades[1].attr("opacity", "0.7");
    lines.shades[2].attr("opacity", "0");
}