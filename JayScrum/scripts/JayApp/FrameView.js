$data.Class.define('JayScrum.FrameView', null, null, {
    constructor: function (name, path, tplSource) {
        this.templateName = name;
        this.loadPath = path;
        this.templateSource = tplSource;
    },
    initializeView:function(){JayScrum.app.selectedFrame().hideLoading();},
    tearDownView:function(){ },
    templateName: { dataType: $data.String },
    loadPath: { dataType: $data.String },
    templateSource: {dataType: $data.String}
}, null);