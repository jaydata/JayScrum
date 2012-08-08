$data.ajax = $.ajax;
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

var page = document.getElementById('page'),
           ua = navigator.userAgent.toLowerCase(),
           iphone = ~ua.indexOf('iphone') || ~ua.indexOf('ipod'),
           ipad = ~ua.indexOf('ipad'),
           ios = iphone || ipad,
           fullscreen = window.navigator.standalone,
           android = ~ua.indexOf('android'),
           isIE = ua.indexOf('msie'),
           $ = isIE > 0 ? jQuery : Zepto,
           eventName = !(/mobile/gi).test(navigator.appVersion) ? "click" : "tap",
           loading = $(".metro-loading"),
           settingScroll = null,
           scrollToRefresh = null,
           appStarted = false;

var setupScroll = function () {
    if (ios) {
        var height = document.documentElement.clientHeight;
        if (iphone && !fullscreen) height += 60;
        //page.style.height = height + 'px';
        document.body.style.height = height + 5 + 'px';
    } else if (android) {
        if (appStarted == false) {
            //page.style.height = (window.innerHeight + 56) + 'px';
            document.body.style.height = (window.innerHeight + 56) + 5 + 'px';
        }
    }
    setTimeout(scrollTo, 0, 0, 1);
    console.log('setup scroll');
};

// APP START
var initUI = function() {
    // GET UI SETTINGS FROM LOCAL STORAGE
    getSettings();

    setTimeout(function () {
        loading.animate({
            opacity: 0
        }, 500, 'ease-out', function () {
            loading.hide();
            loading.find("h1").html("Loading");

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

// FONT
$("div.field.fonts div.field").live(eventName, function () {
    var font = $(this).attr('font')
    $("body").attr('font', font);
    setSettingsByValue('font', font);

    $("div.field.fonts div.field").each(function () {
        $(this).removeClass("active");
    });
    $(this).addClass("active");
});

// THEME
$("div.themes div.theme-box").live(eventName, function () {
    var theme = $(this).attr('theme');
    $("body").attr('theme', theme);
    setSettingsByValue('theme', theme);
});

// LOCAL STORAGE
function setSetting(name, object) {
    localStorage.setItem(name, object);
    console.log('localstorage set:', name, object);
}
function getSetting(name) {
    var storage = localStorage[name];
    if (storage)
        return JSON.parse(storage);
    else
        return null;
}
function clearSetting() {
    localStorage.clear();
    console.log('local storage has been cleared');
}
function getSettings() {
    var prev = getSetting('settings');

    if (prev == null || prev === undefined) {
        var accent = $("body").attr('accent'),
            theme = $("body").attr('theme'),
            font = $("body").attr('font'),
            settings = { 'theme': theme, 'font': font, 'accent': accent },
            jsonSettings = JSON.stringify(settings);

        setSetting('settings', jsonSettings);
    } else {
        $("body").attr('accent', prev.accent);
        $("body").attr('theme', prev.theme);
        $("body").attr('font', prev.font);
    }
}
function setSettingsByValue(key, value) {
    var prev = getSetting('settings');

    if (prev != null || prev !== undefined) {
        var accent = key == 'accent' ? value : $("body").attr('accent'),
            theme = key == 'theme' ? value : $("body").attr('theme'),
            font = key == 'font' ? value : $("body").attr('font'),
            settings = { 'theme': theme, 'font': font, 'accent': accent },
            jsonSettings = JSON.stringify(settings);

        setSetting('settings', jsonSettings);
    } else {
        var accent = $("body").attr('accent'),
            theme = $("body").attr('theme'),
            font = $("body").attr('font'),
            settings = { 'theme': theme, 'font': font, 'accent': accent },
            jsonSettings = JSON.stringify(settings);

        setSetting('settings', jsonSettings);
    }
}


function initDateFieldsById(containerId) {
    return;
    var div = $("#" + containerId),
        dateFields = div.find("input.field-date"),
        date = null,
        $self = null;

    dateFields.each(function () {
        $self = $(this);
        date = moment($self.next('.field-date-value').val()).format("YYYY-MM-DD");
        $self.val(date);
        $self.next('.field-date-value').attr('type','date');
        console.log(date);
    });
}
