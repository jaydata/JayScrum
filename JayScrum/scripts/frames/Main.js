/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 8:43 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Views.Main', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'dashBoard-template';
        this.i_scroll = null;
    },
    initializeView:function(){
        JayScrum.app.hideLoading();
        this.i_scroll = JayScrum.app.initScrollById("metro-tiles-scroll", null, null, true);
    },
    tearDownView:function(){
        if(this.i_scroll){
            this.i_scroll.destroy();
        }
        this.i_scroll = null;
    }
}, null);
$data.Class.define('JayScrum.Frames.Main', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('dashboard', new JayScrum.Views.Main('dashBoard-template'));
        this.registerMetaView('dashboardMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName='dashboard';
        this.selectMetaView('dashboardMeta');
        this.data = ko.observable({
            name:'jayscrum',
            activeSprintList: ko.observableArray(),
            activeSprintsTaskIds: ko.observableArray()
        });
    },
    _loadData:function () {
        var loadDefer = Q.defer();
        var self = this;

        var pinnedSprints = getSetting('pinnedSprints');
        if(pinnedSprints == null || pinnedSprints == undefined){pinnedSprints = [];}
        JayScrum.repository.getSprintsData(pinnedSprints).toArray({success:function(sprintsData){
            for (var s in sprintsData) {
                self.data().activeSprintList.push(sprintsData[s]);
            }
            initUI();
            loadDefer.resolve();
        },
            error:function (error) {
                loadDefer.reject();
                JayScrum.app.selectFrame('Repositories',undefined, {error:'Connection error: '+error});
            }
        });

        return loadDefer.promise;
    },
    _resetData:function(){
        console.log('reset data');
        this.data().activeSprintList.removeAll();
        this.data().activeSprintsTaskIds.removeAll();
    },
    isPinnedSprint: function (sprint) {
        var pinnedSprints = getSetting('pinnedSprints');
        if (!pinnedSprints) { pinnedSprints = []; }
        return pinnedSprints.indexOf(sprint.Id) >= 0;
    },
    onTaskListShow:function(item){
        JayScrum.app.selectFrame('ScrumWall', undefined, item);
    },
    onSprintListShow:function(item){
        JayScrum.app.selectFrame('Sprints');
    },
    onUserStoryListShow:function(item){
        JayScrum.app.selectFrame('UserStories');
    },
    onSettingsShow:function(item){
        JayScrum.app.selectFrame('ThemeSettings');
    },
    onRepositorySettingShow:function(item){
        JayScrum.app.selectFrame('Repositories');
    },
    onUserSettingShow:function(item){
        JayScrum.app.selectFrame('Users');
    },
    onProjectListShow:function(item){
        JayScrum.app.selectFrame('Projects');
    }
}, null);