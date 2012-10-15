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
        this.i_scroll = JayScrum.app.initScrollById("settingPageScroll", null, null, false, true);
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

function SetPasswordModel(model) {
    var self = this;
    var user = model.owner;

    this.validation = ko.observable();
    this.savePassword = function (formData) {
        var popup = this;
        var psw1 = formData[0].value;
        var psw2 = formData[1].value;
        formData[0].disabled = formData[1].disabled = formData[2].disabled = true;
        if(psw1.length<2){
            self.validation('Password must be at least 6 character long.');
            formData[0].disabled = formData[1].disabled = formData[2].disabled = false;
            return;
        }
        if(psw1 !== psw2){
            self.validation("'Confirm password' and 'Password' do not match.");
            formData[0].disabled = formData[1].disabled = formData[2].disabled = false;
            return;
        }


        $data.service(JayScrum.ScrumApp.ApplicationUrl + "/Service/$metadata", function (factory, contextType) {
                var provisionContext = factory('admin', 'admin');
                provisionContext.bCrypPassword(psw1)
                    .then(function (result) {
                        console.log(user);
                        JayScrum.stormContext.Groups.filter(function (group) { return group.Name == 'scrum'; })
                            .toArray({
                                success:function (groups) {
                                    var usr = JayScrum.stormContext.Users.attachOrGet(user);
                                    usr.Password = result;
                                    usr.Groups = groups.map(function(g){return g.GroupID;});
                                    JayScrum.stormContext.saveChanges({
                                        success:function () {
                                            self.validation('Password saved success!');
                                            setTimeout(function () {
                                                popup.close();
                                                formData[0].disabled = formData[1].disabled = formData[2].disabled = false;
                                            }, 1000);

                                        },
                                        error:function () {
                                            self.validation('Save failed! Please try it later!');
                                            formData[0].disabled = formData[1].disabled = formData[2].disabled = false;
                                        }
                                    });
                                },
                                error:function () {
                                    self.validation('Save failed! Please try it later!');
                                    formData[0].disabled = formData[1].disabled = formData[2].disabled = false;
                                }
                            });
                    })
                    .fail(function () {
                        self.validation('Save failed! Please try it later!');
                        formData[0].disabled = formData[1].disabled = formData[2].disabled = false;
                    });
            },
            {user:'admin', password:'admin'});
    }
    this.close = function () {
        model.closeControlBox();
    }
}
