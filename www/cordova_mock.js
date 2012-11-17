window['cordova'] = {};


cordova.exec = function (success, error, a, fn, params) {
    switch (fn) {
        case 'transactions':
            setTimeout(function () { success([JSON.parse('{"DevPayLoad":{"dbName":"alma","psw":"jelszo","title":"Repository","usr":"korte","Title":"Repository","UserName":"korte","Password":"jelszo","OrderId":"1389551147345499"},"purchaseToken":"trivkrjcyozqswvsfeuhnmrs","ProductId":"test.jaystack.subscription_monthly","OrderId":"1389551147345499"}')]) }, 1000);
            //setTimeout(function () { success([]) }, 1000);
            return;
            break;
        case 'subscribe':
            setTimeout(function () { params[0].OrderId = "1389551147345499"; success("RESULT_OK") }, 1000);
            return;
            break;
    }
    error();
};
setTimeout(function () {
    var event = document.createEvent('Events');
    event.initEvent('deviceready', false, false);
    document.dispatchEvent(event);
}, 1000);