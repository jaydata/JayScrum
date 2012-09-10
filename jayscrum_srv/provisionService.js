var https = require('https');
var http = require('http');
var Q = require('q');
var bc = require('bcrypt');
var token = 'ya29.AHES6ZR5k-Jx_S_8IktuS2tRBP1Q1LZfhC4EvGxdgEHytfBHDXx4h30a';
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
                    provisionRequestData.key = 'g2_'+provisionRequestData.key;
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

$data.ServiceBase.extend("ProvisionService", {
    Provision: $data.JayService.serviceFunction()
        .param('provisionList', 'string')
        .returns('$data.Object')
        ( function(provisionList){

            return function(success, error){
                var self = this;
                var provisions = JSON.parse(provisionList);
                var provisionFnArray = [];
                for(var i=0;i<provisions.length;i++){
                    console.log("--==== Start provisioning database! ====--");
                    var repo = provisions[i].DevPayLoad;
                    var provisionRequestData = {
                        key:provisions[i].purchaseToken,                   //google or apple purchase toke
                        appid:'ff000501-7028-4696-9903-cad361c11de6',
                        provisionid:'0d2f89af-df0d-4b92-8c18-6e7d18abe71c',
                        initdata:{
                            ApplicationDB:{
                                Users:{
                                    Login:provisions[i].DevPayLoad.UserName,
                                    Password: bc.hashSync(provisions[i].DevPayLoad.Password, 8)
                                }
                            }
                        },
                        attachment:provisions[i]
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
                        success(JSON.stringify(result));
                    });
            };
        }),
    bCrypPassword: $data.JayService.serviceFunction()
        .param('password', 'string')
        .returns('$data.String')
        (function(password){
            return bc.hashSync(password, 8)
        })
});

ProvisionService.annotateFromVSDoc();
module.exports = ProvisionService;