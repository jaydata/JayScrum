/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 8/17/12
 * Time: 10:21 AM
 * To change this template use File | Settings | File Templates.
 */

function initializeLocalContext(){
    $data.Class.define('$data.ServiceBase', null, null, null, null);
    $data.Entity.extend('JayScrum.SqLite.WorkItem', {
        Id: { type: $data.Integer, key: true, computed: true },
        //'RowVersion':{ type:'$data.Blob', nullable:false, concurrencyMode:$data.ConcurrencyMode.Fixed, computed:true },
        'Title':{ type:'$data.String', nullable:false, required:true, maxLength:255 },
        'Type':{ type:'$data.String', nullable:false, required:true, maxLength:255 },
        'Description':{ type:'$data.String', maxLength:1024 },
        'CreatedDate':{ type:'$data.Date', nullable:false, required:true },
        'CreatedBy':{ type:'$data.String', nullable:false, required:true, maxLength:255 },
        'ChangedDate':{ type:'$data.Date', nullable:false, required:true },
        'ChangedBy':{ type:'$data.String', nullable:false, required:true, maxLength:255 },
        'Priority':{ type:'$data.Integer' },
        'AssignedTo':{ type:'$data.String', maxLength:255 },
        'ParentName':{ type:'$data.String', maxLength:255 },
        'ProjectName':{ type:'$data.String', maxLength:255 },
        'SprintName':{ type:'$data.String', maxLength:255},
        'State':{ type:'$data.String', maxLength:255 },
        'Effort':{ type:'$data.Integer' },
        'BusinessValue':{ type:'$data.Integer' },
        'IsBlocked':{ type:'$data.Boolean' },
        'RemainingWork':{ type:'$data.Integer' },
        'WorkItem_Project':{ type:'$data.Integer' },
        'WorkItem_Sprint':{ type:'$data.Integer' },
        'WorkItem_WorkItem':{ type:'$data.Integer' },
        'Reason':{ type:'$data.String', maxLength:255 }
        //'Project': { type: 'LightSwitchApplication.Project', inverseProperty: 'WorkItems' },
        //'Sprint': { type: 'LightSwitchApplication.Sprint', inverseProperty: 'WorkItems' },
        //'Parent': { type: 'LightSwitchApplication.WorkItem', inverseProperty: 'Children' },
        //'Children': { type: 'Array', elementType: 'LightSwitchApplication.WorkItem', inverseProperty: 'Parent' }
    });
    $data.Entity.extend('JayScrum.SqLite.Project', {
        Id: { type: $data.Integer, key: true, computed: true },
        'RowVersion':{ type:'$data.Blob', nullable:false, concurrencyMode:$data.ConcurrencyMode.Fixed, computed:true },
        'Name':{ type:'$data.String', nullable:false, required:true, maxLength:255 },
        'Description':{ type:'$data.String', maxLength:255 }
        //'WorkItems': { type: 'Array', elementType: 'LightSwitchApplication.WorkItem', inverseProperty: 'Project' }
    });
    $data.Entity.extend('JayScrum.SqLite.Sprint', {
        Id: { type: $data.Integer, key: true, computed: true },
        'RowVersion':{ type:'$data.Blob', nullable:false, concurrencyMode:$data.ConcurrencyMode.Fixed, computed:true },
        'Name':{ type:'$data.String', nullable:false, required:true, maxLength:255 },
        'StartDate':{ type:'$data.Date', nullable:false, required:true },
        'FinishDate':{ type:'$data.Date', nullable:false, required:true }
        //'WorkItems': { type: 'Array', elementType: 'LightSwitchApplication.WorkItem', inverseProperty: 'Sprint' }
    });
    $data.ServiceBase.extend('JayScrum.SqLite.ApplicationService', {
        getSprintsData:function(sprintIdList){

            return {toArray:function (callback){


                JayScrum.repository.Sprints
                    .where(function (item) { return ((item.Id in this.sprintIds) || (item.StartDate<=this.now && item.FinishDate>=this.now)) }, { sprintIds:sprintIdList, now:new Date() })
                    .orderBy(function(item){return item.FinishDate;})
                    .toArray({
                        success:function(sprintList){
                            var workitemQueries = sprintList.map(function(item){
                                return JayScrum.repository.WorkItems
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

                                    callback.success(data);
                                });
                        },
                        error:callback.error});


                }
            };
        }, /*$data.JayService.serviceFunction()
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
            }),*/
        getBurndownData:function(){}/*$data.JayService.serviceFunction()
            .param('sprintId', "string")
            .returns("$data.Object")
            (function (sprintId) {
                return function () {
                    var self = this;

                    var types = ["To Do", "In Progress", "Done"];
                    var workitemQueries = types.map(function (tName) {
                        return self.context.WorkItems
                            .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.State == this.typeName && (item.Type=='Task' || item.Type == 'Bug')}, {sprint_id:sprintId, typeName:tName})
                            .toArray();
                    });
                    workitemQueries.push(
                        self.context.WorkItems
                            .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.Type == 'UserStory' }, {sprint_id:sprintId})
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
                            console.log('burnDown result: '+JSON.stringify(result));
                            self.success(result);
                        });
                };
            })*/
    });
    $data.Class.defineEx('JayScrum.SqLite.ApplicationData',[$data.EntityContext, JayScrum.SqLite.ApplicationService], null, {
        WorkItems:{ type:$data.EntitySet, elementType:JayScrum.SqLite.WorkItem },
        Projects:{ type:$data.EntitySet, elementType:JayScrum.SqLite.Project },
        Sprints:{ type:$data.EntitySet, elementType:JayScrum.SqLite.Sprint }
    });

    $data.Entity.extend('JayScrum.SqLite.Storm.Base', {

        constructor: function() {
            this.creationDate = new Date();
        },
        'Id':{ key:true, type:'$data.Integer', nullable:false, computed:true },
        'creationDate': { type: 'date' }
    });
    $data.Class.define('JayScrum.SqLite.Storm.User', JayScrum.SqLite.Storm.Base, null, {
        login: { type: '$data.String' },
        firstName: { type: '$data.String' },
        lastName:  { type: '$data.String' },
        enabled: { type: '$data.Boolean' },
        password: { type: '$data.String' },
        roles: { type: '$data.String' }
    });
    $data.Class.define('JayScrum.SqLite.Storm.Group', JayScrum.SqLite.Storm.Base, null , {
        name: { type: '$data.String' }
    });
    $data.Class.define('JayScrum.SqLite.Storm.Entity', JayScrum.SqLite.Storm.Base, null , {
        tableName: { type: '$data.String' }
    });

    $data.Class.defineEx('JayScrum.sqLite.StormContext', [$data.EntityContext, $data.ServiceBase], null, {

        Users: {type: $data.EntitySet, elementType: JayScrum.SqLite.Storm.User},

        Groups: { type: $data.EntitySet, elementType: JayScrum.SqLite.Storm.Group},


        getGroups: function(){},/*$data.JayService.serviceFunction()
            .param("userID", "Edm.String")
            .returns("Edm.String")
            (
                function(userID, password) { }
            ),*/


        setPassword: function(){}/*$data.JayService.serviceFunction()
            .param("userID", "Edm.String")
            .param("password", "Edm.String")
            .returns("Edm.String")
            (
                function(userID, password) {
                    var uid = eval(userID), passwd = eval(password);
                    return function() {
                        var self = this, context = this.context
                        var u = new JayStormApplication.User({ Id: uid});
                        context.Users.attach(u);
                        u.password = passwd;
                        context.saveChanges( function() {
                            self.success("OK");
                        });

                    }

                }
            )*/
    });
}