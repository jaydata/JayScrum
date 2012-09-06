/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 4:43 PM
 * To change this template use File | Settings | File Templates.
 */
function InstallLocalDemoDb(ctx){
    console.log("-== Install local db START");
    var p = Q.defer();
    ctx.Users.add(new JayScrum.SqLite.Storm.User({UserID:1, Login:'administrator', Age:32, FirstName:'Mr.', LastName:'Administrator', Enabled:true}));
    ctx.Projects.add(new JayScrum.SqLite.Project({Id:1, Name:"Learn using JayScrum locally", Description:"Step by step instructions: using JayScrum like a todo list" }));
    ctx.Projects.add(new JayScrum.SqLite.Project({Id:2, Name:"Use JayScrum in a team - repo in the cloud", Description:"Step by step instructions: using JayScrum in a team" }));
    ctx.Sprints.add(new JayScrum.SqLite.Sprint({Id:1, Name:"Learn JayScrum", StartDate:moment().add('days', -1).utc().toDate(), FinishDate:moment().add('days', 7).utc().toDate() }));
    ctx.Sprints.add(new JayScrum.SqLite.Sprint({Id:2, Name:"Use JayScrum in a team", StartDate:moment().add('days', -1).utc().toDate(), FinishDate:moment().add('days', 14).utc().toDate() }));
    console.log("-== Save localdb 1st");
    ctx.saveChanges(function(){
        console.log("Save success, create tasks");
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:1, Title:"Create local repository", Description:"You will need a local repository in order to store your work items on your device. This repo is stored only on your current device. Team-work scenarion with a cloud-based repository will be covered in Sprint 2 - Using JayScrum in a team" , Priority: 10, Effort:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"UserStory" , WorkItem_Sprint:1, WorkItem_Project:1, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"New" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:2, Title:"Customizing JayScrum to your needs", Description:"After performing the tasks below you will have a customized JayScrum application" , Priority: 9, Effort:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"UserStory" , WorkItem_Sprint:1, WorkItem_Project:1, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"New" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:3, Title:"Using JayScrum from sprint to sprint", Description:"Learn how to build a project backlog and keep work item up-to-date" , Priority: 8, Effort:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"UserStory" , WorkItem_Sprint:1, WorkItem_Project:1, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"New" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:4, Title:"Working with more sprints at the same time", Description:"Do you work in  or want to keep track of more sprints?" , Priority: 7, Effort:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"UserStory" , WorkItem_Sprint:1, WorkItem_Project:1, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"New" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:5, Title:"Collaborate! Buy new cloud repo!", Description:"Create a cloud-repo and work together with your teammates." , Priority: 6, Effort:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"UserStory" , WorkItem_Sprint:2, WorkItem_Project:2, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"New" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:6, Title:"Create local repository", Description:"JayScrum starts with the repository list for the first time. You can open this screen by clicking the Repositories tile of the Main screen.Press the plus (+) sign.- Fill the repository creation form- Add the display name of your repo- Add the unique database name- Add the username and password- Check the default checkbox if you want to start your app with this repo- Click Save" , Priority: 100, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:1, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"Done" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:7, Title:"Setup your front-end", Description:"Click UI setting on the main screen- Choose a theme according to your visual preferences- Select your favourite font and navigate back to main screen" , Priority: 90, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:2, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"In Progress" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:8, Title:"Create a new sprint", Description:"Choose Sprints on the Main screen- Click the plus sign (+) on the bottom of the screen- Fill the name and time interval of the sprint-Click the save new sprint with the save pictogram on the bottom of the screen" , Priority: 80, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:2, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:9, Title:"Pin the sprint to the main screen", Description:"In the sprint list, click the pin pictogram to have a dedicated tile for your sprint on the main screen" , Priority: 70, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:2, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:10, Title:"Review the Scrum Wall by swiping", Description:"Select a  sprint from the sprint list. The Scrum Wall shows your tasks in Todo, In progress and Done states- Swipe to left and right - Swipe to left and rightin order to review the userstories and tasks in different states- Sprint overview and burndown chart- Swipe to the right of the screen to check the sprint summary" , Priority: 60, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:2, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:11, Title:"Create a new project", Description:"Creating multiple projects makes you able to work on more product of for more clients in one sprint. - navigate to the Projects tile of your Main screen- click the plus sign on the bottom of the sceen- fill the name of your project- click save" , Priority: 50, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:2, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:12, Title:"Create your sprint backlog: User Story", Description:"Be your own Product Owner!- Click the User Stories tile of the Main screen- Add new User story by clicking the plus sign (+) on the top of the screen- Define the fields of the UserStory- Add a title and description and choose the User Story type- Don't forget to assign a backlog priority and click the Save pictogram" , Priority: 40, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:13, Title:"Create your sprint backlog: Tasks", Description:"Add tasks to the user story you created before- Choose on item from the User Story list- Scroll down to the bottom of the screen- Click the plus sign in the Tasks section- Fill task data - Leave the value of the user story field- Click the save pictogram" , Priority: 30, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:14, Title:"Begin to work on a task", Description:"Open the Scrum wall of your sprint- Update State field to In progress- Set the Assigned to field to your name- Click the save buttonAfter saving the task, it will be moved to the In progress column of the Scrum Wall" , Priority: 25, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:15, Title:"Update the remaining hours", Description:"Open the task you are working on- Click the pencil pictogram to edit- Set the Remaining work field of your task and click the Save pictogram" , Priority: 20, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:16, Title:"Take a look at Sprint overview", Description:"Swipe to the right side of the screen to check out the updated burndown chart- the chart shows the remaining work on the current day of the sprint- try to eliminate the remaining hours till the next day of the sprint" , Priority: 15, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:17, Title:"Navigating between tasks of a selected User Story by swiping", Description:"JayScrum supports the user-friendly navigation between tasks of a selected user story- Select a user story from the user story list- Scroll down to the bottom of the user story detail screen- Click the refresh button of the Tasks section- Select a task from the list- Swipe to left and right in order to review the tasks assigned to the selected user story" , Priority: 10, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:18, Title:"Navigating between tasks with the same status", Description:"You can easily navigate between the in-progress tasks based to review the unfinished work items.- Navigate to the Scrum Wall- Select one task with In-progress state- After the task description appears, swipe left and right to navigate between tasks" , Priority: 9, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:3, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:19, Title:"Working with more sprints at the same time", Description:"You can manage more sprint at the same time. To do this easily, navigate to the Sprints tile of the Main Screen and pin the second sprint to the Main Screen. " , Priority: 9, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:1, WorkItem_Project:1, WorkItem_WorkItem:4, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        ctx.WorkItems.add(new JayScrum.SqLite.WorkItem({Id:20, Title:"Buy cloud repo", Description:"Navigate to Repository tab, a buy your new database" , Priority: 5, Effort:Math.floor(Math.random() * 20), Effort:Math.floor(Math.random() * 50), BusinessValue:Math.floor(Math.random() * 100), Type:"Task" , WorkItem_Sprint:2, WorkItem_Project:2, WorkItem_WorkItem:5, CreatedDate:moment().toDate(), CreatedBy:'administrator', RemainingWork:1, ChangedDate:moment().toDate(), ChangedBy:'administrator', AssignedTo:"administrator", State:"To Do" }));
        console.log("Save localdb 2nd");
        ctx.saveChanges(function(){
            console.log("Install local db END");
            p.resolve();
        });
    });
    return p.promise;
}

function testData() {
    //var ctx = new LightSwitchApplication.ApplicationData({ name:'oData', oDataServiceHost:'http://192.168.1.142:3000/jayscrum' });
    var ctx = JayScrum.repository;
    //'hajni' = 'admin';
    ctx.Sprints.add(new LightSwitchApplication.Sprint({ Name:'Sprint 1', StartDate:moment().add('days', -30).utc().toDate(), FinishDate:moment().add('days', -23).utc().toDate() }));
    ctx.Sprints.add(new LightSwitchApplication.Sprint({ Name:'Sprint 2', StartDate:moment().add('days', -26).utc().toDate(), FinishDate:moment().add('days', -19).utc().toDate() }));
    ctx.Sprints.add(new LightSwitchApplication.Sprint({ Name:'Sprint 3', StartDate:moment().add('days', -22).utc().toDate(), FinishDate:moment().add('days', -15).utc().toDate() }));
    ctx.Sprints.add(new LightSwitchApplication.Sprint({ Name:'Sprint 4', StartDate:moment().add('days', -18).utc().toDate(), FinishDate:moment().add('days', -11).utc().toDate() }));
    ctx.Sprints.add(new LightSwitchApplication.Sprint({ Name:'Sprint 5', StartDate:moment().add('days', -14).utc().toDate(), FinishDate:moment().add('days', -7).utc().toDate() }));
    ctx.Sprints.add(new LightSwitchApplication.Sprint({ Name:'Sprint 6', StartDate:moment().add('days', -10).utc().toDate(), FinishDate:moment().add('days', -3).utc().toDate() }));
    ctx.Sprints.add(new LightSwitchApplication.Sprint({ Name:'Sprint 7', StartDate:moment().add('days', -6).utc().toDate(), FinishDate:moment().add('days', 1).utc().toDate() }));
    ctx.Sprints.add(new LightSwitchApplication.Sprint({ Name:'Sprint 8', StartDate:moment().add('days', -2).utc().toDate(), FinishDate:moment().add('days', 5).utc().toDate() }));
    ctx.Sprints.add(new LightSwitchApplication.Sprint({ Name:'Sprint 9', StartDate:moment().add('days', 2).utc().toDate(), FinishDate:moment().add('days', 9).utc().toDate() }));
    ctx.Sprints.add(new LightSwitchApplication.Sprint({ Name:'Sprint 10', StartDate:moment().add('days', -1).utc().toDate(), FinishDate:moment().add('days', 6).utc().toDate() }));

    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 1', Description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tincidunt neque eget dolor rhoncus in vehicula dolor imperdiet. In hac habitasse platea dictumst. ' }));
    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 2', Description:'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aenean mattis egestas lectus a sodales. ' }));
    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 3', Description:'ed lorem mauris, pellentesque et aliquet eget, dapibus quis erat. In dignissim orci nec est fermentum sed dignissim ipsum sodales. ' }));
    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 4', Description:'Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio. ' }));
    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 5', Description:'Fusce varius cursus libero, quis rhoncus ligula facilisis ac. Duis adipiscing congue justo eu bibendum. ' }));
    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 6', Description:'Phasellus vitae purus lorem. Duis lobortis, velit et dignissim congue, nibh ante gravida ipsum, quis luctus enim sapien vitae turpis. ' }));
    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 7', Description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tincidunt neque eget dolor rhoncus in vehicula dolor imperdiet. In hac habitasse platea dictumst. ' }));
    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 8', Description:'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aenean mattis egestas lectus a sodales. ' }));
    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 9', Description:'ed lorem mauris, pellentesque et aliquet eget, dapibus quis erat. In dignissim orci nec est fermentum sed dignissim ipsum sodales. ' }));
    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 10', Description:'Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio. ' }));
    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 11', Description:'Fusce varius cursus libero, quis rhoncus ligula facilisis ac. Duis adipiscing congue justo eu bibendum. ' }));
    ctx.Projects.add(new LightSwitchApplication.Project({ Name:'Project 12', Description:'Phasellus vitae purus lorem. Duis lobortis, velit et dignissim congue, nibh ante gravida ipsum, quis luctus enim sapien vitae turpis. ' }));

    //'hajni' = '';

    var allSprints = null;
    var allProjects = null;


    ctx.saveChanges(function () {
        console.log('Sprint and projects save OK');
        ctx.Sprints.toArray(function (sprintResult) {
            console.log('Get Sprints OK');
            ctx.Projects.toArray(function (projectResult) {
                console.log('Get Projects OK');

                console.log(sprintResult[5].Id);

                var ustoSprint = function (sprintId, projectId, index, context) {
                    for (var i = 0; i < 15; i++) {
                        context.WorkItems.add(new LightSwitchApplication.WorkItem({
                            Title:"User Story 1" + index++, Description:"Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio.Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio. ",
                            Priority:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 100), BusinessValue:Math.floor(Math.random() * 1000), Type:"UserStory",
                            WorkItem_Sprint:sprintId,
                            WorkItem_Project:projectId,
                            CreatedDate:new Date().toISOString(), CreatedBy:'hajni', ChangedDate:new Date().toISOString(), ChangedBy:'hajni', AssignedTo:"", State:"New"
                        }));
                    }
                };

                var taskToSprint = function (sprintId, userStoryId, index, context) {
                    for (var i = 0; i < 15; i++) {
                        context.WorkItems.add(new LightSwitchApplication.WorkItem({
                            Title:"Task 1" + index++, Description:"Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio.Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio. ",
                            Priority:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 100), BusinessValue:Math.floor(Math.random() * 1000), Type:"Task",
                            State:'To Do', RemainingWork:Math.floor(Math.random() * 11),
                            WorkItem_Sprint:sprintId,
                            WorkItem_WorkItem:userStoryId,
                            CreatedDate:new Date().toISOString(), CreatedBy:'hajni', ChangedDate:new Date().toISOString(), ChangedBy:'hajni', AssignedTo:""
                        }));
                        context.WorkItems.add(new LightSwitchApplication.WorkItem({
                            Title:"Task 1" + index++, Description:"Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio.Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio. ",
                            Priority:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 100), BusinessValue:Math.floor(Math.random() * 1000), Type:"Task",
                            State:'To Do', RemainingWork:Math.floor(Math.random() * 11),
                            WorkItem_Sprint:sprintId,
                            WorkItem_WorkItem:userStoryId,
                            CreatedDate:new Date().toISOString(), CreatedBy:'hajni', ChangedDate:new Date().toISOString(), ChangedBy:'hajni', AssignedTo:""
                        }));
                        context.WorkItems.add(new LightSwitchApplication.WorkItem({
                            Title:"Task 1" + index++, Description:"Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio.Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio. ",
                            Priority:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 100), BusinessValue:Math.floor(Math.random() * 1000), Type:"Task",
                            State:'To Do', RemainingWork:Math.floor(Math.random() * 11),
                            WorkItem_Sprint:sprintId,
                            WorkItem_WorkItem:userStoryId,
                            CreatedDate:new Date().toISOString(), CreatedBy:'hajni', ChangedDate:new Date().toISOString(), ChangedBy:'hajni', AssignedTo:""
                        }));

                        context.WorkItems.add(new LightSwitchApplication.WorkItem({
                            Title:"Task 1" + index++, Description:"Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio.Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio. ",
                            Priority:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 100), BusinessValue:Math.floor(Math.random() * 1000), Type:"Task",
                            State:'In Progress', RemainingWork:Math.floor(Math.random() * 11),
                            WorkItem_Sprint:sprintId,
                            WorkItem_WorkItem:userStoryId,
                            CreatedDate:new Date().toISOString(), CreatedBy:'hajni', ChangedDate:new Date().toISOString(), ChangedBy:'hajni', AssignedTo:""
                        }));
                        context.WorkItems.add(new LightSwitchApplication.WorkItem({
                            Title:"Task 1" + index++, Description:"Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio.Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio. ",
                            Priority:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 100), BusinessValue:Math.floor(Math.random() * 1000), Type:"Task",
                            State:'In Progress', RemainingWork:Math.floor(Math.random() * 11),
                            WorkItem_Sprint:sprintId,
                            WorkItem_WorkItem:userStoryId,
                            CreatedDate:new Date().toISOString(), CreatedBy:'hajni', ChangedDate:new Date().toISOString(), ChangedBy:'hajni', AssignedTo:""
                        }));

                        context.WorkItems.add(new LightSwitchApplication.WorkItem({
                            Title:"Task 1" + index++, Description:"Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio.Donec est orci, molestie ac pellentesque in, lacinia et dui. Morbi vitae facilisis enim. Aliquam eu ullamcorper odio. ",
                            Priority:Math.floor(Math.random() * 30), Effort:Math.floor(Math.random() * 100), BusinessValue:Math.floor(Math.random() * 1000), Type:"Task",
                            State:'Done', RemainingWork:Math.floor(Math.random() * 11),
                            WorkItem_Sprint:sprintId,
                            WorkItem_WorkItem:userStoryId,
                            CreatedDate:new Date().toISOString(), CreatedBy:'hajni', ChangedDate:new Date().toISOString(), ChangedBy:'hajni', AssignedTo:""
                        }));
                    }
                }

                ustoSprint(null, null, 0, ctx);
                ustoSprint(sprintResult[5].Id, projectResult[0].Id, 15, ctx);
                ustoSprint(sprintResult[6].Id, projectResult[1].Id, 30, ctx);
                ustoSprint(sprintResult[7].Id, projectResult[0].Id, 45, ctx);
                ustoSprint(sprintResult[8].Id, projectResult[1].Id, 60, ctx);

                ctx.saveChanges(function(){
                    console.log('UserStories save OK');
                    ctx.WorkItems.toArray(function(userStoryResult){
                        console.log('Get userStories OK');
                        taskToSprint(null, null, 0, ctx);
                        console.log(sprintResult[5].Name + userStoryResult[35].Title);
                        taskToSprint(sprintResult[5].Id, userStoryResult[35].Id, 15, ctx);
                        console.log(sprintResult[6].Name + userStoryResult[36].Title);
                        taskToSprint(sprintResult[6].Id, userStoryResult[36].Id, 30, ctx);
                        console.log(sprintResult[7].Name + userStoryResult[50].Title);
                        taskToSprint(sprintResult[7].Id, userStoryResult[50].Id, 45, ctx);
                        console.log(sprintResult[8].Name + userStoryResult[51].Title);
                        taskToSprint(sprintResult[8].Id, userStoryResult[51].Id, 60, ctx);
                        ctx.saveChanges(function () {
                            console.log('ALL OK');
                        });
                    });
                });
            });
        });
    });
}
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
                            self.SprintBurndown.add(new JayScrum.SqLite.BurndownData({
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
                        console.log("next");
                    }
                    callBackHandler();
                });
            });
        });
    };
}

$data.Entity.extend('JayScrum.Settings.Repository', {
    Id:{ type:$data.Integer, key:true, computed:true },
    Title:{ type:$data.String, nullable:false, required:true },
    Url:{ type:$data.String, nullable:false, required:true },
    UserName:{ type:$data.String, nullable:true },
    Password:{ type:$data.String, nullable:true },
    IsDefault:{ type:$data.Boolean, nullable:true },
    OrderId:{ type:$data.String, nullable:true },
    Status:{ type:$data.String, nullable:true } /*Initialized, Creating, Ready*/
});

$data.Class.define('$data.ServiceBase', null, null, null, null);
$data.Entity.extend('JayScrum.SqLite.WorkItem', {
    Id: { type: $data.Integer, key: true, computed: true },
    //'RowVersion':{ type:'$data.Blob', nullable:false, concurrencyMode:$data.ConcurrencyMode.Fixed, computed:true },
    'Title':{ type:'$data.String', nullable:false, required:{value:true, message:'Required field!'}, maxLength:{value:255, message:'Maximumn length of Title field is 255 char'} },
    'Type':{ type:'$data.String', nullable:false, required:true, maxLength:255 },
    'Description':{ type:'$data.String',  maxLength:{value:1024, message:'Maximumn length of Description field is 255 char'} },
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
    'WorkItem_Project':{ type:'$data.Integer'/*, customValidator:function(v) {console.log(v); return false;}, errorMessage:"alma" */},
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
    'SprintDay':{ type:'$data.Integer'},
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
    },
    getBurndownData:function(sprintId){
        var q = Q.defer();
        var self = {};
        self.context = this;

        var types = ["To Do", "In Progress", "Done"];
        var workitemQueries = types.map(function (tName) {
            return self.context.WorkItems
                .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.State == this.typeName && (item.Type=='Task' || item.Type == 'Bug')}, {sprint_id:sprintId, typeName:tName})
                .toArray(function(){ });
        });
        workitemQueries.push(
            self.context.WorkItems
                .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.Type == 'UserStory' }, {sprint_id:sprintId})
                .length(function(){ })
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
                                                                            result.burnDown.remainingLine.length==0
                                                                                ? 0
                                                                                : result.burnDown.remainingLine[result.burnDown.remainingLine.length-1][1]
                                                                            ]);
                                    }
                                    while(result.burnDown.todoLine.length<2){
                                        result.burnDown.todoLine.push([result.burnDown.todoLine.length,
                                                                        result.burnDown.todoLine.length==0
                                                                            ? 0
                                                                            : result.burnDown.todoLine[result.burnDown.todoLine.length-1][1]
                                                                      ]);
                                    }

                                    q.resolve(result);
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
    WorkItems:{ type:$data.EntitySet, elementType:JayScrum.SqLite.WorkItem, 'afterCreate':updateBurndownData, 'afterUpdate':updateBurndownData, 'beforeCreate':updateConnectedData, 'beforeUpdate':updateConnectedData },
    Projects:{ type:$data.EntitySet, elementType:JayScrum.SqLite.Project },
    Sprints:{ type:$data.EntitySet, elementType:JayScrum.SqLite.Sprint,  'afterCreate':afterUpdateCreateSprint, 'afterUpdate':afterUpdateCreateSprint},
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
