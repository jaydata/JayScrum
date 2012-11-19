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
    console.log("   --===  provisionApp method call   ===--");
    validateSubscription(ANDROID_APP_ID, ANDROID_SUBSCRIPTION_ID, provisionRequestData.key)
        .then(function (isValid) {
            console.log('       validation subscription finished');
            console.log('       isValid: ' + isValid);

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
                                console.log("       Provisioning success: " + data);
                                var resultData = JSON.parse(data);
                                provisionRequestData.attachment.Status = "ready";
                                provisionRequestData.attachment.DevPayLoad.Url = resultData.id;
                                if (resultData.canWrite) {
                                    uploadInitData(resultData.id, groups, provisionRequestData.attachment.DevPayLoad.UserName, mainCtx)
                                        .then(function () { provAppDef.resolve(provisionRequestData.attachment); })
                                        .fail(function () {
                                            console.log("       !!!upload init data error");
                                            console.log(arguments);
                                            provisionRequestData.attachment.Status = "initialize";
                                            provisionRequestData.attachment.DevPayLoad.Url = null;
                                            provAppDef.resolve(provisionRequestData.attachment);
                                        });
                                } else {
                                    console.log("       Already provisiond!");
                                    provAppDef.resolve(provisionRequestData.attachment);
                                }

                            });
                        } else {
                            console.log("!!!! Provisioning error !!!!");
                            console.log("   !!!!Response status: ", res.statusCode);
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
                    //TODO removed
                    provisionRequestData.key = 'g2_' + provisionRequestData.key;
                    console.log("       provision request data: ", JSON.stringify(provisionRequestData));
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
        })
        .fail(function () {
            console.log("       validate subscription method call faild: ", arguments);
            provAppDef.fail(arguments);
        });
    return provAppDef.promise;
};
var uploadInitData = function (instanceId, groups, userName, mainCtx) {
    var defer = Q.defer();
    var usr = mainCtx.executionContext.request.currentDatabaseConfig.username;
    var psw = mainCtx.executionContext.request.currentDatabaseConfig.password;
    var appDb = mainCtx.executionContext.request.databases.ApplicationDB(instanceId, usr, psw);
    console.log("       --===  uploadInitData method call   ===--");
    console.log('           Instance id: ' + instanceId);
    console.log('           Login name: ' + usr);
    console.log('           Login psw: ' + psw);
    console.log('           user name: ' + userName);
    // console.log(appDb);
    appDb.onReady(function () {
        console.log("           provisioned appDb is Ready");
        appDb.Users.where(function (item) { return item.Login == this.usr || item.Login == 'admin'; }, { usr: userName })
            .toArray(function (userList) {
                console.log("           groups to add: " + JSON.stringify(groups));
                console.log("           user list: " + JSON.stringify(userList));
                var usr = userList.filter(function (u) { return u.Login == userName; })[0];
                var admin = userList.filter(function (u) { return u.Login == 'admin'; })[0];
                appDb.Users.attach(usr);
                appDb.Users.attach(admin);

                //set new user groups
                usr.Groups = groups;
                console.log("           changed user: " + JSON.stringify(usr.initData));

                //set admin password to user password
                admin.Password = usr.Password;
                console.log("           changed admin: " + JSON.stringify(admin.initData));

                appDb.saveChanges({
                    success: function () {
                        console.log("           Save group success.");
                        process.refreshCache(mainCtx.executionContext.request, mainCtx.executionContext.response, function () {
                            provisionFinish(instanceId)
                                .then(function () { defer.resolve(); })
                                .fail(function () { defer.reject(); });
                        });
                    },
                    error: function () {
                        console.log("           Save user error!", arguments);
                        defer.reject(arguments);
                    }
                });
            });
    });
    return defer.promise;
};
var provisionFinish = function (instanceId) {
    console.log("       --===  provisionFinish method call   ===--");
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
                console.log("           Provisioning end success: " + data);
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
    console.log("           provisionFinishRequestOption: ", provisionFinishRequestOptions);
    var postData = JSON.stringify({ appid: JAYSTORM_APP_ID, instanceid: instanceId });
    console.log("           postData: ", postData);
    provReq.write(postData);
    provReq.end();
    return d.promise;
};
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
    };

    validateRequest(GOOGLE_API_ACCESS_TOKEN)
        .then(function(result){
            if(result === undefined){
                renewAccessToken()
                    .then(function(newAccessToken){
                        validateRequest(GOOGLE_API_ACCESS_TOKEN)
                            .then(function(result2){def.resolve(result2);});
                    })
                    .fail(function(){def.reject();});
            }else{
                def.resolve(result);
            }
        });

    return def.promise;
};
var renewAccessToken= function(){
    console.log("-== Renew access token ==-");
    var qstring = require('querystring');
    var postData = qstring.stringify(GOOGLE_API_REFRESH_TOKEN_OBJECT);
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
                GOOGLE_API_ACCESS_TOKEN = apps.access_token;
                console.log("renew success: "+GOOGLE_API_ACCESS_TOKEN);
                def.resolve();
            });

        }else{
            console.log("!!!! renew FAILD !!!!");
            def.reject();
        }

    });
    req.write(postData);
    req.end();
    return def.promise;
};
var randomString = function () {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 4;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}
$data.ServiceBase.extend("ProvisionService", {
    Provision: $data.JayService.serviceFunction()
        .param('provisionList', 'string')
        .returns('$data.Object')
        (function (provisionList) {
            return function (success, error) {
                var usr = this.executionContext.request.currentDatabaseConfig.username;
                var psw = this.executionContext.request.currentDatabaseConfig.password;
                var appDb = this.executionContext.request.databases.ApplicationDB(JAYSTORM_APP_ID, usr, psw);
                var scrumDb = this.executionContext.request.databases.jayscrum(JAYSTORM_APP_ID, usr, psw);
                var mainCtx = this;
                console.log("--===  ProvisioningService method call   ===--");
                console.log("       usr: " + usr);
                console.log("       psw: " + psw);
                console.log("       appDbIsNull: ", appDb ? "false" : true);
                console.log("       scrumDbIsNull: ", appDb ? "false" : true);
                appDb.onReady(function () {
                    console.log("   appDb is Ready");
                    appDb.Groups.filter(function (grp) { return grp.Name == 'scrum' })
                        .toArray({
                            success: function (groupList) {
                                var groups = groupList.map(function (g) { return g.GroupID; });
                                console.log("   'scrum' group ids: " + groups);
                                var provisions = JSON.parse(provisionList);
                                var provisionFnArray = [];
                                console.log("   provisionList: " + provisionList);
                                for (var i = 0; i < provisions.length; i++) {
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
                                    console.log("   provisionRequestData: ", provisionRequestData);
                                    provisionFnArray.push(provisionApp(provisionRequestData, groups, mainCtx));
                                }
                                console.log("   provisioning database count: " + provisionFnArray.length);
                                Q.all(provisionFnArray)
                                    .then(function () {
                                        console.log("   all provision finished");
                                        var result = provisionFnArray.map(function (item) { return item.valueOf(); });
                                        console.log("   -== Provisioning response ==-");

                                        //console.log("scrumDb: ",JAYSTORM_APP_ID,usr,psw, scrumDb);
                                        scrumDb.onReady(function () {
                                            console.log("   scrumDb is Ready");
                                            var smartUrlFns = [];
                                            result.forEach(function (repo) {
                                                var repoId = repo.DevPayLoad.Url;
                                                console.log("   check smartUrl: ", repoId);
                                                var fn = scrumDb.UrlCutterItems.filter(function (item) { return item.Instance_Id == this.id }, { id: repoId }).toArray();
                                                smartUrlFns.push(fn);
                                            });
                                            console.log("   smart URL requests length: ", smartUrlFns.length);
                                            Q.all(smartUrlFns)
                                              .then(function () {
                                                  console.log(" smartUrl requests finished");
                                                  var addFns = [];
                                                  for (var i = 0; i < smartUrlFns.length; i++) {
                                                      var smartUrlFnValues = smartUrlFns[i].valueOf();
                                                      console.log("    value of: ", smartUrlFnValues);
                                                      if (smartUrlFnValues.length < 1) {
                                                          var url = result[i].DevPayLoad.Url;
                                                          if (url) {
                                                              var payLoad = result[i].DevPayLoad;
                                                              var addFn = function () {
                                                                  var addSmartUrlQ = Q.defer();
                                                                  (function () {
                                                                      var generateSmartUrlQ = Q.defer();
                                                                      var generateFn = function () {
                                                                          var sUrl = randomString();
                                                                          scrumDb.UrlCutterItems.filter(function (item) { return item.ShortName == this.alias; }, { alias: sUrl }).length()
                                                              .then(function (v) {
                                                                  if (v == 0) { generateSmartUrlQ.resolve(sUrl); }
                                                                  else { console.log("regeneratie smrt url"); generateFn(); }
                                                              });
                                                                      }
                                                                      generateFn();
                                                                      return generateSmartUrlQ.promise;
                                                                  })()
                                                          .then(function (sUrl) {
                                                              console.log("Add new smartUrl, instanceId: ", url, "shortName: ", sUrl);
                                                              scrumDb.UrlCutterItems.add(new scrumDb.UrlCutterItems.createNew({ Instance_Id: url, ShortName: sUrl }));
                                                              payLoad.Url = sUrl;
                                                              scrumDb.saveChanges({
                                                                  success: function () { addSmartUrlQ.resolve(); },
                                                                  error: function () { addSmartUrlQ.fail(arguments); }
                                                              });
                                                          })
                                                          .fail(function () { console.log("Smart url generation faild: ", arguments); });
                                                                  return addSmartUrlQ.promise;
                                                              };
                                                              addFns.push(addFn());
                                                          }
                                                      } else {
                                                          console.log("    smartUrl already exists: ", smartUrlFnValues[0].ShortName);
                                                          result[i].DevPayLoad.Url = smartUrlFnValues[0].ShortName;
                                                      }
                                                  }
                                                  console.log("addFns: ", addFns.length);
                                                  Q.all(addFns)
                                                  .then(function () {
                                                      console.log("ALL OK");
                                                      console.log(result);
                                                      success(JSON.stringify(result));
                                                  })
                                                  .fail(function () { console.log("!!!Smart URL SAVE FAILD", arguments); error('!!!Smart URL SAVE FAILD'); });
                                              })
                                              .fail(function () {
                                                  console.log("!!!Smart URL FAILD", arguments);
                                                  error('!!!Smart URL FAILD');
                                              });
                                        });
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