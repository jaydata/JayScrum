/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 9:28 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Views.RepositoryWelcome', JayScrum.FrameView, null, {
    constructor: function (name, path, tplSource) {
        this.templateName = name || 'repositories-welcome';
        this.i_scroll = null;
    },
    initializeView: function () {
        JayScrum.app.hideLoading();
        this.i_scroll = JayScrum.app.initScrollById('hintScreenScroller');
    },
    tearDownView: function () {
        if (this.i_scroll) {
            this.i_scroll.destroy();
            this.i_scroll = null;
        }
    }
}, null);
$data.Class.define('JayScrum.Views.RepositorySettings', JayScrum.FrameView, null, {
    constructor: function (name, path, tplSource) {
        this.templateName = name || 'repositories-template';
        this.i_scroll = null;
        this.i_scroll_popup = null;
    },
    initializeView: function () {
        JayScrum.app.hideLoading();
        this.i_scroll = JayScrum.app.initScrollById('settingPageScroll', null, null, false, true);

        if (android) {
            setTimeout(function () {
                $("div.floating-box").addClass("visible");
            }, 3000);
        }
    },
    tearDownView: function () {
        if (this.i_scroll) {
            this.i_scroll.destroy();
            this.i_scroll = null;
        }
        if (this.i_scroll_popup) {
            this.i_scroll_popup.destroy();
            this.i_scroll_popup = null;
        }
    }
}, null);
$data.Class.define('JayScrum.Views.RepositorySubscription', JayScrum.FrameView, null, {
    constructor: function (name, path, tplSource) {
        this.templateName = name || 'repositories-subscription';
        this.i_scroll = null;
        this.i_scroll_popup = null;
    },
    initializeView: function () {
        JayScrum.app.hideLoading();
        this.i_scroll = JayScrum.app.initScrollById('addSettingScroller');
    },
    tearDownView: function () {
        if (this.i_scroll) {
            this.i_scroll.destroy();
            this.i_scroll = null;
        }
        if (this.i_scroll_popup) {
            this.i_scroll_popup.destroy();
            this.i_scroll_popup = null;
        }
    }
}, null);
$data.Class.define('JayScrum.Views.RepositoryAddSetting', JayScrum.FrameView, null, {
    constructor: function (name, path, tplSource) {
        this.templateName = name || 'repositories-addsetting';
        this.i_scroll = null;
    },
    initializeView: function () {
        JayScrum.app.hideLoading();
        //this.i_scroll = JayScrum.app.initScrollById('addSettingScroller');
    },
    tearDownView: function () {
        if (this.i_scroll) {
            this.i_scroll.destroy();
            this.i_scroll = null;
        }
    }
}, null);
$data.Class.define('JayScrum.Views.RepositoryAddSubscription', JayScrum.FrameView, null, {
    constructor: function (name, path, tplSource) {
        this.templateName = name || 'repositories-addsubscription';
        this.i_scroll = null;
    },
    initializeView: function () {
        JayScrum.app.hideLoading();
        this.i_scroll = JayScrum.app.initScrollById('addSubscriptionScroller');
    },
    tearDownView: function () {
        if (this.i_scroll) {
            this.i_scroll.destroy();
            this.i_scroll = null;
        }
      
    }
}, null);
$data.Class.define('JayScrum.Frames.Repositories', JayScrum.Frame, null, {
    constructor: function () {
        //register frameViews
        this.registerView('welcome', new JayScrum.Views.RepositoryWelcome('repositories-welcome'));
        this.registerView('settings', new JayScrum.Views.RepositorySettings('repositories-template'));
        this.registerView('subscription', new JayScrum.Views.RepositorySubscription('repositories-subscription'));
        this.registerView('addsubscription', new JayScrum.Views.RepositoryAddSubscription('repositories-addsubscription'));
        this.registerView('addsetting', new JayScrum.Views.RepositoryAddSetting('repositories-addsetting'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName = 'welcome';
        this.selectMetaView('defaultMeta');

        this.localContext = new JayScrum.Settings.RepositoryContext({ name: ['sqLite', 'indexedDb'], databaseName: 'JayScrumRepoSetting' });

        this.data = ko.observable({
            name: 'settings',
            selectedSetting: ko.observable(),
            settings: ko.observableArray(),
            errorMsg: ko.observable(),
            isRegistration: ko.observable(false),
            isSupportedPurchase: ko.observable(window['android']),
            subscriptionState: ko.observable()
        });

    },
    _resetData: function () {
        if (this.data().settings() !== null) {
            this.data().settings.removeAll();
        }
        this.data().errorMsg(null);
    },
    _handleDefaultRepo: function (result) {
        if (result && result.length > 0) {
            JayScrum.app.selectedFrame().connectTo(result[0].asKoObservable());
        }
        else {
            JayScrum.app.selectedFrame().localContext.Repositories.length(function (connectionCount) {
                if (!connectionCount) {
                    JayScrum.app.selectedFrame().selectedView().initializeView();
                } else {
                    JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
                    JayScrum.app.selectedFrame().selectView("settings");
                }
            });

        }
    },
    getDemoDb: function () {
        JayScrum.app.showLoading();
        InstallLocalDemoDb(JayScrum.app.selectedFrame().localContext)
        .then(function () {
            JayScrum.app.globalData().repositoryName('Demo local db');
            var newItem = new JayScrum.Settings.Repository({ Id: -1, Title: 'Demo local db', Status: "static", OrderId: '' });
            JayScrum.app.selectedFrame().localContext.Repositories.add(newItem);
            JayScrum.app.selectedFrame().localContext.saveChanges(function () {
                JayScrum.app._initializeDemoRepositories(JayScrum.app.selectedFrame().localContext);
            });

        });
    },
    _initializeRepositoriesFrame: function () {
        console.log('-== 1. initialize repository frame');
        var app = this;
        this.localContext.Repositories.toArray(function (result) {
            console.log("-== 2. Load repo settings: " + JSON.stringify(result));
            app.data().settings([]);
            result.forEach(function (repo) {
                app.data().settings.push(repo.asKoObservable());
            });
            app.data().selectedSetting(null);
            app.showActionBar();

            JayScrum.app.hideLoading();

            if (JayScrum.app.selectedFrame().data().isSupportedPurchase()) {
                console.log('-== 3. Call cordova transactions');
                cordova.exec(function (transactions) {
                    console.log('-== 4. Load transactions: ' + JSON.stringify(transactions));
                    var newTransactions = [];
                    for (var i = 0; i < transactions.length; i++) {
                        var repoItem = JayScrum.app.selectedFrame().data().settings().filter(function (item) { return item.OrderId() == transactions[i].OrderId })[0];
                        if (repoItem === null || repoItem === undefined || (repoItem && repoItem.Status() !== 'ready')) {
                            if (repoItem) {
                                transactions[i].DevPayLoad = repoItem.innerInstance.initData;
                            }
                            newTransactions.push(transactions[i]);
                        }
                    }
                    if (newTransactions.length > 0) {
                        JayScrum.app.selectedFrame()._createNewRepoOrUpdateStatus(newTransactions);
                    }
                },
                    JayScrum.app.selectedFrame()._cordovaFailCallback,
                    "InAppBilling",
                    "transactions",
                    []);
            }

        });
    },

    _sendProvisionReq: function (transactions) {
        var provisionReqDef = Q.defer();
        console.log(JSON.stringify(transactions));
        console.log("-== 5.1. Request to Service metadata: " + JayScrum.ScrumApp.ApplicationUrl + "/Service/$metadata");
        $data.service(JayScrum.ScrumApp.ApplicationUrl + "/Service/$metadata", function (factory, contextType) {
            var provisionContext = factory();
            provisionContext.Provision(JSON.stringify(transactions))
            .then(function (result) { provisionReqDef.resolve(result); })
            .fail(function (error) { console.log(JSON.stringify(error)); provisionReqDef.fail(error) });
        },
        { user: 'admin', password: 'admin' });
        return provisionReqDef.promise;
    },
    _createNewRepoOrUpdateStatus: function (transactions) {
        console.log("-== 5. create or update tran");
        console.log(JSON.stringify(transactions));
        for (var i = 0; i < transactions.length; i++) {
            if (!transactions[i].DevPayLoad.Title) {
                transactions[i].DevPayLoad.Title = transactions[i].DevPayLoad.title;
                transactions[i].DevPayLoad.UserName = transactions[i].DevPayLoad.usr;
                transactions[i].DevPayLoad.Password = transactions[i].DevPayLoad.psw;
                transactions[i].DevPayLoad.OrderId = transactions[i].OrderId;
            }
        }
        JayScrum.app.selectedFrame()._sendProvisionReq(transactions)
        .then(function (result) {
            console.log("-== 6. create database ok");
            console.log(result);
            var redirect = false;
            for (var i = 0; i < result.length; i++) {
                console.log("-== 7/0 i count: " + i + ", tracked entities: " + JayScrum.app.selectedFrame().localContext.stateManager.trackedEntities.length)
                var repoItem = JayScrum.app.selectedFrame().data().settings().filter(function (item) { return item.OrderId() == result[i].OrderId })[0];
                if (repoItem) {
                    if (repoItem.Status() != result[i].Status) {
                        console.log("-== 7/1. update status")
                        repoItem.Status(result[i].Status);
                        var updatItem = new JayScrum.Settings.Repository({ Id: repoItem.Id(), Status: '' });
                        JayScrum.app.selectedFrame().localContext.Repositories.attach(updatItem);
                        updatItem.Status = result[i].Status;
                        redirect = true;
                    }
                } else {
                    console.log("-== 7/2. Add new repo: " + JSON.stringify(result[i]));
                    if (result[i].DevPayLoad.Title) {
                        var repo = new JayScrum.Settings.Repository({
                            Title: result[i].DevPayLoad.Title,
                            Status: result[i].Status,
                            OrderId: result[i].OrderId,
                            Url: result[i].DevPayLoad.Url ? result[i].DevPayLoad.Url : "",
                            UserName: result[i].DevPayLoad.UserName,
                            Password: result[i].DevPayLoad.Password
                        });
                        console.log("###!!! new repo orderid: " + repo.OrderId);
                        JayScrum.app.selectedFrame().localContext.add(repo);
                        redirect = true;
                    }
                }
            }
            console.log("-== 8. redirect: " + redirect + " tracked entities: " + JayScrum.app.selectedFrame().localContext.stateManager.trackedEntities.length);
            if (redirect) {
                JayScrum.app.selectedFrame().localContext.saveChanges({
                    success: function () {
                        console.log("-== 9/1. save new repos");
                        JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
                    },
                    error: function (error) {
                        console.log("-== 9/2. error in save");
                        console.log(JSON.stringify(error));
                    }
                });
            }
        })
        .fail(function (error) { console.log(JSON.stringify(error)); });
    },
    _getDefaultRepository: function (callBack) {
        return this.localContext.Repositories.where(function (repo) { return repo.IsDefault === true; }, null).take(1).toArray(callBack);
    },
    _getAllRepositorySettings: function (callBack) {
        return this.localContext.Repositories.toArray(callBack);
    },
    connectTo: function (repoSetting) {
        JayScrum.app.globalData().repositoryName(repoSetting.Title() + ' (' + repoSetting.Url() + ') ');
        //Repository Id is -1, if it is local storage
        if (repoSetting.Id() === -1) {
            JayScrum.app._initializeDemoRepositories(JayScrum.app.selectedFrame().localContext);
            return;
        }
        JayScrum.app.showLoading();
        var url = repoSetting.RealUrl() || repoSetting.Url();
        //If url is only 4 char, it is a smart url and must resolve it
        if (url.length == 4) {
            JayScrum.app._getFullUrl(url, 'admin', 'admin')
            .then(function (realUrl) {
                console.log("Resolved url: " + url);
                JayScrum.app.selectedFrame().localContext.attach(repoSetting);
                repoSetting.RealUrl(realUrl);
                JayScrum.app.selectedFrame().localContext.saveChanges(function () {
                    JayScrum.app.selectedFrame().connectTo(repoSetting);
                });
            });
            return;
        }
        url = url.toLowerCase();
        if (url.indexOf('http') !== 0) {
            url = "http://" + url.toLowerCase() + JayScrum.Frames.Repositories.ServerUrl;
        }

        JayScrum.app._initializeRepositories(url, repoSetting.UserName(), repoSetting.Password())
            .fail(function () {
                JayScrum.app.hideLoading();
                JayScrum.app.selectedFrame().data().errorMsg('Failed to connect repository!');
                if (!$('div#error-msg').hasClass('opened')) {
                    if ($('div#repo-info').hasClass('opened')) {
                        $('div#repo-info').removeClass('opened');
                    }

                    $('div#error-msg').addClass('opened');
                }
            });
    },
    editSetting: function (item) {
        var entity = JayScrum.app.selectedFrame().localContext.Repositories.attachOrGet(item);
        JayScrum.app.selectedFrame().data().selectedSetting(entity.asKoObservable());
        JayScrum.app.selectedFrame().data().settings(null);

        /*JayScrum.app.selectedFrame().hideActionBar();
        JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById('settingPageScroll');*/
        JayScrum.app.selectedFrame().selectView("addsetting");
    },
    deleteSetting: function (item) {
        JayScrum.app.selectedFrame().localContext.Repositories.remove(item);
        JayScrum.app.selectedFrame().localContext.saveChanges(function () {
            JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
        });
    },
    addSetting: function (item) {
        var newItem = new JayScrum.Settings.Repository({ Title: 'Repository', Status: "static" });
        this.localContext.Repositories.add(newItem);
        this.data().settings(null);
        this.data().selectedSetting(newItem.asKoObservable());
        /*
        JayScrum.app.selectedFrame().hideActionBar();
        JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById('settingPageScroll');
        */

        JayScrum.app.selectedFrame().selectView("addsetting");
    },
    buyDatabase: function () {
        this.data().isRegistration(true);
        var newItem = new JayScrum.Settings.Repository({ Title: 'Repository', Status: "initializing" });
        //this.localContext.Repositories.add(newItem);
        this.data().settings(null);
        this.data().selectedSetting(newItem.asKoObservable());

        /* JayScrum.app.selectedFrame().hideActionBar();
        JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById('settingPageScroll');
        */
        JayScrum.app.selectedFrame().selectView("addsubscription");
    },
    toggleInfoBox: function () {
        $('div#repo-info').toggleClass('opened');
        $('div#error-msg').removeClass('opened');

        if ($('div#repo-info').hasClass('opened') && JayScrum.app.selectedFrame().selectedView().i_scroll_popup == null) {
            JayScrum.app.selectedFrame().selectedView().i_scroll_popup = JayScrum.app.initScrollById('repo-info-scroll');
        }
    },
    saveSetting: function (item) {
        $("div#settingPage input:focus").trigger('blur');
        JayScrum.app.selectedFrame().localContext.saveChanges(function () {
            JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
        });

        /*JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById("settingPageScroll");*/
        JayScrum.app.selectedFrame().selectView("settings");
    },
    cancelSetting: function (item) {
        JayScrum.app.selectedFrame().localContext.Repositories.detach(arguments[0]);
        JayScrum.app.selectedFrame().data().selectedSetting(null);
        JayScrum.app.selectedFrame().data().isRegistration(false);
        JayScrum.app.selectedFrame()._initializeRepositoriesFrame();

        //JayScrum.app.selectedFrame().hideActionBar();
        //JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        //JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById("settingPageScroll");
        JayScrum.app.backView();
    },
    onFrameChangingFrom: function (newFrameMeta, oldFrameMeta, initData, frame) {
        var loadingPromise = Q.defer();
        JayScrum.app.showLoading();
        this.data().initData = initData;
        var self = this;
        loadingPromise.resolve();
        return loadingPromise.promise;
    },
    onFrameChangedFrom: function (newFrameData, oldFrameData, frame) {
        var self = this;
        this.localContext.onReady(function () {
            if (self.data().initData && self.data().initData.autoConnect) {
                self._getDefaultRepository(self._handleDefaultRepo);
            } else {
                if (self.data().initData && self.data().initData.error) { self.data().errorMsg(self.data().initData.error); }
                self._initializeRepositoriesFrame();
                if (newFrameData.viewName !== 'settings') {
                    JayScrum.app.selectedFrame().selectView('settings');
                }
            }
        });

        this.i_scroll = JayScrum.app.initScrollById('settingPageScroll', null, null, false, true);
    },
    showActionBar: function () {
        $('div#settingPageActionBar').addClass("opened");
    },
    hideActionBar: function () {
        $('div#settingPageActionBar').removeClass("opened");
        $('div#error-msg').removeClass('opened');
        $("div#repo-info").removeClass('opened');
    },

    //InApp purchase
    subscriptionDatabase: function (item) {
        JayScrum.app.selectedFrame().data().errorMsg("");
        if (item.UserName() && item.Password()) {
            JayScrum.app.selectedFrame().data().subscriptionState('appStore');
            JayScrum.app.selectedFrame().selectView('subscription');
            console.log('-== 91. subscribe db: ' + JSON.stringify(item.innerInstance));
            cordova.exec(JayScrum.app.selectedFrame()._successSubscriptionRequest,
                JayScrum.app.selectedFrame()._cordovaFailCallback,
                "InAppBilling",
                "subscribe",
                [item.innerInstance]);
        } else {
            JayScrum.app.selectedFrame().data().errorMsg("You must set UserName and Password field!");
        }
    },
    _successSubscriptionRequest: function (result) {
        if (result !== "RESULT_OK") {
            console.log('-== 92/1. error subscribe');
            //TODO: RESULT_USER_CANCELED
            //JayScrum.app.selectedFrame()._cordovaFailCallback(result);
            JayScrum.app.selectedFrame().data().subscriptionState('faild');
            return;
        }
        JayScrum.app.selectedFrame().data().subscriptionState('storm');
        console.log('-== 92/2. success subscribe');

        var getTranCount = 0;
        var getTranFn = function () {
            cordova.exec(function (transactions) {
                console.log('-== 4. Load transactions: ' + JSON.stringify(transactions));
                var newTransactions = [];
                var oId = JayScrum.app.selectedFrame().data().selectedSetting().OrderId();
                var tran = transactions.filter(function (t) { return t.OrderId == oId; })[0];
                //TODO: remove before publish
                if (getTranCount < 5) {
                    tran = undefined;
                }
                //transaction is not ready at AppStore, wait and retry 3 times
                if (!tran) {
                    if (getTranCount < 3) {
                        getTranCount = getTranCount + 1;
                        setTimeout(getTranFn, 3000);
                    } else {
                        //JayScrum.app.selectedFrame()._cordovaFailCallback("Google inapp payment transaction faild!");
                        JayScrum.app.selectedFrame().data().subscriptionState('faild');
                    }
                } else {
                    tran.DevPayLoad = JayScrum.app.selectedFrame().data().selectedSetting().innerInstance.initData;
                    //TODO: uncomment before publish

                    //JayScrum.app.selectedFrame()._sendProvisionReq([tran])
                    //.then(function (result) {
                    //    var payload = result[0].DevPayLoad;
                    //    payload.Status = 'ready';
                    //    var newItem = new JayScrum.Settings.Repository(payload);
                    //    JayScrum.app.selectedFrame().localContext.Repositories.add(newItem);
                    //    JayScrum.app.selectedFrame().data().selectedSetting(newItem.asKoObservable());
                    //    JayScrum.app.selectedFrame().localContext.saveChanges(function () {
                    //        JayScrum.app.selectedFrame().data().subscriptionState('finish');
                    //    });
                    //    console.log("result: ", result);
                    //})
                    //.fail(function (error) { console.log(error);JayScrum.app.selectedFrame().data().subscriptionState('faild');});

                    //TODO: remove before publish
                    setTimeout(function () {
                        var n = new JayScrum.Settings.Repository(tran.DevPayLoad);
                        n.Url = "7h2m";
                        JayScrum.app.selectedFrame().data().selectedSetting(n.asKoObservable());
                        JayScrum.app.selectedFrame().data().subscriptionState('finish');
                    }, 2000);
                }
            },
            JayScrum.app.selectedFrame()._cordovaFailCallback,
            "InAppBilling",
            "transactions",
            []);
        };
        getTranFn();
    },
    _cordovaFailCallback: function () {
        console.log("!!!!!!!ERROR!!!!!!!");
        alert('ERROR: ' + JSON.stringify(arguments));
    },
    unSubscriptionDatabase: function () {
        console.log("unsubscription");
    },
    refreshSettings: function () {
        JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
    },

    getTransactionsClick: function (item) {
        console.log('getTransactions: ' + JSON.stringify(item));
        cordova.exec(JayScrum.app.selectedFrame()._cordovaSuccessCallback,
            JayScrum.app.selectedFrame()._cordovaFailCallback,
            "InAppBilling",
            "transactions",
            [{ usr: item.UserName(), psw: item.Password(), dbName: item.Url(), title: item.Title()}]);
    }
}, {
    ServerUrl: '.jaystack.net',
    SubscriptionState: { AppStore: 'appstore', Storm: 'storm', End: "finish" }
});
