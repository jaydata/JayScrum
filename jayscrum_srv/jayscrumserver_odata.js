var $data = require('jaydata');
var ctx = require('./jayscrumcontext.js');

var connect = require('connect');
var app = connect();

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type, MaxDataServiceVersion, DataServiceVersion');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, MERGE');
    if (req.method === 'OPTIONS') {
        res.end();
    } else {
        next();
    }
});
app.use("/CreateDatabase", function(req, res){
    console.log('Create database');
    //res.write('OK');
    res.end();

});
app.use(connect.query());
app.use($data.JayService.OData.BatchProcessor.connectBodyReader);



app.use("/", $data.JayService.createAdapter(LightSwitchApplication.ApplicationData, function () {
    console.log(arguments);
    return new LightSwitchApplication.ApplicationData({ name:'mongoDB', databaseName:'jayScrum' });
}));

app.listen(3000);
