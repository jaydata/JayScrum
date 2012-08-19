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
            isRegistration: ko.observable(false)
        });

    },
    _resetData: function(){
        this.data().settings.removeAll();
        this.data().errorMsg(null);
    },
    _handleDefaultRepo:function(result){
        if (result && result.length > 0) {
            JayScrum.app.selectedFrame().connectTo(result[0]);
        }
        else {
            JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
        }
    },

    _initializeRepositoriesFrame: function () {
        var app = this;
        this.localContext.Repositories.toArray(function (result) {
            app.data().settings([new JayScrum.Settings.Repository({Id:-1, Title:'Demo local db'})]);
            result.forEach(function(repo){
                app.data().settings.push(repo);
            });
            app.data().selectedSetting(null);
            app.showActionBar();

            JayScrum.app.hideLoading();
        });
    },
    _getDefaultRepository: function (callBack) {
        return this.localContext.Repositories.where(function (repo) { return repo.IsDefault === true; }, null).take(1).toArray(callBack);
    },
    _getAllRepositorySettings: function (callBack) {
        return this.localContext.Repositories.toArray(callBack);
    },
    connectTo:function (repoSetting) {
        if(repoSetting.Id === -1){
            JayScrum.app._initializeDemoRepositories();
            return;
        }
        var url = repoSetting.Url;
        if(url.indexOf('http') !== 0){
            //url = 'http://app1.storm.jaystack.com:3000/'+repoSetting.Url.toLowerCase();
            url = 'http://192.168.1.142:3000/'+repoSetting.Url.toLowerCase();
        }

        var urlparser = document.createElement('a');
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
        });

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
        var newItem = new JayScrum.Settings.Repository({Title:'Repository'});
        this.localContext.Repositories.add(newItem);
        this.data().settings(null);
        this.data().selectedSetting(newItem.asKoObservable());

        JayScrum.app.selectedFrame().hideActionBar();
        JayScrum.app.selectedFrame().selectedView().i_scroll.destroy();
        JayScrum.app.selectedFrame().selectedView().i_scroll = JayScrum.app.initScrollById('settingPageScroll');
    },
    buyDatabase: function(){
        console.log('buy db');
    },
    createDatabase: function(){
        this.data().isRegistration(true);
        var newItem = new JayScrum.Settings.Repository({Title:'Repository'});
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
        var self = this;
        this.localContext.onReady(function(){
            if(initData && initData.autoConnect){
                self._getDefaultRepository(self._handleDefaultRepo);
            } else {
                if(initData && initData.error){self.data().errorMsg(initData.error);}
                self._initializeRepositoriesFrame();
            }
            loadingPromise.resolve();
        });
        return loadingPromise.promise;
    },
    onFrameChangedFrom:function (newFrameData, oldFrameData, frame) {
        this._loadData()
            .then(function(){
                //JayScrum.app.hideLoading();
                JayScrum.app.selectedFrame().selectedView().initializeView();
            });
    },
    showActionBar:function () {
        $('div#settingPageActionBar').addClass("opened");
    },
    hideActionBar:function () {
        $('div#settingPageActionBar').removeClass("opened");
        $('div#error-msg').removeClass('opened');
    }
}, null);