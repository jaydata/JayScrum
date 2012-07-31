/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 9:28 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Frames.UserStories', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('userStory', new JayScrum.FrameView('userStory-template'));
        this.registerView('userStorySelected', new JayScrum.FrameView('userStorySelectView-template'));
        this.registerView('userStoryEditor', new JayScrum.FrameView('userStoryEditView-template'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName='userStory';
        this.selectMetaView('defaultMeta');
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
            .take(7)
            .toArray(function (userStoryResult) {
                JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().userStoryList, userStoryResult);

                JayScrum.repository.Sprints
                    .where(function (sprint) { return sprint.FinishDate > moment().utc().toDate() })
                    .select(function (sprint) { return { Id: sprint.Id, Name: sprint.Name, StartDate: sprint.StartDate, FinishDate: sprint.FinishDate } })
                    .toArray(function (sprinIds) {
                        JayScrum.app.selectedFrame().data().userStoriesInSprintList([]);
                        Q.fcall(JayScrum.app.selectedFrame()._getUserStoryInSprintList, sprinIds, null)
                            //.then(JayScrum.app.selectedFrame()._initializeUserStoriesLists())
                            .then(function(){loadingPromise.resolve();});

                    });
            });
        return loadingPromise.promise;
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
            .take(7)
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
    _initializeUserStoriesLists: function () {


        initScrollById("transition-us", JayScrum.app.selectedFrame().onIndependentUserStoryListPullUp, JayScrum.app.selectedFrame().onIndependentUserStoryListPullDown);
        var listCount = JayScrum.app.selectedFrame().data().userStoriesInSprintList().length;
        for (var i = 0; i < listCount; i++) {
            initScrollById("transition-us-" + i, JayScrum.app.selectedFrame().onUserStoryInSprintListPullUp, JayScrum.app.selectedFrame().onUserStoryInSprintListPullDown);
        }

        initHorizontalScrollById("wrapper", 0);
    },
    _initializeView: function(){
        JayScrum.app.hideLoading();
        JayScrum.app.selectedFrame().selectView('userStory');
        $("h1.main-header").addClass("animate");

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
    onIndependentUserStoryListPullUp: function (scroller) {
        JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == null })
            .skip($data.Model.mainPage.userStoryList().length)
            .take(7)
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
            .take(7)
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
        var currentList = JayScrum.app.selectedFrame().data().userStoriesInSprintList()[sprintIndex];

        JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "UserStory" && item.WorkItem_Sprint == this.sprintId }, { sprintId: currentList.sprintId })
            .take(7)
            .toArray(function (usList) {
                var newData = usList.map(function (item) { return item.asKoObservable(); });
                currentList.list(newData);
                scroller.refresh();
            });
    },

    onSelectUserStory: function (wrkItem, isEventCall) {
        JayScrum.app.selectedFrame().data().selectedUserStory(wrkItem);
        JayScrum.app.selectedFrame().selectView('userStorySelected');

//        $data.Model.mainPage.selectedWorkitemChildren([]);
//        $data.Model.mainPage.activePart('selectedUserStory');
//        $data.Model.mainPage.selectedUserStory(wrkItem);
        $("h1.main-header").addClass("animate");

        var swipeviewUs = $("div#swipeview-inside-us"),
            title = swipeviewUs.prev(),
            minusHeight = title.height() + 15;

        swipeviewUs.css('top', minusHeight);

        setTimeout(function () {
            initScrollById('swipeview-inside-us', null, null, true);
        }, 750);
    },
    onEditUserStory:function (wrkItem, isEventCall) {
//        $data.Model.mainPage.activePart('editableUserStory');
//        $data.Model.mainPage.editableUserStory(wrkItem);
        JayScrum.app.selectedFrame()._onRefreshDropDownLists()
            .then(function () {
                JayScrum.app.selectedFrame().selectView('userStoryEditor');
                JayScrum.repository.WorkItems.attach(wrkItem);

                $("h1.main-header").addClass("animate");
                var swipeHeight = $("div.detail-edit-fix-header h1").height();
                $("div#wrapper-detailed-edit").css('top', swipeHeight);
                initScrollById('wrapper-detailed-edit');
            });

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
        console.log("cancel workitem - type: user story");
        JayScrum.repository.WorkItems.detach(wrkItem);
        JayScrum.app.selectedFrame()._initializeView();
//        switch (wrkItem.Type()) {
//            case "UserStory":
//                $data.Model.mainPage.initializeUserSoriesLists();
//                break;
//            case "Task":
//                $data.Model.mainPage.onTaskListShow();
//                break;
//            default:
//                $data.Model.mainPage.onMainPageShow();
//                break;
//        }
//        return;
    },

    onRefreshWorkItemsOfUserStory: function (userStory) {
        console.log(userStory.Id());
        //showLoading();

        JayScrum.repository.WorkItems
            .where(function (item) { return item.Type == "Task" && item.WorkItem_WorkItem == this.userStoryId }, { userStoryId: userStory.Id() })
            .orderBy(function (item) { return item.Priority; })
            .toArray(function (workItems) {
                JayScrum.pushObservablesToList(JayScrum.app.selectedFrame().data().selectedUserStoryTaskList, workItems);

                refreshScroll(scrollToRefresh, true);
            });
    },
    onSelectWorkItemOfUserStory: function (wrkItem, isEventCall) {
        $data.Model.mainPage.activePart('selectedWorkitem');
        $data.Model.mainPage.selectedWorkItem(wrkItem);
        $("h1.main-header").addClass("animate");
        $("div.icon-action.back.topleft.main").hide();
        $("div.metro-actionbar.detail-view").addClass("opened");

        initSwipeviewById("swipeview", $data.Model.mainPage.selectedWorkitemChildren(), wrkItem.Id());
    },

    onFrameChangedFrom:function (activeFrameMeta, oldFrameMeta, initDatam, frame) {
        this._loadData()
            .then(this._initializeView)
            .then(this._initializeUserStoriesLists);
    }
}, null);