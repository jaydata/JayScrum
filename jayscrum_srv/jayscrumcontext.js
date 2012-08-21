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
    function afterCreateSprint(sprintList){

        sprintList.forEach(function(item){
            var mStartDate = moment(new Date(item.StartDate.getFullYear(), item.StartDate.getMonth(), item.StartDate.getDate()));
            console.log(mStartDate.toDate());
            console.log('_'+mStartDate.toDate());
            var mFinishDate = moment(item.FinishDate);
            var diff = mFinishDate.diff(mStartDate, 'days')+1;
            for(var i= 0;i<diff; i++){
                var date = mStartDate.clone().add('days', i).toDate();
                console.log(item.Id+'__'+date+'__'+i+'__'+mStartDate.toDate());
                this.SprintBurndown.add(new LightSwitchApplication.BurndownData({
                    SprintId:item.Id,
                    SprintDate:date,
                    ToDo:-1,
                    Left:-1
                }));
            }
        }, this);
        this.saveChanges();
    };
    function afterCreateWorkItem(){
        return function (calbackHandler, workItemList) {
            var d = new Date();
            var toDay = moment(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
            var self = this;
            var sprintIds = workItemList.map(function (item) {
                return item.WorkItem_Sprint
            });

            if (sprintIds.length > 0) {
                self.SprintBurndown
                    .where(function (item) {
                        item.SprintId in this.sprintList && item.SprintDate == this.now
                    }, {sprintList:sprintIds, now:toDay.toDate()})
                    .toArray(function (burndownData) {

                        var queries = burndownData.map(function (bdown) {
                            return self.WorkItems
                                .where(function (wrk) {
                                    wrk.WorkItem_Sprint == this.sprintId && (wrk.Type == "Task" || wrk.Type == "Bug") && (wrk.State == "To Do" || wrk.State == "In Progress")
                                }, {sprintId:bdown.SprintId})
                                .toArray()
                        });
                        Q.all(queries)
                            .then(function () {
                                var queryResult = null;
                                var bdEntity = null;
                                for (var i = 0; i < queries.length; i++) {
                                    queryResult = queries[i].valueOf();
                                    bdEntity = burndownData[i];
                                    self.attach(bdEntity);

                                    bdEntity.Left = queryResult.reduce(function (previousValue, currentValue) {return previousValue + currentValue.RemainingWork;}, 0);
                                    var toDoList = queryResult.filter(function (item) {return item.State == "To Do";});
                                    bdEntity.ToDo = toDoList.reduce(function (previousValue, currentValue) {return previousValue + currentValue.RemainingWork;}, 0);
                                }
                                self.saveChanges();
                                calbackHandler();
                            });
                    });
            }
        };
    };
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
        'SprintDate':{ type:'Edm.DateTime'},
        'ToDo':{ type:'Edm.Int32'},
        'Left':{ type:'Edm.Int32'}
    });
    $data.ServiceBase.extend('LightSwitchApplication.ApplicationService', {
        getSprintsData:$data.JayService.serviceFunction()
            .param("sprintIds", "Array")
            .returnsArrayOf("$data.Object")
            (function (sprintIdList) {
                return function () {
                    var self = this;
                    var sprints = this.context.Sprints
                        .where(function (item) { return ((item.Id in this.sprintIds) || (item.StartDate<=this.now && item.FinishDate>=this.now)) }, { sprintIds:JSON.parse(sprintIdList), now:new Date() })
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
                    console.log(sprintId)
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


                    workitemQueries.push(
                        self.context.SprintBurndown
                            .where(function(item){return item.SprintId == this.sprint_id},{sprint_id:sprintId})
                            .orderBy(function(item){return item.SprintDate})
                            .toArray()
                    );
                   /* workitemQueries.push(
                        self.context.Sprints
                            .where(function(item){return item.Id == this.sprint_id},{sprint_id: sprintId})
                            .toArray(function(a){ console.log('v'+5);console.log(a); })
                    );*/

                    Q.all(workitemQueries)
                        .then(function(){
//                            console.log(1);
                            /*var sprint = workitemQueries[4].valueOf()[0];
                            console.log(sprint)*/
//                            console.log(11);
                            var burndownData = workitemQueries[4].valueOf();
//                            console.log(burndownData)
//                            console.log(12);
                            var result = {
                                todo:workitemQueries[0].valueOf().length,
                                inprogress:workitemQueries[1].valueOf().length,
                                done:workitemQueries[2].valueOf().length,
                                inprogress_hour:workitemQueries[1].valueOf().reduce(function(previousValue, currentValue, index, array){return previousValue + currentValue.RemainingWork;},0),
                                userStory:workitemQueries[3].valueOf(),
                                task:9999,
                                burnDown:{
                                    startDate: burndownData[0].SprintDate,
                                    endDate: burndownData[burndownData.length-1].SprintDate,
                                    length: burndownData.length
                                }
                            };
//                            console.log(13);
//                            var mStartDate = moment(sprint.StartDate);
//                            var mFinishDate = moment(sprint.FinishDate);
//                            console.log(131);
//                            var diff = mFinishDate.diff(mStartDate, 'days');
                            result.burnDown.remainingLine = [];
                            result.burnDown.todoLine = [];
                            result.burnDown.idealLine = [burndownData[0].Left<0?0:burndownData[0].Left, 0];
//                            console.log(2);
                            for(var i = 0;i<burndownData.length;i++){
                                if(burndownData[i].Left>=0){
                                    result.burnDown.remainingLine.push(burndownData[i].Left);
                                }
                                if(burndownData[i].ToDo>=0){
                                    result.burnDown.todoLine.push(burndownData[i].ToDo);
                                }
                            }
//                            console.log(3);
                            result.task = result.todo + result.inprogress + result.done;
//                            console.log('burnDown result: '+JSON.stringify(result));
                            self.success(result);
                        }, function(error){console.log(error)});
                };
            })
    });
    $data.Class.defineEx('LightSwitchApplication.ApplicationData',[$data.EntityContext, LightSwitchApplication.ApplicationService], null, {
        WorkItems:{ type:$data.EntitySet, elementType:LightSwitchApplication.WorkItem , 'afterCreate':afterCreateWorkItem, 'afterUpdate':afterCreateWorkItem },
        Projects:{ type:$data.EntitySet, elementType:LightSwitchApplication.Project },
        Sprints:{ type:$data.EntitySet, elementType:LightSwitchApplication.Sprint,  'afterCreate':afterCreateSprint},
        SprintBurndown:{ type:$data.EntitySet, elementType:LightSwitchApplication.BurndownData }/*,
         Microsoft_LightSwitch_GetCanInformation: $data.EntityContext.generateServiceOperation({ serviceName: 'Microsoft_LightSwitch_GetCanInformation', returnType: 'Edm.String', params: [{ dataServiceMembers: 'Edm.String' }], method: 'GET' })*/
    });

})(window, $data);


exports.serviceType = LightSwitchApplication.ApplicationData;
