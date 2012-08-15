var Q = require('q');
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

        function Edm_ObjectID() { };
        $data.Container.registerType('Edm.ObjectID', Edm_ObjectID);
        $data.Container.mapType(Edm_ObjectID, $data.ObjectID);

    };
    registerEdmTypes();
    $data.Entity.extend('LightSwitchApplication.WorkItem', {
        'Id':{ key:true, type:'Edm.ObjectID', nullable:false, computed:true },
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
        'WorkItem_Project':{ type:'Edm.ObjectID' },
        'WorkItem_Sprint':{ type:'Edm.ObjectID' },
        'WorkItem_WorkItem':{ type:'Edm.ObjectID' },
        'Reason':{ type:'Edm.String', maxLength:255 }
        //'Project': { type: 'LightSwitchApplication.Project', inverseProperty: 'WorkItems' },
        //'Sprint': { type: 'LightSwitchApplication.Sprint', inverseProperty: 'WorkItems' },
        //'Parent': { type: 'LightSwitchApplication.WorkItem', inverseProperty: 'Children' },
        //'Children': { type: 'Array', elementType: 'LightSwitchApplication.WorkItem', inverseProperty: 'Parent' }
    });
    $data.Entity.extend('LightSwitchApplication.Project', {
        'Id':{ key:true, type:'Edm.ObjectID', nullable:false, computed:true },
        'RowVersion':{ type:'Edm.Binary', nullable:false, concurrencyMode:$data.ConcurrencyMode.Fixed, computed:true },
        'Name':{ type:'Edm.String', nullable:false, required:true, maxLength:255 },
        'Description':{ type:'Edm.String', maxLength:255 }
        //'WorkItems': { type: 'Array', elementType: 'LightSwitchApplication.WorkItem', inverseProperty: 'Project' }
    });
    $data.Entity.extend('LightSwitchApplication.Sprint', {
        'Id':{ key:true, type:'Edm.ObjectID', nullable:false, computed:true },
        'RowVersion':{ type:'Edm.Binary', nullable:false, concurrencyMode:$data.ConcurrencyMode.Fixed, computed:true },
        'Name':{ type:'Edm.String', nullable:false, required:true, maxLength:255 },
        'StartDate':{ type:'Edm.DateTime', nullable:false, required:true },
        'FinishDate':{ type:'Edm.DateTime', nullable:false, required:true }
        //'WorkItems': { type: 'Array', elementType: 'LightSwitchApplication.WorkItem', inverseProperty: 'Sprint' }
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
            .param('sprintId', $data.ObjectID)
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
            })
    });
    $data.Class.defineEx('LightSwitchApplication.ApplicationData',[$data.EntityContext, LightSwitchApplication.ApplicationService], null, {
        WorkItems:{ type:$data.EntitySet, elementType:LightSwitchApplication.WorkItem },
        Projects:{ type:$data.EntitySet, elementType:LightSwitchApplication.Project },
        Sprints:{ type:$data.EntitySet, elementType:LightSwitchApplication.Sprint }/*,
         Microsoft_LightSwitch_GetCanInformation: $data.EntityContext.generateServiceOperation({ serviceName: 'Microsoft_LightSwitch_GetCanInformation', returnType: 'Edm.String', params: [{ dataServiceMembers: 'Edm.String' }], method: 'GET' })*/
    });
    ///Security
    /*$data.Entity.extend('Microsoft.LightSwitch.Security.UserRegistration', {
        'UserName': { key: true, type: 'Edm.String', nullable: false, required: true, maxLength: 256 },
        'FullName': { type: 'Edm.String', nullable: false, required: true, maxLength: 256, concurrencyMode: $data.ConcurrencyMode.Fixed },
        'Password': { type: 'Edm.String', maxLength: 128, concurrencyMode: $data.ConcurrencyMode.Fixed },
        'RoleAssignments': { type: 'Array', elementType: 'Microsoft.LightSwitch.Security.RoleAssignment', inverseProperty: 'User' },
        'DerivingRoleAssignments': { type: 'Array', elementType: 'Microsoft.LightSwitch.Security.RoleAssignment', inverseProperty: 'SourceAccount' }
    });
    $data.Entity.extend('Microsoft.LightSwitch.Security.Role', {
        'Name': { key: true, type: 'Edm.String', nullable: false, required: true, maxLength: 128 },
        'RoleAssignments': { type: 'Array', elementType: 'Microsoft.LightSwitch.Security.RoleAssignment', inverseProperty: 'Role' },
        'RolePermissions': { type: 'Array', elementType: 'Microsoft.LightSwitch.Security.RolePermission', inverseProperty: 'Role' }
    });
    $data.Entity.extend('Microsoft.LightSwitch.Security.RoleAssignment', {
        'UserName': { key: true, type: 'Edm.String', nullable: false, required: true, maxLength: 256 },
        'RoleName': { key: true, type: 'Edm.String', nullable: false, required: true, maxLength: 128 },
        'SourceAccountName': { key: true, type: 'Edm.String', nullable: false, required: true, maxLength: 256 },
        'User': { type: 'Microsoft.LightSwitch.Security.UserRegistration', required: true, inverseProperty: 'RoleAssignments' },
        'SourceAccount': { type: 'Microsoft.LightSwitch.Security.UserRegistration', required: true, inverseProperty: 'DerivingRoleAssignments' },
        'Role': { type: 'Microsoft.LightSwitch.Security.Role', required: true, inverseProperty: 'RoleAssignments' }
    });
    $data.Entity.extend('Microsoft.LightSwitch.Security.Permission', {
        'Id': { key: true, type: 'Edm.String', nullable: false, required: true, maxLength: 322 },
        'Name': { type: 'Edm.String', nullable: false, required: true, maxLength: 64, concurrencyMode: $data.ConcurrencyMode.Fixed },
        'RolePermissions': { type: 'Array', elementType: 'Microsoft.LightSwitch.Security.RolePermission', inverseProperty: 'Permission' }
    });
    $data.Entity.extend('Microsoft.LightSwitch.Security.RolePermission', {
        'RoleName': { key: true, type: 'Edm.String', nullable: false, required: true, maxLength: 128 },
        'PermissionId': { key: true, type: 'Edm.String', nullable: false, required: true, maxLength: 322 },
        'Role': { type: 'Microsoft.LightSwitch.Security.Role', required: true, inverseProperty: 'RolePermissions' },
        'Permission': { type: 'Microsoft.LightSwitch.Security.Permission', required: true, inverseProperty: 'RolePermissions' }
    });
    $data.EntityContext.extend('Microsoft.LightSwitch.Security.SecurityData', {
        UserRegistrations: { type: $data.EntitySet, elementType: Microsoft.LightSwitch.Security.UserRegistration },
        Roles: { type: $data.EntitySet, elementType: Microsoft.LightSwitch.Security.Role },
        RoleAssignments: { type: $data.EntitySet, elementType: Microsoft.LightSwitch.Security.RoleAssignment },
        Permissions: { type: $data.EntitySet, elementType: Microsoft.LightSwitch.Security.Permission },
        RolePermissions: { type: $data.EntitySet, elementType: Microsoft.LightSwitch.Security.RolePermission },
        Microsoft_LightSwitch_GetCanInformation: $data.EntityContext.generateServiceOperation({ serviceName: 'Microsoft_LightSwitch_GetCanInformation', returnType: 'Edm.String', params: [{ dataServiceMembers: 'Edm.String' }], method: 'GET' }),
        ChangePassword: $data.EntityContext.generateServiceOperation({ serviceName: 'ChangePassword', returnType: null, params: [{ userName: 'Edm.String' }, { oldPassword: 'Edm.String' }, { newPassword: 'Edm.String' }], method: 'POST' }),
        IsValidPassword: $data.EntityContext.generateServiceOperation({ serviceName: 'IsValidPassword', returnType: 'Edm.Boolean', params: [{ password: 'Edm.String' }], method: 'POST' }),
        GetWindowsUserInfo: $data.EntityContext.generateServiceOperation({ serviceName: 'GetWindowsUserInfo', returnType: 'Edm.String', params: [{ userName: 'Edm.String' }], method: 'GET' })
    });*/

    //Microsoft.LightSwitch.Security.context = new Microsoft.LightSwitch.Security.SecurityData({ name: 'oData', oDataServiceHost: 'http://localhost/JayScrumServer_ls/Microsoft.LightSwitch.SecurityData.svc' });


})(window, $data);


exports.serviceType = LightSwitchApplication.ApplicationData;
