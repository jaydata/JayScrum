/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 7/30/12
 * Time: 9:28 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Class.define('JayScrum.Frames.Sprints', JayScrum.Frame, null, {
    constructor:function () {
        //register frameViews
        this.registerView('sprints', new JayScrum.FrameView('alma'));
        this.registerMetaView('defaultMeta', new JayScrum.FrameView('jayAppMetaDefault'));
        this.selectView('sprints');
        this.selectMetaView('defaultMeta');
        this.data = ko.observable({
            name:'Sprints'
        });
    }
}, null);