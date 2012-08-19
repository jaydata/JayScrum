/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 10:03 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Views.Users', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'usersPage-template';
        this.i_scroll = null;
    },
    initializeView:function(){
        JayScrum.app.hideLoading();
        this.i_scroll = JayScrum.app.initScrollById("settingPageScroll");
    },
    tearDownView:function(){
        if (this.i_scroll){
            this.i_scroll.destroy();
        }
        this.i_scroll = null;
    }
}, null);
$data.Class.define('JayScrum.Views.UserSelect', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'usersSelectView-template';
        this.i_scroll = null;
    },
    initializeView:function(){
        JayScrum.app.hideLoading();
        //this.i_scroll = JayScrum.app.initScrollById("settingPageScroll");
    },
    tearDownView:function(){
        /*if (this.i_scroll){
            this.i_scroll.destroy();
        }
        this.i_scroll = null;*/
    }
}, null);
$data.Class.define('JayScrum.Views.UserEdit', JayScrum.FrameView, null, {
    constructor:function(name, path, tplSource){
        this.templateName = name || 'userEditView-template';
        this.i_scroll = null;
    },
    initializeView:function(){
        JayScrum.app.hideLoading();
        this.i_scroll = JayScrum.app.initScrollById("settingPageScroll");
    },
    tearDownView:function(){
        if (this.i_scroll){
            this.i_scroll.destroy();
        }
        this.i_scroll = null;
    }
}, null);
$data.Class.define('JayScrum.Frames.Users', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('users', new JayScrum.Views.Users('usersPage-template'));
        this.registerView('user-select', new JayScrum.Views.UserSelect('usersSelectView-template'));
        this.registerView('user-edit', new JayScrum.Views.UserEdit('userEditView-template'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName='users';
        this.selectMetaView('defaultMeta');
        this.data = ko.observable({
            name:'users',
            users:ko.observableArray([]),
            roles:ko.observableArray(['','','','']),
            selectedUser: ko.observable()
        });
    },
    _loadData:function(){
        var loadingPromise = Q.defer();
        var self = this;
        var queries = [];
        queries.push(JayScrum.stormContext.Users.orderBy(function(item){return item.login}).toArray());
        queries.push(JayScrum.stormContext.Groups.orderBy(function(item){return item.name}).toArray());
        Q.all(queries)
            .then(function(){
                self.data().users.removeAll();
                var queryResult = queries[0].valueOf();
                queryResult.forEach(function(usr){
                    self.data().users.push(usr.asKoObservable());
                });

                self.data().roles.removeAll();
                var queryResult = queries[1].valueOf();
                queryResult.forEach(function(role){
                    self.data().roles.push(role.asKoObservable());
                });

                loadingPromise.resolve();
            });
        return loadingPromise.promise;
    },
    onSelectUser:function(item){
        JayScrum.app.selectedFrame().data().selectedUser(item);
        if(item.roles() && item.roles().length>0){
            if(item.roles2 === undefined){item.roles2 = ko.observableArray();}
            item.roles2(JSON.parse(item.roles()));
        }
        JayScrum.app.selectedFrame().selectView('user-select');
    },
    onAddUser:function(){
        var item = new JayScrum.stormContext.Users.createNew({Id:null});
        item = item.asKoObservable();
        item.roles2 = ko.observableArray();
        JayScrum.app.selectedFrame().onEditUser(item);
    },
    onEditUser:function(item){
        JayScrum.app.selectedFrame().data().selectedUser(item);
        if(item.roles() && item.roles().length>0){
            if(item.roles2 === undefined){item.roles2 = ko.observableArray();}
            item.roles2(JSON.parse(item.roles()));
        }
        if (item.Id() !== null) {
            JayScrum.stormContext.Users.attach(item);
        } else {
            JayScrum.stormContext.Users.add(item);
        }

        JayScrum.app.selectedFrame().selectView('user-edit');
    },
    onCancelUser: function (item) {
        if (item != null) {
            var user = item.innerInstance;
            JayScrum.stormContext.Users.detach(user);
        }
        JayScrum.app.selectedFrame()._loadData()
            .then(function(){
                JayScrum.app.backView();
                if(item.Id() === null){
                    JayScrum.app.selectedFrame().data().selectedUser(null);
                }else{
                    JayScrum.app.selectedFrame().data().selectedUser(item);
                }
            });
    },
    onSaveUser: function (item) {
        item.roles(JSON.stringify(item.roles2()));
        JayScrum.stormContext.saveChanges(function () {
            JayScrum.app.selectedFrame().onCancelUser();
        });
    },
    onDeleteUser:function (item) {
        JayScrum.stormContext.remove(item.innerInstance);
        JayScrum.stormContext.saveChanges(function () {
            JayScrum.app.selectedFrame()._loadData();

        });
    }
}, null);