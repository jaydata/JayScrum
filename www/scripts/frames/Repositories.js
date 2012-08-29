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
    	console.log('-== 1. initialize repository frame');
    	var app = this;
        this.localContext.Repositories.toArray(function (result) {
        	console.log("-== 2. Load repo settings: "+JSON.stringify(result));
            app.data().settings([(new JayScrum.Settings.Repository({Id:-1, Title:'Demo local db', Status: "static", OrderId:''})).asKoObservable()]);
            result.forEach(function(repo){
                app.data().settings.push(repo.asKoObservable());
            });
            app.data().selectedSetting(null);
            app.showActionBar();

            JayScrum.app.hideLoading();

            if(JayScrum.app.selectedFrame().data().isSupportedPurchase()){
            	console.log('-== 3. Call cordova transactions');
                cordova.exec(function(transactions){
                		console.log('-== 4. Load transactions: '+JSON.stringify(transactions));
                        var newTransactions = [];
                        for(var i=0;i<transactions.length;i++){
                            var repoItem = JayScrum.app.selectedFrame().data().settings().filter(function(item){return item.OrderId() == transactions[i].OrderId})[0];
                            if(repoItem === null || repoItem === undefined || (repoItem && repoItem.Status() !== 'ready')){
                                if(repoItem){
                                    transactions[i].DevPayLoad = repoItem.innerInstance.initData;
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
                    []);
            }

        });
    },
    _createNewRepoOrUpdateStatus:function(transactions){
      console.log("-== 5. create or update tran");
        console.log(JSON.stringify(transactions));
        $.ajax({
            url: JayScrum.Frames.Repositories.ServerUrl+'CreateDatabase2',
            data:JSON.stringify(transactions),
            type:"POST",
            contentType: 'application/json',
            error:function (xhr, status, error) {
                console.log(error);
                //JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
            },
            success:function (data, status, xhr) {
                console.log("-== 6. create database ok");
                console.log(data);
                var result = JSON.parse(data);
                var redirect = false;
                for(var i=0;i<result.length;i++){
                	console.log("-== 7/0 i count: "+i+", tracked entities: "+JayScrum.app.selectedFrame().localContext.stateManager.trackedEntities.length)
                    var repoItem = JayScrum.app.selectedFrame().data().settings().filter(function(item){return item.OrderId() == result[i].OrderId})[0];
                    if(repoItem){
                        if(repoItem.Status() != result[i].Status){
                        	console.log("-== 7/1. update status")
                            repoItem.Status(result[i].Status);
                            var updatItem = new JayScrum.Settings.Repository({Id:repoItem.Id(), Status:''});
                            JayScrum.app.selectedFrame().localContext.Repositories.attach(updatItem);
                            updatItem.Status = result[i].Status;
                            redirect = true;
                        }
                    }else{
                    	console.log("-== 7/2. Add new repo: "+JSON.stringify(result[i]));
                        if(result[i].Title){
	                        var repo = new JayScrum.Settings.Repository({
	                            Title: result[i].Title,
	                            Status: result[i].Status,
	                            OrderId:result[i].OrderId,
	                            Url:result[i].Url,
	                            UserName:result[i].UserName,
	                            Password:result[i].Password});
	                        console.log("###!!! new repo orderid: "+repo.OrderId);
	                        JayScrum.app.selectedFrame().localContext.add(repo);
	                        redirect = true;
                    	}
                    }
                }
                console.log("-== 8. redirect: "+redirect+" tracked entities: "+JayScrum.app.selectedFrame().localContext.stateManager.trackedEntities.length);
                if(redirect){
                	
                    JayScrum.app.selectedFrame().localContext.saveChanges({
                    	success:function () {
                    		console.log("-== 9/1. save new repos");
                    		JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
                    	}, 
                    	error:function(error){
                    		console.log("-== 9/2. error in save");
                    		alert(JSON.stringify(error));
                    	}
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
            url = JayScrum.Frames.Repositories.ServerUrl+repoSetting.Url().toLowerCase();
        }
        JayScrum.app._initializeRepositories(url, repoSetting.UserName, repoSetting.Password);
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
        //this.localContext.Repositories.add(newItem);
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
    	if(result !== "RESULT_OK"){
        	console.log('-== 92/1. error subscribe');
            JayScrum.app.selectedFrame()._cordovaFailCallback();
            return;
        }
        console.log('-== 92/2. success subscribe');
        JayScrum.app.selectedFrame().data().selectedSetting(null);
        JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
        JayScrum.app.selectedFrame().hideActionBar();
        JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById("settingPageScroll");

    },
    _cordovaFailCallback:function(){
    	console.log("!!!!!!!ERROR!!!!!!!");
        alert('ERROR: '+JSON.stringify(arguments));
    },

    subscriptionDatabase: function(item){
        console.log('-== 91. subscribe db: '+JSON.stringify(item.innerInstance));
        cordova.exec(JayScrum.app.selectedFrame()._successSubscriptionRequest,
            JayScrum.app.selectedFrame()._cordovaFailCallback,
            "InAppBilling",
            "subscribe",
            [item.innerInstance]);
    },
    unSubscriptionDatabase:function(){
        console.log("unsubscription");
    },
    refreshSettings:function(){
      JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
    },

	getTransactionsClick:function(item){
		console.log('getTransactions: '+JSON.stringify(item));
        cordova.exec(JayScrum.app.selectedFrame()._cordovaSuccessCallback,
            JayScrum.app.selectedFrame()._cordovaFailCallback,
            "InAppBilling",
            "transactions",
            [{usr:item.UserName(), psw:item.Password(), dbName: item.Url(), title:item.Title()}]);
	}
}, {
    ServerUrl:'http://192.168.1.142:3000/'
    //ServerSideUrl:'http://app1.storm.jaystack.com:3000/'
});