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
$data.Class.define('JayScrum.Frames.Users', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('users', new JayScrum.Views.Users('usersPage-template'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName='users';
        this.selectMetaView('defaultMeta');
        this.data = ko.observable({
            collection:ko.observable()
        });
    },
    _loadData:function(){
        var loadingPromise = Q.defer();
        var self = this;
        self.data().collection(JayScrum.stormContext.Users);
        loadingPromise.resolve();
        return loadingPromise.promise;
    }
}, null);