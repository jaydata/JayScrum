$data.Class.define('$JayScrum.Frame', null, null, {
    constructor: function (name) {
        this.name = name;
        this.metaData = new $JayScrum.FrameMetadata('metaDefault', { name: 'FrameMeta' });
    },
    name: { dataType: $data.String },
    data: { dataType: $data.Object },
    //views: { dataType: $data.Array, elementType: '$JayScrum.View' },
    //childFrames: { dataType: $data.Array, elementType: '$JayScrum.Frame' },
    activeView: { value: ko.observable() },
    metaData: { dataType: '$JayScrum.FrameMetadata' },
    registerChildFrame: function (frame) {
        if (!this.childFrames) {
            this.childFrames = ko.observableArray();
        }
        this.childFrames.push(frame);
    },
    registerView: function (view) {
        if (!this.views) {
            this.views = ko.observableArray();
        }
        this.views.push(view);
    }

}, null);

$data.Class.define('$JayScrum.FrameMetadata', null, null, {
    viewName: { value: ko.observable() },
    data: { value: ko.observable() },
    constructor: function (name, meta) {
        this.viewName(name);
        this.data(meta);
    }

}, null);