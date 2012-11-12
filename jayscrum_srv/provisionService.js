var https = require('https');
var http = require('http');
var Q = require('q');
var bc = require('bcrypt');

var JAYSTORM_ADMIN_HOST = 'admin.jaystack.net';
var JAYSTORM_ADMIN_HOST_PORT = 3000;
var JAYSTORM_ADMIN_PROVISION_PATH = '/provision';
var JAYSTORM_ADMIN_PROVISION_FINISH_PATH="/provisionEnd";
var JAYSTORM_APP_ID = '';
var JAYSTORM_PROVISION_ID = '';
var ANDROID_APP_ID = 'com.jaystack.jayscrum';
var ANDROID_SUBSCRIPTION_ID = 'test.jaystack.subscription_monthly';

var GOOGLE_API_ACCESS_TOKEN = '';
var GOOGLE_API_REFRESH_TOKEN_OBJECT = {
    client_id: '',
    client_secret: '',
    grant_type:'refresh_token',
    refresh_token:''
};

var provisionApp = function (provisionRequestData, groups, mainCtx) {
    var provAppDef = Q.defer();

    validateSubscription(ANDROID_APP_ID, ANDROID_SUBSCRIPTION_ID, provisionRequestData.key)
        .then(function (isValid) {
            console.log('-== Start provisioning on admin jaystack.net ==-');
            console.log('isValid: ' + isValid);

            if (isValid === true) {
                var provisionRequestOptions = {
                    host: JAYSTORM_ADMIN_HOST,
                    port: JAYSTORM_ADMIN_HOST_PORT,
                    path: JAYSTORM_ADMIN_PROVISION_PATH,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                try {
                    var provReq = http.request(provisionRequestOptions, function (res) {
                        var data = '';
                        if (res.statusCode == 200) {
                            res.on("data", function (d) {
                                data += d;
                            });
                            res.on("end", function () {
                                console.log("Provisioning success: " + data);
                                var resultData = JSON.parse(data);
                                provisionRequestData.attachment.Status = "ready";
                                provisionRequestData.attachment.DevPayLoad.Url = resultData.id;
                                if (resultData.canWrite) {
                                    uploadInitData(resultData.id, groups, provisionRequestData.attachment.DevPayLoad.UserName, mainCtx)
                                        .then(function () { provAppDef.resolve(provisionRequestData.attachment); })
                                        .fail(function () {
                                            console.log("!!!! Provisioning finish error !!!!");
                                            provisionRequestData.attachment.Status = "initialize";
                                            provisionRequestData.attachment.DevPayLoad.Url = null;
                                            provAppDef.resolve(provisionRequestData.attachment);
                                        });
                                } else {
                                    console.log("Already provisiond!");
                                    provAppDef.resolve(provisionRequestData.attachment);
                                }

                            });
                        } else {
                            console.log("!!!! Provisioning error !!!!");
                            provisionRequestData.attachment.Status = "initialize";
                            provisionRequestData.attachment.DevPayLoad.Url = null;
                            provAppDef.resolve(provisionRequestData.attachment);
                        }
                    });

                    provReq.on('error', function (e) {
                        console.log('!!! Provisioning request error !!!');
                        console.log(e);
                        provisionRequestData.attachment.Status = "initialize";
                        provisionRequestData.attachment.DevPayLoad.Url = null;
                        provAppDef.resolve(provisionRequestData.attachment);
                    });
                    console.log(JSON.stringify(provisionRequestData));
                    //TODO removed
                    provisionRequestData.key = 'g89_' + provisionRequestData.key;
                    provReq.write(JSON.stringify(provisionRequestData));
                    provReq.end();
                } catch (ex) {
                    console.log('!!! Provisioning request error !!!');
                    console.log(ex);
                    provisionRequestData.attachment.Status = "initialize";
                    provisionRequestData.attachment.DevPayLoad.Url = null;
                    provAppDef.resolve(provisionRequestData.attachment);
                }
            }
            else {
                console.log('!!!! Validation error !!!!');
                provisionRequestData.attachment.Status = "initialize";
                provisionRequestData.attachment.DevPayLoad.Url = null;
                provAppDef.resolve(provisionRequestData.attachment);
            }

        });
    return provAppDef.promise;
};
var uploadInitData = function (instanceId, groups, userName, mainCtx) {
    var defer = Q.defer();
    var usr = mainCtx.executionContext.request.currentDatabaseConfig.username;
    var psw = mainCtx.executionContext.request.currentDatabaseConfig.password;
    var appDb = mainCtx.executionContext.request.databases.ApplicationDB(instanceId, usr, psw);
    console.log('!!!Instance id: ' + instanceId);
    console.log('!!!Login name: ' + usr);
    console.log('!!!Login psw: ' + psw);
    console.log('!!!user name: ' + userName);
    // console.log(appDb);
    appDb.onReady(function () {
        appDb.Users.where(function (item) { return item.Login == this.usr || item.Login == 'admin'; }, { usr: userName })
            .toArray(function (userList) {
                console.log("!!!GROUPS: " + JSON.stringify(groups));
                console.log("!!! user: " + JSON.stringify(userList));
                var usr = userList.filter(function (u) { return u.Login == userName; })[0];
                var admin = userList.filter(function (u) { return u.Login == 'admin'; })[0];
                appDb.Users.attach(usr);
                appDb.Users.attach(admin);

                //set new user groups
                usr.Groups = groups;
                console.log("change user: " + JSON.stringify(usr.initData));

                //set admin password to user password
                admin.Password = usr.Password;

                appDb.saveChanges({
                    success: function () {
                        console.log("Save group success.");
                        process.refreshCache(mainCtx.executionContext.request, mainCtx.executionContext.response, function () {
                            provisionFinish(instanceId)
                                .then(function () { defer.resolve(); })
                                .fail(function () { defer.reject(); });
                        });
                    },
                    error: function () {
                        console.log("Save user error!", arguments);
                        defer.reject();
                    }
                });
            });
    });
    return defer.promise;
};
var provisionFinish = function (instanceId) {
    console.log("Finishing provisioning.")
    var d = Q.defer();

    var provisionFinishRequestOptions = {
        host: JAYSTORM_ADMIN_HOST,
        port: JAYSTORM_ADMIN_HOST_PORT,
        path: JAYSTORM_ADMIN_PROVISION_FINISH_PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    var provReq = http.request(provisionFinishRequestOptions, function (res) {
        var data = '';
        if (res.statusCode == 200) {
            res.on("data", function (d) {
                data += d;
            });
            res.on("end", function () {
                console.log("Provisioning end success: " + data);
                d.resolve();
            });
        } else {
            console.log("!!!! Provisioning end error !!!!");
            d.reject();
        }
    });
    provReq.on('error', function (e) {
        console.log('!!! Provisioning end request error !!!');
        console.log(e);
        d.reject();
    });
    provReq.write(JSON.stringify({ appid: JAYSTORM_APP_ID, instanceid: instanceId }));
    provReq.end();
    return d.promise;
};
var validateSubscription = function (applicationNameSpace, subscriptionId, subscriptionToken) {
    console.log('-== Validate subscription ==-');
    console.log('appNameSpace: ' + applicationNameSpace);
    console.log('subscription Id: ' + subscriptionId);
    console.log('subscription token: ' + subscriptionToken);
    var def = Q.defer();
    var validateRequest = function (accessToken) {
        var get_options = {
            host: 'www.googleapis.com',
            port: 443,
            path: '/androidpublisher/v1/applications/' + applicationNameSpace + '/subscriptions/' + subscriptionId + '/purchases/' + subscriptionToken + '?access_token=' + accessToken,
            method: 'GET'
        };
        console.log('Validation path: ' + get_options.path);
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
                    reqPromise.resolve(Date.now().valueOf() < apps.validUntilTimestampMsec);
                });
            } else {
                reqPromise.resolve(undefined);
            }

        }).end();
        return reqPromise.promise;
    };

    validateRequest(GOOGLE_API_ACCESS_TOKEN)
        .then(function (result) {
            if (result === undefined) {
                renewAccessToken()
                    .then(function (newAccessToken) {
                        validateRequest(GOOGLE_API_ACCESS_TOKEN)
                            .then(function (result2) { def.resolve(result2); });
                    })
                    .fail(function () { def.reject(); });
            } else {
                def.resolve(result);
            }
        });

    return def.promise;
};
var renewAccessToken = function () {
    console.log("-== Renew access token ==-");
    var qstring = require('querystring');
    var postData = qstring.stringify(GOOGLE_API_REFRESH_TOKEN_OBJECT);
    var def = Q.defer();
    var get_options = {
        host: 'accounts.google.com',
        port: 443,
        path: '/o/oauth2/token',
        method: 'POST',
        headers: {
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
                GOOGLE_API_ACCESS_TOKEN = apps.access_token;
                console.log("renew success: " + GOOGLE_API_ACCESS_TOKEN);
                def.resolve();
            });

        } else {
            console.log("!!!! renew FAILD !!!!");
            def.reject();
        }

    });
    req.write(postData);
    req.end();
    return def.promise;
};

$data.ServiceBase.extend("ProvisionService", {
    Provision: $data.JayService.serviceFunction()
        .param('provisionList', 'string')
        .returns('$data.Object')
        (function (provisionList) {

            return function (success, error) {
                var usr = this.executionContext.request.currentDatabaseConfig.username;
                var psw = this.executionContext.request.currentDatabaseConfig.password;
                var appDb = this.executionContext.request.databases.ApplicationDB(JAYSTORM_APP_ID, usr, psw);
                var mainCtx = this;
                appDb.onReady(function () {
                    appDb.Groups.filter(function (grp) { return grp.Name == 'scrum' })
                        .toArray({
                            success: function (groupList) {
                                var groups = groupList.map(function (g) { return g.GroupID; });
                                var provisions = JSON.parse(provisionList);
                                var provisionFnArray = [];
                                for (var i = 0; i < provisions.length; i++) {
                                    console.log("--==== Start provisioning database! ====--");
                                    var repo = provisions[i].DevPayLoad;
                                    var provisionRequestData = {
                                        key: provisions[i].purchaseToken,                   //google or apple purchase toke
                                        appid: JAYSTORM_APP_ID,
                                        provisionid: JAYSTORM_PROVISION_ID,
                                        attachment: provisions[i]
                                    };
                                    if (provisions[i].DevPayLoad.UserName && provisions[i].DevPayLoad.Password) {
                                        provisionRequestData['initdata'] = {
                                            ApplicationDB: {
                                                Users: {
                                                    Login: provisions[i].DevPayLoad.UserName,
                                                    Password: bc.hashSync(provisions[i].DevPayLoad.Password, 8),
                                                    Enabled: true
                                                    //Groups: groups
                                                }
                                            }
                                        };
                                    }
                                    provisionFnArray.push(provisionApp(provisionRequestData, groups, mainCtx));
                                }
                                console.log("New database count: " + provisionFnArray.length);
                                Q.all(provisionFnArray)
                                    .then(function () {
                                        var result = provisionFnArray.map(function (item) { return item.valueOf(); });
                                        console.log("-== Provisioning response ==-");
                                        console.log(result);
                                        console.log("-== Provisioning response END ==-");
                                        success(JSON.stringify(result));
                                    });
                            },
                            error: function () {
                                console.log("group query error: ", arguments);
                                error('group query error');
                            }
                        });
                });
            };
        }),
    bCrypPassword: $data.JayService.serviceFunction()
        .param('password', 'string')
        .returns('$data.String')
        (function (password) {
            return bc.hashSync(password, 8);
        })
});

ProvisionService.annotateFromVSDoc();
module.exports = ProvisionService;