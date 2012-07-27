window['App'] = function (id) {
    var appFrame = {
        frames: [],
        activeFram: 0,

    };


    this.appFrames = ko.observableArray([{ name: 'f1', template: 'f1', data: { text: 'text' } },
                                        {
                                            name: 'f2', template: 'f2', data: {
                                                text: 'text2',
                                                appFrames: ko.observableArray([{ name: 'f21', template: 'f1', data: { text: 'text21' } },
                                                                                { name: 'f21', template: 'f1', data: { text: 'text21' } }]),
                                                activeFrame: ko.observable(0)
                                            }
                                        },
                                        { name: 'f1', template: 'f1', data: { text: 'text3' } }]);
    this.activeFrame = ko.observable(0);
    this.mainElement = document.querySelector(id);
    this.initialize = function () {
        ko.applyBindings(this, this.mainElement);
    };
    this.addTemplate = function () {
        var s = document.createElement('script');
        s.setAttribute('type', 'text/html');
        s.id = 'tt';
        s.innerHTML = '<div>            <span>F1 template</span><br />            <span data-bind="text: $data.name"></span><br />            <span data-bind="text: $data.data.text"></span><br />        </div>        <hr />';
        document.body.appendChild(s);
    };
    this.addView = function () {
        this.appFrames.push({ name: 'tt', template: 'tt', data: { text: 'text3343' } });
        this.activeFrame(3);
    };

    this.registerView = function (viewName, templateName, data) {
    };
    this.initialize();
}
function view() {
    this.name = "string";
    this.templateName = "template";
    this.subViewsContainerId = "subviews";
    this.subView = [];
    this.activeSubView = 0;
    this.data = {};
}
view.prototype.registerView = function () {
    this.subView.push(new view());
}