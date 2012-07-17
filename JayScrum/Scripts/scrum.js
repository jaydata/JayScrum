/// <reference path="knockout-2.0.0.debug.js" />
/// <reference path="serverevents.js" />
/// <reference path="iscroll.js" />
/// <reference path="JayData.js" />

var debug = true,
    dragndrop = false,
    vScroll,
    iScrollOptions = function (fn, fn2) {
        this.useTransition = true;
        this.hScroll = false;
        this.vScroll = true;
        this.fixedScrollbar = false;
        this.hideScrollbar = true;
        this.bounce = true;
        this.lockDirection = true;
        this.onScrollMove = function () {
            //console.log(this.y, this.maxScrollY);

            if (this.y < 0 && this.y < this.maxScrollY - 100 && !this.addNewItem) {
                console.log("Release to load more");

                $(this.scroller).find("div.scroll-up").addClass("flip");
                $(this.scroller).find("div.scroll-up span.pullUpLabel").html("Release to refresh");
                this.addNewItem = true;
            } else if (this.y > 0 && this.y > this.maxScrollY - 200 && !this.clearList) {
                console.log("Release to refresh");

                $(this.scroller).find("div.scroll-down").addClass("flip");
                $(this.scroller).find("div.scroll-down span.pullDownLabel").html("Release to refresh");
                this.clearList = true;
            }
        };
        this.onScrollEnd = function () {
            if (this.addNewItem) {
                $(this.scroller).find("div.scroll-up").removeClass("flip");
                $(this.scroller).find("div.scroll-up span.pullUpLabel").html("Pull up to load more");

                console.log("onScrollEnd = " + this.y);
                this.addNewItem = undefined;

                if (this.options.refreshFunction) {
                    this.options.refreshFunction(this);
                }
            }

            if (this.clearList) {
                $(this.scroller).find("div.scroll-down").removeClass("flip");
                $(this.scroller).find("div.scroll-down span.pullDownLabel").html("Pull down to refresh");

                console.log("onScrollEnd = " + this.y);
                this.clearList = undefined;

                if (this.options.clearFunction) {
                    this.options.clearFunction(this);
                }
            }
        };
        this.refreshFunction = fn;
        this.clearFunction = fn2;
    },
    windowHeight = $(window).height();

$data.Class.define('JayScrum.Types.scrumModel', null, null, {
    constructor: function () {
        this.activePartName = ko.observable();
        this.settingPage = new JayScrum.Models.settingPage();
        this.activePartName('settingPage');
        //this.mainPage = new JayScrum.Models.mainPage();

        //this.ScrumAsync();
    },
    ScrumAsync: function () {
        //Current sprints
        $data.Model.mainPage.selectedProject(getSetting('selectedProject'));
        $data.ScrumDb.Sprints
            .where(function (item) { return item.StartDate <= this.currentDate && item.FinishDate >= this.currentDate; }, { currentDate: new Date().todayUTC() })
            .orderBy(function (item) { return item.StartDate })
            .toArray({
                success: function (result) {
                    if (result.length == 0) {
                        $("div#error-msg").addClass("opened");
                    }
                    $data.Model.mainPage.pushObservablesToList($data.Model.mainPage.activeSprintList, result, true);
                    //Get pinned sprints
                    var pinnedSprints = getSetting('pinnedSprints');
                    var additionalSprintIds = [];
                    for (var id in pinnedSprints) {
                        if (!result.some(function (sprint) { return sprint.Id == pinnedSprints[id] })) {
                            additionalSprintIds.push(pinnedSprints[id]);
                        }
                    }
                    if (additionalSprintIds.length > 0) {
                        $data.ScrumDb.Sprints
                            .where(function (item) { return item.Id in this.sprintIds }, { sprintIds: additionalSprintIds })
                            .toArray(function (sprintList) {
                                for (var s in sprintList) {
                                    $data.Model.mainPage.activeSprintList.push(sprintList[s].asKoObservable());
                                }

                                var sprintIds = $data.Model.mainPage.activeSprintList().map(function (s) { return s.Id(); });
                                $data.ScrumDb.WorkItems
                                    .where(function (wi) { return wi.Type == 'Task' && wi.State != 'Done' && wi.WorkItem_Sprint in this.sprintIds }, { sprintIds: sprintIds })
                                    .select(function (wi) { return { WorkItemId: wi.Id, SprintId: wi.WorkItem_Sprint } })
                                    .orderBy(function (wi) { return wi.WorkItem_Sprint; })
                                    .toArray(function (result) {
                                        $data.Model.mainPage.activeSprintsTaskIds(result);
                                        setTimeout(initUI(), 1000);
                                    });
                            });
                    } else {
                        initUI();
                    }
                },
                error: function (error) {
                    console.log(error.stack);
                    //alert(error);
                }
            });
    },
    isActivePart: function (partName) {
        return partName === this.activePartName();
    },
    findWorkItem: function (wrkItemId) {
        var todoList = $data.Model.mainPage.todoList()
        for (var i = 0; i < todoList.length; i++) {
            if (todoList[i].Id() === wrkItemId)
                return todoList[i];
        }
        var inProgList = $data.Model.mainPage.inProgList();
        for (var i = 0; i < inProgList.length; i++) {
            if (inProgList[i].Id() === wrkItemId)
                return inProgList[i];
        }
        var doneList = $data.Model.mainPage.doneList();
        for (var i = 0; i < doneList.length; i++) {
            if (doneList[i].Id() === wrkItemId)
                return doneList[i];
        }
        var userStoryList = $data.Model.mainPage.userStoryList();
        for (var i = 0; i < userStoryList.length; i++) {
            if (userStoryList[i].Id() === wrkItemId)
                return userStoryList[i];
        }
        return null;
    },
    findListById: function (wrkItemId, data) {
        var todoList = $data.Model.mainPage.todoList()
        for (var i = 0; i < todoList.length; i++) {
            if (todoList[i].Id() === wrkItemId) {
                if (data) { todoList[i] = data; }
                return [].concat(todoList);
            }
        }
        var inProgList = $data.Model.mainPage.inProgList();
        for (var i = 0; i < inProgList.length; i++) {
            if (inProgList[i].Id() === wrkItemId) {
                if (data) { inProgList[i] = data; }
                return [].concat(inProgList);
            }
        }
        var doneList = $data.Model.mainPage.doneList();
        for (var i = 0; i < doneList.length; i++) {
            if (doneList[i].Id() === wrkItemId) {
                if (data) { doneList[i] = data; }
                return [].concat(doneList);
            }
        }
        var userStoryList = $data.Model.mainPage.userStoryList();
        for (var i = 0; i < userStoryList.length; i++) {
            if (userStoryList[i].Id() === wrkItemId) {
                if (data) { userStoryList[i] = data; }
                return [].concat(userStoryList);
            }
        }
        return null;
    },

    mainPage: {},
    settingPage: {}
}, null);

$(function () {
    $data.Model = new JayScrum.Types.scrumModel();
    ko.applyBindings($data.Model);

    if (settingScroll == null) {
        initUI();
    }
});

Date.prototype.todayUTC = function () {
    var d = Date.UTC(this.getFullYear(), this.getMonth(), this.getDate());
    return new Date(d);
}
Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + days);
    return this;
}
Date.prototype.diffInDays = function (date) {
    return 55;
}
// SCROLL
function initScrollById(id, fn, fn2, hideLoad) {

    var transition = $("div#" + id);

    if (id == 'wrapper-detailed-edit' || id == 'swipeview-inside-us') {
        scrollToRefresh = new iScroll(id, new iScrollOptions(fn, fn2));
    } else if (transition.length > 0) {
        new iScroll(id, new iScrollOptions(fn, fn2));
        transition.addClass("animate").prev().addClass("animate");
    }

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

    if (hideLoad) {
        hideLoading();
    }
    console.log('initing scroll: ' + id);
}
function initHorizontalScrollById(id, scrollToPage) {

    var wrapper = $("div#" + id);
    if (wrapper.length > 0) {
        var columns = wrapper.find("div.pivot-list div.pivot").length,
            scrollerWidth = columns * 335;
        wrapper.find("div#scroller").width(scrollerWidth);

        vScroll = new iScroll(id, {
            snap: '.pivot',
            momentum: false,
            hScrollbar: false,
            vScrollbar: false,
            useTransition: true,
            lockDirection: true
        });
        vScroll.scrollToPage(scrollToPage, 0, 0);

        if (window.outerWidth >= scrollerWidth) {
            vScroll.disable();
        }

        hideLoading();
    }
}
function refreshScroll(scroll, hideLoad) {
    setTimeout(function () {
        scroll.refresh();

        if (hideLoad) {
            hideLoading();
        }
    }, 500);

    console.log("scroll refreshed: " + scroll);
}
function initSwipeviewById(id, list, wrkItemId) {
    showLoading();

    var swipe = $("div#" + id),
        currentIndex = 0;

    if (list != null && swipe.length > 0) {
        list.filter(function (item, index) { if (item.Id() == wrkItemId) { currentIndex = index; } }, this);

        var gallery = new SwipeView("#" + id, { numberOfPages: list.length });
        gallery.onFlip(function () {
            $data.Model.mainPage.selectedWorkItemPrev(list[gallery.masterPages[0].dataset.upcomingPageIndex]);
            $data.Model.mainPage.selectedWorkItem(list[gallery.masterPages[1].dataset.upcomingPageIndex]);
            $data.Model.mainPage.selectedWorkItemNext(list[gallery.masterPages[2].dataset.upcomingPageIndex]);
            switch (gallery.currentMasterPage) {
                case 0: $data.Model.mainPage.selectedWorkItemActive($data.Model.mainPage.selectedWorkItemPrev()); break;
                case 1: $data.Model.mainPage.selectedWorkItemActive($data.Model.mainPage.selectedWorkItem()); break;
                case 2: $data.Model.mainPage.selectedWorkItemActive($data.Model.mainPage.selectedWorkItemNext()); break;
            }

            // TODO: layout is broken on first load
            var swipeviewUs = $("#swipeview-inside-" + gallery.currentMasterPage),
                title = swipeviewUs.prev(),
                minusHeight = title.height() + 15;

            console.log(minusHeight);
            swipeviewUs.css('top', minusHeight);
            setTimeout(function () {
                initScrollById('swipeview-inside-' + gallery.currentMasterPage);
            }, 100);
        });
        gallery.goToPage(currentIndex);
    }

    setTimeout(function () {
        hideLoading();
    }, 500);
}