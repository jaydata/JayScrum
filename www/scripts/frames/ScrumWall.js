/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/31/12
 * Time: 9:03 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Views.ScrumWall', JayScrum.FrameView, null, {
    constructor: function (name, path, tplSource) {
        this.templateName = name || 'scrumWall-template';
        this.recChange_iScroll = null;
        this.todo_iScroll = null;
        this.inProgress_iScroll = null;
        this.done_iScroll = null;
        this.burndown_iScroll = null;
        this.vertical_iScroll = null;
    },
    initializeView: function () {
        this.recChange_iScroll = JayScrum.app.initScrollById('transition0', JayScrum.app.selectedFrame().onRecentlyChangedListPullUp, JayScrum.app.selectedFrame().onRecentlyChangedListPullDown);
        this.todo_iScroll = JayScrum.app.initScrollById('transition1', JayScrum.app.selectedFrame().onToDoListPullUp, JayScrum.app.selectedFrame().onToDoListPullDown);
        this.inProgress_iScroll = JayScrum.app.initScrollById('transition2', JayScrum.app.selectedFrame().onInProgressListPullUp, JayScrum.app.selectedFrame().onInProgressListPullDown);
        this.done_iScroll = JayScrum.app.initScrollById('transition3', JayScrum.app.selectedFrame().onDoneListPullUp, JayScrum.app.selectedFrame().onDoneListPullDown);
        this.burndown_iScroll = JayScrum.app.initScrollById('transition4', null, null);
        this.vertical_iScroll = JayScrum.app.initHorizontalScrollById("wrapper", 1);
        JayScrum.app.selectedFrame()._loadBurndownData()
            .then(function () {
                DisplayBurndownChart();
                JayScrum.app.hideLoading();
            });
    },
    tearDownView: function () {
        if (this.vertical_iScroll) {
            this.vertical_iScroll.destroy();
        };
        this.recChange_iScroll.destroy();
        this.todo_iScroll.destroy();
        this.inProgress_iScroll.destroy();
        this.done_iScroll.destroy();
        this.burndown_iScroll.destroy();

        this.vertical_iScroll = null;
        this.recChange_iScroll = null;
        this.todo_iScroll = null;
        this.inProgress_iScroll = null;
        this.done_iScroll = null;
        this.burndown_iScroll = null;
    }
}, null);
$data.Class.define('JayScrum.Views.TaskSelect', JayScrum.FrameView, null, {
    constructor: function (name, path, tplSource) {
        this.templateName = name || 'taskSelectView-template';
        this.swipeView = null;
    },
    initializeView: function () {
        JayScrum.app.hideLoading();

        this.swipeView = JayScrum.app.initSwipeviewById("swipeview", JayScrum.app.selectedFrame().activeList, JayScrum.app.selectedFrame().data().selectedWorkItemActive().Id());
    },
    tearDownView: function () {
        if (this.swipeView && this.swipeView.i_scroll) {
            this.swipeView.i_scroll.destroy();
            this.swipeView.i_scroll = null;
        }
        if (this.swipeView) {
            this.swipeView.destroy();
        }
        this.swipeView = null;
    }
}, null);
$data.Class.define('JayScrum.Views.TaskEdit', JayScrum.FrameView, null, {
    constructor: function (name, path, tplSource) {
        this.templateName = name || 'taskEditView-template';
        this.i_scroll = null;
    },
    initializeView: function () {
        var self = this;
        JayScrum.app.hideLoading();

        $("h1.main-header").addClass("animate");
        //var swipeHeight = $("div.detail-edit-fix-header h1").height();
        //$("div#wrapper-detailed-edit").css('top', swipeHeight);

        if (android23) {
            self.i_scroll = JayScrum.app.initScrollById('wrapper-detailed-edit', null, null, true);
        }
    },
    tearDownView: function () {
        if (this.i_scroll) {
            this.i_scroll.destroy();
            this.i_scroll = null;
        }
    }
}, null);
$data.Class.define('JayScrum.Frames.ScrumWall', JayScrum.Frame, null, {
    constructor: function () {
        //register frameViews
        this.registerView('scrumWall', new JayScrum.Views.ScrumWall('scrumWall-template'));
        this.registerView('taskSelect', new JayScrum.Views.TaskSelect('taskSelectView-template'));
        this.registerView('taskEdit', new JayScrum.Views.TaskEdit('taskEditView-template'));
        this.registerMetaView('scrumWallMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName = 'scrumWall';
        this.selectMetaView('scrumWallMeta');
        this.listLoadSize = window['isDesktop'] ? 9999 : 7;
        this.data = ko.observable({
            currentSprint: ko.observable(),
            name: 'scrumWall',
            recentlyChangedTasks: ko.observableArray(),
            todoList: ko.observableArray(),
            inProgList: ko.observableArray(),
            doneList: ko.observableArray(),
            summaryList: ko.observable({
                BackLogItemCountInSprint: ko.observable(0),
                SprintAllTaskCount: ko.observable(0),
                SprintAllTaskRemainingWork: ko.observable(0),
                SprintToDoTaskCount: ko.observable(0),
                SprintToDoTaskRemainingWork: ko.observable(0),
                SprintInProgTaskCount: ko.observable(0),
                SprintInProgTaskRemainingWork: ko.observable(0),
                SprintDoneTaskCount: ko.observable(0),
                SprintDoneTaskRemainingWork: ko.observable(0),
                SprintBurndownData: ko.observable()
            }),
            selectedWorkItem: ko.observable(),
            selectedWorkItemActive: ko.observable(),
            selectedWorkItemPrev: ko.observable(),
            selectedWorkItemNext: ko.observable(),
            myTasks: ko.observable(false)
        });
    },

    _loadData: function () {
        var loadingPromise = Q.defer();
        JayScrum.app.onRefreshUserList()
            .then(function () {
                JayScrum.app.selectedFrame().onRecentlyChangedListPullDown(JayScrum.app.selectedFrame().selectedView().recChange_iScroll)
                    .then(function () {
                        JayScrum.app.selectedFrame().onToDoListPullDown(JayScrum.app.selectedFrame().selectedView().todo_iScroll)
                            .then(function () {
                                JayScrum.app.selectedFrame().onInProgressListPullDown(JayScrum.app.selectedFrame().selectedView().inProgress_iScroll)
                                    .then(function () {
                                        JayScrum.app.selectedFrame().onDoneListPullDown(JayScrum.app.selectedFrame().selectedView().done_iScroll)
                                            .then(function () {
                                                loadingPromise.resolve();
                                            });
                                    });
                            });
                    });
            });
        return loadingPromise.promise;
    },
    _loadBurndownData: function () {
        var p = Q.defer();
        JayScrum.repository.getBurndownData(JayScrum.app.selectedFrame().data().currentSprint().Id)
            .then(function (r) {
                JayScrum.app.selectedFrame().data().summaryList().BackLogItemCountInSprint(r.userStory);
                JayScrum.app.selectedFrame().data().summaryList().SprintAllTaskCount(r.task);
                JayScrum.app.selectedFrame().data().summaryList().SprintAllTaskRemainingWork(r.todo_hour + r.inprogress_hour + r.done_hour);
                JayScrum.app.selectedFrame().data().summaryList().SprintToDoTaskCount(r.todo);
                JayScrum.app.selectedFrame().data().summaryList().SprintToDoTaskRemainingWork(r.todo_hour);
                JayScrum.app.selectedFrame().data().summaryList().SprintInProgTaskCount(r.inprogress);
                JayScrum.app.selectedFrame().data().summaryList().SprintInProgTaskRemainingWork(r.inprogress_hour);
                JayScrum.app.selectedFrame().data().summaryList().SprintDoneTaskCount(r.done);
                JayScrum.app.selectedFrame().data().summaryList().SprintDoneTaskRemainingWork(r.done_hour);
                JayScrum.app.selectedFrame().data().summaryList().SprintBurndownData(r.burnDown);
                p.resolve();
            });
        //        p.resolve();
        return p.promise;
    },
    _resetData: function () {
        this.data().currentSprint(null);
        this.data().recentlyChangedTasks.removeAll();
        this.data().todoList.removeAll();
        this.data().inProgList.removeAll();
        this.data().doneList.removeAll();
        this.data().selectedWorkItem(null);
        this.data().selectedWorkItemNext(null);
        this.data().selectedWorkItemPrev(null);
        this.data().selectedWorkItemActive(null);
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

        /*var userStoryList = JayScrum.app.selectedFrame().data().userStoryList();
        for (var i = 0; i < userStoryList.length; i++) {
            if (userStoryList[i].Id() === wrkItemId) {
                if (data) { userStoryList[i] = data; }
                return [].concat(userStoryList);
            }
        }*/
        return null;
    },
    _onRefreshDropDownLists: function () {
        var loadingPromise = Q.defer();

        var refreshLists = [JayScrum.app.onRefreshProjectList(), JayScrum.app.onRefreshUserStoryList(), JayScrum.app.onRefreshUserList(), JayScrum.app.onRefreshSprintListForDropDown()];
        Q.all(refreshLists)
            .then(function () { loadingPromise.resolve() });

        return loadingPromise.promise;
    },
    onSelectWorkItem: function (wrkItem, isEventCall) {
        JayScrum.app.selectedFrame().data().selectedWorkItem(wrkItem);
        JayScrum.app.selectedFrame().data().selectedWorkItemActive(wrkItem);

        // SWIPEVIEW FOR TASKS
        if (isEventCall && isEventCall.currentTarget.attributes['data-isInRecentlyChangedList'] && isEventCall.currentTarget.attributes['data-isInRecentlyChangedList'].value === 'true') {
            JayScrum.app.selectedFrame().activeList = JayScrum.app.selectedFrame().data().recentlyChangedTasks();
        } else if (wrkItem.Type() == "Task" || wrkItem.Type() == "Bug") {
            JayScrum.app.selectedFrame().activeList = JayScrum.app.selectedFrame()._findListById(wrkItem.Id(), wrkItem);
        }
        JayScrum.app.selectedFrame().selectView('taskSelect');
    },
    onEditWorkItem: function (wrkItem, isEventCall) {
        JayScrum.repository.WorkItems.attach(wrkItem);
        JayScrum.app.selectedFrame().selectView('taskEdit')
    },
    onSaveWorkItem: function (wrkItem, isEventCall, disableBack) {
        if (!wrkItem.innerInstance.isValid()) {
            $("div#error-msg").addClass("opened");
            $("div#wrapper-detailed-edit").css("bottom", "90px");
            setTimeout(function () {
                JayScrum.app.selectedFrame().selectedView().i_scroll.refresh();
            }, 0);
            return;
        }

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
            wrkItem.RemainingWork(0);
            currentLista = JayScrum.app.selectedFrame().data().doneList();
        } else if (wrkItem.State() == 'To Do') {
            wrkItem.Reason(wrkItem.Id() === null ? 'New task' : 'Work stopped');
            currentLista = JayScrum.app.selectedFrame().data().todoList();
        }
        if (wrkItem.Type() == 'Bug') {
            //remove user story
            wrkItem.WorkItem_WorkItem(null);
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
        if (project) {
            wrkItem.SprintName(sprint.Name());
        }
        //save workItem
        wrkItem.RemainingWork(parseInt(wrkItem.RemainingWork()));
        wrkItem.ChangedDate(new Date());
        wrkItem.ChangedBy(JayScrum.app.globalData().user().Login());
        //wrkItem.IsBlocked(wrkItem.IsBlocked()==='true'?true:false);


        JayScrum.app.selectedFrame().data().todoList.remove(function (item) { return item.Id() == wrkItem.Id() });
        JayScrum.app.selectedFrame().data().inProgList.remove(function (item) { return item.Id() == wrkItem.Id() });
        JayScrum.app.selectedFrame().data().doneList.remove(function (item) { return item.Id() == wrkItem.Id() });
        if (wrkItem.Type() == 'Task' || wrkItem.Type() == 'Bug') {
            switch (wrkItem.State()) {
                case 'To Do':
                    JayScrum.app.selectedFrame().data().todoList.push(wrkItem);
                    break;
                case 'In Progress':
                    JayScrum.app.selectedFrame().data().inProgList.push(wrkItem);
                    break;
                case 'Done':
                    JayScrum.app.selectedFrame().data().doneList.push(wrkItem);
                    break;
                default: break;
            }
        }
        JayScrum.repository.saveChanges(function (error) {
            if (!disableBack) { JayScrum.app.backView(); }
        });
    },
    onCancelWorkItem: function (wrkItem, isEventCall) {
        JayScrum.repository.WorkItems.detach(wrkItem);
        JayScrum.app.backView();
    },
    onAddWorkItem: function (wrkItem) {
        var item = new JayScrum.repository.WorkItems.createNew({
            Id: null,
            //Title: "",
            Type: "Task",
            //Description: "",
            CreatedDate: new Date().toISOString(),
            CreatedBy: JayScrum.app.globalData().user().Login(),
            ChangedDate: new Date().toISOString(),
            ChangedBy: JayScrum.app.globalData().user().Login(),
            Priority: 0,
            AssignedTo: "",
            State: "To Do",
            WorkItem_Sprint: JayScrum.app.selectedFrame().data().currentSprint().Id,
            Effort: 0,
            BusinessValue: 0,
            RemainingWork: 0,
            IsBlocked: false
        });

        item = item.asKoObservable();
        JayScrum.repository.WorkItems.add(item);
        JayScrum.app.selectedFrame()._onRefreshDropDownLists()
            .then(function () {
                JayScrum.app.selectedFrame().data().selectedWorkItemActive(item);
                JayScrum.app.selectedFrame().selectView('taskEdit');
            });
    },
    onUpdateWorkItem: function (workItem, isEventCall) {
        JayScrum.repository.WorkItems.where(function (item) { return item.Id == this.currentItem.Id }, { currentItem: workItem }).toArray({
            success: function (result) {

                var propName = result[0].getType().memberDefinitions.getPublicMappedPropertyNames();
                propName.forEach(function (propName) {
                    workItem[propName](result[0][propName]);
                }, this);
            },
            error: function (error) { console.log("Refresh error!!"); console.dir(error); }
        });
    },
    onDeleteWorkItem: function (workItem) {
        JayScrum.repository.remove(workItem.innerInstance);
        var index = JayScrum.app.selectedFrame().activeList.indexOf(workItem);
        if (index > -1) {
            JayScrum.app.selectedFrame().activeList.splice(index, 1);
        }
        JayScrum.app.selectedFrame().data().todoList.remove(function (item) { return item.Id() == workItem.Id() });
        JayScrum.app.selectedFrame().data().inProgList.remove(function (item) { return item.Id() == workItem.Id() });
        JayScrum.app.selectedFrame().data().doneList.remove(function (item) { return item.Id() == workItem.Id() });
        JayScrum.app.selectedFrame().data().recentlyChangedTasks.remove(function (item) { return item.Id() == workItem.Id() });
        JayScrum.repository.saveChanges(function () {
            JayScrum.app.selectedFrame().onCancelWorkItem(workItem);
        });
    },

    // ================================================ STATE CHANGING ================================================ //
    onStateChangeWorkItem: function (workItem, isEventCall) {
        JayScrum.repository.WorkItems.attach(workItem);

        if (workItem.State() == 'To Do') {
            workItem.State("In Progress");

        } else if (workItem.State() == 'In Progress') {
            workItem.State("Done");

        } else if (workItem.State() == 'Done') {
            workItem.State("To Do");
        }

        JayScrum.app.selectedFrame().onSaveWorkItem(workItem, isEventCall, true);
    },
    onStateToTodo: function (workItem, isEventCall) {
        if (workItem.State() == "To Do") { return; }

        JayScrum.repository.WorkItems.attach(workItem);
        workItem.State("To Do");
        JayScrum.app.selectedFrame().onSaveWorkItem(workItem, isEventCall, true);
    },
    onStateToInprog: function (workItem, isEventCall) {
        if (workItem.State() == "In Progress") { return; }

        JayScrum.repository.WorkItems.attach(workItem);
        workItem.State("In Progress");
        JayScrum.app.selectedFrame().onSaveWorkItem(workItem, isEventCall, true);
    },
    onStateToDone: function (workItem, isEventCall) {
        if (workItem.State() == "Done") { return; }

        JayScrum.repository.WorkItems.attach(workItem);
        workItem.State("Done");
        JayScrum.app.selectedFrame().onSaveWorkItem(workItem, isEventCall, true);
    },

    // ================================================ FIELD CHANGING ================================================ //
    onSubtractHour: function (workItem, event) {
        JayScrum.repository.WorkItems.attach(workItem);

        var hourSub = parseInt($(event.target).next().val()) - 1;
        if (hourSub > 0) {
            workItem.RemainingWork(hourSub);
            JayScrum.app.selectedFrame().onSaveWorkItem(workItem, event, true);
        }
    },
    onAddHour: function (workItem, event) {
        JayScrum.repository.WorkItems.attach(workItem);

        var hourAdd = parseInt($(event.target).prev().val()) + 1;
        workItem.RemainingWork(hourAdd);
        JayScrum.app.selectedFrame().onSaveWorkItem(workItem, event, true);
    },
    onChangeAssignTo: function(workItem, event){
        JayScrum.repository.WorkItems.attach(workItem);

        workItem.AssignedTo(event.currentTarget.value);
        JayScrum.app.selectedFrame().onSaveWorkItem(workItem, event, true);
    },
    onAssignToMe: function (workItem, event) {
        if (workItem.AssignedTo() == JayScrum.app.globalData().user().Login()) { return; }
        console.log(workItem.AssignedTo(), JayScrum.app.globalData().user().Login());

        JayScrum.repository.WorkItems.attach(workItem);
        workItem.AssignedTo(JayScrum.app.globalData().user().Login());
        JayScrum.app.selectedFrame().onSaveWorkItem(workItem, event, true);
    },

    // ================================================ PULL UP TO LOAD MORE ================================================ // 
    onRecentlyChangedListPullUp: function (scroller) {
        var q = JayScrum.app.selectedFrame().recentlyChangedListQuery;
        if (JayScrum.app.selectedFrame().data().myTasks()) {
            q = q.filter(function (item) { return item.AssignedTo == '' || item.AssignedTo == this.currentUser; }, { currentUser: JayScrum.app.globalData().user().Login() });
        }
        q.orderByDescending(function (item) { return item.ChangedDate })
            .take(JayScrum.app.selectedFrame().listLoadSize)
            .skip(JayScrum.app.selectedFrame().data().recentlyChangedTasks().length)
            .toArray(function (workItemsResult) {
                JayScrum.app.selectedFrame().data().recentlyChangedTasks(JayScrum.app.selectedFrame().data().recentlyChangedTasks().concat(
                    workItemsResult.map(function (item) { return item.asKoObservable(); })
                ));
                scroller.refresh();
            });
    },
    onToDoListPullUp: function (scroller) {
        var q = JayScrum.app.selectedFrame().toDoListQuery;
        if (JayScrum.app.selectedFrame().data().myTasks()) {
            q = q.filter(function (item) { return item.AssignedTo == '' || item.AssignedTo == this.currentUser; }, { currentUser: JayScrum.app.globalData().user().Login() });
        }
        q.orderBy(function (item) { return item.Priority; })
            .take(JayScrum.app.selectedFrame().listLoadSize)
            .skip(JayScrum.app.selectedFrame().data().todoList().length)
            .toArray(function (workItemsResult) {
                JayScrum.app.selectedFrame().data().todoList(JayScrum.app.selectedFrame().data().todoList().concat(
                    workItemsResult.map(function (item) { return item.asKoObservable(); })
                ));
                scroller.refresh();
            });
    },
    onInProgressListPullUp: function (scroller) {
        var q = JayScrum.app.selectedFrame().inProgressListQuery;
        if (JayScrum.app.selectedFrame().data().myTasks()) {
            q = q.filter(function (item) { return item.AssignedTo == '' || item.AssignedTo == this.currentUser; }, { currentUser: JayScrum.app.globalData().user().Login() });
        }
        q.orderBy(function (item) { return item.AssignedTo; })
            .orderBy(function (item) { return item.Priority; })
            .take(JayScrum.app.selectedFrame().listLoadSize)
            .skip(JayScrum.app.selectedFrame().data().inProgList().length)
            .toArray(function (workItemsResult) {
                JayScrum.app.selectedFrame().data().inProgList(JayScrum.app.selectedFrame().data().inProgList().concat(
                    workItemsResult.map(function (item) { return item.asKoObservable(); })
                ));
                scroller.refresh();
            });
    },
    onDoneListPullUp: function (scroller) {
        var q = JayScrum.app.selectedFrame().doneListQuery;
        if (JayScrum.app.selectedFrame().data().myTasks()) {
            q = q.filter(function (item) { return item.AssignedTo == '' || item.AssignedTo == this.currentUser; }, { currentUser: JayScrum.app.globalData().user().Login() });
        }
        q.orderByDescending(function (item) { return item.ChangedDate; })
            .orderBy(function (item) { return item.AssignedTo; })
            .take(JayScrum.app.selectedFrame().listLoadSize)
            .skip(JayScrum.app.selectedFrame().data().doneList().length)
            .toArray(function (workItemsResult) {
                JayScrum.app.selectedFrame().data().doneList(JayScrum.app.selectedFrame().data().doneList().concat(
                    workItemsResult.map(function (item) { return item.asKoObservable(); })
                ));
                scroller.refresh();
            });
    },

    // ================================================ PULL DOWN TO REFRESH ================================================ // 
    onRecentlyChangedListPullDown: function (scroller) {
        var loadingPromise = Q.defer();
        var q = JayScrum.app.selectedFrame().recentlyChangedListQuery;
        if (JayScrum.app.selectedFrame().data().myTasks()) {
            q = q.filter(function (item) { return item.AssignedTo == '' || item.AssignedTo == this.currentUser; }, { currentUser: JayScrum.app.globalData().user().Login() });
        }
        q.orderByDescending(function (item) { return item.ChangedDate })
        .take(JayScrum.app.selectedFrame().listLoadSize)
        .toArray(function (workItemsResult) {
            JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().recentlyChangedTasks, workItemsResult);
            if (scroller) { scroller.refresh(); }
            loadingPromise.resolve();
        });
        return loadingPromise.promise;
    },
    onToDoListPullDown: function (scroller) {
        var loadingPromise = Q.defer();
        var q = JayScrum.app.selectedFrame().toDoListQuery;
        if (JayScrum.app.selectedFrame().data().myTasks()) {
            q = q.filter(function (item) { return item.AssignedTo == '' || item.AssignedTo == this.currentUser; }, { currentUser: JayScrum.app.globalData().user().Login() });
        }
        q.orderBy(function (item) { return item.Priority; })
        .take(JayScrum.app.selectedFrame().listLoadSize)
        .toArray(function (workItemsResult) {
            JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().todoList, workItemsResult);
            if (scroller) { scroller.refresh(); }
            loadingPromise.resolve();
        });
        return loadingPromise.promise;
    },
    onInProgressListPullDown: function (scroller) {
        var loadingPromise = Q.defer();
        var q = JayScrum.app.selectedFrame().inProgressListQuery;
        if (JayScrum.app.selectedFrame().data().myTasks()) {
            q = q.filter(function (item) { return item.AssignedTo == '' || item.AssignedTo == this.currentUser; }, { currentUser: JayScrum.app.globalData().user().Login() });
        }
        q.orderBy(function (item) { return item.AssignedTo; })
        .orderBy(function (item) { return item.Priority; })
        .take(JayScrum.app.selectedFrame().listLoadSize)
        .toArray(function (workItemsResult) {
            JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().inProgList, workItemsResult);
            if (scroller) { scroller.refresh(); }
            loadingPromise.resolve();
        });
        return loadingPromise.promise;
    },
    onDoneListPullDown: function (scroller) {
        var loadingPromise = Q.defer();
        var q = JayScrum.app.selectedFrame().doneListQuery;
        if (JayScrum.app.selectedFrame().data().myTasks()) {
            q = q.filter(function (item) { return item.AssignedTo == '' || item.AssignedTo == this.currentUser; }, { currentUser: JayScrum.app.globalData().user().Login() });
        }
        q.orderByDescending(function (item) { return item.ChangedDate; })
        .orderBy(function (item) { return item.AssignedTo; })
        .take(JayScrum.app.selectedFrame().listLoadSize)
        .toArray(function (workItemsResult) {
            JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().doneList, workItemsResult);
            if (scroller) { scroller.refresh(); }
            loadingPromise.resolve();
        });
        return loadingPromise.promise;
    },

    onFrameChangingFrom: function (activeFrameMeta, oldFrameMeta, initData, frame) {
        JayScrum.app.showLoading();
        var loadingPromise = Q.defer();
        var self = this;
        switch (activeFrameMeta.viewName) {
            case 'taskEdit':
                this._onRefreshDropDownLists()
                    .then(function () {
                        self.data().selectedWorkItemActive(initData);
                        loadingPromise.resolve();
                    });

                break;
            case 'taskSelect':
                this.data().selectedWorkItem(initData.wrkItem);
                this.data().selectedWorkItemActive(initData.wrkItem);
                this.activeList = initData.list;
                loadingPromise.resolve();
                break;
            default:
                this.pinnedQueryParam = { sprintId: initData.Id };
                this.toDoListQuery = JayScrum.repository.WorkItems
                    .where(function (item) { return item.WorkItem_Sprint == this.sprintId && item.State == 'To Do' && (item.Type == "Task" || item.Type == 'Bug'); }, this.pinnedQueryParam);
                this.inProgressListQuery = JayScrum.repository.WorkItems
                    .where(function (item) { return item.WorkItem_Sprint == this.sprintId && item.State == 'In Progress' && (item.Type == "Task" || item.Type == 'Bug'); }, this.pinnedQueryParam);
                this.doneListQuery = JayScrum.repository.WorkItems
                    .where(function (item) { return item.WorkItem_Sprint == this.sprintId && item.State == 'Done' && (item.Type == "Task" || item.Type == 'Bug'); }, this.pinnedQueryParam);
                this.recentlyChangedListQuery = JayScrum.repository.WorkItems
                    .where(function (item) { return item.WorkItem_Sprint == this.sprintId && item.ChangedDate >= moment().add('days', -1).utc().toDate() && (item.Type == "Task" || item.Type == 'Bug'); }, this.pinnedQueryParam);
                this.data().currentSprint(initData);
                this.data().name = initData.Name;
                loadingPromise.resolve();
                break;
        }
        return loadingPromise.promise;
    },
    onFrameChangedFrom: function (activeFrameMeta, oldFrameMeta, frame) {
        if (activeFrameMeta.viewName === 'taskEdit' || activeFrameMeta.viewName === 'taskSelect') {
            JayScrum.app.selectedFrame().selectedView().initializeView();
        } else {
            this._loadData()
                .then(function () { JayScrum.app.selectedFrame().selectedView().initializeView() });
        }
    },
    onChangeMyTasksFilter: function () {
        JayScrum.app.showLoading();
        JayScrum.app.selectedFrame().data().myTasks(!JayScrum.app.selectedFrame().data().myTasks());
        this._loadData()
            .then(function () { JayScrum.app.hideLoading() });
    },
    onShowToolbar: function () {
        $("div.metro-actionbar").toggleClass("opened");
    }
}, null);
