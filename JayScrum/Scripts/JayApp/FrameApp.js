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
    registerFrame:function (frame) {
        if (frame instanceof JayScrum.Frame) {
            this._frameHashTable[frame.name] = (this.frameContainer.push(frame)-1);
            frame.frameRegistredApp(this);
            return;
        }
        throw 'not supported';
    },
    selectFrame:function (name, viewName, initData) {

        var frameIndex = this._frameHashTable[name];
        var newActiveFrame = {frameName:name, viewName:viewName};
        var oldActiveFrame = {frameName:null, viewName:null};
        if (this.collectFramePath()) {
            oldActiveFrame = this.framePath.slice(-1)[0];
        }

        console.log('change frame from:'+JSON.stringify(oldActiveFrame)+' to '+JSON.stringify(newActiveFrame));

        var newFrame = this.frameContainer()[frameIndex];
        var oldFrame = this.selectedFrame();

        if (oldFrame) {
            oldFrame.onFrameChangingTo(newActiveFrame, oldActiveFrame, newFrame);
        }
        newFrame.onFrameChangingFrom(newActiveFrame, oldActiveFrame, initData, oldFrame);

        if (this.collectFramePath()) {
            this.framePath.push(newActiveFrame);
        }
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