/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 4:43 PM
 * To change this template use File | Settings | File Templates.
 */
function InstallLocalDemoDb(ctx){
    var p = Q.defer();
    ctx.Users.add(new JayScrum.SqLite.Storm.User({UserID:1, Login:'administrator', Age:32, FirstName:'Mr.', LastName:'Administrator', Enabled:true}));
    ctx.Projects.add(new JayScrum.SqLite.Project({Id:1, Name:"Learn using JayScrum locally", Description:"Step by step instructions: using JayScrum like a todo list" }));
    ctx.Projects.add(new JayScrum.SqLite.Project({Id:2, Name:"Use JayScrum in a team - repo in the cloud", Description:"Step by step instructions: using JayScrum in a team" }));
    ctx.Sprints.add(new JayScrum.SqLite.Sprint({Id:1, Name:"Learn JayScrum", StartDate:moment().add('days', -1).utc().toDate(), FinishDate:moment().add('days', 7).utc().toDate() }));
    ctx.Sprints.add(new JayScrum.SqLite.Sprint({Id:2, Name:"Use JayScrum in a team", StartDate:moment().add('days', -5).utc().toDate(), FinishDate:moment().add('days', 14).utc().toDate() }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:1, Title:"Create local repository", Description:"You will need a local repository in order to store your work items on your device. This repo is stored only on your current device. Team-work scenarion with a cloud-based repository will be covered in Sprint 2 - Using JayScrum in a team" , Priority:Math.floor(Math.random() * 10), Effort:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"UserStory" , WorkItem_Sprint:1, WorkItem_Project:1, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"New" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:2, Title:"Customizing JayScrum to your needs", Description:"After performing the tasks below you will have a customized JayScrum application" , Priority:Math.floor(Math.random() * 10), Effort:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"UserStory" , WorkItem_Sprint:1, WorkItem_Project:1, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"New" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:3, Title:"Using JayScrum from sprint to sprint", Description:"Learn how to build a project backlog and keep work item up-to-date" , Priority:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"UserStory" , WorkItem_Sprint:1, WorkItem_Project:1, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"New" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:4, Title:"Working with more sprints at the same time", Description:"Do you work in  or want to keep track of more sprints?" , Priority:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"UserStory" , WorkItem_Sprint:1, WorkItem_Project:1, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"New" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:5, Title:"Collaborate! Buy new cloud repo!", Description:"Create a cloud-repo and work together with your teammates." , Priority:Math.floor(Math.random() * 40), Effort:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"UserStory" , WorkItem_Sprint:2, WorkItem_Project:2, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"New" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:6, Title:"Create local repository", Description:"JayScrum starts with the repository list for the first time. You can open this screen by clicking the Repositories tile of the Main screen.Press the plus (+) sign.- Fill the repository creation form- Add the display name of your repo- Add the unique database name- Add the username and password- Check the default checkbox if you want to start your app with this repo- Click Save" , Priority:Math.floor(Math.random() * 11), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:1, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"Done" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:7, Title:"Setup your front-end", Description:"Click UI setting on the main screen- Choose a theme according to your visual preferences- Select your favourite font and navigate back to main screen" , Priority:Math.floor(Math.random() * 21), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:2, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"InProgress" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:8, Title:"Create a new sprint", Description:"Choose Sprints on the Main screen- Click the plus sign (+) on the bottom of the screen- Fill the name and time interval of the sprint-Click the save new sprint with the save pictogram on the bottom of the screen" , Priority:Math.floor(Math.random() * 22), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:2, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:9, Title:"Pin the sprint to the main screen", Description:"In the sprint list, click the pin pictogram to have a dedicated tile for your sprint on the main screen" , Priority:Math.floor(Math.random() * 23), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:2, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:10, Title:"Review the Scrum Wall by swiping", Description:"Select a  sprint from the sprint list. The Scrum Wall shows your tasks in Todo, In progress and Done states- Swipe to left and right - Swipe to left and rightin order to review the userstories and tasks in different states- Sprint overview and burndown chart- Swipe to the right of the screen to check the sprint summary" , Priority:Math.floor(Math.random() * 24), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:2, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:11, Title:"Create a new project", Description:"Creating multiple projects makes you able to work on more product of for more clients in one sprint. - navigate to the Projects tile of your Main screen- click the plus sign on the bottom of the sceen- fill the name of your project- click save" , Priority:Math.floor(Math.random() * 25), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:2, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:12, Title:"Create your sprint backlog: User Story", Description:"Be your own Product Owner!- Click the User Stories tile of the Main screen- Add new User story by clicking the plus sign (+) on the top of the screen- Define the fields of the UserStory- Add a title and description and choose the User Story type- Don't forget to assign a backlog priority and click the Save pictogram" , Priority:Math.floor(Math.random() * 31), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:13, Title:"Create your sprint backlog: Tasks", Description:"Add tasks to the user story you created before- Choose on item from the User Story list- Scroll down to the bottom of the screen- Click the plus sign in the Tasks section- Fill task data - Leave the value of the user story field- Click the save pictogram" , Priority:Math.floor(Math.random() * 32), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:14, Title:"Begin to work on a task", Description:"Open the Scrum wall of your sprint- Update State field to In progress- Set the Assigned to field to your name- Click the save buttonAfter saving the task, it will be moved to the In progress column of the Scrum Wall" , Priority:Math.floor(Math.random() * 33), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:15, Title:"Update the remaining hours", Description:"Open the task you are working on- Click the pencil pictogram to edit- Set the Remaining work field of your task and click the Save pictogram" , Priority:Math.floor(Math.random() * 34), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"ToDo" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:16, Title:"Take a look at Sprint overview", Description:"Swipe to the right side of the screen to check out the updated burndown chart- the chart shows the remaining work on the current day of the sprint- try to eliminate the remaining hours till the next day of the sprint" , Priority:Math.floor(Math.random() * 35), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:17, Title:"Navigating between tasks of a selected User Story by swiping", Description:"JayScrum supports the user-friendly navigation between tasks of a selected user story- Select a user story from the user story list- Scroll down to the bottom of the user story detail screen- Click the refresh button of the Tasks section- Select a task from the list- Swipe to left and right in order to review the tasks assigned to the selected user story" , Priority:Math.floor(Math.random() * 36), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:18, Title:"Navigating between tasks with the same status", Description:"You can easily navigate between the in-progress tasks based to review the unfinished work items.- Navigate to the Scrum Wall- Select one task with In-progress state- After the task description appears, swipe left and right to navigate between tasks" , Priority:Math.floor(Math.random() * 37), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:19, Title:"Working with more sprints at the same time", Description:"You can manage more sprint at the same time. To do this easily, navigate to the Sprints tile of the Main Screen and pin the second sprint to the Main Screen. " , Priority:Math.floor(Math.random() * 41), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:4, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
    ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:20, Title:"Buy cloud repo", Description:"Navigate to NochtaP feature" , Priority:Math.floor(Math.random() * 111), Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:2, WorkItem_Project:2, WorkItem_WorkItem:5, CreatedDate:new Date().toISOString(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:new Date().toISOString(), ChangedBy:'administrator', AssignedTo:"administrator", State:"ToDo" }));
    ctx.saveChanges(function(){p.resolve();});
    return p.promise;
}
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
            this.SprintBurndown.add(new JayScrum.SqLite.BurndownData({
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

$data.Entity.extend('JayScrum.Settings.Repository', {
    Id: { type: $data.Integer, key: true, computed: true },
    Title: { type: $data.String, nullable: false, required: true },
    Url: { type: $data.String, nullable: false, required: true },
    UserName: { type: $data.String, nullable: true },
    Password: { type: $data.String, nullable: true },
    IsDefault: { type: $data.Boolean, nullable: true }
});

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
    //'RowVersion':{ type:'$data.Blob', nullable:false, concurrencyMode:$data.ConcurrencyMode.Fixed, computed:true },
    'Name':{ type:'$data.String', nullable:false, required:true, maxLength:255 },
    'Description':{ type:'$data.String', maxLength:255 }
    //'WorkItems': { type: 'Array', elementType: 'LightSwitchApplication.WorkItem', inverseProperty: 'Project' }
});
$data.Entity.extend('JayScrum.SqLite.Sprint', {
    Id: { type: $data.Integer, key: true, computed: true },
    //'RowVersion':{ type:'$data.Blob', nullable:false, concurrencyMode:$data.ConcurrencyMode.Fixed, computed:true },
    'Name':{ type:'$data.String', nullable:false, required:true, maxLength:255 },
    'StartDate':{ type:'$data.Date', nullable:false, required:true },
    'FinishDate':{ type:'$data.Date', nullable:false, required:true }
    //'WorkItems': { type: 'Array', elementType: 'LightSwitchApplication.WorkItem', inverseProperty: 'Sprint' }
});
$data.Entity.extend('JayScrum.SqLite.BurndownData', {
    'Id':{ key:true, type: $data.Integer, nullable:false, computed:true },
    'SprintId':{ type: $data.Integer},
    'SprintDate':{ type:'$data.Date'},
    'ToDo':{ type:'$data.Integer'},
    'Left':{ type:'$data.Integer'}
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
    getBurndownData:function(sprintId){
        var q = Q.defer();

        var types = ["To Do", "In Progress", "Done"];
        var workitemQueries = types.map(function (tName) {
            return JayScrum.repository.WorkItems
                .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.State == this.typeName && (item.Type=='Task' || item.Type == 'Bug')}, {sprint_id:sprintId, typeName:tName})
                .toArray();
        });
        workitemQueries.push(
            JayScrum.repository.WorkItems
                .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.Type == 'UserStory' }, {sprint_id:sprintId})
                .length()
        );
        workitemQueries.push(
            JayScrum.repository.SprintBurndown
                .where(function(item){return item.SprintId == this.sprint_id},{sprint_id:sprintId})
                .orderBy(function(item){return item.SprintDate})
                .toArray()
        );
        Q.all(workitemQueries)
            .then(function(){
                var burndownData = workitemQueries[4].valueOf();
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
                result.task = result.todo + result.inprogress + result.done;
                result.burnDown.remainingLine = [];
                result.burnDown.todoLine = [];
                result.burnDown.idealLine = [burndownData[0].Left<0?0:burndownData[0].Left, 0];
                for(var i = 0;i<burndownData.length;i++){
                    if(burndownData[i].Left>=0){
                        result.burnDown.remainingLine.push(burndownData[i].Left);
                    }
                    if(burndownData[i].ToDo>=0){
                        result.burnDown.todoLine.push(burndownData[i].ToDo);
                    }
                }

                q.resolve(result);
            });


        return q.promise;

    }
});

$data.Class.define('JayScrum.SqLite.Storm.User', $data.Entity, null, {
    UserID: { key:true, type:'$data.Integer', nullable:false, computed:true },
    Login: { type: '$data.String' },
    Age: { type: '$data.Integer', required: true },
    FirstName: { type: '$data.String' },
    LastName:  { type: '$data.String' },
    Enabled: { type: '$data.Boolean' },
    Password: { type: '$data.String' },
    //Roles: { type: 'Array', elementType: 'string', $source: 'Groups', $field: 'GroupID' },
    CreationDate: { type: 'date'}
});
$data.Class.define('JayScrum.SqLite.Storm.Group', $data.Entity, null , {
    GroupID: { key:true, type:'$data.Integer', nullable:false, computed:true },
    Name: { type: '$data.String' },
    Database: { type : 'string', require: true},
    CreationDate: { type: 'date', computed: true },
    constructor: function() {
        this.CreationDate = new Date();
    }
});



$data.Class.defineEx('JayScrum.Settings.RepositoryContext',[$data.EntityContext, JayScrum.SqLite.ApplicationService], null, {
    Repositories: { type: $data.EntitySet, elementType: JayScrum.Settings.Repository },
//JayScrum
    WorkItems:{ type:$data.EntitySet, elementType:JayScrum.SqLite.WorkItem , 'afterCreate':afterCreateWorkItem, 'afterUpdate':afterCreateWorkItem },
    Projects:{ type:$data.EntitySet, elementType:JayScrum.SqLite.Project },
    Sprints:{ type:$data.EntitySet, elementType:JayScrum.SqLite.Sprint,  'afterCreate':afterCreateSprint},
    SprintBurndown:{ type:$data.EntitySet, elementType:JayScrum.SqLite.BurndownData },

//Users
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
