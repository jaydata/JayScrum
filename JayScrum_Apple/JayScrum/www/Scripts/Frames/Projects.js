/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 9:28 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Views.Projects', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'project-template';
    },
    initializaView:function(){
        console.log('==> initialize View');
        $("h1.main-header").addClass("animate");
        initScrollById("transition-projects", null, null, true);
    }
}, null);
$data.Class.define('JayScrum.Views.ProjectEdit', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'projectEditView-template';
    },
    initializaView:function(){
        console.log('==> initialize Edit View');
        $("h1.main-header").addClass("animate");
        initScrollById('transition-projects', null, null, true);
        $("div.metro-actionbar.detail-view-edit").addClass("opened");
    }
}, null);
$data.Class.define('JayScrum.frames.Projects', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('projects', new JayScrum.Views.Projects('project-template'));
        this.registerView('projects-edit', new JayScrum.Views.ProjectEdit('projectEditView-template'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName='projects';
        this.selectMetaView('defaultMeta');
        this.data = ko.observable({
            name:'Projects',
            projectList:ko.observableArray(),
            editableProject: ko.observable()
        });
    },
    _loadData:function () {
        var dataLoadPromis = Q.defer();
        JayScrum.repository.Projects.toArray(function (projects) {
            JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().projectList, projects);

            dataLoadPromis.resolve();
        });
        return dataLoadPromis.promise;
    },
    onAddProject: function (item) {
        var item = new JayScrum.repository.Projects.createNew({ Id: 0, Name: '', Description: '' });
        item = item.asKoObservable();
        JayScrum.app.selectedFrame().onEditProject(item);
    },
    onEditProject: function (item) {
        JayScrum.app.selectedFrame().data().editableProject(item);

        var project = item.innerInstance;
        if (project.Id > 0) {
            JayScrum.repository.Projects.attach(project);
        } else {
            JayScrum.repository.Projects.add(project);
        }

        JayScrum.app.selectedFrame().selectView('projects-edit');
    },
    onCancelProject: function (projectItem) {
        if (projectItem != null) {
            var project = projectItem.innerInstance;
            JayScrum.repository.Projects.detach(project);
        }
        JayScrum.app.selectedFrame()._loadData()
            .then(function(){
                JayScrum.app.selectedFrame().selectView('projects');
                JayScrum.app.selectedFrame().data().editableProject(null);
            });
    },
    onSaveProject: function (projectItem) {

        JayScrum.repository.saveChanges(function () {
            JayScrum.app.selectedFrame().onCancelProject();
        });
    },
    onDeleteProject: function (item) {
        JayScrum.repository.remove(item.innerInstance);
        JayScrum.repository.saveChanges(function () {
            JayScrum.app.selectedFrame().onCancelProject();
        });
    },
    onFrameChangedFrom:function (activeFrameMeta, oldFrameMeta, initDatam, frame) {
        this._loadData()
            .then(function () {
                JayScrum.app.hideLoading();
                JayScrum.app.selectedFrame().selectedView().initializaView();
            });
    }
}, null);