$data.Class.define('JayScrum.Models.settingPage', null, null, {
    localContext: {},
    settingsKoModel: {},
    constructor: function () {
        var app = this;
        this.localContext = new JayScrum.Settings.RepositoryContext({ name: ['sqLite', 'indexedDb'], databaseName: 'JayScrumRepoSetting' });
        //this.securityContext = new Microsoft.LightSwitch.Security.SecurityData({ name: 'oData', oDataServiceHost: 'http://localhost/JayScrumServer_ls/Microsoft.LightSwitch.SecurityData.svc' });

        this.settingsKoModel = {
            selectedSetting: ko.observable(),
            settings: ko.observableArray(),
            users: ko.observableArray(),
            roles: ko.observableArray(),
            editSetting: function () {
                var entity = app.localContext.Repositories.attachOrGet(arguments[0]);
                app.settingsKoModel.selectedSetting(entity.asKoObservable());
                app.settingsKoModel.settings(null);
                hideActionBar();
            },
            deleteSetting: function () { app.deleteRepositorySetting(arguments[0]); },
            addSetting: function () { app.addRepositorySetting(); },
            saveSetting: function () { app.save(arguments[0]); },
            connecTo: function () { app.connect(arguments[0]); },
            cancelSetting: function () {
                app.localContext.Repositories.detach(arguments[0]);
                app.settingsKoModel.selectedSetting(null);

                app.initializeSettingsApp();
            }
        };

        this.loginSettings = {};
        this.localContext.onReady(function () { app.initializeApplication.call(app, true) });
    },
    initializeApplication: function (isFirstTime) {
        var app = this;
        this.getDefaultRepository(function (result) {
            if (result && result.length > 0) {
                app.connect(result[0]);
            }
            else {
                app.initializeSettingsApp();
            }
        });
    },
    initializeSettingsApp: function () {
        var app = this;
        this.localContext.Repositories.toArray(function (result) {
            app.settingsKoModel.settings(result);
            app.settingsKoModel.selectedSetting(null);
            showActionBar();
        });
        //this.securityContext.UserRegistrations.toArray(function (result) {
        //    app.settingsKoModel.users(result);
        //});
    },
    addRepositorySetting: function () {
        var newItem = new JayScrum.Settings.Repository();
        this.localContext.Repositories.add(newItem);
        this.settingsKoModel.settings(null);
        this.settingsKoModel.selectedSetting(newItem.asKoObservable());

        hideActionBar();
        initScrollById('settingPageScroll');
    },
    deleteRepositorySetting: function (repoSetting) {
        var app = this;
        this.localContext.Repositories.remove(repoSetting);
        this.localContext.saveChanges(function () {
            app.initializeSettingsApp();
        });
    },
    save: function (repoSetting) {
        var app = this;
        this.localContext.saveChanges(function () {
            app.initializeSettingsApp();
        });

        console.log($("div#settingPage input:focus"));
        $("div#settingPage input:focus").trigger('blur');
        initScrollById("settingPageScroll");
    },
    connect: function (repoSetting) {
        console.dir(repoSetting);
        showLoading();

        $data.Model.settingPage.loginSettings = repoSetting;
        //LightSwitchApplication.context = new LightSwitchApplication.ApplicationData({ name: 'oData', oDataServiceHost: repoSetting.Url, user: repoSetting.UserName, password: repoSetting.Password });
        LightSwitchApplication.context = new LightSwitchApplication.ApplicationData({ name: 'storm', url: repoSetting.Url, user: repoSetting.UserName, password: repoSetting.Password });
        $data.ScrumDb = LightSwitchApplication.context;
        $data.Model.mainPage = new JayScrum.Models.mainPage();
        $data.Model.activePartName('mainPage');
        $data.Model.ScrumAsync();

        setTimeout(function () {
            initScrollById("metro-tiles-scroll", null, null, true);
        }, 500);
    },
    getDefaultRepository: function (callBack) {
        return this.localContext.Repositories.where(function (repo) { return repo.IsDefault === true; }, null).take(1).toArray(callBack);
    },
    getAllRepositorySettings: function (callBack) {
        return this.localContext.Repositories.toArray(callBack);
    }
}, null);

$data.Entity.extend('JayScrum.Settings.Repository', {
    Id: { type: $data.Integer, key: true, computed: true },
    Title: { type: $data.String, nullable: false, required: true },
    Url: { type: $data.String, nullable: false, required: true },
    UserName: { type: $data.String, nullable: true },
    Password: { type: $data.String, nullable: true },
    IsDefault: { type: $data.Boolean, nullable: true }
});
$data.EntityContext.extend('JayScrum.Settings.RepositoryContext', {
    Repositories: { type: $data.EntitySet, elementType: JayScrum.Settings.Repository },
});

showActionBar = function () {
    $('div#settingPageActionBar').addClass("opened");
}
hideActionBar = function () {
    $('div#settingPageActionBar').removeClass("opened");
}