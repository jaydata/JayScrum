#!/usr/bin/node-dev

/**
 * Created with JetBrains WebStorm.
 * User: zpace
 * Date: 8/12/12
 * Time: 4:20 PM
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains WebStorm.
 * User: zpace
 * Date: 8/12/12
 * Time: 1:15 PM
 * To change this template use File | Settings | File Templates.
 */
require('jaydata');
require('q');


function registerEdmTypes() {

    function Edm_Boolean() {
    }
    $data.Container.registerType('Edm.Boolean', Edm_Boolean);
    $data.Container.mapType(Edm_Boolean, $data.Boolean);

    function Edm_Binary() {
    }
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

$data.Entity.extend('JayStormApplication.Base', {

    constructor: function() {
        this.creationDate = new Date();
    },
    'Id':{ key:true, type:'id', nullable:false, computed:true },
    'creationDate': { type: 'date' }
});

$data.Class.define('JayStormApplication.User', JayStormApplication.Base, null, {
    login: { type: 'Edm.String' },
    firstName: { type: 'Edm.String' },
    lastName:  { type: 'Edm.String' },
    enabled: { type: 'Edm.Boolean' },
    password: { type: 'Edm.String' },
    roles: { type: 'Edm.String' }
});

$data.Class.define('JayStormApplication.Group', JayStormApplication.Base, null , {
    name: { type: 'Edm.String' }
});

$data.Class.define('JayStormApplication.Entity', JayStormApplication.Base, null , {
    tableName: { type: 'Edm.String' }
});


$data.Class.defineEx('JayStormApplication.Context', [$data.EntityContext, $data.ServiceBase], null, {

    Users: {type: $data.EntitySet, elementType: JayStormApplication.User},

    Groups: { type: $data.EntitySet, elementType: JayStormApplication.Group},


    getGroups: $data.JayService.serviceFunction()
        .param("userID", "Edm.String")
        .returns("Edm.String")
        (
            function(userID, password) { }
        ),


    setPassword: $data.JayService.serviceFunction()
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
        )
});

exports.serviceType = JayStormApplication.Context;
