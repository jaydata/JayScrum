/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 9/9/12
 * Time: 9:48 PM
 * To change this template use File | Settings | File Templates.
 */
var Q = require('q');

function updateBurndownDataList(sprint, context){
    var p = Q.defer();
    var self = context;

    var sprintDays = parseInt((sprint.FinishDate.getTime()-sprint.StartDate.getTime())/(24*3600*1000));
    //var sprintDays = moment(sprint.FinishDate).diff(sprint.StartDate, 'days');
    self.SprintBurndown
        .where(function(item){return item.SprintId == this.sprintId && item.SprintDay> this.maxDay;},{sprintId:sprint.Id, maxDay:sprintDays})
        .toArray(function(sprintBurndownData){
            if(sprintBurndownData.length>0){
                /// remove unused days
                sprintBurndownData.forEach(function(data){self.remove(data);});
                p.resolve();
            }
            else{
                /// add extra days if needed
                self.SprintBurndown
                    .where(function(item){return item.SprintId == this.sprintId && item.SprintDay<= this.maxDay;},{sprintId:sprint.Id, maxDay:sprintDays})
                    .orderByDescending(function(item){return item.SprintDay;})
                    .take(1)
                    .toArray(function(lastSprintDayData){
                        var lastSprintDay = 0;
                        var todoValue = -1;
                        var leftValue = -1;
                        if(lastSprintDayData.length>0){
                            lastSprintDay = lastSprintDayData[0].SprintDay+1;
                            todoValue = lastSprintDayData[0].ToDo;
                            leftValue = lastSprintDayData[0].Left;
                        }
                        for(var i= lastSprintDay;i<=sprintDays; i++){
                            self.SprintBurndown.add(new self.SprintBurndown.createNew({
                                SprintId:sprint.Id,
                                SprintDay:i,
                                ToDo:todoValue,
                                Left:leftValue
                            }));
                        }
                        p.resolve();
                    });
            }
        });

    return p.promise;
}
function afterUpdateCreateSprint(){
    return function(callbackHandler, sprintList){
        var self = this;
        var fns = sprintList.map(function(s){return updateBurndownDataList(s, self);});
        Q.all(fns)
            .then(function(){
                self.saveChanges(function(){
                    var fnUpdateConnectedData = updateConnectedDataSprintChanged();
                    fnUpdateConnectedData.apply(self,[function(){
                        callbackHandler();
                    }, sprintList]);
                });
            });
    };
}

function updateSprintBurndownData(sprint, context){
    var p= Q.defer();
    var self = context;

    var sprintDays = parseInt((Date.now()-sprint.StartDate.getTime())/(24*3600*1000));
    //var sprintDay = moment().diff(sprint.StartDate, 'days');
    self.WorkItems
        .where(function (wrk) {return wrk.WorkItem_Sprint == this.sprintId && (wrk.Type == "Task" || wrk.Type == "Bug") && (wrk.State == "To Do" || wrk.State == "In Progress");}, {sprintId:sprint.Id})
        .toArray( function(wrkItems){

            var leftHour = wrkItems.reduce(function (previousValue, currentValue) {return previousValue + currentValue.RemainingWork;}, 0);
            var todoHour = wrkItems.filter(function (item) {return item.State == "To Do";})
                .reduce(function (previousValue, currentValue) {return previousValue + currentValue.RemainingWork;}, 0);

            self.SprintBurndown
                .where(function(item){return item.SprintId == this.sprint_id && ((item.SprintDay == this.sprintDay) || (item.SprintDay < this.sprintDay && (item.Left<0 || item.ToDo<0)));}, {sprint_id:sprint.Id, sprintDay:sprintDay})
                .toArray(function(bdData){
                    bdData.forEach(function(bdEntity) {
                        self.attach(bdEntity);
                        if(bdEntity.SprintDay == sprintDay){
                            bdEntity.Left = leftHour;
                            bdEntity.ToDo = todoHour;
                        }
                        else{
                            if(bdEntity.Left < 0){bdEntity.Left = leftHour;}
                            if(bdEntity.ToDo < 0){bdEntity.ToDo = todoHour;}
                        }
                    });
                    p.resolve();
                });
        });


    return p.promise;
}
function updateBurndownData(){
    return function (callbackHandler, workItemList) {

        var sprintIdList = workItemList.map(function(wrkItem){return wrkItem.WorkItem_Sprint;});
        var self = this;

        self.Sprints
            .where(function(item){return item.Id in this.sprint_ids;},{sprint_ids:sprintIdList})
            .toArray(function(sprintList){

                var fns = sprintList.map(function(s){return updateSprintBurndownData(s, self);});
                Q.all(fns)
                    .then(function(){
                        self.saveChanges(function(){
                            var fnUpdateConnectedData = updateConnectedDataUserStoryChanged();
                            fnUpdateConnectedData.apply(self,[function(){
                                callbackHandler();
                            }, workItemList]);
                        });
                    });

            });
    };
}

function updateConnectedData(){
    return function(callBackHandler, workItemList){
        var self = this;
        var projectIds = workItemList.map(function(wrkItem){return wrkItem.WorkItem_Project === undefined?null:wrkItem.WorkItem_Project; });
        var sprintIds = workItemList.map(function(wrkItem){return wrkItem.WorkItem_Sprint === undefined?null:wrkItem.WorkItem_Sprint; });
        var parentIds = workItemList.map(function(wrkItem){return wrkItem.WorkItem_WorkItem === undefined?null:wrkItem.WorkItem_WorkItem; });
        var fns = [];
        fns.push(self.Projects.where(function(item){return item.Id in this.ids;}, {ids:projectIds}).toArray());
        fns.push(self.Sprints.where(function(item){return item.Id in this.ids1;}, {ids1:sprintIds}).toArray());
        fns.push(self.WorkItems.where(function(item){return item.Id in this.ids2;}, {ids2:parentIds}).toArray());

        self.Projects.where(function(item){return item.Id in this.ids;}, {ids:projectIds}).toArray(function(projectList){
            self.Sprints.where(function(item){return item.Id in this.ids1;}, {ids1:sprintIds}).toArray(function(sprintList){
                self.WorkItems.where(function(item){return item.Id in this.ids2;}, {ids2:parentIds}).toArray(function(parentList){
                    for(var i = 0;i<workItemList.length;i++){
                        wrkItem = workItemList[i];
                        var project = projectList.filter(function(item){return item.Id == wrkItem.WorkItem_Project;})[0];
                        var sprint = sprintList.filter(function(item){return item.Id == wrkItem.WorkItem_Sprint;})[0];
                        var parent = parentList.filter(function(item){return item.Id == wrkItem.WorkItem_WorkItem;})[0];
                        if(project){ wrkItem.ProjectName = project.Name;}
                        if(sprint){ wrkItem.SprintName = sprint.Name;}
                        if(parent){ wrkItem.ParentName = parent.Title;}
                    }
                    callBackHandler();
                });
            });
        });
    };
}

function updateConnectedDataSprintChanged() {
    return function (callBackHandler, sprintList) {
        var self = this;
        var sprintIds = sprintList.map(function (wrkItem) {
            return wrkItem.Id;
        });

        self.WorkItems.where(function (item) {return item.WorkItem_Sprint in this.ids1;}, {ids1:sprintIds}).toArray(function (workItemList) {
            for (var i = 0; i < workItemList.length; i++) {
                wrkItem = workItemList[i];
                var sprint = sprintList.filter(function (item) {return item.Id == wrkItem.WorkItem_Sprint;})[0];
                if (sprint) {
                    self.WorkItems.attach(wrkItem);
                    wrkItem.SprintName = sprint.Name;
                }
            }
            self.saveChanges(function () {
                callBackHandler();
            });

        });
    };
}
function updateConnectedDataProjectChanged() {
    return function (callBackHandler, projectList) {
        var self = this;
        var projectIds = projectList.map(function (wrkItem) {return wrkItem.Id;});

        self.WorkItems.where(function (item) {return item.WorkItem_Project in this.ids1;}, {ids1:projectIds}).toArray(function (workItemList) {
            for (var i = 0; i < workItemList.length; i++) {
                wrkItem = workItemList[i];
                var project = projectList.filter(function (item) {return item.Id == wrkItem.WorkItem_Project;})[0];
                if (project) {
                    self.WorkItems.attach(wrkItem);
                    wrkItem.ProjectName = project.Name;
                }
            }
            console.log("Update workItem after change project!");
            self.saveChanges(function () {
                callBackHandler();
            });

        });
    };
}
function updateConnectedDataUserStoryChanged() {
    return function (callBackHandler, userStoryItemList) {
        var self = this;
        var userStoryIds = userStoryItemList.filter(function (item){return item.Type == "UserStory";}).map(function (wrkItem) {return wrkItem.Id;});
        self.WorkItems.where(function (item) {return item.WorkItem_WorkItem in this.ids1;}, {ids1:userStoryIds}).toArray(function (workItemList) {
            for (var i = 0; i < workItemList.length; i++) {
                wrkItem = workItemList[i];
                var project = userStoryItemList.filter(function (item) {return item.Id == wrkItem.WorkItem_WorkItem;})[0];
                if (project) {
                    self.WorkItems.attach(wrkItem);
                    wrkItem.ParentName = project.Name;
                }
            }
            self.saveChanges(function () {
                callBackHandler();
            });

        });
    };
}

exports = module.exports = function(type){
    type.extend("JayScrumFunctionImports", {
        constructor:function(){
            this.WorkItems['afterCreate'] = updateBurndownData;
            this.WorkItems['afterUpdate'] = updateBurndownData;
            this.WorkItems['beforeCreate'] = updateConnectedData;
            this.WorkItems['beforeUpdate'] = updateConnectedData;
            this.Projects['afterUpdate'] = updateConnectedDataProjectChanged;
            this.Sprints['afterCreate'] = afterUpdateCreateSprint;
            this.Sprints['afterUpdate'] = afterUpdateCreateSprint;
        },
        getSprintsData:$data.JayService.serviceFunction()
            .param("sprintIds", "Array")
            .returnsArrayOf("jayscrum.SprintExtended")
            (function (sprintIdList) {
                return function (success, error) {
                    console.log(arguments);
                    console.log(this);
                    var self = this;
                    var sprints = this.Sprints
                        .where(function (item) { return ((item.Id in this.sprintIds) || (item.StartDate<=this.now && item.FinishDate>=this.now)); }, { sprintIds:sprintIdList, now:new Date() })
                        .orderBy(function(item){return item.FinishDate;})
                        .toArray();

                    Q.when(sprints)
                        .then(function (sprintList) {
                            var workitemQueries = sprintList.map(function(item){
                                return self.WorkItems
                                    .where(function (item) {return item.WorkItem_Sprint == this.sprintId && item.State != "Done" && (item.Type=='Task' || item.Type == 'Bug');}, {sprintId: item.Id})
                                    .length();
                            });

                            Q.all(workitemQueries)
                                .then(function(){
                                    var data = workitemQueries.map(function(item, index){
                                        var d = sprintList[index].initData;
                                        d.tasksLeft = item.valueOf();
                                        return new jayscrum.SprintExtended(d);
                                    });

                                    success(data);
                                })
                                .fail(function(){console.log(arguments);success([]);});
                        })
                        .fail(function(){console.log(arguments);success([]);});
                };
            }),
        getBurndownData:$data.JayService.serviceFunction()
            .param('sprintId', "string")
            .returns("$data.Object")
            (function (sprintId) {
                return function (success, error) {
                    var self = this;

                    var types = ["To Do", "In Progress", "Done"];
                    var workitemQueries = types.map(function (tName) {
                        return self.WorkItems
                            .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.State == this.typeName && (item.Type=='Task' || item.Type == 'Bug');}, {sprint_id:sprintId, typeName:tName})
                            .toArray();
                    });
                    workitemQueries.push(
                        self.WorkItems
                            .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.Type == 'UserStory'; }, {sprint_id:sprintId})
                            .length()
                    );

                    Q.all(workitemQueries)
                        .then(function(){
                            var result = {
                                todo:workitemQueries[0].valueOf().length,
                                inprogress:workitemQueries[1].valueOf().length,
                                done:workitemQueries[2].valueOf().length,
                                inprogress_hour:workitemQueries[1].valueOf().reduce(function(previousValue, currentValue, index, array){return previousValue + currentValue.RemainingWork;},0),
                                userStory:workitemQueries[3].valueOf(),
                                task:9999
                            };
                            result.task = result.todo + result.inprogress + result.done;

                            self.Sprints
                                .single(function(item){return item.Id == this.sprint_id;},
                                {sprint_id:sprintId},
                                function(sprint){

                                    self.SprintBurndown
                                        .where(function(item){return item.SprintId == this.sprint_id;},{sprint_id:sprintId})
                                        .orderBy(function(item){return item.SprintDay;})
                                        .toArray(function(burndownData){

                                            var collectBurndownData = function (bdData) {
                                                result.burnDown = {
                                                    startDate:sprint.StartDate,
                                                    endDate:sprint.FinishDate,
                                                    length:bdData.length
                                                };
                                                result.burnDown.remainingLine = [];
                                                result.burnDown.todoLine = [];
                                                result.burnDown.idealLine = [[0, bdData[0].Left < 0 ? 0 : bdData[0].Left], [bdData.length-1, 0]];
                                                for (var i = 0; i < bdData.length; i++) {
                                                    if (bdData[i].Left >= 0) {
                                                        result.burnDown.remainingLine.push([i, bdData[i].Left]);
                                                    }
                                                    if (bdData[i].ToDo >= 0) {
                                                        result.burnDown.todoLine.push([i, bdData[i].ToDo]);
                                                    }
                                                }
                                                while(result.burnDown.remainingLine.length<2){

                                                    result.burnDown.remainingLine.push([result.burnDown.remainingLine.length,
                                                        result.burnDown.remainingLine.length===0
                                                            ? 0
                                                            : result.burnDown.remainingLine[result.burnDown.remainingLine.length-1][1]
                                                    ]);
                                                }
                                                while(result.burnDown.todoLine.length<2){
                                                    result.burnDown.todoLine.push([result.burnDown.todoLine.length,
                                                        result.burnDown.todoLine.length===0
                                                            ? 0
                                                            : result.burnDown.todoLine[result.burnDown.todoLine.length-1][1]
                                                    ]);
                                                }
                                                success(result);
                                            };

                                            if(burndownData.length === 0){
                                                updateBurndownDataList(sprint, self)
                                                    .then(function(){
                                                        self.saveChanges(function(){
                                                            self.SprintBurndown
                                                                .where(function(item){return item.SprintId == this.sprint_id;},{sprint_id:sprintId})
                                                                .orderBy(function(item){return item.SprintDay;})
                                                                .toArray(function(newBurndownData){
                                                                    collectBurndownData(newBurndownData);
                                                                });
                                                        });
                                                    });
                                            }else{
                                                collectBurndownData(burndownData);
                                            }
                                        });
                                });

                        }, function(error){console.log(error);});
                };
            })
    });
    JayScrumFunctionImports.annotateFromVSDoc();
    return JayScrumFunctionImports;
};