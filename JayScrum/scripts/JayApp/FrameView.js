$data.Class.define('JayScrum.FrameView', null, null, {
    constructor: function (name, path, tplSource) {
        this.templateName = name;
        this.loadPath = path;
        this.templateSource = tplSource;
    },
    initializaView:function(){JayScrum.app.selectedFrame().hideLoading();},
    tearDownView:function(){ console.log('tearDown View')},
    templateName: { dataType: $data.String },
    loadPath: { dataType: $data.String },
    templateSource: {dataType: $data.String}
}, null);