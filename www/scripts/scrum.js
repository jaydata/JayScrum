var debug = true,
    iScrollOptions = function (fn, fn2) {
        this.useTransition = true;
        this.hScroll = false;
        this.vScroll = true;
        this.fixedScrollbar = false;
        this.hideScrollbar = true;
        this.scrollbarClass = "iscrollbar";
        this.bounce = true;
        this.lockDirection = true;
        this.onScrollStart = function () {
            if ($('input:focus, select:focus, textarea:focus').length > 0) {
                $(':focus').blur();
            }
        };
        this.onScrollMove = function () {
            if (this.y < 0 && this.y < this.maxScrollY - 100 && !this.addNewItem) {
                $(this.scroller).find("div.scroll-up").addClass("flip");
                $(this.scroller).find("div.scroll-up span.pullUpLabel").html("Release to refresh");
                this.addNewItem = true;
            } else if (this.y > 0 && this.y > this.maxScrollY - 200 && !this.clearList) {
                $(this.scroller).find("div.scroll-down").addClass("flip");
                $(this.scroller).find("div.scroll-down span.pullDownLabel").html("Release to refresh");
                this.clearList = true;
            }
        };
        this.onScrollEnd = function () {
            if (this.addNewItem) {
                $(this.scroller).find("div.scroll-up").removeClass("flip");
                $(this.scroller).find("div.scroll-up span.pullUpLabel").html("Pull up to load more");

                this.addNewItem = undefined;

                if (this.options.refreshFunction) {
                    this.options.refreshFunction(this);
                }
            }

            if (this.clearList) {
                $(this.scroller).find("div.scroll-down").removeClass("flip");
                $(this.scroller).find("div.scroll-down span.pullDownLabel").html("Pull down to refresh");

                this.clearList = undefined;

                if (this.options.clearFunction) {
                    this.options.clearFunction(this);
                }
            }
        };
        this.refreshFunction = fn;
        this.clearFunction = fn2;
    };


$data.Class.define('JayScrum.ScrumApp', JayScrum.FrameApp, null,{
    constructor:function(){
        this.registerFrame(new JayScrum.Frames.Main('MainFrame'));
        this.registerFrame(new JayScrum.Frames.ScrumWall('ScrumWall'));
        this.registerFrame(new JayScrum.Frames.Projects('Projects'));
        this.registerFrame(new JayScrum.Frames.Sprints('Sprints'));
        this.registerFrame(new JayScrum.Frames.UserStories('UserStories'));
        this.registerFrame(new JayScrum.Frames.ThemeSettings('ThemeSettings'));
        this.registerFrame(new JayScrum.Frames.Repositories('Repositories'));
        this.registerFrame(new JayScrum.Frames.Users('Users'));
        this.visibleMetaData(false);
        this.globalData = ko.observable({
            stateOptionValues : ["To Do", "In Progress", "Done", "Removed"],
            stateOptionUserStoryValues : ["New", "Approved", "Committed", "Removed", "Done"],
            typeOptionValues : ['Task', 'Bug', 'UserStory', 'Issue', 'Epic'],
            blockedOptionValues : ['No', 'Yes'],
            projectList : ko.observableArray(),
            userStoryList: ko.observableArray(),
            userList: ko.observableArray(),
            sprintList: ko.observableArray(),
            user:ko.observable(),
            repositoryName: ko.observable()
        });
    },
    onRefreshProjectList:function () {
        var loadPromise = Q.defer();
        JayScrum.repository.Projects.toArray(function (projects) {
            JayScrum.pushObservablesToList(JayScrum.app.globalData().projectList, projects);
            loadPromise.resolve();
        });
        return loadPromise.promise;
    },
    onRefreshUserStoryList:function () {
        var loadPromise = Q.defer();
        JayScrum.repository.WorkItems
            .where(function (item) {
                return item.Type == "UserStory"
            })
            .toArray(function (userStoryResult) {
                JayScrum.pushObservablesToList(JayScrum.app.globalData().userStoryList, userStoryResult);
                loadPromise.resolve();
            });
        return loadPromise.promise;
    },
    onRefreshUserList:function () {
        var loadPromise = Q.defer();
        JayScrum.app.globalData().userList(['']);
        JayScrum.stormContext.Users.toArray(function(result){
            result.forEach(function(item){
                JayScrum.app.globalData().userList.push(item.login);
            });
            loadPromise.resolve();
        });

        return loadPromise.promise;
    },
    onRefreshSprintListForDropDown:function () {
        var loadPromise = Q.defer();
        JayScrum.repository.Sprints
            .where(function(item){return item.FinishDate>this.now;}, {now: new Date()})
            .orderBy(function(item){return item.FinishDate;})
            .toArray(function (sprints) {
                JayScrum.pushObservablesToList(JayScrum.app.globalData().sprintList, sprints);
                JayScrum.app.globalData().sprintList.splice(0,0,{Name:ko.observable(''), Id:ko.observable(null)});
                loadPromise.resolve();
            });
        return loadPromise.promise;
    },
    initScrollById:function (id, fn, fn2, hideLoad) {
        var i_scroll = null,
            transition = $("div#" + id);

        i_scroll = new iScroll(id, new iScrollOptions(fn, fn2));
        transition.addClass("animate").parent().find('h1.pivot-default').addClass("animate");

        // pull up to load more
        if (fn) {
            var d = document.createElement('div');
            d.className = "scroll-up list-item";
            d.innerHTML = "<span class='pullUpIcon'></span><span class='pullUpLabel'>Pull up to load more...</span>";
            transition.find('div.scroller-list').append(d);
        }

        // pull down to refresh
        if (fn2) {
            var d = document.createElement('div');
            d.className = "scroll-down list-item";
            d.innerHTML = "<span class='pullDownIcon'></span><span class='pullDownLabel'>Pull down to refresh...</span>";
            transition.find('div.scroller-list').prepend(d);
        }
        return i_scroll;
    },
    initSwipeviewById:function (id, list, wrkItemId) {

        var swipe = $("div#" + id),
            currentIndex = 0,
            gallery = null,
            scroll0 = scroll1 = scroll2 = null;

        if (list != null && swipe.length > 0) {
            list.filter(function (item, index) {
                if (item.Id() == wrkItemId) {
                    currentIndex = index;
                }
            }, this);

            JayScrum.app.selectedFrame().data().selectedWorkItemPrev(list[list.length - 1]);
            JayScrum.app.selectedFrame().data().selectedWorkItem(list[0]);
            JayScrum.app.selectedFrame().data().selectedWorkItemNext(list[1]);

            gallery = new SwipeView("#" + id, { numberOfPages:list.length });
            gallery.refreshMethods = [];
            gallery.onFlip(function () {
                for (i = 0; i < 3; i++) {
                    upcoming = gallery.masterPages[i].dataset.upcomingPageIndex;
                    if (upcoming != gallery.masterPages[i].dataset.pageIndex) {
                        switch (i) {
                            case 0:
                                JayScrum.app.selectedFrame().data().selectedWorkItemPrev(list[upcoming]);
                                break;
                            case 1:
                                JayScrum.app.selectedFrame().data().selectedWorkItem(list[upcoming]);
                                break;
                            case 2:
                                JayScrum.app.selectedFrame().data().selectedWorkItemNext(list[upcoming]);
                                break;
                        }
                    }
                }
                switch (gallery.currentMasterPage) {
                    case 0:
                        JayScrum.app.selectedFrame().data().selectedWorkItemActive(JayScrum.app.selectedFrame().data().selectedWorkItemPrev());
                        break;
                    case 1:
                        JayScrum.app.selectedFrame().data().selectedWorkItemActive(JayScrum.app.selectedFrame().data().selectedWorkItem());
                        break;
                    case 2:
                        JayScrum.app.selectedFrame().data().selectedWorkItemActive(JayScrum.app.selectedFrame().data().selectedWorkItemNext());
                        break;
                }

                if (scroll0 != null) {
                    scroll0.destroy();
                    scroll0 = null;
                }
                scroll0 = JayScrum.app.initScrollById("swipeview-inside-0", null, null, false);

                if (scroll1 != null) {
                    scroll1.destroy();
                    scroll1 = null;
                }
                scroll1 = JayScrum.app.initScrollById("swipeview-inside-1", null, null, false);

                if (scroll2 != null) {
                    scroll2.destroy();
                    scroll2 = null;
                }
                scroll2 = JayScrum.app.initScrollById("swipeview-inside-2", null, null, false);
            });
            gallery.goToPage(currentIndex);


        }
        return gallery;
    },
    initHorizontalScrollById:function (id, scrollToPage) {
        var wrapper = $("div#" + id),
            vScroll = null;

        if (wrapper.length > 0) {
            var columns = wrapper.find("div.pivot-list div.pivot").length,
                scrollerWidth = columns * 335;
            wrapper.find("div#scroller").width(scrollerWidth);

            vScroll = new iScroll(id, {
                snap:'.pivot',
                momentum:false,
                hScrollbar:false,
                vScrollbar:false,
                useTransition:true,
                lockDirection:true,
                handleClick:false
            });
            vScroll.scrollToPage(scrollToPage, 0, 0);
            if (window.outerWidth >= scrollerWidth) {
                vScroll.disable();
            }
        }
        return vScroll;
    },
    _initializeRepositories:function(url, userName, psw){

        $data.MetadataLoader.load({url: url+"/$metadata", AutoCreateContext:false}, function(factory, contextType){
            JayScrum.repository = factory();
            $data.MetadataLoader.load({url:url+"_users/$metadata", AutoCreateContext:false}, function(usrfactory, usrcontextType){
                JayScrum.stormContext = usrfactory();
                JayScrum.stormContext.Users
                    .where(function(item){return item.Login == this.loginName}, {loginName: userName})
                    .toArray(function(user){
                        if (user && user.length > 0) {
                            JayScrum.app.globalData().user(user[0].asKoObservable());
                        } else {
                            //TODO remove
                            JayScrum.app.globalData().user((new JayScrum.stormContext.Users.createNew({Id:'administrator', Login:'administrator', FirstName:'Administrator', LastName:'!!!'})).asKoObservable());
                        }
                        JayScrum.app.selectFrame('MainFrame');
                    });

            });
        });
    },
    _initializeDemoRepositories:function(context){
        JayScrum.repository = context;
        JayScrum.stormContext = context;
        JayScrum.stormContext.Users
            .where(function(item){return item.Login == 'administrator';})
            .toArray(function(usrList){
                if(usrList.length>0){
                    JayScrum.app.globalData().user(usrList[0].asKoObservable());
                }else{
                    JayScrum.app.globalData().user((new JayScrum.stormContext.Users.createNew({Id:'1', Login:'testUser', FirstName:'test', LastName:'user'})).asKoObservable());
                }
                JayScrum.app.selectFrame('MainFrame');
            });
    }
},null);

JayScrum.pushObservablesToList= function (list, rawData) {
    list([]);
    for (var i = 0; i < rawData.length; i++) {
        var obs = rawData[i].asKoObservable();
        list.push(obs);
    }
};

android = true;
if(window['android'] && window['cordova']){
    //TODO REMOVE!!!!!
    initApplication();return;
	document.addEventListener("deviceready", function(){
		initApplication();	
		document.addEventListener("backbutton", function(e){
			if(JayScrum.app.framePath().length > 1){
				JayScrum.app.backView();
			} else {
				e.preventDefault();
				navigator.app.exitApp();
			}
		}, false);
	}, false);
}else{
    initApplication();
}
function initApplication(){
	$(function () {
		if (android) {
			document.body.classList.add("android")
		}

		JayScrum.app = new JayScrum.ScrumApp('#page');
		JayScrum.app.bind();
		JayScrum.app.selectFrame('Repositories', undefined, { autoConnect: true });
	});
}

Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + days);
    return this;
}

