var $data = require('jaydata');
var ctx = require('./jayscrumcontext');
var appContextType = require('./appdb_context').serviceType;
var connect = require('connect');
var app = connect();

console.log("JayStorm oData publisher starting\n");

var dbAddress = '127.0.0.1';
//var dbAddress = 'db1.storm.jaystack.com';
var appDBName = 'appdb_00';

var oDataServicePort = 3000;


function publishDatabaseInstance(urlName, dbName, dbType) {
    console.log("Publishing database:" + urlName + ">" + dbName + ">" + dbType);
    var dbContextType = require('./' + dbType).serviceType;
    console.log("\tdbContextType:" + dbContextType.fullName);
    if (urlName === undefined || urlName === '') {

    }
    app.use("/" + urlName, $data.JayService.createAdapter(dbContextType, function() {
        return new dbContextType({name: 'mongoDB', databaseName: dbName, address:dbAddress })
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

app.use(connect.urlencoded());
app.use(connect.json());
app.use(connect.bodyParser());
app.use(connect.query());
app.use($data.JayService.OData.BatchProcessor.connectBodyReader);



app.use("/CreateDatabase", function(req, res){
    console.log("CreateDB");
    console.log(req.query);
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

    var appdb = new appContextType({ name:'mongoDB', databaseName: appDBName, address: dbAddress});



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

app.use("/CreateDatabase2", function(req, res){

    var result = [];

    for(var i=0;i<req.body.length;i++){
        console.log("--==== Check purchase token! ====--");
        console.log(req.body[i]);

        var repo = req.body[i].DevPayLoad;
        console.log("  orderid(devPayload): "+repo.OrderId);
        console.log("  orderid(body): "+req.body[i].OrderId);

        if(repo.Status){
            repo.Status = (repo.Status && repo.Status == 'initialize')?"ready":'initialize';
        }else{
            repo.Status = "initialize";
        }
        repo.OrderId = req.body[i].OrderId;

        if(repo.Status == "ready"){
            (function(){
                var appdb = new appContextType({ name:'mongoDB', databaseName: appDBName, address: dbAddress});
                appdb.onReady( function() {

                    appdb.Databases.filter("it.dbName == this.dbName", {dbName: repo.Url}).toArray( function(items) {
                        if (items.length > 0) {
                            return;
                        };

                        appdb.Databases.add({dbName: repo.Url, dbType: 'jayscrumcontext'});
                        appdb.Databases.add({dbName: repo.Url+'_users', dbType: 'jaystormcontext'});
                        appdb.saveChanges(function() {
                            console.log("Create database: "+repo.Url);
                            publishDatabaseInstance(repo.Url, repo.Url, 'jayscrumcontext');
                            publishDatabaseInstance(repo.Url+'_users', repo.Url+'_users', 'jaystormcontext');
                        })
                    })
                });
            })();
        }

        result.push(repo);
    }

console.log("==========");
console.log(result);
    res.end(JSON.stringify(result));
});

var appdb = new appContextType({ name:'mongoDB', databaseName:appDBName, address: dbAddress });

appdb.onReady(function() {
    appdb.Databases.forEach( function(database) {
        console.log("publishing db:" + database.dbName + " of type:"  + database.dbType);
        publishDatabaseInstance(database.dbName, database.dbName, database.dbType);
    })
});


app.listen(oDataServicePort);
