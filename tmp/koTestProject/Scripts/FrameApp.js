$data.Class.define('$JayScrum.FrameApp', null, null, {
    mainElement: { dataType: $data.Object },
    menuElement: { dataType: $data.Object },
    contentElement: { dataType: $data.Object },
    frameContainer: { value: ko.observableArray() },
    selectedFrame: { value: ko.observable() },
    framePath: { value: ko.observableArray([]) },
    collectFramePath: {value: ko.observable(true)},
    constructor: function (elementId, menuId, contentId) {
        if (!elementId) { elementId = 'JayScrumFrameApp'; }
        this.mainElement = this._createContainer(elementId, document.body);

        if (!menuId) { menuId = 'JayScrumMenu'; }
        this.menuElement = this._createContainer(menuId, this.mainElement);

        if (!contentId) { contentId = 'JayScrumContent'; }
        this.contentElement = this._createContainer(contentId, this.mainElement);

        //Add databinding
        this.menuElement.setAttribute('data-bind', 'template: { name: "menu", data: $data }');
        this.contentElement.setAttribute('data-bind', 'template: { name: "content", data: $data.selectedFrame }');
    },
    _createContainer: function (elementId, parent) {
        var containerNode = null;

        containerNode = document.querySelectorAll(elementId)[0];
        if (containerNode === null || containerNode === undefined) {
            containerNode = document.createElement('div');
            containerNode.id = elementId;
            parent.appendChild(containerNode);
        }
        return containerNode;
    },
    registerFrame: function (frame) {
        if (frame instanceof $JayScrum.Frame) {
            this.frameContainer.push(frame);
            return;
        }
        throw 'not supported';
    },
    selectFrame: function (index) {
        if (this.collectFramePath()) {
            this.framePath.push(index);
        }
        this.selectedFrame(this.frameContainer()[index]);
    },
    bind: function () {
        ko.applyBindings(this, this.mainElement);
    }
}, null);


function test() {
    window['app'] = new $JayScrum.FrameApp('#koTerep');
    var f = new $JayScrum.Frame('test frame 1');
    f.activeView('f1');    
    app.registerFrame(f);
    app.registerFrame(new $JayScrum.Frame('test frame 2'));
    app.selectFrame(0);
    app.bind();
}