/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 9:28 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Views.Sprints', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'print-template';
        this.i_scroll = null;
    },
    initializeView:function(){
        JayScrum.app.hideLoading();
        $("h1.main-header").addClass("animate");
        this.i_scroll = JayScrum.app.initScrollById("transition-iteration");
    },
    tearDownView:function(){
        this.i_scroll.destroy();
        this.i_scroll = null;
    }
}, null);
$data.Class.define('JayScrum.Views.SprintEdit', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'sprintEditView-template';
        this.i_scroll = null;
    },
    initializeView:function(){
        $("h1.main-header").addClass("animate");
        this.i_scroll = JayScrum.app.initScrollById("transition-iteration-edit");
        initDateFieldsById('transition-iteration-edit');
        $("div.metro-actionbar.detail-view-edit").addClass("opened");
    },
    tearDownView:function(){
        this.i_scroll.destroy();
        this.i_scroll = null;
    }
}, null);
$data.Class.define('JayScrum.Frames.Sprints', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('sprints', new JayScrum.Views.Sprints('sprint-template'));
        this.registerView('sprintEdit', new JayScrum.Views.SprintEdit('sprintEditView-template'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName='sprints';
        this.selectMetaView('defaultMeta');
        this.data = ko.observable({
            name:'Sprints',
            sprintList: ko.observableArray(),
            selectedSprint: ko.observable()
        });
    },
    _isPinnedSprint: function (sprint) {
        var pinnedSprints = getSetting('pinnedSprints');
        if (!pinnedSprints) { pinnedSprints = []; }
        return pinnedSprints.indexOf(sprint.Id()) >= 0;
    },
    _loadData: function () {
        var loadingPromise = Q.defer();
       JayScrum.repository.Sprints
            .orderBy(function (item) { return item.StartDate })
            .toArray(function (sprints) {
                JayScrum.app.selectedFrame().data().sprintList([]);
                for(var i=0;i<sprints.length;i++){
                    var sprint = sprints[i].asKoObservable();
                    sprint.isPinned = ko.observable();
                    sprint.isPinned(JayScrum.app.selectedFrame()._isPinnedSprint(sprint));
                    JayScrum.app.selectedFrame().data().sprintList.push(sprint);
                }
               loadingPromise.resolve();
            });
        return loadingPromise.promise;
    },
    _resetData: function(){
        console.log('reset data');
        this.data().sprintList.removeAll();
        this.data().selectedSprint(null);
    },
    onPinSprint: function (sprint) {
        var pinnedSprints = getSetting('pinnedSprints');
        if (pinnedSprints) {
            var index = pinnedSprints.indexOf(sprint.Id())
            if (index < 0) {
                pinnedSprints.push(sprint.Id());
                sprint.isPinned(true);
            } else {
                pinnedSprints.splice(index, 1);
                sprint.isPinned(false);
            }
        } else {
            pinnedSprints = [sprint.Id()];
        }
        setSetting('pinnedSprints', JSON.stringify(pinnedSprints));
    },
    onAddSprint: function (sprint) {
        var sprint = new JayScrum.repository.Sprints.createNew({ Id: null, Name: '', StartDate: new Date(), FinishDate: new Date().addDays(7) });
        sprint = sprint.asKoObservable();
        JayScrum.app.selectedFrame().onEditSprint(sprint);
    },
    onEditSprint: function (sprintItem) {
        JayScrum.app.selectedFrame().data().selectedSprint(sprintItem);

        var sprint = sprintItem.innerInstance;
        if (sprint.Id !== null) {
            JayScrum.repository.Sprints.attach(sprint);
        } else {
            JayScrum.repository.Sprints.add(sprint);
        }

        JayScrum.app.selectedFrame().selectView('sprintEdit');
    },
    onCancelSprint: function (sprintItem) {
        if (sprintItem != null) {
            var sprint = sprintItem.innerInstance;
            JayScrum.repository.Sprints.detach(sprint);
        }
        JayScrum.app.selectedFrame()._loadData()
            .then(function(){
                JayScrum.app.backView();
                JayScrum.app.selectedFrame().data().selectedSprint(null);
            });
    },
    onSaveSprint: function (sprintItem) {
        JayScrum.app.visibleLoadingScreen(true);

        var sprint = sprintItem.innerInstance;
        sprint.StartDate = new Date(moment(sprint.StartDate).valueOf());
        sprint.FinishDate = new Date(moment(sprint.FinishDate).valueOf());
        JayScrum.repository.saveChanges(function () {
            JayScrum.app.selectedFrame().onCancelSprint();
        });
    },
    onDeleteSprint: function (item) {
        JayScrum.app.visibleLoadingScreen(true);

        JayScrum.repository.remove(item.innerInstance);
        JayScrum.repository.saveChanges(function () {
            JayScrum.app.selectedFrame().onCancelSprint();
        });
    },
    onSelectSprint: function(item){
        JayScrum.app.selectFrame('ScrumWall', undefined, item.innerInstance);
    }
}, null);