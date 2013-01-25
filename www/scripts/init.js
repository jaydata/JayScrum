function initEnvironment(wnd) {
    $data.ajax = wnd.$.ajax;

    wnd.ua = navigator.userAgent.toLowerCase();
    wnd.iphone = ~ua.indexOf('iphone') || ~ua.indexOf('ipod');
    wnd.ipad = ~ua.indexOf('ipad');
    wnd.ios = iphone || ipad;
    wnd.android = ua.indexOf('android') >= 0;
    wnd.android23 = android && $.os.version.indexOf("2.3") > -1;
    wnd.isIE = ua.indexOf('msie');
    wnd.eventName = !(/mobile/gi).test(navigator.appVersion) ? "click" : "tap";
    wnd.loading = $("div.metro-loading");
    wnd.scrollToRefresh = null;
    wnd.appStarted = false;

    //document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    document.addEventListener('touchmove', function (e) {
        if (android && $(':focus').length > 0) {
            $(":focus").each(function () {
                $(this).blur();
            });
        }
    }, false);

    wnd.setupScroll = function () {
        //var page = document.getElementById('page');
        if (ios) {
            var height = document.documentElement.clientHeight;
            if (iphone && !window.navigator.standalone) height += 60;
            //page.style.height = height + 'px';
            document.body.style.height = height + 5 + 'px';
        } else if (android && !appStarted) {
            //page.style.height = (window.innerHeight + 56) + 'px';
            document.body.style.height = (window.innerHeight + 56) + 5 + 'px';
        }
        setTimeout(scrollTo, 0, 0, 1);
    };

    // APP START
    wnd.initUI = function () {
        // GET UI SETTINGS FROM LOCAL STORAGE
        getSettings();

        setTimeout(function () {
            loading.animate({
                opacity: 0
            }, 500, 'ease-out', function () {
                loading.hide();

                setupScroll();
                appStarted = true;
            });
        }, 1000);
    }

    // HTML EVENTS
    $("span.chbox-icon").live(eventName, function () {
        $(this).prev().trigger(eventName);
        $(this).toggleClass('checked');
    });
    $("div.slider-action.prev").live(eventName, function () {
        JayScrum.app.selectedFrame().selectedView().swipeView.prev();
    });
    $("div.slider-action.next").live(eventName, function () {
        JayScrum.app.selectedFrame().selectedView().swipeView.next();
    });
    $("div.floating-box").live(eventName, function () {
        $(this).removeClass("visible");
    });

    // FONT
    $(".theme-font").live(eventName, function () {
        var font = this.dataset.font;

        document.body.setAttribute('data-font', font);
        $(".theme-font.active").removeClass("active");
        $(this).addClass("active");

        setSettingsByValue('font', font);
    });

    // THEME
    $(".theme-box").live(eventName, function () {
        var theme = this.dataset.theme;

        document.body.setAttribute('data-theme', theme);
        $(".theme-box.active").removeClass("active");
        $(this).addClass("active");

        setSettingsByValue('theme', theme);
    });

    // LOCAL STORAGE
    wnd.setSetting = function (name, object) {
        localStorage.setItem(name, object);
    }
    wnd.getSetting = function (name) {
        var storage = localStorage[name];
        if (storage)
            return JSON.parse(storage);
        else
            return null;
    }
    wnd.clearSetting = function () {
        localStorage.clear();
        console.log('local storage has been cleared');
    }
    wnd.getSettings = function () {
        var prev = getSetting('settings');

        if (prev == null || prev === undefined) {
            var accent   = $("body").attr('data-accent'),
                theme    = $("body").attr('data-theme'),
                font     = $("body").attr('data-font'),
                settings = { 'theme': theme, 'font': font, 'accent': accent },
                jsonSettings = JSON.stringify(settings);

            setSetting('settings', jsonSettings);
            setBodyClasses(settings);
        } else {
            $("body").attr('data-accent', prev.accent);
            $("body").attr('data-theme', prev.theme);
            $("body").attr('data-font', prev.font);

            setBodyClasses(prev);
        }
    }
    wnd.setSettingsByValue = function (key, value) {
        var prev = getSetting('settings'), accent, theme, font, settings;

        if (prev != null || prev !== undefined) {
            accent  = key == 'accent'   ? value : $("body").attr('data-accent');
            theme   = key == 'theme'    ? value : $("body").attr('data-theme');
            font    = key == 'font'     ? value : $("body").attr('data-font');
        } else {
            accent  = $("body").attr('data-accent');
            theme   = $("body").attr('data-theme');
            font    = $("body").attr('data-font');
        }

        var settings = { 'theme': theme, 'font': font, 'accent': accent };
        jsonSettings = JSON.stringify(settings);

        setSetting('settings', jsonSettings);
        setBodyClasses(settings);
    }

    wnd.setBodyClasses = function (s) {
        document.body.className = android ? ("android font-" + s.font + " theme-" + s.theme) : ("font-" + s.font + " theme-" + s.theme);
    }

    wnd.initDateFieldsById = function (containerId) {
        return;
        var div = $("#" + containerId),
            dateFields = div.find("input.field-date"),
            date = null,
            $self = null;

        dateFields.each(function () {
            $self = $(this);
            date = moment($self.next('.field-date-value').val()).format("YYYY-MM-DD");
            $self.val(date);
            $self.next('.field-date-value').attr('type', 'date');
        });
    }
}