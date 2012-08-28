/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 9:28 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Views.RepositorySettings', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'repositories-template';
        this.i_scroll = null;
    },
    initializeView:function(){
        //JayScrum.app.hideLoading();
        this.i_scroll = JayScrum.app.initScrollById('settingPageScroll');
    },
    tearDownView:function(){
        if(this.i_scroll){
            this.i_scroll.destroy();
            this.i_scroll = null;
        }
    }
}, null);
$data.Class.define('JayScrum.Frames.Repositories', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('settings', new JayScrum.Views.RepositorySettings('repositories-template'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName = 'settings';
        this.selectMetaView('defaultMeta');

        this.localContext = new JayScrum.Settings.RepositoryContext({ name: ['sqLite', 'indexedDb'], databaseName: 'JayScrumRepoSetting' });

        this.data = ko.observable({
            name:'settings',
            selectedSetting: ko.observable(),
            settings: ko.observableArray(),
            errorMsg: ko.observable(),
            isRegistration: ko.observable(false),
            isSupportedPurchase: ko.observable(android)
        });

    },
    _resetData: function(){
        this.data().settings.removeAll();
        this.data().errorMsg(null);
    },
    _handleDefaultRepo:function (result) {
        if (result && result.length > 0) {
            JayScrum.app.selectedFrame().connectTo(result[0]);
        }
        else {
            JayScrum.app.selectedFrame().localContext.Sprints.length(function (sprintCount) {
                if (sprintCount) {
                    JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
                } else {
                    InstallLocalDemoDb(JayScrum.app.selectedFrame().localContext)
                        .then(function () {
                            JayScrum.app.globalData().repositoryName('Demo local db');
                            JayScrum.app._initializeDemoRepositories(JayScrum.app.selectedFrame().localContext);
                        });
                }
            });

        }
    },

    _initializeRepositoriesFrame: function () {
        var app = this;
        this.localContext.Repositories.toArray(function (result) {
            app.data().settings([(new JayScrum.Settings.Repository({Id:-1, Title:'Demo local db', Status: "static", OrderId:''})).asKoObservable()]);
            result.forEach(function(repo){
                app.data().settings.push(repo.asKoObservable());
            });
            app.data().selectedSetting(null);
            app.showActionBar();

            JayScrum.app.hideLoading();

            if(JayScrum.app.selectedFrame().data().isSupportedPurchase()){
                cordova.exec(function(transactions){
                        console.log('Call cordova transactions');
                        var newTransactions = [];
                        for(var i=0;i<transactions.length;i++){
                            var repoItem = JayScrum.app.selectedFrame().data().settings().filter(function(item){return item.OrderId() == transactions[i].OrderId})[0];
                            if(repoItem === null || repoItem === undefined || (repoItem && repoItem.Status() !== 'ready')){
                                if(repoItem){
                                    transactions[i].devPayLoad = repoItem.innerInstance.initData;
                                }
                                newTransactions.push(transactions[i]);
                            }
                        }
                        if(newTransactions.length>0){
                            JayScrum.app.selectedFrame()._createNewRepoOrUpdateStatus(newTransactions);
                        }
                    },
                    JayScrum.app.selectedFrame()._cordovaFailCallback,
                    "InAppBilling",
                    "transactions",
                    null);
            }

        });
    },
    _createNewRepoOrUpdateStatus:function(transactions){
      console.log("create or update tran");
        console.log(transactions);
        $.ajax({
            url:'http://192.168.1.142:3000/CreateDatabase2',
            data:JSON.stringify(transactions),
            type:"POST",
            contentType: 'application/json',
            error:function (xhr, status, error) {
                console.log(error);
                //JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
            },
            success:function (data, status, xhr) {
                console.log("create database ok");
                console.log(JSON.parse(data));
                var result = JSON.parse(data);
                var redirect = false;
                for(var i=0;i<result.length;i++){
                    var repoItem = JayScrum.app.selectedFrame().data().settings().filter(function(item){return item.OrderId() == result[i].OrderId})[0];
                    if(repoItem){
                        if(repoItem.Status() != result[i].Status){
                            repoItem.Status(result[i].Status);
                            var updatItem = new JayScrum.Settings.Repository({Id:repoItem.Id(), Status:''});
                            JayScrum.app.selectedFrame().localContext.Repositories.attach(updatItem);
                            updatItem.Status = result[i].Status;
                            redirect = true;
                        }
                    }else{
                        //add new repo
                        var repo = new JayScrum.Settings.Repository({
                            Title: result[i].Title,
                            Status: result[i].Status,
                            OrderId:result[i].OrderId,
                            Url:result[i].Url,
                            UserName:result[i].UserName,
                            Password:result[i].Password});
                        JayScrum.app.selectedFrame().localContext.add(repo);
                        redirect = true;
                    }
                }
                if(redirect){
                    JayScrum.app.selectedFrame().localContext.saveChanges(function () {
                        JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
                    });
                }
            }

        });
    },
    _getDefaultRepository: function (callBack) {
        return this.localContext.Repositories.where(function (repo) { return repo.IsDefault === true; }, null).take(1).toArray(callBack);
    },
    _getAllRepositorySettings: function (callBack) {
        return this.localContext.Repositories.toArray(callBack);
    },
    connectTo:function (repoSetting) {
        JayScrum.app.globalData().repositoryName(repoSetting.Title());
        if(repoSetting.Id() === -1){
            JayScrum.app._initializeDemoRepositories(JayScrum.app.selectedFrame().localContext);
            return;
        }
        var url = repoSetting.Url();
        if(url.indexOf('http') !== 0){
            //url = 'http://app1.storm.jaystack.com:3000/'+repoSetting.Url.toLowerCase();
            url = 'http://192.168.1.142:3000/'+repoSetting.Url().toLowerCase();
        }
        JayScrum.app._initializeRepositories(url, repoSetting.UserName, repoSetting.Password);

        /*var urlparser = document.createElement('a');
        urlparser.href = url;
        var dbName = urlparser.pathname.slice(1);
        if(dbName[dbName.length-1] === '/'){
            dbName = dbName.slice(0,-1);
        }

        var createDbUrl = urlparser.protocol + '//' + urlparser.host + '/CreateDatabase?dbName=' + dbName + '&schemaName=jayscrumcontext';
        var createUserDbUrl = urlparser.protocol + '//' + urlparser.host + '/CreateDatabase?dbName=' + dbName + '_users&schemaName=jaystormcontext';

        $.ajax({
            url:createDbUrl,
            error:function (xhr, status, error) {
                console.log(error);
                JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
            },
            success:function (data, status, xhr) {

                $.ajax({
                    url: createUserDbUrl,
                    error:function (xhr, status, error) {
                        console.log(error);
                        JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
                    },
                    success:function (data, status, xhr) {
                        JayScrum.app._initializeRepositories(url, repoSetting.UserName, repoSetting.Password);
                    }
                });
            }
        });*/

    },
    editSetting:function(item){
        var entity = JayScrum.app.selectedFrame().localContext.Repositories.attachOrGet(item);
        JayScrum.app.selectedFrame().data().selectedSetting(entity.asKoObservable());
        JayScrum.app.selectedFrame().data().settings(null);

        JayScrum.app.selectedFrame().hideActionBar();
        JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById('settingPageScroll');
    },
    deleteSetting:function(item){
        JayScrum.app.selectedFrame().localContext.Repositories.remove(item);
        JayScrum.app.selectedFrame().localContext.saveChanges(function () {
            JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
        });
    },
    addSetting:function(item){
        var newItem = new JayScrum.Settings.Repository({Title:'Repository', Status:"static"});
        this.localContext.Repositories.add(newItem);
        this.data().settings(null);
        this.data().selectedSetting(newItem.asKoObservable());

        JayScrum.app.selectedFrame().hideActionBar();
        JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById('settingPageScroll');
    },
    buyDatabase: function(){
        this.data().isRegistration(true);
        var newItem = new JayScrum.Settings.Repository({Title:'Repository', Status:"initializing"});
        this.localContext.Repositories.add(newItem);
        this.data().settings(null);
        this.data().selectedSetting(newItem.asKoObservable());

        JayScrum.app.selectedFrame().hideActionBar();
        JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById('settingPageScroll');
    },
    saveSetting:function(item){
        $("div#settingPage input:focus").trigger('blur');
        JayScrum.app.selectedFrame().localContext.saveChanges(function () {
            JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
        });

        JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById("settingPageScroll");
    },
    cancelSetting:function(item){
        JayScrum.app.selectedFrame().localContext.Repositories.detach(arguments[0]);
        JayScrum.app.selectedFrame().data().selectedSetting(null);
        JayScrum.app.selectedFrame().data().isRegistration(false);
        JayScrum.app.selectedFrame()._initializeRepositoriesFrame();

        JayScrum.app.selectedFrame().hideActionBar();
        JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById("settingPageScroll");
    },
    onFrameChangingFrom: function(newFrameMeta, oldFrameMeta, initData, frame){
        var loadingPromise = Q.defer();
        JayScrum.app.showLoading();
        this.data().initData = initData;
        var self = this;
        loadingPromise.resolve();
        return loadingPromise.promise;
    },
    onFrameChangedFrom:function (newFrameData, oldFrameData, frame) {
        var self = this;
        this.localContext.onReady(function(){
                if(self.data().initData && self.data().initData.autoConnect){
                    self._getDefaultRepository(self._handleDefaultRepo);
                } else {
                    if(self.data().initData && self.data().initData.error){self.data().errorMsg(self.data().initData.error);}
                    self._initializeRepositoriesFrame();
                }
                JayScrum.app.selectedFrame().selectedView().initializeView();
        });
    },
    showActionBar:function () {
        $('div#settingPageActionBar').addClass("opened");
    },
    hideActionBar:function () {
        $('div#settingPageActionBar').removeClass("opened");
        $('div#error-msg').removeClass('opened');
    },
    //InApp purchase
    _successSubscriptionRequest:function(result){
        if(result.res !== "RESULT_OK"){
            JayScrum.app.selectedFrame()._cordovaFailCallback();
            return;
        }
        JayScrum.app.selectedFrame().data().selectedSetting(null);
        JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
        JayScrum.app.selectedFrame().hideActionBar();
        JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById("settingPageScroll");
        /*cordova.exec(JayScrum.app.selectedFrame()._sendTransactionToSrv,
            JayScrum.app.selectedFrame()._cordovaFailCallback,
            "InAppBilling",
            "transactions",
            [result.subscriptionId]);*/

    },
    /*_sendTransactionToSrv: function(transaction){
        console.log("Save transaction to db!");

        console.log(transactions);
    },*/
    _cordovaFailCallback:function(){
        alert('ERROR: '+JSON.stringify(arguments));
    },

    subscriptionDatabase: function(item){
        console.log('subscribe db: '+JSON.stringify(item.innerInstance));
        cordova.exec(JayScrum.app.selectedFrame()._successSubscriptionRequest,
            JayScrum.app.selectedFrame()._cordovaFailCallback,
            "InAppBilling",
            "subscribe",
            [item.innerInstance]);
    },

	getTransactionsClick:function(item){
		console.log('getTransactions: '+JSON.stringify(item));
        cordova.exec(JayScrum.app.selectedFrame()._cordovaSuccessCallback,
            JayScrum.app.selectedFrame()._cordovaFailCallback,
            "InAppBilling",
            "transactions",
            [{usr:item.UserName(), psw:item.Password(), dbName: item.Url(), title:item.Title()}]);
	}
}, null);
/*
cordova = {};
cordova.exec = function(success, error, name, functionname, params){
    if(functionname == "transactions" && params == null){

        success(JSON.parse('[{"OrderId":"order1", "productId":"havielofzu_nagy", "purchaseToken":"", "devPayLoad":{"Title":"Repository","Url":"af","UserName":"asdf","Password":"sdf","IsDefault":false}},' +
            '{"OrderId":"order2", "productId":"havielofzu_nagy", "purchaseToken":"", "devPayLoad":{"Title":"Repository","Url":"af2","UserName":"asdf","Password":"sdf","IsDefault":false}}]'));
        return;
    }else if(functionname == "subscribe"){
        success({res:"RESULT_OK", subscriptionId:'havielofzu_nagy'});
    }else if(functionname == "transactions" && params != null){
        success(JSON.parse('{"OrderId":"order1", "productId":"havielofzu_nagy", "purchaseToken":"", "devPayLoad":{"Title":"Repository","Url":"af","UserName":"asdf","Password":"sdf","IsDefault":false}}'));
    }
    //success(params[0]);

}*/