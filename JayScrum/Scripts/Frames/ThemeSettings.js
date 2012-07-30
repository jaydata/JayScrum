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
        this.registerView('theme', new JayScrum.FrameView('alma'));
        this.registerMetaView('themeMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.selectView('theme');
        this.selectMetaView('themeMeta');
        this.data = ko.observable({
            name:'themeMeta'
        });
    }
}, null);