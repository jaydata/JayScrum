var $data = require('jaydata');
var ctx = require('./jayscrumcontext');
var appContextType = require('./appdb_context').serviceType;
var connect = require('connect');
var app = connect();

console.dir(typeof ad);

function publishDatabaseInstance(urlName, dbName, dbType) {
    console.log("Publishing database:" + urlName + ">" + dbName + ">" + dbType);
    var dbContextType = require('./' + dbType).serviceType;
    console.log("dbContextType:" + dbContextType);

    app.use("/" + urlName, $data.JayService.createAdapter(dbContextType, function() {
        return new dbContextType({name: 'mongoDB', databaseName: dbName })
    }));
}

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

app.use(connect.query());

app.use($data.JayService.OData.BatchProcessor.connectBodyReader);


app.use("/CreateDatabase", function(req, res){
    var dbName = req.query.dbName, dbType = req.query.schemaName;

    var result = {
        _command: 'CreateDatabase',
        dbName: dbName,
        dbType: dbType
    }

    if(dbName == ''){
        result.status = 'error';
        result.message = 'empty db name';
        res.end(JSON.stringify(result));
        return;
    }

    var appdb = new appContextType({ name:'mongoDB', databaseName:'appdb_00' });



    appdb.onReady( function() {
        appdb.Databases.filter("it.dbName == this.dbName", {dbName: dbName}).toArray( function(items) {
            if (items.length > 0) {
                result.status = 'error';
                result.message = 'duplicate db name';
                res.end(JSON.stringify(result));
                return;
            };

            appdb.Databases.add({dbName: dbName, dbType: dbType});
            appdb.saveChanges(function() {
                publishDatabaseInstance(dbName, dbName, dbType);
                result.status = 'ok';
                res.end(JSON.stringify(result));
            })

        })


    });
});



var appdb = new appContextType({ name:'mongoDB', databaseName:'appdb_00' });

appdb.onReady(function() {
    appdb.Databases.forEach( function(database) {
        console.log("publishing db:" + database.dbName + " of type:"  + database.dbType);
        publishDatabaseInstance(database.dbName, database.dbName, database.dbType);
    })
});



//app.use("/xxx", $data.JayService.createAdapter(LightSwitchApplication.ApplicationData, function () {
//    console.log(arguments);
//    return new LightSwitchApplication.ApplicationData({ name:'mongoDB', databaseName:'jayScrum' });
//}));

app.listen(3000);
