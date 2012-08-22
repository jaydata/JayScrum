/**
 * Created with JetBrains WebStorm.
 * User: zpace
 * Date: 8/12/12
 * Time: 11:40 PM
 * To change this template use File | Settings | File Templates.
 */
$data.Base.extend("ViewModels.Showable", {
    constructor: function() {
        //var self = this;

        this.visible = ko.observable(false);
    },

    visible: { },

    hide: function() {
        this.visible(false)
    },
    show: function() {
        this.visible(true);
    }
});

$data.Base.extend("ViewModels.EventSource", {
    constructor: function() {
        this.eventClasses = [];
    },

    fireEvent: function(event, data) {
        var self = this;

        var subs = (this.eventClasses[event] || []).concat(this.eventClasses["*"] || []) ;
        for(var i = 0; i < subs.length; i++) {
            subs[i].apply(this, Array.prototype.slice.call(arguments,1));
        };



        if (event === 'ok' || event === 'cancel') {
            var handler = this[event + '_handler'] || function() { };
            handler.apply(self, data);
            //ok and cancel are a one time event, reset after call to any of them
            this.ok_handler = function() { };
            this.cancel_handler = function()  { };
        }
    },

    attach: function(event, fn) {
        if (arguments.length < 2) {
            fn = event;
            event = "*";
        }

        (this.eventClasses[event] = this.eventClasses[event] || []).push(fn);
    },

    'ok': function(fn) {
        this["ok_handler"] = fn;
        return this;
    },

    'cancel': function(fn) {
        this.cancel_handler = fn;
        return this;
    },

    detach: function(event, fn) {
        throw "NOT IMPLEMENTED";
        //this.visible(true);
    }
});

function SetPasswordModel(context) {
    var self = this;

    self.user = ko.observable();

    self.user.subscribe(function(value) {
        self.password(null);
        self.password2(null);
    });

    self.password = ko.observable();
    self.password2 = ko.observable();

    self.progressText = ko.observable();

    self.changePassword = function() {

        if (! (self.password() && self.password2())) {
            alert("password field is empty");
            return;
        }
        if (self.password() !== self.password2()) {
            alert("password dont match");
            return;
        }

        context.setPassword(self.user().Id(), self.password(), function() {
            self.user(null);
        });
    }

}



$data.Class.defineEx("ViewModels.NewGroup", [ViewModels.Showable, ViewModels.EventSource], null, {
    constructor: function(context) {
        var self = this;

        self.name = ko.observable();

        self.closeOnCreate = ko.observable(false);

        self.createGroup = function() {
            self.visible(! self.closeOnCreate());
            var group = new context.Groups.createNew();
            group.name = self.name();
            context.Groups.add(group);
            context.saveChanges( function( item ) {
                self.fireEvent("newGroup", group);
            })
        }
    }
});

function ManageGroupsModel(context, newGroupModel) {
    var self = this;

    self.groups = ko.observableArray([]);
    context.Groups.toArray(self.groups);

    self.newGroupModel = newGroupModel;

    self.newGroupModel.attach(function(group) {
        self.groups.push(group.asKoObservable());
    });

    self.selectedGroup = ko.observable();

    self.removeGroup = function(group) {
        context.Groups.remove(group.innerInstance);
        context.saveChanges( function() {
           self.groups.remove(group);
        });
    };


};


$data.Class.defineEx("ViewModels.EditUser", [ViewModels.Showable, ViewModels.EventSource], null, {
    constructor: function (context) {
        var self = this;


        self.user = ko.observable();


        self.createUser = function() {
            self.fireEvent("ok", self.user());
        }

        self.cancelCreateUser = function() {
            self.fireEvent("cancel", self.user());
        }
    }
});

$data.Class.defineEx("ViewModels.EntityEditor", [ViewModels.Showable, ViewModels.EventSource], null, {
    constructor: function (context) {
        var self = this;


        self.object = ko.observable();

        self.data = function(value) {
            self.object(value);
            return self;
        }


        self.save = function() {
            self.fireEvent("ok", self.object());
        }

        self.cancelSave = function() {
            self.fireEvent("cancel", self.object());
        }

        self.new = function(eSet) {
            var d = $.Deferred();
            var u = new eSet.createNew().asKoObservable();

            self.data(u)
                .ok(function() {
                    eSet.add(u);
                    context.saveChanges( function() {
                        self.data(null).hide();
                        d.resolve(u);
                    });
                })
                .cancel(function() {d.reject() ;this.hide(); })
                .show();
            return d.promise();
        }

        self.edit = function(obj, eSet) {
            var d = $.Deferred();

            function ok() {
                context.saveChanges(function() {
                    d.resolve(obj);
                    self.hide();
                });
            }
            function cancel() {
                eSet.detach(obj);
                d.resolve(null);
                self.hide();
            }


            eSet.attach(obj);
            self.data(obj).ok(ok).cancel(cancel).show();

            var sub = self.object.subscribe( function() {
                eSet.detach(obj);
                //todo rollback user
                sub.dispose();
            })
            return d.promise();
        }
    }
});

function ManageUsersModel(context, spModel, groupsModel, editor) {
    var _context = context;

    c = context;
    var self = this;

    self.groupsModel = groupsModel;
    self.editor = editor;

    self.userCount = ko.observable();
    self.userList = ko.observableArray([]);

    self.selectedUser = ko.observable();



    self.newUser = function() {
            self.editor.new(context.Users).then(function(user) {
                self.userList.push(user);
            });
    }

    self.editUser = function(user) {
        self.editor.edit(user, context.Users);
    }


    self.changePassword = function(user) {
        console.dir(user.Login());
        spModel.user(user);
    }

    self.removeUser = function(user) {
        _context.Users.remove(user.innerInstance);
        _context.saveChanges( function() {
            self.userList.remove(user);
        });
        //alert();
    }

    _context.Users.toArray(self.userList);

}




