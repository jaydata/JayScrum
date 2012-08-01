/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 10:58 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Frames.ThemeSettings', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('theme', new JayScrum.FrameView('guiSettingPage-template'));
        this.registerMetaView('themeMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.defaultViewName='theme';
        this.selectMetaView('themeMeta');
        this.data = ko.observable({
            name:'ui settings'
        });
    },
    onFrameChangedFrom:function (activeFrameMeta, oldFrameMeta, initDatam, frame) {
        JayScrum.app.hideLoading();

        $("h1.main-header").addClass("animate");
        $("div.icon-action.back.topleft.main").show();
        var font = $("body").attr('font');
        $("div.field.fonts div.field").each(function () {
            if ($(this).attr('font') == font)
                $(this).addClass('active');
        });
        initScrollById("transition-settings");
    }
}, null);