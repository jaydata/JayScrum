/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 9:28 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Frames.Sprints', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('sprints', new JayScrum.FrameView('sprint-template'));
        this.registerView('sprintEdit', new JayScrum.FrameView('sprintEditView-template'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.selectView('sprints');
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
    _initializeView: function(){
        JayScrum.app.visibleLoadingScreen(false);
        JayScrum.app.selectedFrame().selectView('sprints');
        $("h1.main-header").addClass("animate");
        $("div.icon-action.back.topleft.main").show();
        initScrollById("transition-iteration", null, null, true);
        JayScrum.app.selectedFrame().data().selectedSprint(null);
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
        var sprint = new JayScrum.repository.Sprints.createNew({ Id: 0, Name: '', StartDate: new Date(), FinishDate: new Date().addDays(7) });
        sprint = sprint.asKoObservable();
        JayScrum.app.selectedFrame().onEditSprint(sprint);
    },
    onEditSprint: function (sprintItem) {
        JayScrum.app.selectedFrame().data().selectedSprint(sprintItem);

        var sprint = sprintItem.innerInstance;
        if (sprint.Id > 0) {
            JayScrum.repository.Sprints.attach(sprint);
        } else {
            JayScrum.repository.Sprints.add(sprint);
        }

        JayScrum.app.selectedFrame().selectView('sprintEdit');
        $("h1.main-header").addClass("animate");
        initScrollById('transition-iteration-edit');
        initDateFieldsById('transition-iteration-edit');
        $("div.metro-actionbar.detail-view-edit").addClass("opened");

    },
    onCancelSprint: function (sprintItem) {
        if (sprintItem != null) {
            var sprint = sprintItem.innerInstance;
            JayScrum.repository.Sprints.detach(sprint);
        }
        JayScrum.app.selectedFrame()._loadData()
            .then(JayScrum.app.selectedFrame()._initializeView);
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
    onFrameChangedFrom:function (activeFrameMeta, oldFrameMeta, initDatam, frame) {
        this._loadData()
            .then(this._initializeView);
    }
}, null);