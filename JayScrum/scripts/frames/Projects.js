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
        this.i_scroll = null;
    },
    initializaView:function(){
        JayScrum.app.hideLoading();
        $("h1.main-header").addClass("animate");
        this.i_scroll = JayScrum.app.initScrollById("transition-projects");
    },
    tearDownView:function(){
        this.i_scroll.destroy();
        this.i_scroll = null;
    }
}, null);
$data.Class.define('JayScrum.Views.ProjectSelect', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'projectSelectView-template';
        this.i_scroll = null;
    },
    initializaView:function(){
        JayScrum.app.hideLoading();
        $("h1.main-header").addClass("animate");
        this.i_scroll = JayScrum.app.initScrollById("transition-projects");
    },
    tearDownView:function(){
        this.i_scroll.destroy();
        this.i_scroll = null;
    }
}, null);
$data.Class.define('JayScrum.Views.ProjectEdit', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'projectEditView-template';
        this.i_scroll = null;
    },
    initializaView:function(){
        JayScrum.app.hideLoading();
        $("h1.main-header").addClass("animate");
        this.i_scroll = JayScrum.app.initScrollById("transition-projects");
        $("div.metro-actionbar.detail-view-edit").addClass("opened");
    },
    tearDownView:function(){
        this.i_scroll.destroy();
        this.i_scroll = null;
    }
}, null);
$data.Class.define('JayScrum.Frames.Projects', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('projects', new JayScrum.Views.Projects('project-template'));
        this.registerView('project-select', new JayScrum.Views.ProjectSelect('projectSelectView-template'));
        this.registerView('project-edit', new JayScrum.Views.ProjectEdit('projectEditView-template'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName='projects';
        this.selectMetaView('defaultMeta');
        this.data = ko.observable({
            name:'Projects',
            projectList:ko.observableArray(),
            selectedProject: ko.observable(),
            userStoriesOfProject: ko.observableArray()
        });
    },
    _loadData:function () {
        var dataLoadPromis = Q.defer();
        JayScrum.repository.Projects.orderBy(function(item){return item.Name}).toArray(function (projects) {
            JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().projectList, projects);

            dataLoadPromis.resolve();
        });
        return dataLoadPromis.promise;
    },
    _restData:function(){
        console.log('reset data');
        this.data().projectList.removeAll();
        this.data().userStoriesOfProject.removeAll();
        this.data().selectedProject(null);
    },
    onAddProject: function (item) {
        var item = new JayScrum.repository.Projects.createNew({ Id: null, Name: '', Description: '' });
        item = item.asKoObservable();
        JayScrum.app.selectedFrame().onEditProject(item);
    },
    onEditProject: function (item) {
        JayScrum.app.selectedFrame().data().selectedProject(item);

        var project = item.innerInstance;
        if (project.Id !== null) {
            JayScrum.repository.Projects.attach(project);
        } else {
            JayScrum.repository.Projects.add(project);
        }

        JayScrum.app.selectedFrame().selectView('project-edit');
    },
    onCancelProject: function (projectItem) {
        if (projectItem != null) {
            var project = projectItem.innerInstance;
            JayScrum.repository.Projects.detach(project);
        }
        JayScrum.app.selectedFrame()._loadData()
            .then(function(){
                JayScrum.app.backView();
                if(projectItem.Id() === null){
                    JayScrum.app.selectedFrame().data().selectedProject(null);
                }else{
                    JayScrum.app.selectedFrame().data().selectedProject(projectItem);
                }
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
    onSelectProject:function(wrkItem){
        JayScrum.app.selectedFrame().data().selectedProject(wrkItem);
        JayScrum.app.selectedFrame().data().userStoriesOfProject.removeAll();
        JayScrum.app.selectedFrame().selectView('project-select');
    },
    onRefreshUserStoriesOfProject: function (project) {
        JayScrum.repository.WorkItems
            .where(function (item) { return ( item.Type == "UserStory") && item.WorkItem_Project == this.projectId;}, { projectId: project.Id() })
            .orderBy(function (item) { return item.Priority; })
            .toArray(function (userStories) {
                JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().userStoriesOfProject, userStories);

                JayScrum.app.selectedFrame().selectedView().i_scroll.refresh();
            });
    },
    onAddNewUserStoryToProject:function(project){
        var item = (new JayScrum.repository.WorkItems.createNew({
            Id: null,
            Title: "",
            Type: "Task",
            Description: "",
            CreatedDate: new Date().toISOString(),
            CreatedBy: 'Admin', //$data.Model.settingPage.loginSettings.UserName, //TODO: add user data
            ChangedDate: new Date().toISOString(),
            ChangedBy: 'Admin', //$data.Model.settingPage.loginSettings.UserName, //TODO: add user data
            Priority: 0,
            AssignedTo: "",
            State: "To Do",
            //WorkItem_Sprint: JayScrum.app.selectedFrame().data().currentSprint().innerInstance.Id,
            Effort: 0,
            BusinessValue: 0,
            RemainingWork: 0,
            IsBlocked:false,
            WorkItem_Project:project.Id()
            //Reason: "New task",
            //IterationPath: $data.Model.mainPage.currentSprint().IterationPath(),
            //AreaPath: $data.Model.mainPage.currentSprint().AreaPath()
            //ParentName: " ",
            //FinishDate: "",
            //StartDate: ""
        })).asKoObservable();
        JayScrum.repository.add(item);
        JayScrum.app.selectFrame('UserStories', 'userStoryEditor', item);
    },
    onSelectUserStoryOfProject: function (wrkItem) {
        JayScrum.app.selectFrame('UserStories', 'userStorySelected', wrkItem);
    }
}, null);