$data.Class.define('JayScrum.Frame', null, null, {
    constructor:function (name) {
        this.name = name;
        this.metaData = new JayScrum.FrameMetadata('jayAppMetaDefault', { name:'FrameMeta' });
        this.defaultViewName = 'defaultView';
        this.selectedView = ko.observable();
        this.selectedViewName = ko.observable();
    },
    name:{ dataType:$data.String },
    data:{ dataType:$data.Object },
    views:{ dataType:$data.Object},
    metaViews:{ dataType:$data.Object},
    selectedView: { dataType: $data.Object },
    selectedMetaView:{ dataType:$data.Object },
    frameApp:{dataType:'JayScrum.FrameApp'},
    registerChildFrame:function (frame) {
        if (!this.childFrames) {
            this.childFrames = ko.observableArray();
        }
        this.childFrames.push(frame);
    },
    registerView:function (name, view) {
        if (!this.views) {
            this.views = {};
        }
        this.views[name] = view;
    },
    registerMetaView:function (name, view) {
        if (!this.metaViews) {
            this.metaViews = {};
        }
        this.metaViews[name] = view;
    },
    backView:function(frameSetting){
        var newView = JayScrum.app.selectedFrame().views[frameSetting.viewName];
        JayScrum.app.framePath.push(frameSetting);
        JayScrum.app.selectedFrame().selectedView().tearDownView();
        JayScrum.app.selectedFrame().selectedView(newView);
        newView.initializeView();
    },
    selectView:function (name, initData) {
        if (JayScrum.app.collectFramePath()) {
            var currentView = JayScrum.app.framePath.slice(-1)[0];
            JayScrum.app.framePath.push({frameName:currentView.frameName, viewName:name, data:initData || currentView.data});
        }
        this.selectedView().tearDownView();
        this.selectedView(this.views[name]);
        this.selectedViewName(name);
        this.views[name].initializeView();
    },
    selectMetaView:function (name) {
        if (this.selectedMetaView === undefined) {
            this.selectedMetaView = ko.observable();
        }
        this.selectedMetaView(this.metaViews[name]);
    },
    frameRegistredApp:function (app) {
        this.frameApp = app;
    },
    onFrameChangingTo:function (newFrameData, oldFrameData, frame, disableResetData) {
        if((!oldFrameData || (oldFrameData && newFrameData.frameName !== oldFrameData.frameName)) && !disableResetData){
            JayScrum.app.showLoading();
            this._resetData();
        }
    },
    onFrameChangingFrom:function (newFrameData, oldFrameData, frame) {
        return Q.fcall(JayScrum.app.showLoading);
    },
    onFrameChangedTo:function (newFrameData, oldFrameData, frame) {
        this.selectedView().tearDownView();
    },
    _loadData: function(){
        var q = Q.defer();
        q.resolve();
        return q.promise;
    },
    _resetData: function(){

    },
    onFrameChangedFrom:function (newFrameData, oldFrameData, frame) {
        this._loadData()
            .then(function(){
                JayScrum.app.hideLoading();
               JayScrum.app.selectedFrame().selectedView().initializeView();
            });
    }
}, null);

$data.Class.define('JayScrum.FrameMetadata', null, null, {
    viewName:{ value:ko.observable() },
    data:{ value:ko.observable() },
    constructor:function (name, meta) {
        this.viewName(name);
        this.data(meta);
    }

}, null);