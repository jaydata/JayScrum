$data.Class.define('JayScrum.FrameApp', null, null, {
    mainElement:{ dataType:$data.Object },
    menuElement:{ dataType:$data.Object },
    contentElement:{ dataType:$data.Object },
    frameContainer:{ value:ko.observableArray() },
    selectedFrame:{ value:ko.observable() },
    framePath:{ value:ko.observableArray([]) },
    collectFramePath:{value:ko.observable(true)},
    visibleMetaData:{dataType:$data.Object},
    visibleContent:{dataType:$data.Object},
    visibleLoadingScreen:{dataType:$data.Object},
    constructor:function (elementId, menuId, contentId) {
        if (!elementId) {
            elementId = 'JayScrumFrameApp';
        }
        this.mainElement = this._createContainer(elementId, document.body);

        if (!menuId) {
            menuId = 'JayScrumMenu';
        }
        this.menuElement = this._createContainer(menuId, this.mainElement);

        if (!contentId) {
            contentId = 'JayScrumContent';
        }
        this.contentElement = this._createContainer(contentId, this.mainElement);

        //Add databinding
        this.menuElement.setAttribute('data-bind', 'visible: $root.visibleMetaData, template: { name: "jayAppMenu", data: $data }');
        this.contentElement.setAttribute('data-bind', 'visible: $root.visibleContent, template: { name: "jayAppContent", data: $data }');
        this.visibleMetaData = ko.observable(true);
        this.visibleContent = ko.observable(true);
        this.visibleLoadingScreen = ko.observable(false);
        this._frameHashTable = {};
        //TODO csinád meg
        this.loading = $(".metro-loading");
    },
    _createContainer:function (elementId, parent) {
        var containerNode = null;

        containerNode = document.querySelectorAll(elementId)[0];
        if (containerNode === null || containerNode === undefined) {
            containerNode = document.createElement('div');
            containerNode.id = elementId;
            parent.appendChild(containerNode);
        }
        return containerNode;
    },
    showLoading:function () {
        console.log('show loading screen');
        JayScrum.app.loading.show();
        JayScrum.app.loading.animate({
            opacity:1
        }, 0, 'ease-out');
    },
    hideLoading:function () {
        console.log('hide loading screen');
        JayScrum.app.loading.animate({
            opacity:0
        }, 500, 'ease-out', function () {
            JayScrum.app.loading.hide();
        })
    },
    registerFrame:function (frame) {
        if (frame instanceof JayScrum.Frame) {
            this._frameHashTable[frame.name] = (this.frameContainer.push(frame)-1);
            frame.frameRegistredApp(this);
            return;
        }
        throw 'not supported';
    },
    backView:function(){
        var actualFrameSetting = null;
        var prevFrameSetting = null;
        if (JayScrum.app.collectFramePath()) {
            actualFrameSetting = JayScrum.app.framePath.pop();
            prevFrameSetting = JayScrum.app.framePath.pop();
        }
        if(actualFrameSetting.frameName === prevFrameSetting.frameName){
            JayScrum.app.selectedFrame().backView(prevFrameSetting);
        }else{
            JayScrum.app.selectFrame(prevFrameSetting.frameName, prevFrameSetting.viewName, prevFrameSetting.data);
        }
    },
    selectFrame:function (name, viewName, initData) {

        var frameIndex = this._frameHashTable[name];
        var newActiveFrame = {frameName:name, viewName:viewName, data:initData};
        var oldActiveFrame = {frameName:null, viewName:null, data: null};
        if (this.collectFramePath()) {
            oldActiveFrame = this.framePath.slice(-1)[0];
        }
        var newFrame = this.frameContainer()[frameIndex];
        var oldFrame = this.selectedFrame();
        if(viewName === undefined){
            newActiveFrame.viewName = newFrame.defaultViewName;
        }
        console.log('change frame from:'+JSON.stringify(oldActiveFrame)+' to '+JSON.stringify(newActiveFrame));



        if (oldFrame) {
            oldFrame.onFrameChangingTo(newActiveFrame, oldActiveFrame, newFrame);
        }
        newFrame.onFrameChangingFrom(newActiveFrame, oldActiveFrame, initData, oldFrame);

        if (this.collectFramePath()) {
            this.framePath.push(newActiveFrame);
        }
        newFrame.selectedView(newFrame.views[newActiveFrame.viewName]);
        this.selectedFrame(newFrame);

        if (oldFrame) {
            oldFrame.onFrameChangedTo(newActiveFrame, oldActiveFrame, newFrame);
        }
        newFrame.onFrameChangedFrom(newActiveFrame, oldActiveFrame, oldFrame);

        console.log('app path: '+JSON.stringify(this.framePath()));
    },
    bind:function () {
        ko.applyBindings(this, this.mainElement);
    }
}, null);