var $data = require('jaydata');
var ctx = require('./jayscrumcontext');
var appContextType = require('./appdb_context').serviceType;
var express = require('express');
var app = express();
var https = require('https');
var http = require('http');
var Q = require('q');
var bc = require('bcrypt');


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
    res.setHeader('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type, MaxDataServiceVersion, DataServiceVersion, If-Match');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, MERGE');
    if (req.method === 'OPTIONS') {
        res.end();
    } else {
        next();
    }
});

app.use(express.urlencoded());
app.use(express.json());
app.use(express.bodyParser());
app.use(express.query());
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
    var provisionFnArray = [];
    for(var i=0;i<req.body.length;i++){
        console.log("--==== Start provisioning database! ====--");
        var repo = req.body[i].DevPayLoad;
        var provisionRequestData = {
            key:req.body[i].purchaseToken,                   //google or apple purchase toke
            appid:'15bd52b7-8434-4168-9a56-968ce6c8de4a',
            provisionid:'f7a84bef-1ceb-4090-8631-50bf57f5c0f6',
            initdata:{
                ApplicationDB:{
                    Users:{
                        Login:req.body[i].DevPayLoad.UserName,
                        Password: bc.hashSync(req.body[i].DevPayLoad.Password, 8)
                    }
                }
            },
            attachment:req.body[i]
        };
        provisionFnArray.push(provisionApp(provisionRequestData));
    }
    console.log("Provision database count: "+provisionFnArray.length);
    Q.all(provisionFnArray)
        .then(function(){
           var result = provisionFnArray.map(function(item){return item.valueOf()});
            console.log("-== Provisioning response ==-");
            console.log(result);
            console.log("-== Provisioning response END ==-");
            res.end(JSON.stringify(result));
        });

});


var token = 'ya29.AHES6ZR5k-Jx_S_8IktuS2tRBP1Q1LZfhC4EvGxdgEHytfBHDXx4h30a';
var subscriptionToken = 'trivkrjcyozqswvsfeuhnmrs';

var provisionApp = function (provisionRequestData) {
    var provAppDef = Q.defer();

    validateSubscription('com.jaystack.jayscrum', 'test.jaystack.subscription_monthly', provisionRequestData.key)
        .then(function (isValid) {
            console.log('-== Start provisioning on admin jaystack.net ==-');
            console.log('isValid: '+isValid);

            if (isValid === true) {
                var provisionRequestOptions = {
                    host:'admin.jaystack.net',
                    port:3000,
                    path:'/provision',
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    }
                };
                try{
                    var provReq = http.request(provisionRequestOptions, function (res) {
                        var data = '';
                        if (res.statusCode == 200) {
                            res.on("data", function (d) {
                                data += d;
                            });
                            res.on("end", function () {
                                console.log("Provisioning success: "+data);
                                var resultData = JSON.parse(data);
                                provisionRequestData.attachment.Status = "ready";
                                provisionRequestData.attachment.DevPayLoad.Url = resultData.id;
                                provAppDef.resolve(provisionRequestData.attachment);
                            });
                        } else {
                            console.log("!!!! Provisioning error !!!!");
                            provisionRequestData.attachment.Status = "initialize";
                            provisionRequestData.attachment.DevPayLoad.Url = null;
                            provAppDef.resolve(provisionRequestData.attachment);
                        }
                    });

                    provReq.on('error', function(e) {
                        console.log('!!! Provisioning request error !!!');
                        console.log(e);
                        provisionRequestData.attachment.Status = "initialize";
                        provisionRequestData.attachment.DevPayLoad.Url = null;
                        provAppDef.resolve(provisionRequestData.attachment);
                    });
                    console.log(JSON.stringify(provisionRequestData));
  //TODO removed
                    provisionRequestData.key = 'g_'+provisionRequestData.key;
                    provReq.write(JSON.stringify(provisionRequestData));
                    provReq.end();
                }catch(ex){
                    console.log('!!! Provisioning request error !!!');
                    console.log(ex);
                    provisionRequestData.attachment.Status = "initialize";
                    provisionRequestData.attachment.DevPayLoad.Url = null;
                    provAppDef.resolve(provisionRequestData.attachment);
                }
            }
            else {
                console.log('!!!! Validation error !!!!')
                provisionRequestData.attachment.Status = "initialize";
                provisionRequestData.attachment.DevPayLoad.Url = null;
                provAppDef.resolve(provisionRequestData.attachment);
            }

        });
    return provAppDef.promise;
}
app.use("/Provision", function (req, res) {
    var provisionRequestData = {
        key:'g_trivkrjcyozqswvsfeuhnmrs', //google or apple purchase toke
        appid:'15bd52b7-8434-4168-9a56-968ce6c8de4a',
        provisionid:'f7a84bef-1ceb-4090-8631-50bf57f5c0f6',
        initdata:{
            ApplicationDB:{
                Users:{
                    Login:'kunbela',
                    Password:'asdqwe123'
                }
            }
        },
        attachment:{
            DevPayLoad:{
                Title:'Repository name',
                UserName:'Kun Béla',
                Password:'ezazénjelszavam',
                IsDefault:false }
        }
    };
    provisionApp(provisionRequestData)
        .then(function (result) {
            res.end(result.response);
        })
});
var validateSubscription = function(applicationNameSpace, subscriptionId, subscriptionToken){
    console.log('-== Validate subscription ==-');
    console.log('appNameSpace: '+applicationNameSpace);
    console.log('subscription Id: '+subscriptionId);
    console.log('subscription token: '+subscriptionToken);
    var def = Q.defer();
    var validateRequest = function(accessToken){
        var get_options = {
            host: 'www.googleapis.com',
            port: 443,
            path: '/androidpublisher/v1/applications/'+applicationNameSpace+'/subscriptions/'+subscriptionId+'/purchases/'+subscriptionToken+'?access_token='+accessToken,
            method: 'GET'
        };
        console.log('Validation path: '+get_options.path);
        var reqPromise = Q.defer();
        https.request(get_options, function (res) {
            res.setEncoding('utf8');
            if (res.statusCode == 200) {
                var data = '';
                res.on("data", function (d) {
                    data += d;
                });
                res.on("end", function () {
                    var apps = JSON.parse(data);
                    console.log(apps);
                    console.log(apps.validUntilTimestampMsec);
                    console.log(Date.now().valueOf());
                    reqPromise.resolve(Date.now().valueOf()<apps.validUntilTimestampMsec);
                });
            }else{
                reqPromise.resolve(undefined);
            }

        }).end();
        return reqPromise.promise;
    }

    validateRequest(token)
        .then(function(result){
            if(result === undefined){
                renewAccessToken()
                    .then(function(newAccessToken){
                        validateRequest(token)
                            .then(function(result2){def.resolve(result2);})
                    })
                    .fail(function(){
                        def.reject();
                    })
            }else{
                def.resolve(result);
            }
        });

    return def.promise;
}
var renewAccessToken= function(){
    console.log("-== Renew access token ==-");
    var qstring = require('querystring');
    var postData = qstring.stringify({
        client_id: '449285537332.apps.googleusercontent.com',
        client_secret: 'NXYsLEtOsCQCf1iQoVHYV2tx',
        grant_type:'refresh_token',
        refresh_token:'1/3CkT1ie_xobqqtHTuq24nKbQZKBV6UfSATynwgFQi4M'
    });
    var def = Q.defer();
    var get_options = {
        host: 'accounts.google.com',
        port: 443,
        path: '/o/oauth2/token',
        method: 'POST',
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };
    var req = https.request(get_options, function (res) {
        if (res.statusCode == 200) {
            var data = '';
            res.on("data", function (d) {
                data += d;
            });
            res.on("end", function () {
                var apps = JSON.parse(data);
                token = apps.access_token;
                console.log("renew success: "+token);
                def.resolve();
            });

        }else{
            console.log("!!!! renew FAILD !!!!")
            def.reject();
        }

    });
    req.write(postData);
    req.end();
    return def.promise;
}

var appdb = new appContextType({ name:'mongoDB', databaseName:appDBName, address: dbAddress });

appdb.onReady(function() {
    appdb.Databases.forEach( function(database) {
        console.log("publishing db:" + database.dbName + " of type:"  + database.dbType);
        publishDatabaseInstance(database.dbName, database.dbName, database.dbType);
    })
});


app.listen(oDataServicePort);
