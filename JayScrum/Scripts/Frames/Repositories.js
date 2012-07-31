/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 9:28 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Frames.Repositories', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('settings', new JayScrum.FrameView('repositories-template'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName = 'settings';
        this.selectMetaView('defaultMeta');

        this.localContext = new JayScrum.Settings.RepositoryContext({ name: ['sqLite', 'indexedDb'], databaseName: 'JayScrumRepoSetting' });

        this.data = ko.observable({
            name:'settings',
            selectedSetting: ko.observable(),
            settings: ko.observableArray()
        });

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
        this.frameApp.visibleLoadingScreen(true);
        var app = this;
        this.localContext.Repositories.toArray(function (result) {
            app.data().settings(result);
            app.data().selectedSetting(null);
            app.showActionBar();
            app.frameApp.visibleLoadingScreen(false);
        });
    },
    _getDefaultRepository: function (callBack) {
        return this.localContext.Repositories.where(function (repo) { return repo.IsDefault === true; }, null).take(1).toArray(callBack);
    },
    _getAllRepositorySettings: function (callBack) {
        return this.localContext.Repositories.toArray(callBack);
    },
    connectTo:function(repoSetting){
        console.log(repoSetting);
        JayScrum.repository = new LightSwitchApplication.ApplicationData({ name: 'storm', url: repoSetting.Url, user: repoSetting.UserName, password: repoSetting.Password });
        JayScrum.repository.onReady(function(){
            JayScrum.app.selectFrame('MainFrame');
        });
    },
    editSetting:function(item){
        var entity = JayScrum.app.selectedFrame().localContext.Repositories.attachOrGet(item);
        JayScrum.app.selectedFrame().data().selectedSetting(entity.asKoObservable());
        JayScrum.app.selectedFrame().data().settings(null);
        JayScrum.app.selectedFrame().hideActionBar();
    },
    deleteSetting:function(item){
        JayScrum.app.selectedFrame().localContext.Repositories.remove(item);
        JayScrum.app.selectedFrame().localContext.saveChanges(function () {
            JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
        });
    },
    addSetting:function(item){
        var newItem = new JayScrum.Settings.Repository();
        this.localContext.Repositories.add(newItem);
        this.data().settings(null);
        this.data().selectedSetting(newItem.asKoObservable());

        this.hideActionBar();
        initScrollById('settingPageScroll');
    },
    saveSetting:function(item){
        $("div#settingPage input:focus").trigger('blur');
        JayScrum.app.selectedFrame().localContext.saveChanges(function () {
            JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
        });


        initScrollById("settingPageScroll");
    },
    cancelSetting:function(item){
        console.log(item);
        JayScrum.app.selectedFrame().localContext.Repositories.detach(arguments[0]);
        JayScrum.app.selectedFrame().data().selectedSetting(null);

        JayScrum.app.selectedFrame()._initializeRepositoriesFrame();
    },
    onFrameChangingFrom: function(newFrameMeta, oldFrameMeta, initData, frame){
        this.frameApp.visibleLoadingScreen(true);
        var self = this;
        this.localContext.onReady(function(){
            if(initData){
                self._getDefaultRepository(self._handleDefaultRepo);
            }else{
                self._initializeRepositoriesFrame();
            }
        });
    },
    onFrameChangedFrom:function (newFrameMeta, oldFrameMeta, frame) {

    },
    showActionBar:function () {
        $('div#settingPageActionBar').addClass("opened");
    },
    hideActionBar:function () {
        $('div#settingPageActionBar').removeClass("opened");
    }
}, null);