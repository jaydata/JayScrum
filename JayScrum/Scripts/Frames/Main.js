/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 8:43 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Frames.Main', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('dashboard', new JayScrum.FrameView('dashBoard-template'));
        this.registerMetaView('dashboardMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.selectView('dashboard');
        this.selectMetaView('dashboardMeta');
        this.data = ko.observable({
            name:'dashboard',
            activeSprintList: ko.observableArray(),
            activeSprintsTaskIds: ko.observableArray()
        });
    },
    _loadData:function () {
        var loadDefer = Q.defer();
        var self = this;

        JayScrum.repository.Sprints
            .where(function (item) {
                return item.StartDate <= this.currentDate && item.FinishDate >= this.currentDate;
            }, { currentDate:moment.utc().toDate() })
            .orderBy(function (item) {
                return item.StartDate
            })
            .toArray({
                success:function (result) {
                    if (result.length == 0) {
                        $("div#error-msg").addClass("opened");
                    }
                    JayScrum.pushObservablesToList(self.data().activeSprintList, result, true);
                    //Get pinned sprints
                    var pinnedSprints = getSetting('pinnedSprints');
                    var additionalSprintIds = [];
                    for (var id in pinnedSprints) {
                        if (!result.some(function (sprint) {
                            return sprint.Id == pinnedSprints[id]
                        })) {
                            additionalSprintIds.push(pinnedSprints[id]);
                        }
                    }

                    Q.fcall(function () {
                        if (additionalSprintIds.length > 0) {
                            var p1 = Q.defer();
                            JayScrum.repository.Sprints
                                .where(function (item) {
                                    return item.Id in this.sprintIds
                                }, { sprintIds:additionalSprintIds })
                                .toArray(function (sprintList) {
                                    for (var s in sprintList) {
                                        self.data().activeSprintList.push(sprintList[s].asKoObservable());
                                    }
                                    p1.resolve();
                                });
                            return p1.promise;
                        }
                    })
                        /*.then(function () {
                            var p2 = Q.defer();
                            var sprintIds = self.data().activeSprintList().map(function (s) {
                                return s.Id();
                            });
                            JayScrum.repository.WorkItems
                                .where(function (wi) { return wi.Type == 'Task' && wi.State != 'Done' && wi.WorkItem_Sprint in this.sprintIds }, { sprintIds:sprintIds })
                                .select(function (wi) { return { WorkItemId:wi.Id, SprintId:wi.WorkItem_Sprint }})
                                .orderBy(function (wi) { return wi.WorkItem_Sprint; })
                                .toArray(function (result) {
                                    $data.Model.mainPage.activeSprintsTaskIds(result);
                                    p2.resolve();
                                });
                            return p2.promise;
                        })*/
                        .then(function () {
                            initUI();
                            loadDefer.resolve();
                        });
                },
                error:function (error) {
                    $("div#error-msg").addClass("opened");
                    console.log(error.stack);
                    loadDefer.reject();
                    //alert(error);
                }
            });

        return loadDefer.promise;
    },
    onFrameChangedFrom:function (activeFrameMeta, oldFrameMeta, initDatam, frame) {
        this._loadData()
            .then(function () {
                JayScrum.app.visibleLoadingScreen(false);
                initScrollById("metro-tiles-scroll", null, null, true);
            });
    },
    isPinnedSprint: function (sprint) {
        var pinnedSprints = getSetting('pinnedSprints');
        if (!pinnedSprints) { pinnedSprints = []; }
        return pinnedSprints.indexOf(sprint.Id()) >= 0;
    },
    onTaskListShow:function(item){
        console.log(item);
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