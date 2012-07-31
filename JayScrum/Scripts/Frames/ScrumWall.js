/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/31/12
 * Time: 9:03 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Frames.ScrumWall', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('scrumWall', new JayScrum.FrameView('scrumWall-template'));
        this.registerView('taskSelect', new JayScrum.FrameView('taskSelectView-template'));
        this.registerView('taskEdit', new JayScrum.FrameView('taskEditView-template'));
        this.registerMetaView('scrumWallMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName='scrumWall';
        this.selectMetaView('scrumWallMeta');

        this.data = ko.observable({
            currentSprint: ko.observable(),
            name:'scrumWall',
            recentlyChangedTasks: ko.observableArray(),
            todoList: ko.observableArray(),
            inProgList: ko.observableArray(),
            doneList: ko.observableArray(),
            summaryList:ko.observable({
                BackLogItemCountInSprint:0,
                SprintAllTaskCount: 0,
                SprintToDoTaskCount: 0,
                SprintInProgTaskCount: 0,
                SprintInProgTaskRemainingWork: 0,
                SprintDoneTaskCount: 0
            }),
            selectedWorkItem:ko.observable(),
            selectedWorkItemActive:ko.observable(),
            selectedWorkItemPrev:ko.observable(),
            selectedWorkItemNext:ko.observable()
        });
    },
    _loadTaskList:function(query, dataList, listId, pullUpFn, pullDownFn){
        var loadingPromise = Q.defer();
        var dList = dataList;
        var lId = listId;
        var pUpFn = pullUpFn;
        var pDownFn = pullDownFn;
        query.toArray(function(result){
            JayScrum.pushObservablesToList(dList, result);
            initScrollById(lId, pUpFn, pDownFn);
            loadingPromise.resolve();
        })
        return loadingPromise.promise;
    },
    _loadData:function(){
        var loadingPromise = Q.defer();
        JayScrum.app.selectedFrame()._loadTaskList(JayScrum.app.selectedFrame().recentlyChangedListQuery, JayScrum.app.selectedFrame().data().recentlyChangedTasks, 'transition0', null, null)
            .then(function(){
                JayScrum.app.selectedFrame()._loadTaskList(JayScrum.app.selectedFrame().toDoListQuery, JayScrum.app.selectedFrame().data().todoList, 'transition1', null, null)
                    .then(function(){
                        JayScrum.app.selectedFrame()._loadTaskList(JayScrum.app.selectedFrame().inProgressListQuery, JayScrum.app.selectedFrame().data().inProgList, 'transition2', null, null)
                            .then(function(){
                                JayScrum.app.selectedFrame()._loadTaskList(JayScrum.app.selectedFrame().doneListQuery, JayScrum.app.selectedFrame().data().doneList, 'transition3', null, null)
                                    .then(function(){
                                        initScrollById("transition4");
                                        initHorizontalScrollById("wrapper", 1);})
                                    .then(function(){loadingPromise.resolve();})
                            })
                    })
            })

        return loadingPromise.promise;
    },
    _findListById: function (wrkItemId, data) {
        var todoList = JayScrum.app.selectedFrame().data().todoList()
        for (var i = 0; i < todoList.length; i++) {
            if (todoList[i].Id() === wrkItemId) {
                if (data) { todoList[i] = data; }
                return [].concat(todoList);
            }
        }
        var inProgList = JayScrum.app.selectedFrame().data().inProgList();
        for (var i = 0; i < inProgList.length; i++) {
            if (inProgList[i].Id() === wrkItemId) {
                if (data) { inProgList[i] = data; }
                return [].concat(inProgList);
            }
        }
        var doneList = JayScrum.app.selectedFrame().data().doneList();
        for (var i = 0; i < doneList.length; i++) {
            if (doneList[i].Id() === wrkItemId) {
                if (data) { doneList[i] = data; }
                return [].concat(doneList);
            }
        }
        var userStoryList = JayScrum.app.selectedFrame().data().userStoryList();
        for (var i = 0; i < userStoryList.length; i++) {
            if (userStoryList[i].Id() === wrkItemId) {
                if (data) { userStoryList[i] = data; }
                return [].concat(userStoryList);
            }
        }
        return null;
    },
    _onRefreshDropDownLists: function () {
        var loadingPromise = Q.defer();
        JayScrum.app.onRefreshProjectList()
            .then(function () {
                JayScrum.app.onRefreshUserStoryList()
                    .then(function () {
                        JayScrum.app.onRefreshUserList()
                            .then(function () {
                                JayScrum.app.onRefreshSprintListForDropDown()
                                    .then(function () {
                                        loadingPromise.resolve();
                                    });
                            });
                    });
            });

        return loadingPromise.promise;
    },
    onSelectWorkItem: function (wrkItem, isEventCall) {
        console.log('onSelectWorkItem');

//        $data.Model.mainPage.activePart('selectedWorkitem');
        JayScrum.app.selectedFrame().data().selectedWorkItem(wrkItem);
        JayScrum.app.selectedFrame().data().selectedWorkItemActive(wrkItem);
        JayScrum.app.selectedFrame().selectView('taskSelect');

        $("h1.main-header").addClass("animate");
        $("div.icon-action.back.topleft.main").hide();
        $("div.metro-actionbar.detail-view").addClass("opened");

        // SWIPEVIEW FOR TASKS
        if (isEventCall && isEventCall.srcElement.attributes['data-isInRecentlyChangedList'] && isEventCall.srcElement.attributes['data-isInRecentlyChangedList'].value === 'true') {

            initSwipeviewById("swipeview", $data.Model.mainPage.recentlyChangedTasks(), wrkItem.Id());

        } else if (wrkItem.Type() == "Task") {

            var workItemId  = wrkItem.Id(),
                list        = JayScrum.app.selectedFrame()._findListById(workItemId, wrkItem);
            initSwipeviewById("swipeview", list, workItemId);

        } else {
            $("div.detail div#wrapper-detailed div.list div.pivot-content").show();

            var swipeviewUs = $("div#swipeview-inside-us"),
                title = swipeviewUs.prev(),
                minusHeight = title.height() + 15;

            swipeviewUs.css('top', minusHeight);
            initScrollById('swipeview-inside-us');

            console.log(scrollToRefresh);
        }
    },
    onEditWorkItem: function (wrkItem, isEventCall) {
        console.log('onEditWorkItem');

        JayScrum.app.selectedFrame()._onRefreshDropDownLists()
            .then(function(){
                JayScrum.repository.WorkItems.attach(wrkItem);
                JayScrum.app.selectedFrame().selectView('taskEdit')
                $("h1.main-header").addClass("animate");
                var swipeHeight = $("div.detail-edit-fix-header h1").height();
                $("div#wrapper-detailed-edit").css('top', swipeHeight);
                initScrollById('wrapper-detailed-edit', null, null, true);
            });
    },
    onSaveWorkItem: function (wrkItem, isEventCall) {
        console.log("save workitem - type: task");

        var currentLista = null;
        if (wrkItem.State() == 'In Progress') {
            if (wrkItem.Reason() == 'Work finished')
                wrkItem.Reason('Additional work found');
            else
                wrkItem.Reason('Work started');

            wrkItem.RemainingWork(wrkItem.RemainingWork() || 0);
            currentLista = JayScrum.app.selectedFrame().data().inProgList()
        } else if (wrkItem.State() == "Done") {
            wrkItem.Reason('Work finished');
            wrkItem.RemainingWork(null);
            currentLista = JayScrum.app.selectedFrame().data().doneList();
        } else if (wrkItem.State() == 'To Do') {
            wrkItem.Reason(wrkItem.Id() == 0 ? 'New task' : 'Work stopped');
            currentLista = JayScrum.app.selectedFrame().data().todoList();
        }
        //save parentName
        var us = JayScrum.app.selectedFrame().data().userStoryList().filter(function (item) { return item.Id() == wrkItem.WorkItem_WorkItem() })[0];
        if (us) {
            wrkItem.ParentName(us.Title());
        }
        //projectname update
        var project = JayScrum.app.selectedFrame().data().projectList().filter(function (item) { return item.Id() == wrkItem.WorkItem_Project() })[0];
        if (project) {
            wrkItem.ProjectName(project.Name());
        }
        //save workItem
        wrkItem.ChangedDate(new Date());

        if (wrkItem.Id() === 0) {
            JayScrum.repository.WorkItems.add(wrkItem);
            currentLista.push(wrkItem);
        }

        JayScrum.repository.saveChanges({
            success: function (error) {
                $(".metro-loading").hide();
                JayScrum.app.selectedFrame().onSelectWorkItem(wrkItem);
                JayScrum.app.selectedFrame().data().recentlyChangedTasks.unshift(wrkItem);

                hideLoading();
            },
            error: function (error) {
                $data.Model.ScrumAsync();

                hideLoading();
            }
        });
    },
    onCancelWorkItem: function (wrkItem, isEventCall) {
        console.log("cancel workitem - type: task");
        JayScrum.repository.WorkItems.detach(wrkItem);
        JayScrum.app.selectedFrame().onSelectWorkItem(wrkItem);
    },
    onAddWorkItem: function (wrkItem) {
        console.log("add workitem - type: task");
        //showLoading();

        $("h1.main-header").addClass("animate");

        var item = new $data.ScrumDb.WorkItems.createNew({
            Id: 0,
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
            WorkItem_Sprint: JayScrum.app.selectedFrame().data().currentSprint().innerInstance.Id,
            Effort: 0,
            BusinessValue: 0,
            RemainingWork: 0
            //Reason: "New task",
            //IterationPath: $data.Model.mainPage.currentSprint().IterationPath(),
            //AreaPath: $data.Model.mainPage.currentSprint().AreaPath()
            //ParentName: " ",
            //FinishDate: "",
            //StartDate: ""
        });

        item = item.asKoObservable();
        JayScrum.app.selectedFrame().onEditWorkItem(item);

        console.log(item);
    },
    onUpdateWorkItem: function (workItem, isEventCall) {
        console.log("update workitem");

       JayScrum.repository.WorkItems.where(function (item) { return item.Id == this.currentItem.Id }, { currentItem: workItem }).toArray({
            success: function (result) {
                workItem.innerInstance = result[0];

                JayScrum.app.selectedFrame().data().selectedWorkItemActive(workItem.innerInstance.asKoObservable());
                JayScrum.app.selectedFrame().data().selectedWorkItemPrev(JayScrum.app.selectedFrame().data().selectedWorkItemPrev().innerInstance.asKoObservable());
                JayScrum.app.selectedFrame().data().selectedWorkItem(JayScrum.app.selectedFrame().data().selectedWorkItem().innerInstance.asKoObservable());
                JayScrum.app.selectedFrame().data().selectedWorkItemNext(JayScrum.app.selectedFrame().data().selectedWorkItemNext().innerInstance.asKoObservable());
                JayScrum.app.selectedFrame().selectView('taskSelect');
            },
            error: function (error) { console.log("Refresh error!!"); console.dir(error); }
        });
    },
    onDeleteWorkItem: function (workItem) {
        JayScrum.repository.remove(workItem.innerInstance);
        JayScrum.repository.saveChanges(function () {
            $data.Model.mainPage.onCancelWorkItem(workItem);
        });
    },


    onFrameChangingFrom:function (activeFrameMeta, oldFrameMeta, initData, frame) {
        this.pinnedQueryParam = { sprintId: initData.Id() };
        this.toDoListQuery = JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "Task" && item.WorkItem_Sprint == this.sprintId && item.State == 'To Do' }, this.pinnedQueryParam)
            .orderBy(function (item) { return item.Priority; })
            .take(this.listLoadSize);
        this.inProgressListQuery = JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "Task" && item.WorkItem_Sprint == this.sprintId && item.State == 'In Progress' }, this.pinnedQueryParam)
            .orderBy(function (item) { return item.Priority; })
            .take(this.listLoadSize);
        this.doneListQuery = JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "Task" && item.WorkItem_Sprint == this.sprintId && item.State == 'Done' }, this.pinnedQueryParam)
            .orderBy(function (item) { return item.Priority; })
            .take(this.listLoadSize);
        this.recentlyChangedListQuery = JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "Task" && item.WorkItem_Sprint == this.sprintId && item.ChangedDate >= moment().add('days', -1).utc().toDate() }, this.pinnedQueryParam)
            .orderByDescending(function (item) { return item.ChangedDate })
            .take(this.listLoadSize);
        this.data().currentSprint(initData);
        this.data().name = initData.Name();
    },
    onFrameChangedFrom:function (activeFrameMeta, oldFrameMeta, frame) {
        this._loadData()
            .then(function () {
                JayScrum.app.visibleLoadingScreen(false);
                initScrollById("metro-tiles-scroll", null, null, true);
            });
    }
}, null);