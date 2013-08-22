/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 9:28 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Views.UserStory', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'userStory-template';
        this.independent_iScroll = null;
        this.sprint_iScrolls = null;
        this.horizontalScroll = null;
    },
    initializeView:function(){
        JayScrum.app.hideLoading();
        $("h1.main-header").addClass("animate");

        this.independent_iScroll = JayScrum.app.initScrollById("transition-us", JayScrum.app.selectedFrame().onIndependentUserStoryListPullUp, JayScrum.app.selectedFrame().onIndependentUserStoryListPullDown);
        var listCount = JayScrum.app.selectedFrame().data().userStoriesInSprintList().length;
        this.sprint_iScrolls = [];
        for (var i = 0; i < listCount; i++) {
            this.sprint_iScrolls.push(
            JayScrum.app.initScrollById("transition-us-" + i, JayScrum.app.selectedFrame().onUserStoryInSprintListPullUp, JayScrum.app.selectedFrame().onUserStoryInSprintListPullDown)
            )
        }

        this.horizontalScroll = JayScrum.app.initHorizontalScrollById("wrapper", 0);
    },
    tearDownView: function(){
        this.independent_iScroll.destroy();
        this.independent_iScroll = null;
        this.horizontalScroll.destroy();
        this.horizontalScroll = null;
        while(this.sprint_iScrolls.length>0){
            var scroll = this.sprint_iScrolls.pop();
            scroll.destroy();
            scroll = null;
        }
        this.sprint_iScrolls = null;
    }
}, null);
$data.Class.define('JayScrum.Views.UserStorySelected', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'userStorySelectView-template';
        this.i_scroll = null;
    },
    initializeView:function(){
        JayScrum.app.hideLoading();

        var self = this;
        JayScrum.app.initScrollPosition("swipeview-inside-1", "#swipeview");
        setTimeout(function () {
            self.i_scroll = JayScrum.app.initScrollById('swipeview-inside-1', null, null, true);
        }, 350);
    },
    tearDownView: function(){
        if(this.i_scroll !== null){
            this.i_scroll.destroy();
        }
        this.i_scroll = null;
    }
}, null);
$data.Class.define('JayScrum.Views.UserStoryEditor', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'userStoryEditView-template';
        this.i_scroll = null;
    },
    initializeView:function(){
        JayScrum.app.hideLoading();
        $("h1.main-header").addClass("animate");
        var swipeHeight = $("div.detail-edit-fix-header h1").height();
        $("div#wrapper-detailed-edit").css('top', swipeHeight);
        
        if (android23 || window["IsNote404"]) {
            this.i_scroll = JayScrum.app.initScrollById('wrapper-detailed-edit');
        }
    },
    tearDownView: function () {
        if (this.i_scroll) {
            this.i_scroll.destroy();
            this.i_scroll = null;
        }
    }
}, null);
$data.Class.define('JayScrum.Frames.UserStories', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('userStory', new JayScrum.Views.UserStory('userStory-template'));
        this.registerView('userStorySelected', new JayScrum.Views.UserStorySelected('userStorySelectView-template'));
        this.registerView('userStoryEditor', new JayScrum.Views.UserStoryEditor('userStoryEditView-template'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName='userStory';
        this.selectMetaView('defaultMeta');
        this.listLoadSize = window['isDesktop'] ? 9999 : 7;
        this.data = ko.observable({
            name:'User Stories',
            userStoryList: ko.observableArray(),
            userStoriesInSprintList: ko.observableArray([]),
            selectedUserStory: ko.observable(),
            selectedUserStoryTaskList: ko.observableArray()
        });
    },
    _loadData: function () {
        var loadingPromise = Q.defer();
        JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == null })
            .orderBy(function(item){return item.Priority;})
            .orderBy(function(item){return item.Title;})
            .take(JayScrum.app.selectedFrame().listLoadSize)
            .toArray(function (userStoryResult) {
                JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().userStoryList, userStoryResult);

                JayScrum.repository.Sprints
                    .where(function (sprint) { return sprint.FinishDate > moment().utc().toDate() })
                    .select(function (sprint) { return { Id: sprint.Id, Name: sprint.Name, StartDate: sprint.StartDate, FinishDate: sprint.FinishDate } })
                    .toArray(function (sprinIds) {
                        JayScrum.app.selectedFrame().data().userStoriesInSprintList([]);
                        Q.fcall(JayScrum.app.selectedFrame()._getUserStoryInSprintList, sprinIds, null)
                            .then(function(){loadingPromise.resolve();});

                    });
            });
        return loadingPromise.promise;
    },
    _resetData: function(){
        //console.log('reset data');

        this.data().userStoryList.removeAll();
        this.data().userStoriesInSprintList.removeAll();
        this.data().selectedUserStoryTaskList.removeAll();
        this.data().selectedUserStory(null);
    },
    _getUserStoryInSprintList: function (sprintDataList, promise) {
        if(sprintDataList.length<1){
            return;
        }
        if(promise === null){
            promise = Q.defer();
        }
        var sprintData = sprintDataList.shift(1);

        JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == this.sprintId }, { sprintId: sprintData.Id })
            .orderBy(function(item){return item.Priority;})
            .orderBy(function(item){return item.Title;})
            .take(JayScrum.app.selectedFrame().listLoadSize)
            .toArray(function (usList) {

                var actualList = ko.observableArray();
                JayScrum.app.selectedFrame().data().userStoriesInSprintList.push({
                    list: actualList,
                    sprintId: sprintData.Id,
                    sprintName: sprintData.Name,
                    StartDate: sprintData.StartDate,
                    FinishDate: sprintData.FinishDate
                });
                JayScrum.pushObservablesToList(actualList, usList);
                if (sprintDataList.length > 0) {
                    JayScrum.app.selectedFrame()._getUserStoryInSprintList(sprintDataList, promise);
                } else {
                    promise.resolve();
                }
            });
        return promise.promise;
    },

    _onRefreshDropDownLists: function () {
        var loadingPromise = Q.defer();
        var refreshLists = [JayScrum.app.onRefreshProjectList(), JayScrum.app.onRefreshUserStoryList(), JayScrum.app.onRefreshUserList(), JayScrum.app.onRefreshSprintListForDropDown()];
        Q.all(refreshLists)
            .then(function(){loadingPromise.resolve()});

        return loadingPromise.promise;
    },
    onIndependentUserStoryListPullUp: function (scroller) {
        JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == null })

            .orderBy(function(item){return item.Priority;})
            .orderBy(function(item){return item.Title;})
            .skip(JayScrum.app.selectedFrame().data().userStoryList().length)
            .take(JayScrum.app.selectedFrame().listLoadSize)
            .toArray(function (userStoryResult) {
                JayScrum.app.selectedFrame().data().userStoryList(JayScrum.app.selectedFrame().data().userStoryList().concat(
                    userStoryResult.map(function (item) { return item.asKoObservable(); })
                ));
                scroller.refresh();
            });
    },
    onIndependentUserStoryListPullDown: function (scroller) {
        JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == null })
            .orderBy(function(item){return item.Priority;})
            .orderBy(function(item){return item.Title;})
            .take(JayScrum.app.selectedFrame().listLoadSize)
            .toArray(function (userStoryResult) {
                JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().userStoryList, userStoryResult);
                scroller.refresh();
            });
    },
    onUserStoryInSprintListPullUp: function (scroller) {
        var sprintIndex = scroller.scroller.attributes['data-sprintIndex'].value;
        var currentList = JayScrum.app.selectedFrame().data().userStoriesInSprintList()[sprintIndex];

        JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == this.sprintId }, { sprintId: currentList.sprintId })
            .orderBy(function(item){return item.Priority;})
            .orderBy(function(item){return item.Title;})
            .skip(currentList.list().length)
            .take(JayScrum.app.selectedFrame().listLoadSize)
            .toArray(function (usList) {
                currentList.list(currentList.list().concat(
                    usList.map(function (item) { return item.asKoObservable(); })
                ));
                scroller.refresh();
            });
    },
    onUserStoryInSprintListPullDown: function (scroller) {
        var sprintIndex = scroller.scroller.attributes['data-sprintIndex'].value;
        var currentList = JayScrum.app.selectedFrame().data().userStoriesInSprintList()[sprintIndex];

        JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == this.sprintId }, { sprintId: currentList.sprintId })
            .orderBy(function(item){return item.Priority;})
            .orderBy(function(item){return item.Title;})
            .take(JayScrum.app.selectedFrame().listLoadSize)
            .toArray(function (usList) {
                var newData = usList.map(function (item) { return item.asKoObservable(); });
                currentList.list(newData);
                scroller.refresh();
            });
    },

    onAddUserStory: function(wrkItem){
        var item = new JayScrum.repository.WorkItems.createNew({
            Id: null,
            Title: "",
            Type: "UserStory",
            Description: "",
            CreatedDate: new Date().toISOString(),
            CreatedBy: JayScrum.app.globalData().user().Login(),
            ChangedDate: new Date().toISOString(),
            ChangedBy: JayScrum.app.globalData().user().Login(),
            Priority: 0,
            AssignedTo: "",
            State: "New",
            //Project: "JayStack",
            Effort: 0,
            BusinessValue: 0,
            RemainingWork: 0,
            IsBlocked:false
            //Reason: "New task",
            //IterationPath: $data.Model.mainPage.currentSprint().IterationPath(),
            //AreaPath: $data.Model.mainPage.currentSprint().AreaPath()
            //ParentName: " ",
            //FinishDate: "",
            //StartDate: ""
        });
        item = item.asKoObservable();
        JayScrum.app.selectedFrame().data().selectedUserStory(item);
        JayScrum.app.selectedFrame().onEditUserStory(item);
    },
    onSelectUserStory: function (wrkItem, isEventCall) {
        JayScrum.app.selectedFrame().data().selectedUserStory(wrkItem);
        JayScrum.app.selectedFrame().data().selectedUserStoryTaskList.removeAll();
        JayScrum.app.selectedFrame().selectView('userStorySelected', wrkItem);
    },
    onEditUserStory:function (wrkItem, isEventCall) {
        JayScrum.app.selectedFrame()._onRefreshDropDownLists()
            .then(function () {
                if(wrkItem.Id() === null){
                    JayScrum.repository.WorkItems.add(wrkItem);
                }else{
                    JayScrum.repository.WorkItems.attach(wrkItem);
                }
                JayScrum.app.selectedFrame().selectView('userStoryEditor');
            });

    },
    onSaveUserStory: function (wrkItem, isEventCall) {
        JayScrum.app.showLoading();

        //this.clear();
        if (wrkItem.State() == 'In Progress') {
            if (wrkItem.Reason() == 'Work finished')
                wrkItem.Reason('Additional work found');
            else
                wrkItem.Reason('Work started');

            wrkItem.RemainingWork(wrkItem.RemainingWork() || 0);
        } else if (wrkItem.State() == "Done") {
            wrkItem.Reason('Work finished');
            wrkItem.RemainingWork(null);
        } else if (wrkItem.State() == 'To Do') {
            wrkItem.Reason(wrkItem.Id() === null ? 'New task' : 'Work stopped');
        }
        //save parentName
        var us = JayScrum.app.globalData().userStoryList().filter(function (item) { return item.Id() == wrkItem.WorkItem_WorkItem() })[0];
        if (us) {
            wrkItem.ParentName(us.Title());
        }
        //projectname update
        var project = JayScrum.app.globalData().projectList().filter(function (item) { return item.Id() == wrkItem.WorkItem_Project() })[0];
        if (project) {
            wrkItem.ProjectName(project.Name());
        }
        //sprintname update
        var sprint = JayScrum.app.globalData().sprintList().filter(function (item) { return item.Id() == wrkItem.WorkItem_Sprint() })[0];
        if (sprint) {
            wrkItem.SprintName(sprint.Name());
        }
        //save workItem
        wrkItem.ChangedBy(JayScrum.app.globalData().user().Login());
        wrkItem.ChangedDate(new Date());

        if (wrkItem.Id() === null) {
            JayScrum.repository.WorkItems.add(wrkItem);
        }

        JayScrum.repository.saveChanges(function (result) {
            ///remove item from lists
            JayScrum.app.selectedFrame().data().userStoriesInSprintList().forEach(function(sprint){sprint.list.remove(wrkItem)});
            JayScrum.app.selectedFrame().data().userStoryList.remove(wrkItem);
            //add item to new lists
            var sprint = [];
            if(wrkItem.WorkItem_Sprint() === null){
                sprint.push({list: JayScrum.app.selectedFrame().data().userStoryList});
            }else{
                sprint = JayScrum.app.selectedFrame().data().userStoriesInSprintList().filter(function(s){return s.sprintId == wrkItem.WorkItem_Sprint()});
            }
            if(sprint && sprint.length>0){
                sprint[0].list.push(wrkItem);
            }
            JayScrum.app.selectedFrame().onCancelUserStory();
        });
    },
    onCancelUserStory: function (wrkItem, isEventCall) {
        JayScrum.repository.WorkItems.detach(wrkItem);
        JayScrum.app.backView();
    },
    onUpdateUserStory: function (workItem, isEventCall) {
        JayScrum.repository.WorkItems.where(function (item) { return item.Id == this.currentItem.Id }, { currentItem: workItem }).toArray({
            success: function (result) {

                var propName = result[0].getType().memberDefinitions.getPublicMappedPropertyNames();
                propName.forEach(function(propName){
                    workItem[propName](result[0][propName]);
                },this);
            },
            error: function (error) { console.log("Refresh error!!"); console.dir(error); }
        });
    },
    onDeleteUserStory: function (workItem){
        JayScrum.repository.remove(workItem);
        JayScrum.app.selectedFrame().data().userStoriesInSprintList().forEach(function(sprint){sprint.list.remove(workItem)});
        JayScrum.app.selectedFrame().data().userStoryList.remove(workItem);
        JayScrum.repository.saveChanges(function () {
            JayScrum.app.selectedFrame().onCancelUserStory(workItem);
        });
    },

    onRefreshWorkItemsOfUserStory: function (userStory) {
        JayScrum.repository.WorkItems
            .where(function (item) { return  item.WorkItem_WorkItem == this.userStoryId && ( item.Type == "Task" || item.Type == "UserStory");}, { userStoryId: userStory.Id() })
            .orderBy(function (item) { return item.Priority; })
            .toArray(function (workItems) {
                JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().selectedUserStoryTaskList, workItems);

                JayScrum.app.selectedFrame().selectedView().i_scroll.refresh();
            });
    },
    onSelectWorkItemOfUserStory: function (wrkItem, isEventCall) {
        JayScrum.app.selectFrame('ScrumWall', 'taskSelect', {wrkItem:  wrkItem, list:JayScrum.app.selectedFrame().data().selectedUserStoryTaskList()}, true);
    },
    onAddNewTaskToUserStory:function(userStory){
        var item = (new JayScrum.repository.WorkItems.createNew({
            Id: null,
            Title: "",
            Type: "Task",
            Description: "",
            CreatedDate: new Date().toISOString(),
            CreatedBy: JayScrum.app.globalData().user().Login(),
            ChangedDate: new Date().toISOString(),
            ChangedBy: JayScrum.app.globalData().user().Login(),
            Priority: 0,
            AssignedTo: "",
            State: "To Do",
            Effort: 0,
            BusinessValue: 0,
            RemainingWork: 0,
            IsBlocked:false,
            WorkItem_WorkItem:userStory.Id(),
            WorkItem_Project: userStory.WorkItem_Project(),
            WorkItem_Sprint: userStory.WorkItem_Sprint()
        })).asKoObservable();
        JayScrum.repository.add(item);
        JayScrum.app.selectFrame('ScrumWall', 'taskEdit', item, true);
    },
    onFrameChangingFrom: function(activeFrameMeta, oldFrameMeta, initData, frame){
        var loadingPromise = Q.defer();
        var self = this;
        switch(activeFrameMeta.viewName){
            case 'userStorySelected':
                this.data().selectedUserStory(initData);
                loadingPromise.resolve();
                break;
            case 'userStoryEditor':
                this._onRefreshDropDownLists()
                    .then(function(){
                        self.data().selectedUserStory(initData);
                        loadingPromise.resolve();
                    });
                break;
            default:
                loadingPromise.resolve();
                break;
        }
        return loadingPromise.promise;
    },
    onFrameChangedFrom:function (activeFrameMeta, oldFrameMeta, frame) {
        switch(activeFrameMeta.viewName){
            case 'userStorySelected':
            case 'userStoryEditor':
                JayScrum.app.selectedFrame().selectedView().initializeView();
                break;
            default:
                this._loadData()
                    .then(function(){JayScrum.app.selectedFrame().selectedView().initializeView()});
                break;
        }
    }
}, null);