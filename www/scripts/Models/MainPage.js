$data.Class.define('JayScrum.Models.mainPage', null, null, {
    constructor: function () {
        var self = this;
        this.pageTitle = ko.observable('jayscrum');
        this.activePart = ko.observable('main');
        this.activePart.subscribe(function () {
            self.selectedWorkItem(null);
            self.editableWorkItem(null);
            self.editableIteration(null);
        }, undefined, 'beforeChange');

        this.eventConfig = {
            isAllowNavigate: false,
            remoteControllingMode: "push", //[ "", "push", "remote" ]
            lastNavigateEvent: null,
            lastRecivedNavigateEvent: null
        };

        this.settings = ko.observable();
        this.mainPage = ko.observable();

        this.currentSprint = ko.observable();
        this.activeSprintList = ko.observableArray();
        this.allSprintList = ko.observableArray();

        this.recentlyChangedTasks = ko.observableArray();
        this.todoList = ko.observableArray();
        this.inProgList = ko.observableArray();
        this.doneList = ko.observableArray();
        this.userStoryList = ko.observableArray();
        this.userStoriesInSprintList = ko.observableArray();

        this.selectedWorkItem = ko.observable();
        this.selectedWorkItemPrev = ko.observable();
        this.selectedWorkItemNext = ko.observable();
        this.selectedWorkItemActive = ko.observable();
        this.editableWorkItem = ko.observable();
        this.stateOptionValues = ["To Do", "In Progress", "Done", "Removed"];
        this.stateOptionUserStoryValues = ["New", "Approved", "Committed", "Removed", "Done"];
        this.typeOptionValues = ['Task', 'Bug', 'UserStory', 'Issue', 'Epic'];
        this.blockedOptionValues = ['No', 'Yes'];

        this.ContainerMapping = { 'To Do': this.todoList, 'In Progress': this.inProgList, 'Done': this.doneList };
        this.listLoadSize = 7;
        this.pinnedQueryParam = { sprintId: -1 };
        this.toDoListQuery = $data.ScrumDb.WorkItems
                            .where(function (item) { return item.Type == "Task" && item.WorkItem_Sprint == this.sprintId && item.State == 'To Do' }, this.pinnedQueryParam)
                            .orderBy(function (item) { return item.Priority; })
                            .take(this.listLoadSize);
        this.inProgressListQuery = $data.ScrumDb.WorkItems
                                .where(function (item) { return item.Type == "Task" && item.WorkItem_Sprint == this.sprintId && item.State == 'In Progress' }, this.pinnedQueryParam)
                                .orderBy(function (item) { return item.Priority; })
                                .take(this.listLoadSize);
        this.doneListQuery = $data.ScrumDb.WorkItems
                            .where(function (item) { return item.Type == "Task" && item.WorkItem_Sprint == this.sprintId && item.State == 'Done' }, this.pinnedQueryParam)
                            .orderBy(function (item) { return item.Priority; })
                            .take(this.listLoadSize);
        this.recentlyChangedListQuery = $data.ScrumDb.WorkItems
                                        .where(function (item) { return item.Type == "Task" && item.WorkItem_Sprint == this.sprintId && item.ChangedDate >= moment().add('days', -1).utc().toDate() }, this.pinnedQueryParam)
                                        .orderByDescending(function (item) { return item.ChangedDate })
                                        .take(this.listLoadSize);
        
        this.editableWorkItem.subscribe(function (wrkItem) {
            if (wrkItem instanceof $data.EntityWrapper && !wrkItem.State.$dataChangeListSubscribed) {
                wrkItem.State.subscribe(function (oldState) {
                    if (self.ContainerMapping[oldState]) {
                        var idx = self.ContainerMapping[oldState].indexOf(wrkItem);
                        self.ContainerMapping[oldState].splice(idx, 1);
                    }
                }, undefined, 'beforeChange');
                wrkItem.State.subscribe(function (newState) {
                    if (self.ContainerMapping[newState])
                        self.ContainerMapping[newState].unshift(wrkItem);
                });
                wrkItem.State.$dataChangeListSubscribed = true;
            }
        });
        //load workItems for sprint
        this.currentSprint.subscribe(function (value) {
            if (value.innerInstance instanceof LightSwitchApplication.Sprint) {

                $data.Model.mainPage.pinnedQueryParam.sprintId = $data.Model.mainPage.currentSprint().Id();

                $data.Model.mainPage.recentlyChangedListQuery.toArray(function (recently_taskResult) {
                    $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.recentlyChangedTasks, recently_taskResult);
                    initScrollById("transition0", $data.Model.mainPage.onRecentlyChangedListPullUp, $data.Model.mainPage.onRecentlyChangedListPullDown);
                });

                $data.Model.mainPage.toDoListQuery.toArray(function (todo_taskResult) {
                    $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.todoList, todo_taskResult);
                    initScrollById("transition1", $data.Model.mainPage.onToDoListPullUp, $data.Model.mainPage.onToDoListPullDown);

                    $data.Model.mainPage.inProgressListQuery.toArray(function (inProg_taskResult) {
                        $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.inProgList, inProg_taskResult);
                        initScrollById("transition2", $data.Model.mainPage.onInProgressListPullUp, $data.Model.mainPage.onInProgressListPullDown);

                        $data.Model.mainPage.doneListQuery.toArray(function (done_taskResult) {
                            $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.doneList, done_taskResult);
                            initScrollById("transition3", $data.Model.mainPage.onDoneListPullUp, $data.Model.mainPage.onDoneListPullDown);

                            $data.ScrumDb.WorkItems
                                .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == this.sprintId }, { sprintId: value.Id() })
                                .toArray(function (usList) {
                                    var remainingWork = 0;
                                    if ($data.Model.mainPage.inProgList().length > 0) {
                                        remainingWork = $data.Model.mainPage.inProgList()
                                            .map(function (item) { return item.RemainingWork() === null ? 0 : item.RemainingWork(); })
                                            .reduce(function (preValue, currentValue) { return preValue + currentValue });
                                    }

                                    $data.Model.mainPage.summaryList({
                                        BackLogItemCountInSprint: usList.length,
                                        SprintAllTaskCount: $data.Model.mainPage.todoList().length + $data.Model.mainPage.inProgList().length + $data.Model.mainPage.doneList().length,
                                        SprintToDoTaskCount: $data.Model.mainPage.todoList().length,
                                        SprintInProgTaskCount: $data.Model.mainPage.inProgList().length,
                                        SprintInProgTaskRemainingWork: remainingWork,
                                        SprintDoneTaskCount: $data.Model.mainPage.doneList().length
                                    });
                                    initScrollById("transition4");
                                    initHorizontalScrollById("wrapper", 1);
                                });
                        });
                    });
                });
            }
        });
        //Iteration
        this.iterationPaths = ko.observableArray();
        this.projectList = ko.observableArray();
        this.editableProject = ko.observable();
        this.editableIteration = ko.observable();
        this.selectedUserStory = ko.observable();
        this.editableUserStory = ko.observable();
        this.summaryList = ko.observable();
        this.selectedProject = ko.observable();
        this.activeSprintsTaskIds = ko.observable();
        this.userList = ko.observableArray();
        this.sprintListForDropDown = ko.observableArray();
        this.selectedWorkitemChildren = ko.observableArray();
    },
    isActivePart: function (part) {
        return this.activePart() == part;
    },
    clear: function () {
        this.selectedWorkItem(null);
        this.editableWorkItem(null);
        this.editableIteration(null);
    },
    onMainPageShow: function (isEventCall) {
        $data.Model.activePartName('mainPage');
        $data.Model.ScrumAsync();
        this.pageTitle('jayscrum');
        this.activePart('main');
        initScrollById("metro-tiles-scroll");
        $("h1.main-title").addClass("animate");
    },

    /*ko subscribes*/
    pushObservablesToList: function (list, rawData) {
        list([]);
        for (var i = 0; i < rawData.length; i++) {
            var obs = rawData[i].asKoObservable();
            list.push(obs);
        }
    },
    /*end ko subscribes*/
    onSettingsShow: function () {
        $data.Model.mainPage.activePart('settings');
        this.pageTitle('ui settings');

        $("h1.main-header").addClass("animate");
        var font = $("body").attr('font');
        $("div.field.fonts div.field").each(function () {
            if ($(this).attr('font') == font)
                $(this).addClass('active');
        });
        initScrollById("transition-settings");
    },
    onUpdateWorkItemState: function (wrkItem) {
        $data.Model.ScrumAsync();
        $data.Model.mainPage.onTaskListShow(true);
    },
    isPinnedSprint: function (sprint) {
        var pinnedSprints = getSetting('pinnedSprints');
        if (!pinnedSprints) { pinnedSprints = []; }
        return pinnedSprints.indexOf(sprint.Id()) >= 0;
    },
    getTaskLeftForSprint: function (sprintId) {
        return $data.Model.mainPage.activeSprintsTaskIds().filter(function (item) { return item.SprintId == sprintId }).length;
    },

    //ScrumWall
    onRepositorySettingShow: function () {
        $data.Model.settingPage.initializeSettingsApp();
        $data.Model.activePartName('settingPage');
        this.pageTitle('repositories');

        initScrollById('settingPageScroll');
    },
    onUserSettingShow: function () {
        $data.Model.settingPage.initializeSettingsApp();

        $data.Model.activePartName('usersPage');
        this.pageTitle('users');

        initScrollById('settingPageScroll');
    },

    // Pull up to load more functions
    onRecentlyChangedListPullUp: function (scroller) {
        $data.Model.mainPage.pinnedQueryParam.sprintId = $data.Model.mainPage.currentSprint().Id();
        $data.Model.mainPage.recentlyChangedListQuery
            .skip($data.Model.mainPage.recentlyChangedTasks().length)
            .toArray(function (workItemsResult) {
                $data.Model.mainPage.recentlyChangedTasks($data.Model.mainPage.recentlyChangedTasks().concat(
                    workItemsResult.map(function (item) { return item.asKoObservable(); })
                    ));
                scroller.refresh();
            });
    },
    onToDoListPullUp: function (scroller) {
        $data.Model.mainPage.pinnedQueryParam.sprintId = $data.Model.mainPage.currentSprint().Id();
        $data.Model.mainPage.toDoListQuery
            .skip($data.Model.mainPage.todoList().length)
            .toArray(function (workItemsResult) {
                $data.Model.mainPage.todoList($data.Model.mainPage.todoList().concat(
                    workItemsResult.map(function (item) { return item.asKoObservable(); })
                    ));
                scroller.refresh();
            });
    },
    onInProgressListPullUp: function (scroller) {
        $data.Model.mainPage.pinnedQueryParam.sprintId = $data.Model.mainPage.currentSprint().Id();
        $data.Model.mainPage.inProgressListQuery
            .skip($data.Model.mainPage.inProgList().length)
            .toArray(function (workItemsResult) {
                $data.Model.mainPage.inProgList($data.Model.mainPage.inProgList().concat(
                    workItemsResult.map(function (item) { return item.asKoObservable(); })
                    ));
                scroller.refresh();
            });
    },
    onDoneListPullUp: function (scroller) {
        $data.Model.mainPage.pinnedQueryParam.sprintId = $data.Model.mainPage.currentSprint().Id();
        $data.Model.mainPage.doneListQuery
            .skip($data.Model.mainPage.doneList().length)
            .toArray(function (workItemsResult) {
                $data.Model.mainPage.doneList($data.Model.mainPage.doneList().concat(
                    workItemsResult.map(function (item) { return item.asKoObservable(); })
                    ));
                scroller.refresh();
            });
    },

    // Pull  down to refresh
    onRecentlyChangedListPullDown: function (scroller) {
        $data.Model.mainPage.pinnedQueryParam.sprintId = $data.Model.mainPage.currentSprint().Id();
        $data.Model.mainPage.recentlyChangedListQuery
            .toArray(function (workItemsResult) {
                $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.recentlyChangedTasks, workItemsResult);
                scroller.refresh();
            });
    },
    onToDoListPullDown: function (scroller) {
        $data.Model.mainPage.pinnedQueryParam.sprintId = $data.Model.mainPage.currentSprint().Id();
        $data.Model.mainPage.toDoListQuery
            .toArray(function (workItemsResult) {
                $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.todoList, workItemsResult);
                scroller.refresh();
            });
    },
    onInProgressListPullDown: function (scroller) {
        $data.Model.mainPage.pinnedQueryParam.sprintId = $data.Model.mainPage.currentSprint().Id();
        $data.Model.mainPage.inProgressListQuery
            .toArray(function (workItemsResult) {
                $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.inProgList, workItemsResult);
                scroller.refresh();
            });
    },
    onDoneListPullDown: function (scroller) {
        $data.Model.mainPage.pinnedQueryParam.sprintId = $data.Model.mainPage.currentSprint().Id();
        $data.Model.mainPage.doneListQuery
            .toArray(function (workItemsResult) {
                $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.doneList, workItemsResult);
                scroller.refresh();
            });
    },

    //TaskList
    onTaskListShow: function (sprint) {
        $data.Model.mainPage.selectedUserStory(null);
        showLoading();

        $data.Model.mainPage.activePart('taskList');
        $("h1.main-header").addClass("animate");

        var lastSprint = $data.Model.mainPage.currentSprint();
        if (sprint && sprint.Id() && (!lastSprint || lastSprint.Id() !== sprint.Id())) {
            $data.Model.mainPage.currentSprint(sprint);
        } else {
            initScrollById("transition0", $data.Model.mainPage.onRecentlyChangedListPullUp, $data.Model.mainPage.onRecentlyChangedListPullDown);
            initScrollById("transition1", $data.Model.mainPage.onToDoListPullUp, $data.Model.mainPage.onToDoListPullDown);
            initScrollById("transition2", $data.Model.mainPage.onInProgressListPullUp, $data.Model.mainPage.onInProgressListPullDown);
            initScrollById("transition3", $data.Model.mainPage.onDoneListPullUp, $data.Model.mainPage.onDoneListPullDown);
            initScrollById("transition4");
            initHorizontalScrollById("wrapper", 1);
        }
    },
    onSelectWorkItem: function (wrkItem, isEventCall) {
        console.log('onSelectWorkItem');

        $data.Model.mainPage.activePart('selectedWorkitem');
        $data.Model.mainPage.selectedWorkItem(wrkItem);
        $data.Model.mainPage.selectedWorkItemActive(wrkItem);
        $("h1.main-header").addClass("animate");
        $("div.metro-actionbar.detail-view").addClass("opened");

        // SWIPEVIEW FOR TASKS
        if (isEventCall && isEventCall.srcElement.attributes['data-isInRecentlyChangedList'] && isEventCall.srcElement.attributes['data-isInRecentlyChangedList'].value === 'true') {

            initSwipeviewById("swipeview", $data.Model.mainPage.recentlyChangedTasks(), wrkItem.Id());

        } else if (wrkItem.Type() == "Task") {

            var workItemId  = wrkItem.Id(),
                list        = $data.Model.findListById(workItemId, wrkItem);
            initSwipeviewById("swipeview", list, workItemId);

        } else {
            $("div.detail div#wrapper-detailed div.list div.pivot-content").show();

            var swipeviewUs = $("div#swipeview-inside-us"),
                title = swipeviewUs.prev(),
                minusHeight = title.height() + 15;

            swipeviewUs.css('top', minusHeight);
            initScrollById('swipeview-inside-us');
        }
    },
    onEditWorkItem: function (wrkItem, isEventCall) {
        console.log('onEditWorkItem');
        $data.Model.mainPage.onRefreshDropDownLists(function () {
            $data.Model.mainPage.activePart('editableWorkItem');
            $data.Model.mainPage.editableWorkItem(wrkItem);
            $data.ScrumDb.WorkItems.attach(wrkItem);

            $("h1.main-header").addClass("animate");
            var swipeHeight = $("div.detail-edit-fix-header h1").height();
            $("div#wrapper-detailed-edit").css('top', swipeHeight);
            initScrollById('wrapper-detailed-edit', null, null, true);
        });

    },
    onSaveWorkItem: function (wrkItem, isEventCall) {
        console.log("save workitem - type: task");
        showLoading();

        var currentLista = null;
        if (wrkItem.State() == 'In Progress') {
            if (wrkItem.Reason() == 'Work finished')
                wrkItem.Reason('Additional work found');
            else
                wrkItem.Reason('Work started');

            wrkItem.RemainingWork(wrkItem.RemainingWork() || 0);
            currentLista = $data.Model.mainPage.inProgList()
        } else if (wrkItem.State() == "Done") {
            wrkItem.Reason('Work finished');
            wrkItem.RemainingWork(null);
            currentLista = $data.Model.mainPage.doneList();
        } else if (wrkItem.State() == 'To Do') {
            wrkItem.Reason(wrkItem.Id() == 0 ? 'New task' : 'Work stopped');
            currentLista = $data.Model.mainPage.todoList();
        }
        //save parentName
        var us = $data.Model.mainPage.userStoryList().filter(function (item) { return item.Id() == wrkItem.WorkItem_WorkItem() })[0];
        if (us) {
            wrkItem.ParentName(us.Title());
        }
        //projectname update
        var project = $data.Model.mainPage.projectList().filter(function (item) { return item.Id() == wrkItem.WorkItem_Project() })[0];
        if (project) {
            wrkItem.ProjectName(project.Name());
        }
        //save workItem
        wrkItem.ChangedDate(new Date());

        if (wrkItem.Id() === 0) {
            $data.ScrumDb.WorkItems.add(wrkItem);
            currentLista.push(wrkItem);
        }

        $data.ScrumDb.saveChanges({
            success: function (error) {
                $(".metro-loading").hide();
                $data.Model.mainPage.onSelectWorkItem(wrkItem);
                $data.Model.mainPage.recentlyChangedTasks.unshift(wrkItem);

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
        $data.ScrumDb.WorkItems.detach(wrkItem);
        if ($data.Model.mainPage.selectedUserStory() !== null && $data.Model.mainPage.selectedUserStory() !== undefined) {
            $data.Model.mainPage.onSelectUserStory($data.Model.mainPage.selectedUserStory());
        } else {
            switch (wrkItem.Type()) {
                case "Product Backlog Item":
                    $data.Model.mainPage.onUserStoryListShow();
                    break;
                case "Task":
                    $data.Model.mainPage.onTaskListShow();
                    break;
                default:
                    $data.Model.mainPage.onMainPageShow();
                    break;
            }
        }
        return;
    },
    onAddWorkItem: function (wrkItem) {
        console.log("add workitem - type: task");
        showLoading();

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
            WorkItem_Sprint: $data.Model.mainPage.currentSprint().innerInstance.Id,
            Effort: 0,
            BusinessValue: 0,
            RemainingWork: 0,
            //Reason: "New task",
            //IterationPath: $data.Model.mainPage.currentSprint().IterationPath(),
            //AreaPath: $data.Model.mainPage.currentSprint().AreaPath()
            //ParentName: " ",
            //FinishDate: "",
            //StartDate: ""
        });

        item = item.asKoObservable();
        $data.Model.mainPage.onEditWorkItem(item);

        console.log(item);
    },
    onUpdateWorkItem: function (workItem, isEventCall) {
        console.log("update workitem");
        showLoading();

        $data.ScrumDb.WorkItems.where(function (item) { return item.Id == this.currentItem.Id }, { currentItem: workItem }).toArray({
            success: function (result) {
                workItem.innerInstance = result[0];
                $data.Model.mainPage.selectedWorkItemActive(workItem.innerInstance.asKoObservable());
                $data.Model.mainPage.selectedWorkItemPrev($data.Model.mainPage.selectedWorkItemPrev().innerInstance.asKoObservable());
                $data.Model.mainPage.selectedWorkItem($data.Model.mainPage.selectedWorkItem().innerInstance.asKoObservable());
                $data.Model.mainPage.selectedWorkItemNext($data.Model.mainPage.selectedWorkItemNext().innerInstance.asKoObservable());
                hideLoading();
            },
            error: function (error) { console.log("Refresh error!!"); console.dir(error); }
        });
    },
    onDeleteWorkItem: function (workItem) {
        showLoading();

        $data.ScrumDb.remove(workItem.innerInstance);
        $data.ScrumDb.saveChanges(function () {
            $data.Model.mainPage.onCancelWorkItem(workItem);
            hideLoading();
        });
    },

    //UserStory
    onIndependentUserStoryListPullUp: function (scroller) {
        $data.ScrumDb.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == null })
            .skip($data.Model.mainPage.userStoryList().length)
            .take(7)
            .toArray(function (userStoryResult) {
                $data.Model.mainPage.userStoryList($data.Model.mainPage.userStoryList().concat(
                    userStoryResult.map(function (item) { return item.asKoObservable(); })
                    ));
                scroller.refresh();
            });
    },
    onIndependentUserStoryListPullDown: function (scroller) {
        $data.ScrumDb.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == null })
            .take(7)
            .toArray(function (userStoryResult) {
                $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.userStoryList, userStoryResult);
                scroller.refresh();
            });
    },
    onUserStoryInSprintListPullUp: function (scroller) {
        var sprintIndex = scroller.scroller.attributes['data-sprintIndex'].value;
        var currentList = $data.Model.mainPage.userStoriesInSprintList()[sprintIndex];

        $data.ScrumDb.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == this.sprintId }, { sprintId: currentList.sprintId })
            .skip(currentList.list().length)
            .take(7)
            .toArray(function (usList) {
                currentList.list(currentList.list().concat(
                    usList.map(function (item) { return item.asKoObservable(); })
                    ));
                scroller.refresh();
            });
    },
    onUserStoryInSprintListPullDown: function (scroller) {
        var sprintIndex = scroller.scroller.attributes['data-sprintIndex'].value;
        var currentList = $data.Model.mainPage.userStoriesInSprintList()[sprintIndex];

        $data.ScrumDb.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == this.sprintId }, { sprintId: currentList.sprintId })
            .take(7)
            .toArray(function (usList) {
                var newData = usList.map(function (item) { return item.asKoObservable(); });
                currentList.list(newData);
                scroller.refresh();
            });
    },
    getUserStoryInSprintList: function (sprintDataList) {
        var sprintData = sprintDataList.shift(1);

        $data.ScrumDb.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == this.sprintId }, { sprintId: sprintData.Id })
            .take(7)
            .toArray(function (usList) {

                var actualList = ko.observableArray();
                $data.Model.mainPage.userStoriesInSprintList.push({
                    list: actualList,
                    sprintId: sprintData.Id,
                    sprintName: sprintData.Name,
                    StartDate: sprintData.StartDate,
                    FinishDate: sprintData.FinishDate
                });
                $data.Model.mainPage.pushObservablesToList(actualList, usList);
                if (sprintDataList.length > 0) {
                    $data.Model.mainPage.getUserStoryInSprintList(sprintDataList);
                } else {
                    $data.Model.mainPage.initializeUserSoriesLists();
                }
            });
    },
    initializeUserSoriesLists: function () {
        $data.Model.mainPage.activePart('userStoryList');
        $data.Model.mainPage.pageTitle('userstories');
        $("h1.main-header").addClass("animate");
        initScrollById("transition-us", $data.Model.mainPage.onIndependentUserStoryListPullUp, $data.Model.mainPage.onIndependentUserStoryListPullDown);
        var listCount = $data.Model.mainPage.userStoriesInSprintList().length;
        for (var i = 0; i < listCount; i++) {
            initScrollById("transition-us-" + i, $data.Model.mainPage.onUserStoryInSprintListPullUp, $data.Model.mainPage.onUserStoryInSprintListPullDown);
        }

        initHorizontalScrollById("wrapper", 0);
    },
    onUserStoryListShow: function (isEventCall) {
        showLoading();

        var self = this;
        $data.ScrumDb.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == null })
            .take(7)
            .toArray(function (userStoryResult) {
                $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.userStoryList, userStoryResult);

                $data.ScrumDb.Sprints
                    .where(function (sprint) { return sprint.FinishDate > moment().utc().toDate() })
                    .select(function (sprint) { return { Id: sprint.Id, Name: sprint.Name, StartDate: sprint.StartDate, FinishDate: sprint.FinishDate } })
                    .toArray(function (sprinIds) {
                        if (sprinIds.length > 0) {
                            self.userStoriesInSprintList([]);
                            $data.Model.mainPage.getUserStoryInSprintList(sprinIds);
                        } else {
                            $data.Model.mainPage.initializeUserSoriesLists();
                        }
                    });
            });
    },
    initializeUserSoriesByProjectLists: function () {
        //TODO: implement this method

        $data.Model.mainPage.activePart('userStoryByProjectList');
        $data.Model.mainPage.pageTitle('project name');
        $("h1.main-header").addClass("animate");
        //initScrollById("transition-us", $data.Model.mainPage.onIndependentUserStoryListPullUp, $data.Model.mainPage.onIndependentUserStoryListPullDown);
        var listCount = $data.Model.mainPage.userStoriesInSprintList().length;
        for (var i = 0; i < listCount; i++) {
            //initScrollById("transition-us-" + i, $data.Model.mainPage.onUserStoryInSprintListPullUp, $data.Model.mainPage.onUserStoryInSprintListPullDown);
        }

        //initHorizontalScrollById("wrapper", 0);
        hideLoading();
    },
    onUserStoryByProjectListShow: function (isEventCall) {
        //TODO: implement this method
        showLoading();

        var self = this;
        $data.ScrumDb.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == null })
            .take(7)
            .toArray(function (userStoryResult) {
                $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.userStoryList, userStoryResult);

                $data.ScrumDb.Sprints
                    .where(function (sprint) { return sprint.FinishDate > moment().utc().toDate() })
                    .select(function (sprint) { return { Id: sprint.Id, Name: sprint.Name, StartDate: sprint.StartDate, FinishDate: sprint.FinishDate } })
                    .toArray(function (sprinIds) {
                        //if (sprinIds.length > 0) {
                            //self.userStoriesInSprintList([]);
                            //$data.Model.mainPage.getUserStoryInSprintList(sprinIds);
                        //} else {
                            $data.Model.mainPage.initializeUserSoriesByProjectLists();
                        //}
                    });
            });
    },
    onSelectUserStory: function (wrkItem, isEventCall) {
        console.log('onSelectUserStory');
        showLoading();

        $data.Model.mainPage.selectedWorkitemChildren([]);
        $data.Model.mainPage.activePart('selectedUserStory');
        $data.Model.mainPage.selectedUserStory(wrkItem);
        $("h1.main-header").addClass("animate");

        //$("div.detail div#wrapper-detailed div.list div.pivot-content").show();

        var swipeviewUs = $("div#swipeview-inside-us"),
            title = swipeviewUs.prev(),
            minusHeight = title.height() + 15;

        swipeviewUs.css('top', minusHeight);

        setTimeout(function () {
            initScrollById('swipeview-inside-us', null, null, true);
        }, 750);
    },
    onEditUserStory: function (wrkItem, isEventCall) {
        $data.Model.mainPage.activePart('editableUserStory');
        $data.Model.mainPage.editableUserStory(wrkItem);
        $data.ScrumDb.WorkItems.attach(wrkItem);

        $("h1.main-header").addClass("animate");
        var swipeHeight = $("div.detail-edit-fix-header h1").height();
        $("div#wrapper-detailed-edit").css('top', swipeHeight);
        initScrollById('wrapper-detailed-edit');
    },
    onSaveUserStory: function (wrkItem, isEventCall) {
        console.log("save workitem - type: user story");
        console.log(wrkItem.ChangedBy());
        showLoading();

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
            wrkItem.Reason(wrkItem.Id() == 0 ? 'New task' : 'Work stopped');
        }
        //save parentName
        var us = $data.Model.mainPage.userStoryList().filter(function (item) { return item.Id() == wrkItem.WorkItem_WorkItem() })[0];
        if (us) {
            wrkItem.ParentName(us.Title());
        }
        //projectname update
        var project = $data.Model.mainPage.projectList().filter(function (item) { return item.Id() == wrkItem.WorkItem_Project() })[0];
        if (project) {
            wrkItem.ProjectName(project.Name());
        }
        //save workItem
        wrkItem.ChangedDate(new Date());

        if (wrkItem.Id() === 0) {
            $data.ScrumDb.WorkItems.add(wrkItem);
        }

        $data.ScrumDb.saveChanges({
            success: function (result) {
                $data.Model.mainPage.onSelectUserStory(wrkItem);
            },
            error: function (error) {
                $data.Model.ScrumAsync();

                hideLoading();
            }
        });
    },
    onCancelUserStory: function (wrkItem, isEventCall) {
        // TODO: implement this function

        console.log("cancel workitem - type: user story");
        $data.ScrumDb.WorkItems.detach(wrkItem);
        switch (wrkItem.Type()) {
            case "UserStory":
                $data.Model.mainPage.initializeUserSoriesLists();
                break;
            case "Task":
                $data.Model.mainPage.onTaskListShow();
                break;
            default:
                $data.Model.mainPage.onMainPageShow();
                break;
        }
        return;
    },
    onAddUserStory: function (wrkItem) {
        // TODO: implement this function

        console.log("add workitem - type: user story");

        $("h1.main-header").addClass("animate");

        var item = new $data.ScrumDb.WorkItems.createNew({
            Id: 0,
            Title: "",
            Type: "UserStory",
            Description: "",
            CreatedDate: new Date().toISOString(),
            CreatedBy: 'Admin', //$data.Model.settingPage.loginSettings.UserName,
            ChangedDate: new Date().toISOString(),
            ChangedBy: 'Admin', //$data.Model.settingPage.loginSettings.UserName,
            Priority: 0,
            AssignedTo: "",
            State: "New",
            //Project: "JayStack",
            Effort: 0,
            BusinessValue: 0,
            RemainingWork: 0,
            //Reason: "New task",
            //IterationPath: $data.Model.mainPage.currentSprint().IterationPath(),
            //AreaPath: $data.Model.mainPage.currentSprint().AreaPath()
            //ParentName: " ",
            //FinishDate: "",
            //StartDate: ""
        });

        item = item.asKoObservable();
        $data.Model.mainPage.onEditUserStory(item);

        console.log(item);
    },
    onUpdateUserStory: function (workItem, isEventCall) {
        console.log("update workitem");
        showLoading();

        $data.ScrumDb.WorkItems.where(function (item) { return item.Id == this.currentItem.Id }, { currentItem: workItem }).toArray({
            success: function (result) {
                $data.Model.mainPage.onSelectUserStory(result[0].asKoObservable());
            },
            error: function (error) { console.log("Refresh error!!"); console.dir(error); }
        });
    },
    onDeleteUserStory: function (workItem) {
        showLoading();

        $data.ScrumDb.WorkItems.detach(workItem.innerInstance);
        $data.ScrumDb.WorkItems.remove(workItem.innerInstance);
        $data.ScrumDb.saveChanges(function () {
            $data.Model.mainPage.onCancelUserStory(workItem);
        });
    },
    onRefreshWorkItemsOfUserStory: function (userStory) {
        console.log(userStory.Id());
        showLoading();

        $data.ScrumDb.WorkItems
            .where(function (item) { return item.Type == "Task" && item.WorkItem_WorkItem == this.userStoryId }, { userStoryId: userStory.Id() })
            .orderBy(function (item) { return item.Priority; })
            .toArray(function (workItems) {
                $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.selectedWorkitemChildren, workItems);

                refreshScroll(scrollToRefresh, true);
            });
    },
    onSelectWorkItemOfUserStory: function (wrkItem, isEventCall) {
        $data.Model.mainPage.activePart('selectedWorkitem');
        $data.Model.mainPage.selectedWorkItem(wrkItem);
        $("h1.main-header").addClass("animate");
        $("div.metro-actionbar.detail-view").addClass("opened");

        initSwipeviewById("swipeview", $data.Model.mainPage.selectedWorkitemChildren(), wrkItem.Id());
    },
    //Sprint functions
    onSprintListShow: function () {
        showLoading();

        $data.ScrumDb.Sprints
            .orderBy(function (item) { return item.StartDate })
            .toArray(function (sprints) {
                $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.iterationPaths, sprints);
                $data.Model.mainPage.iterationPaths().forEach(function (sprint) {
                    sprint.isPinned = ko.observable();
                    sprint.isPinned($data.Model.mainPage.isPinnedSprint(sprint));
                }, this);

                $data.Model.mainPage.activePart('iterationList');
                $data.Model.mainPage.pageTitle('sprints');
                $("h1.main-header").addClass("animate");
                initScrollById("transition-iteration", null, null, true);
            });
    },
    onCancelSprint: function (sprintItem) {
        if (sprintItem != null) {
            var sprint = sprintItem.innerInstance;
            $data.ScrumDb.Sprints.detach(sprint);
        }
        $data.Model.mainPage.onSprintListShow();
    },
    onAddSprint: function (sprint) {
        var sprint = new $data.ScrumDb.Sprints.createNew({ Id: 0, Name: '', StartDate: new Date(), FinishDate: new Date().addDays(7) });
        sprint = sprint.asKoObservable();
        $data.Model.mainPage.onEditSprint(sprint);
    },
    onEditSprint: function (sprintItem) {
        $data.Model.mainPage.activePart('editableIteration');
        $data.Model.mainPage.editableIteration(sprintItem);

        var sprint = sprintItem.innerInstance;
        if (sprint.Id > 0) {
            $data.ScrumDb.Sprints.attach(sprint);
        } else {
            $data.ScrumDb.Sprints.add(sprint);
        }

        $("h1.main-header").addClass("animate");
        initScrollById('transition-iteration-edit');
        initDateFieldsById('transition-iteration-edit');
        $("div.metro-actionbar.detail-view-edit").addClass("opened");
    },
    onSaveSprint: function (sprintItem) {
        showLoading();

        var sprint = sprintItem.innerInstance;
        sprint.StartDate = new Date(moment(sprint.StartDate).valueOf());
        sprint.FinishDate = new Date(moment(sprint.FinishDate).valueOf());
        var self = $data.Model.mainPage;
        $data.ScrumDb.saveChanges(function () {
            self.onCancelSprint();
        });
    },
    onDeleteSprint: function (item) {
        showLoading();

        $data.ScrumDb.remove(item.innerInstance);
        var self = $data.Model.mainPage;
        $data.ScrumDb.saveChanges(function () {
            self.onCancelSprint();
        });
    },

    //Project functions
    onProjectListShow: function () {
        showLoading();

        $data.ScrumDb.Projects.toArray(function (projects) {
            $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.projectList, projects);

            $data.Model.mainPage.activePart('projectList');
            $data.Model.mainPage.pageTitle('projects');
            $("h1.main-header").addClass("animate");
            initScrollById("transition-projects", null, null, true);
        });
    },
    onAddProject: function (item) {
        var item = new $data.ScrumDb.Projects.createNew({ Id: 0, Name: '', Description: 'Project description' });
        item = item.asKoObservable();
        $data.Model.mainPage.onEditProject(item);
    },
    onEditProject: function (item) {
        $data.Model.mainPage.activePart('editableProject');
        $data.Model.mainPage.editableProject(item);

        var project = item.innerInstance;
        if (project.Id > 0) {
            $data.ScrumDb.Projects.attach(project);
        } else {
            $data.ScrumDb.Projects.add(project);
        }

        $("h1.main-header").addClass("animate");
        initScrollById('transition-projects', null, null, true);
        $("div.metro-actionbar.detail-view-edit").addClass("opened");
    },
    onCancelProject: function (projectItem) {
        if (projectItem != null) {
            var project = projectItem.innerInstance;
            $data.ScrumDb.Projects.detach(project);
        }
        $data.Model.mainPage.onProjectListShow();
    },
    onSaveProject: function (projectItem) {
        showLoading();

        var self = $data.Model.mainPage;
        $data.ScrumDb.saveChanges(function () {
            self.onCancelProject();
        });
    },
    onDeleteProject: function (item) {
        showLoading();

        $data.ScrumDb.remove(item.innerInstance);
        var self = $data.Model.mainPage;
        $data.ScrumDb.saveChanges(function () {
            self.onCancelProject();
        });
    },

    onPinProject: function (item) {
        if ($data.Model.mainPage.selectedProject() == item.Id()) {
            $data.Model.mainPage.selectedProject(null);
            setSetting('selectedProject', null);
        } else {
            $data.Model.mainPage.selectedProject(item.Id());
            setSetting('selectedProject', JSON.stringify(item.Id()));
        }
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
    onRefreshDropDownLists: function (callback) {
        var sprintCallback = false;
        if ($data.Model.mainPage.sprintListForDropDown().length === 0) { sprintCallback = true; $data.Model.mainPage.onRefreshSprintListForDropDown(callback); }

        if ($data.Model.mainPage.projectList().length === 0) { $data.Model.mainPage.onRefreshProjectList(); }
        if ($data.Model.mainPage.userStoryList().length === 0) { $data.Model.mainPage.onRefreshUserStoryList(); }
        if ($data.Model.mainPage.userList().length === 0) { $data.Model.mainPage.onRefreshUserList(); }
        if (!sprintCallback && callback) {
            callback();
        }
    },
    onRefreshProjectList: function (callback) {
        $data.ScrumDb.Projects.toArray(function (projects) {
            $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.projectList, projects);
            if (typeof callback === 'function') {
                callback();
            }
        });
    },
    onRefreshUserStoryList: function (callback) {
        $data.ScrumDb.WorkItems
            .where(function (item) { return item.Type == "UserStory" })
            .toArray(function (userStoryResult) {
                $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.userStoryList, userStoryResult);
                if (typeof callback === 'function') {
                    callback();
                }
            });
    },
    onRefreshUserList: function (callback) {
        $data.Model.mainPage.userList(['hajni', 'user1', 'user2', 'nochtap', 'kimi', 'hat izsák']);
        if (typeof callback === 'function') {
            callback();
        }
    },
    onRefreshSprintListForDropDown: function (callback) {
        $data.ScrumDb.Sprints
            .toArray(function (sprints) {
                $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.sprintListForDropDown, sprints);
                if (typeof callback === 'function') {
                    callback();
                }
            });
    }
}, null);