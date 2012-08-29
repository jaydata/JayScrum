var Q = require('q');
var moment = require('moment');
(function (global, $data, undefined) {
    function registerEdmTypes() {

        function Edm_Boolean() { };
        $data.Container.registerType('Edm.Boolean', Edm_Boolean);
        $data.Container.mapType(Edm_Boolean, $data.Boolean);

        function Edm_Binary() { };
        $data.Container.registerType('Edm.Binary', Edm_Binary);
        $data.Container.mapType(Edm_Binary, $data.Blob);

        function Edm_DateTime() { };
        $data.Container.registerType('Edm.DateTime', Edm_DateTime);
        $data.Container.mapType(Edm_DateTime, $data.Date);

        function Edm_DateTimeOffset() { };
        $data.Container.registerType('Edm.DateTimeOffset', Edm_DateTimeOffset);
        $data.Container.mapType(Edm_DateTimeOffset, $data.Integer);

        function Edm_Time() { };
        $data.Container.registerType('Edm.Time', Edm_Time);
        $data.Container.mapType(Edm_Time, $data.Integer);

        function Edm_Decimal() { };
        $data.Container.registerType('Edm.Decimal', Edm_Decimal);
        $data.Container.mapType(Edm_Decimal, $data.Number);

        function Edm_Single() { };
        $data.Container.registerType('Edm.Single', Edm_Single);
        $data.Container.mapType(Edm_Single, $data.Number);

        function Edm_Double() { };
        $data.Container.registerType('Edm.Double', Edm_Double);
        $data.Container.mapType(Edm_Double, $data.Number);

        function Edm_Guid() { };
        $data.Container.registerType('Edm.Guid', Edm_Guid);
        $data.Container.mapType(Edm_Guid, $data.String);

        function Edm_Int16() { };
        $data.Container.registerType('Edm.Int16', Edm_Int16);
        $data.Container.mapType(Edm_Int16, $data.Integer);

        function Edm_Int32() { };
        $data.Container.registerType('Edm.Int32', Edm_Int32);
        $data.Container.mapType(Edm_Int32, $data.Integer);

        function Edm_Int64() { };
        $data.Container.registerType('Edm.Int64', Edm_Int64);
        $data.Container.mapType(Edm_Int64, $data.Integer);

        function Edm_Byte() { };
        $data.Container.registerType('Edm.Byte', Edm_Byte);
        $data.Container.mapType(Edm_Byte, $data.Integer);

        function Edm_String() { };
        $data.Container.registerType('Edm.String', Edm_String);
        $data.Container.mapType(Edm_String, $data.String);

    };

    function updateBurndownDataList(sprint, context){
        var p = Q.defer();
        var self = context;

        var sprintDays = moment(sprint.FinishDate).diff(sprint.StartDate, 'days');
        self.SprintBurndown
            .where(function(item){return item.SprintId == this.sprintId && item.SprintDay> this.maxDay},{sprintId:sprint.Id, maxDay:sprintDays})
            .toArray(function(sprintBurndownData){
                if(sprintBurndownData.length>0){
                    /// remove unused days
                    sprintBurndownData.forEach(function(data){self.remove(data)});
                    p.resolve();
                }
                else{
                    /// add extra days if needed
                    self.SprintBurndown
                        .where(function(item){return item.SprintId == this.sprintId && item.SprintDay<= this.maxDay},{sprintId:sprint.Id, maxDay:sprintDays})
                        .orderByDescending(function(item){return item.SprintDay})
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
                                self.SprintBurndown.add(new LightSwitchApplication.BurndownData({
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
                        callbackHandler();})});
        };
    };

    function updateSprintBurndownData(sprint, context){
        var p= Q.defer();
        var self = context;

        var sprintDay = moment().diff(sprint.StartDate, 'days');
        self.WorkItems
            .where(function (wrk) {wrk.WorkItem_Sprint == this.sprintId && (wrk.Type == "Task" || wrk.Type == "Bug") && (wrk.State == "To Do" || wrk.State == "In Progress")}, {sprintId:sprint.Id})
            .toArray( function(wrkItems){

                var leftHour = wrkItems.reduce(function (previousValue, currentValue) {return previousValue + currentValue.RemainingWork;}, 0);
                var todoHour = wrkItems.filter(function (item) {return item.State == "To Do";})
                    .reduce(function (previousValue, currentValue) {return previousValue + currentValue.RemainingWork;}, 0);

                self.SprintBurndown
                    .where(function(item){return item.SprintId == this.sprint_id && ((item.SprintDay == this.sprintDay) || (item.SprintDay < this.sprintDay && (item.Left<0 || item.ToDo<0)))}, {sprint_id:sprint.Id, sprintDay:sprintDay})
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
                .where(function(item){return item.Id in this.sprint_ids},{sprint_ids:sprintIdList})
                .toArray(function(sprintList){

                    var fns = sprintList.map(function(s){return updateSprintBurndownData(s, self)});
                    Q.all(fns)
                        .then(function(){
                            self.saveChanges(function(){
                                callbackHandler();
                            });
                        });

                });
        };
    };

    function updateConnectedData(){
        return function(callBackHandler, workItemList){
            var self = this;
            var projectIds = workItemList.map(function(wrkItem){return wrkItem.WorkItem_Project === undefined?null:wrkItem.WorkItem_Project; });
            var sprintIds = workItemList.map(function(wrkItem){return wrkItem.WorkItem_Sprint === undefined?null:wrkItem.WorkItem_Sprint; });
            var parentIds = workItemList.map(function(wrkItem){return wrkItem.WorkItem_WorkItem === undefined?null:wrkItem.WorkItem_WorkItem; });
            var fns = [];
            fns.push(self.Projects.where(function(item){return item.Id in this.ids}, {ids:projectIds}).toArray());
            fns.push(self.Sprints.where(function(item){return item.Id in this.ids1}, {ids1:sprintIds}).toArray());
            fns.push(self.WorkItems.where(function(item){return item.Id in this.ids2}, {ids2:parentIds}).toArray());

            self.Projects.where(function(item){return item.Id in this.ids}, {ids:projectIds}).toArray(function(projectList){
                self.Sprints.where(function(item){return item.Id in this.ids1}, {ids1:sprintIds}).toArray(function(sprintList){
                    self.WorkItems.where(function(item){return item.Id in this.ids2}, {ids2:parentIds}).toArray(function(parentList){
                        for(var i = 0;i<workItemList.length;i++){
                            wrkItem = workItemList[i];
                            var project = projectList.filter(function(item){return item.Id == wrkItem.WorkItem_Project})[0];
                            var sprint = sprintList.filter(function(item){return item.Id == wrkItem.WorkItem_Sprint})[0];
                            var parent = parentList.filter(function(item){return item.Id == wrkItem.WorkItem_WorkItem})[0];
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
            var sprintIds = sprintList.map(function (wrkItem) {return wrkItem.Id;});

            self.WorkItems.where(function (item) {return item.WorkItem_Sprint in this.ids1}, {ids1:sprintIds}).toArray(function (workItemList) {
                for (var i = 0; i < workItemList.length; i++) {
                    wrkItem = workItemList[i];
                    var sprint = sprintList.filter(function (item) {return item.Id == wrkItem.WorkItem_Sprint})[0];
                    if (sprint) {
                        self.WorkItems.update(wrkItem);
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

            self.WorkItems.where(function (item) {return item.WorkItem_Project in this.ids1}, {ids1:projectIds}).toArray(function (workItemList) {
                for (var i = 0; i < workItemList.length; i++) {
                    wrkItem = workItemList[i];
                    var project = projectList.filter(function (item) {return item.Id == wrkItem.WorkItem_Project})[0];
                    if (project) {
                        self.WorkItems.update(wrkItem);
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
        return function (callBackHandler, workItemList) {
            var self = this;
            var useStoryIds = workItemList.filter(function (){return item.Type == "UserStory"}).map(function (wrkItem) {return wrkItem.Id;});

            self.WorkItems.where(function (item) {return item.WorkItem_WorkItem in this.ids1}, {ids1:useStoryIds}).toArray(function (workItemList) {
                for (var i = 0; i < workItemList.length; i++) {
                    wrkItem = workItemList[i];
                    var project = workItemList.filter(function (item) {return item.Id == wrkItem.WorkItem_WorkItem})[0];
                    if (project) {
                        self.WorkItems.update(wrkItem);
                        wrkItem.ParentName = project.Name;
                    }
                }
                self.saveChanges(function () {
                    callBackHandler();
                });

            });
        };
    }

    registerEdmTypes();
    $data.Entity.extend('LightSwitchApplication.WorkItem', {
        'Id':{ key:true, type:'id', nullable:false, computed:true },
        'RowVersion':{ type:'Edm.Binary', nullable:false, concurrencyMode:$data.ConcurrencyMode.Fixed, computed:true },
        'Title':{ type:'Edm.String', nullable:false, required:true, maxLength:255 },
        'Type':{ type:'Edm.String', nullable:false, required:true, maxLength:255 },
        'Description':{ type:'Edm.String', maxLength:1024 },
        'CreatedDate':{ type:'Edm.DateTime', nullable:false, required:true },
        'CreatedBy':{ type:'Edm.String', nullable:false, required:true, maxLength:255 },
        'ChangedDate':{ type:'Edm.DateTime', nullable:false, required:true },
        'ChangedBy':{ type:'Edm.String', nullable:false, required:true, maxLength:255 },
        'Priority':{ type:'Edm.Int32' },
        'AssignedTo':{ type:'Edm.String', maxLength:255 },
        'ParentName':{ type:'Edm.String', maxLength:255 },
        'ProjectName':{ type:'Edm.String', maxLength:255 },
        'SprintName':{ type:'Edm.String', maxLength:255},
        'State':{ type:'Edm.String', maxLength:255 },
        'Effort':{ type:'Edm.Int32' },
        'BusinessValue':{ type:'Edm.Int32' },
        'IsBlocked':{ type:'Edm.Boolean' },
        'RemainingWork':{ type:'Edm.Int32' },
        'WorkItem_Project':{ type:'id' },
        'WorkItem_Sprint':{ type:'id' },
        'WorkItem_WorkItem':{ type:'id' },
        'Reason':{ type:'Edm.String', maxLength:255 }
        //'Project': { type: 'LightSwitchApplication.Project', inverseProperty: 'WorkItems' },
        //'Sprint': { type: 'LightSwitchApplication.Sprint', inverseProperty: 'WorkItems' },
        //'Parent': { type: 'LightSwitchApplication.WorkItem', inverseProperty: 'Children' },
        //'Children': { type: 'Array', elementType: 'LightSwitchApplication.WorkItem', inverseProperty: 'Parent' }
    });
    $data.Entity.extend('LightSwitchApplication.Project', {
        'Id':{ key:true, type:'id', nullable:false, computed:true },
        'RowVersion':{ type:'Edm.Binary', nullable:false, concurrencyMode:$data.ConcurrencyMode.Fixed, computed:true },
        'Name':{ type:'Edm.String', nullable:false, required:true, maxLength:255 },
        'Description':{ type:'Edm.String', maxLength:1024 }
        //'WorkItems': { type: 'Array', elementType: 'LightSwitchApplication.WorkItem', inverseProperty: 'Project' }
    });
    $data.Entity.extend('LightSwitchApplication.Sprint', {
        'Id':{ key:true, type:'id', nullable:false, computed:true },
        'RowVersion':{ type:'Edm.Binary', nullable:false, concurrencyMode:$data.ConcurrencyMode.Fixed, computed:true },
        'Name':{ type:'Edm.String', nullable:false, required:true, maxLength:255 },
        'StartDate':{ type:'Edm.DateTime', nullable:false, required:true },
        'FinishDate':{ type:'Edm.DateTime', nullable:false, required:true }
        //'WorkItems': { type: 'Array', elementType: 'LightSwitchApplication.WorkItem', inverseProperty: 'Sprint' }
    });
    $data.Entity.extend('LightSwitchApplication.BurndownData', {
        'Id':{ key:true, type:'id', nullable:false, computed:true },
        'SprintId':{ type:'id'},
        'SprintDay':{ type:'Edm.Int32'},
        'ToDo':{ type:'Edm.Int32'},
        'Left':{ type:'Edm.Int32'}
    });
    $data.Entity.extend('LightSwitchApplication.SprintData', {
        'Id':{ key:true, type:'id', nullable:false, computed:true },
        'Name':{ type:'Edm.String', nullable:false, required:true, maxLength:255 },
        'StartDate':{ type:'Edm.DateTime', nullable:false, required:true },
        'FinishDate':{ type:'Edm.DateTime', nullable:false, required:true },
        'tasksLeft': {type:'Edm.Int32'}
    });
    $data.ServiceBase.extend('LightSwitchApplication.ApplicationService', {
        getSprintsData:$data.JayService.serviceFunction()
            .param("sprintIds", "Array")
            .returnsArrayOf("$data.Object")
            (function (sprintIdList) {
                return function () {

                    var self = this;
                    var sprints = this.context.Sprints
                        .where(function (item) { return ((item.Id in this.sprintIds) || (item.StartDate<=this.now && item.FinishDate>=this.now)) }, { sprintIds:sprintIdList, now:new Date() })
                        .orderBy(function(item){return item.FinishDate;})
                        .toArray();

                    Q.when(sprints)
                        .then(function (sprintList) {
                            var workitemQueries = sprintList.map(function(item){
                                return self.context.WorkItems
                                        .where(function (item) {return item.WorkItem_Sprint == this.sprintId && item.State != "Done" && (item.Type=='Task' || item.Type == 'Bug')}, {sprintId: item.Id})
                                        .length();
                            });

                            Q.all(workitemQueries)
                                .then(function(){
                                    var data = workitemQueries.map(function(item, index){
                                        var d = sprintList[index].initData;
                                        d.tasksLeft = item.valueOf();
                                        return  d;
                                    });

                                    self.success(data);
                                });
                        });
                };
            }),
        getBurndownData:$data.JayService.serviceFunction()
            .param('sprintId', "string")
            .returns("$data.Object")
            (function (sprintId) {
                return function () {
                    var self = this;

                    var types = ["To Do", "In Progress", "Done"];
                    var workitemQueries = types.map(function (tName) {
                        return self.context.WorkItems
                            .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.State == this.typeName && (item.Type=='Task' || item.Type == 'Bug')}, {sprint_id:sprintId, typeName:tName})
                            .toArray(function(){ console.log('v'+tName)});
                    });
                    workitemQueries.push(
                        self.context.WorkItems
                            .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.Type == 'UserStory' }, {sprint_id:sprintId})
                            .length(function(){ console.log('v'+4)})
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

                            self.context.Sprints
                                .single(function(item){return item.Id == this.sprint_id},
                                    {sprint_id:sprintId},
                                    function(sprint){

                                        self.context.SprintBurndown
                                            .where(function(item){return item.SprintId == this.sprint_id},{sprint_id:sprintId})
                                            .orderBy(function(item){return item.SprintDay})
                                            .toArray(function(burndownData){

                                                var collectBurndownData = function (bdData) {
                                                    result.burnDown = {
                                                        startDate:sprint.StartDate,
                                                        endDate:sprint.FinishDate,
                                                        length:bdData.length
                                                    };
                                                    result.burnDown.remainingLine = [];
                                                    result.burnDown.todoLine = [];
                                                    result.burnDown.idealLine = [bdData[0].Left < 0 ? 0 : bdData[0].Left, 0];
                                                    for (var i = 0; i < bdData.length; i++) {
                                                        if (bdData[i].Left >= 0) {
                                                            result.burnDown.remainingLine.push(bdData[i].Left);
                                                        }
                                                        if (bdData[i].ToDo >= 0) {
                                                            result.burnDown.todoLine.push(bdData[i].ToDo);
                                                        }
                                                    }
                                                    self.success(result);
                                                };

                                                if(burndownData.length == 0){
                                                    updateBurndownDataList(sprint, self.context)
                                                        .then(function(){
                                                            self.context.saveChanges(function(){
                                                                self.context.SprintBurndown
                                                                    .where(function(item){return item.SprintId == this.sprint_id},{sprint_id:sprintId})
                                                                    .orderBy(function(item){return item.SprintDay})
                                                                    .toArray(function(newBurndownData){
                                                                        collectBurndownData(newBurndownData);
                                                                    });
                                                            });
                                                        });
                                                }else{
                                                    collectBurndownData(burndownData);
                                                }
                                            })
                                    });

                        }, function(error){console.log(error)});
                };
            })
    });
    $data.Class.defineEx('LightSwitchApplication.ApplicationData',[$data.EntityContext, LightSwitchApplication.ApplicationService], null, {
        WorkItems:{ type:$data.EntitySet, elementType:LightSwitchApplication.WorkItem , 'afterCreate':updateBurndownData, 'afterUpdate':updateBurndownData, 'beforeCreate':updateConnectedData, 'beforeUpdate':updateConnectedData },
        Projects:{ type:$data.EntitySet, elementType:LightSwitchApplication.Project/*, 'afterUpdate':updateConnectedDataProjectChanged*/},
        Sprints:{ type:$data.EntitySet, elementType:LightSwitchApplication.Sprint,  'afterCreate':afterUpdateCreateSprint, 'afterUpdate':afterUpdateCreateSprint},
        SprintBurndown:{ type:$data.EntitySet, elementType:LightSwitchApplication.BurndownData }/*,
         Microsoft_LightSwitch_GetCanInformation: $data.EntityContext.generateServiceOperation({ serviceName: 'Microsoft_LightSwitch_GetCanInformation', returnType: 'Edm.String', params: [{ dataServiceMembers: 'Edm.String' }], method: 'GET' })*/
    });

})(window, $data);


exports.serviceType = LightSwitchApplication.ApplicationData;
