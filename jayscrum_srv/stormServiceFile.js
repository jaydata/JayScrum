/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 9/9/12
 * Time: 9:48 PM
 * To change this template use File | Settings | File Templates.
 */
// moment.js
// version : 1.7.2
// author : Tim Wood
// license : MIT
// momentjs.com
(function (a) { function E(a, b, c, d) { var e = c.lang(); return e[a].call ? e[a](c, d) : e[a][b] } function F(a, b) { return function (c) { return K(a.call(this, c), b) } } function G(a) { return function (b) { var c = a.call(this, b); return c + this.lang().ordinal(c) } } function H(a, b, c) { this._d = a, this._isUTC = !!b, this._a = a._a || null, this._lang = c || !1 } function I(a) { var b = this._data = {}, c = a.years || a.y || 0, d = a.months || a.M || 0, e = a.weeks || a.w || 0, f = a.days || a.d || 0, g = a.hours || a.h || 0, h = a.minutes || a.m || 0, i = a.seconds || a.s || 0, j = a.milliseconds || a.ms || 0; this._milliseconds = j + i * 1e3 + h * 6e4 + g * 36e5, this._days = f + e * 7, this._months = d + c * 12, b.milliseconds = j % 1e3, i += J(j / 1e3), b.seconds = i % 60, h += J(i / 60), b.minutes = h % 60, g += J(h / 60), b.hours = g % 24, f += J(g / 24), f += e * 7, b.days = f % 30, d += J(f / 30), b.months = d % 12, c += J(d / 12), b.years = c, this._lang = !1 } function J(a) { return a < 0 ? Math.ceil(a) : Math.floor(a) } function K(a, b) { var c = a + ""; while (c.length < b) c = "0" + c; return c } function L(a, b, c) { var d = b._milliseconds, e = b._days, f = b._months, g; d && a._d.setTime(+a + d * c), e && a.date(a.date() + e * c), f && (g = a.date(), a.date(1).month(a.month() + f * c).date(Math.min(g, a.daysInMonth()))) } function M(a) { return Object.prototype.toString.call(a) === "[object Array]" } function N(a, b) { var c = Math.min(a.length, b.length), d = Math.abs(a.length - b.length), e = 0, f; for (f = 0; f < c; f++) ~~a[f] !== ~~b[f] && e++; return e + d } function O(a, b, c, d) { var e, f, g = []; for (e = 0; e < 7; e++) g[e] = a[e] = a[e] == null ? e === 2 ? 1 : 0 : a[e]; return a[7] = g[7] = b, a[8] != null && (g[8] = a[8]), a[3] += c || 0, a[4] += d || 0, f = new Date(0), b ? (f.setUTCFullYear(a[0], a[1], a[2]), f.setUTCHours(a[3], a[4], a[5], a[6])) : (f.setFullYear(a[0], a[1], a[2]), f.setHours(a[3], a[4], a[5], a[6])), f._a = g, f } function P(a, c) { var d, e, g = []; !c && h && (c = require("./lang/" + a)); for (d = 0; d < i.length; d++) c[i[d]] = c[i[d]] || f.en[i[d]]; for (d = 0; d < 12; d++) e = b([2e3, d]), g[d] = new RegExp("^" + (c.months[d] || c.months(e, "")) + "|^" + (c.monthsShort[d] || c.monthsShort(e, "")).replace(".", ""), "i"); return c.monthsParse = c.monthsParse || g, f[a] = c, c } function Q(a) { var c = typeof a == "string" && a || a && a._lang || null; return c ? f[c] || P(c) : b } function R(a) { return a.match(/\[.*\]/) ? a.replace(/^\[|\]$/g, "") : a.replace(/\\/g, "") } function S(a) { var b = a.match(k), c, d; for (c = 0, d = b.length; c < d; c++) D[b[c]] ? b[c] = D[b[c]] : b[c] = R(b[c]); return function (e) { var f = ""; for (c = 0; c < d; c++) f += typeof b[c].call == "function" ? b[c].call(e, a) : b[c]; return f } } function T(a, b) { function d(b) { return a.lang().longDateFormat[b] || b } var c = 5; while (c-- && l.test(b)) b = b.replace(l, d); return A[b] || (A[b] = S(b)), A[b](a) } function U(a) { switch (a) { case "DDDD": return p; case "YYYY": return q; case "S": case "SS": case "SSS": case "DDD": return o; case "MMM": case "MMMM": case "dd": case "ddd": case "dddd": case "a": case "A": return r; case "Z": case "ZZ": return s; case "T": return t; case "MM": case "DD": case "YY": case "HH": case "hh": case "mm": case "ss": case "M": case "D": case "d": case "H": case "h": case "m": case "s": return n; default: return new RegExp(a.replace("\\", "")) } } function V(a, b, c, d) { var e, f; switch (a) { case "M": case "MM": c[1] = b == null ? 0 : ~~b - 1; break; case "MMM": case "MMMM": for (e = 0; e < 12; e++) if (Q().monthsParse[e].test(b)) { c[1] = e, f = !0; break } f || (c[8] = !1); break; case "D": case "DD": case "DDD": case "DDDD": b != null && (c[2] = ~~b); break; case "YY": c[0] = ~~b + (~~b > 70 ? 1900 : 2e3); break; case "YYYY": c[0] = ~~Math.abs(b); break; case "a": case "A": d.isPm = (b + "").toLowerCase() === "pm"; break; case "H": case "HH": case "h": case "hh": c[3] = ~~b; break; case "m": case "mm": c[4] = ~~b; break; case "s": case "ss": c[5] = ~~b; break; case "S": case "SS": case "SSS": c[6] = ~~(("0." + b) * 1e3); break; case "Z": case "ZZ": d.isUTC = !0, e = (b + "").match(x), e && e[1] && (d.tzh = ~~e[1]), e && e[2] && (d.tzm = ~~e[2]), e && e[0] === "+" && (d.tzh = -d.tzh, d.tzm = -d.tzm) } b == null && (c[8] = !1) } function W(a, b) { var c = [0, 0, 1, 0, 0, 0, 0], d = { tzh: 0, tzm: 0 }, e = b.match(k), f, g; for (f = 0; f < e.length; f++) g = (U(e[f]).exec(a) || [])[0], g && (a = a.slice(a.indexOf(g) + g.length)), D[e[f]] && V(e[f], g, c, d); return d.isPm && c[3] < 12 && (c[3] += 12), d.isPm === !1 && c[3] === 12 && (c[3] = 0), O(c, d.isUTC, d.tzh, d.tzm) } function X(a, b) { var c, d = a.match(m) || [], e, f = 99, g, h, i; for (g = 0; g < b.length; g++) h = W(a, b[g]), e = T(new H(h), b[g]).match(m) || [], i = N(d, e), i < f && (f = i, c = h); return c } function Y(a) { var b = "YYYY-MM-DDT", c; if (u.exec(a)) { for (c = 0; c < 4; c++) if (w[c][1].exec(a)) { b += w[c][0]; break } return s.exec(a) ? W(a, b + " Z") : W(a, b) } return new Date(a) } function Z(a, b, c, d, e) { var f = e.relativeTime[a]; return typeof f == "function" ? f(b || 1, !!c, a, d) : f.replace(/%d/i, b || 1) } function $(a, b, c) { var e = d(Math.abs(a) / 1e3), f = d(e / 60), g = d(f / 60), h = d(g / 24), i = d(h / 365), j = e < 45 && ["s", e] || f === 1 && ["m"] || f < 45 && ["mm", f] || g === 1 && ["h"] || g < 22 && ["hh", g] || h === 1 && ["d"] || h <= 25 && ["dd", h] || h <= 45 && ["M"] || h < 345 && ["MM", d(h / 30)] || i === 1 && ["y"] || ["yy", i]; return j[2] = b, j[3] = a > 0, j[4] = c, Z.apply({}, j) } function _(a, c) { b.fn[a] = function (a) { var b = this._isUTC ? "UTC" : ""; return a != null ? (this._d["set" + b + c](a), this) : this._d["get" + b + c]() } } function ab(a) { b.duration.fn[a] = function () { return this._data[a] } } function bb(a, c) { b.duration.fn["as" + a] = function () { return +this / c } } var b, c = "1.7.2", d = Math.round, e, f = {}, g = "en", h = typeof module != "undefined" && module.exports, i = "months|monthsShort|weekdays|weekdaysShort|weekdaysMin|longDateFormat|calendar|relativeTime|ordinal|meridiem".split("|"), j = /^\/?Date\((\-?\d+)/i, k = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|zz?|ZZ?|.)/g, l = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?)/g, m = /([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi, n = /\d\d?/, o = /\d{1,3}/, p = /\d{3}/, q = /\d{1,4}/, r = /[0-9a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+/i, s = /Z|[\+\-]\d\d:?\d\d/i, t = /T/i, u = /^\s*\d{4}-\d\d-\d\d(T(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/, v = "YYYY-MM-DDTHH:mm:ssZ", w = [["HH:mm:ss.S", /T\d\d:\d\d:\d\d\.\d{1,3}/], ["HH:mm:ss", /T\d\d:\d\d:\d\d/], ["HH:mm", /T\d\d:\d\d/], ["HH", /T\d\d/]], x = /([\+\-]|\d\d)/gi, y = "Month|Date|Hours|Minutes|Seconds|Milliseconds".split("|"), z = { Milliseconds: 1, Seconds: 1e3, Minutes: 6e4, Hours: 36e5, Days: 864e5, Months: 2592e6, Years: 31536e6 }, A = {}, B = "DDD w M D d".split(" "), C = "M D H h m s w".split(" "), D = { M: function () { return this.month() + 1 }, MMM: function (a) { return E("monthsShort", this.month(), this, a) }, MMMM: function (a) { return E("months", this.month(), this, a) }, D: function () { return this.date() }, DDD: function () { var a = new Date(this.year(), this.month(), this.date()), b = new Date(this.year(), 0, 1); return ~~((a - b) / 864e5 + 1.5) }, d: function () { return this.day() }, dd: function (a) { return E("weekdaysMin", this.day(), this, a) }, ddd: function (a) { return E("weekdaysShort", this.day(), this, a) }, dddd: function (a) { return E("weekdays", this.day(), this, a) }, w: function () { var a = new Date(this.year(), this.month(), this.date() - this.day() + 5), b = new Date(a.getFullYear(), 0, 4); return ~~((a - b) / 864e5 / 7 + 1.5) }, YY: function () { return K(this.year() % 100, 2) }, YYYY: function () { return K(this.year(), 4) }, a: function () { return this.lang().meridiem(this.hours(), this.minutes(), !0) }, A: function () { return this.lang().meridiem(this.hours(), this.minutes(), !1) }, H: function () { return this.hours() }, h: function () { return this.hours() % 12 || 12 }, m: function () { return this.minutes() }, s: function () { return this.seconds() }, S: function () { return ~~(this.milliseconds() / 100) }, SS: function () { return K(~~(this.milliseconds() / 10), 2) }, SSS: function () { return K(this.milliseconds(), 3) }, Z: function () { var a = -this.zone(), b = "+"; return a < 0 && (a = -a, b = "-"), b + K(~~(a / 60), 2) + ":" + K(~~a % 60, 2) }, ZZ: function () { var a = -this.zone(), b = "+"; return a < 0 && (a = -a, b = "-"), b + K(~~(10 * a / 6), 4) } }; while (B.length) e = B.pop(), D[e + "o"] = G(D[e]); while (C.length) e = C.pop(), D[e + e] = F(D[e], 2); D.DDDD = F(D.DDD, 3), b = function (c, d) { if (c === null || c === "") return null; var e, f; return b.isMoment(c) ? new H(new Date(+c._d), c._isUTC, c._lang) : (d ? M(d) ? e = X(c, d) : e = W(c, d) : (f = j.exec(c), e = c === a ? new Date : f ? new Date(+f[1]) : c instanceof Date ? c : M(c) ? O(c) : typeof c == "string" ? Y(c) : new Date(c)), new H(e)) }, b.utc = function (a, c) { return M(a) ? new H(O(a, !0), !0) : (typeof a == "string" && !s.exec(a) && (a += " +0000", c && (c += " Z")), b(a, c).utc()) }, b.unix = function (a) { return b(a * 1e3) }, b.duration = function (a, c) { var d = b.isDuration(a), e = typeof a == "number", f = d ? a._data : e ? {} : a, g; return e && (c ? f[c] = a : f.milliseconds = a), g = new I(f), d && (g._lang = a._lang), g }, b.humanizeDuration = function (a, c, d) { return b.duration(a, c === !0 ? null : c).humanize(c === !0 ? !0 : d) }, b.version = c, b.defaultFormat = v, b.lang = function (a, c) { var d; if (!a) return g; (c || !f[a]) && P(a, c); if (f[a]) { for (d = 0; d < i.length; d++) b[i[d]] = f[a][i[d]]; b.monthsParse = f[a].monthsParse, g = a } }, b.langData = Q, b.isMoment = function (a) { return a instanceof H }, b.isDuration = function (a) { return a instanceof I }, b.lang("en", { months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), longDateFormat: { LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D YYYY", LLL: "MMMM D YYYY LT", LLLL: "dddd, MMMM D YYYY LT" }, meridiem: function (a, b, c) { return a > 11 ? c ? "pm" : "PM" : c ? "am" : "AM" }, calendar: { sameDay: "[Today at] LT", nextDay: "[Tomorrow at] LT", nextWeek: "dddd [at] LT", lastDay: "[Yesterday at] LT", lastWeek: "[last] dddd [at] LT", sameElse: "L" }, relativeTime: { future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", mm: "%d minutes", h: "an hour", hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years" }, ordinal: function (a) { var b = a % 10; return ~~(a % 100 / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th" } }), b.fn = H.prototype = { clone: function () { return b(this) }, valueOf: function () { return +this._d }, unix: function () { return Math.floor(+this._d / 1e3) }, toString: function () { return this._d.toString() }, toDate: function () { return this._d }, toArray: function () { var a = this; return [a.year(), a.month(), a.date(), a.hours(), a.minutes(), a.seconds(), a.milliseconds(), !!this._isUTC] }, isValid: function () { return this._a ? this._a[8] != null ? !!this._a[8] : !N(this._a, (this._a[7] ? b.utc(this._a) : b(this._a)).toArray()) : !isNaN(this._d.getTime()) }, utc: function () { return this._isUTC = !0, this }, local: function () { return this._isUTC = !1, this }, format: function (a) { return T(this, a ? a : b.defaultFormat) }, add: function (a, c) { var d = c ? b.duration(+c, a) : b.duration(a); return L(this, d, 1), this }, subtract: function (a, c) { var d = c ? b.duration(+c, a) : b.duration(a); return L(this, d, -1), this }, diff: function (a, c, e) { var f = this._isUTC ? b(a).utc() : b(a).local(), g = (this.zone() - f.zone()) * 6e4, h = this._d - f._d - g, i = this.year() - f.year(), j = this.month() - f.month(), k = this.date() - f.date(), l; return c === "months" ? l = i * 12 + j + k / 30 : c === "years" ? l = i + (j + k / 30) / 12 : l = c === "seconds" ? h / 1e3 : c === "minutes" ? h / 6e4 : c === "hours" ? h / 36e5 : c === "days" ? h / 864e5 : c === "weeks" ? h / 6048e5 : h, e ? l : d(l) }, from: function (a, c) { return b.duration(this.diff(a)).lang(this._lang).humanize(!c) }, fromNow: function (a) { return this.from(b(), a) }, calendar: function () { var a = this.diff(b().sod(), "days", !0), c = this.lang().calendar, d = c.sameElse, e = a < -6 ? d : a < -1 ? c.lastWeek : a < 0 ? c.lastDay : a < 1 ? c.sameDay : a < 2 ? c.nextDay : a < 7 ? c.nextWeek : d; return this.format(typeof e == "function" ? e.apply(this) : e) }, isLeapYear: function () { var a = this.year(); return a % 4 === 0 && a % 100 !== 0 || a % 400 === 0 }, isDST: function () { return this.zone() < b([this.year()]).zone() || this.zone() < b([this.year(), 5]).zone() }, day: function (a) { var b = this._isUTC ? this._d.getUTCDay() : this._d.getDay(); return a == null ? b : this.add({ d: a - b }) }, startOf: function (a) { switch (a.replace(/s$/, "")) { case "year": this.month(0); case "month": this.date(1); case "day": this.hours(0); case "hour": this.minutes(0); case "minute": this.seconds(0); case "second": this.milliseconds(0) } return this }, endOf: function (a) { return this.startOf(a).add(a.replace(/s?$/, "s"), 1).subtract("ms", 1) }, sod: function () { return this.clone().startOf("day") }, eod: function () { return this.clone().endOf("day") }, zone: function () { return this._isUTC ? 0 : this._d.getTimezoneOffset() }, daysInMonth: function () { return b.utc([this.year(), this.month() + 1, 0]).date() }, lang: function (b) { return b === a ? Q(this) : (this._lang = b, this) } }; for (e = 0; e < y.length; e++) _(y[e].toLowerCase(), y[e]); _("year", "FullYear"), b.duration.fn = I.prototype = { weeks: function () { return J(this.days() / 7) }, valueOf: function () { return this._milliseconds + this._days * 864e5 + this._months * 2592e6 }, humanize: function (a) { var b = +this, c = this.lang().relativeTime, d = $(b, !a, this.lang()), e = b <= 0 ? c.past : c.future; return a && (typeof e == "function" ? d = e(d) : d = e.replace(/%s/i, d)), d }, lang: b.fn.lang }; for (e in z) z.hasOwnProperty(e) && (bb(e, z[e]), ab(e.toLowerCase())); bb("Weeks", 6048e5), h && (module.exports = b), typeof ender == "undefined" && (this.moment = b), typeof define == "function" && define.amd && define("moment", [], function () { return b }) }).call(this);
var Q = require('q');

function updateBurndownDataList(sprint, context) {
    var p = Q.defer();
    var self = context;

    var sprintDays = moment(sprint.FinishDate).diff(sprint.StartDate, 'days');
    self.SprintBurndown
        .where(function (item) { return item.SprintId == this.sprintId && item.SprintDay > this.maxDay; }, { sprintId: sprint.Id, maxDay: sprintDays })
        .toArray(function (sprintBurndownData) {
            console.log("burndown data length: ", sprintBurndownData.length);
            if (sprintBurndownData.length > 0) {
                /// remove unused days
                sprintBurndownData.forEach(function (data) { self.remove(data); });
                p.resolve();
            }
            else {
                /// add extra days if needed
                self.SprintBurndown
                    .where(function (item) { return item.SprintId == this.sprintId && item.SprintDay <= this.maxDay; }, { sprintId: sprint.Id, maxDay: sprintDays })
                    .orderByDescending(function (item) { return item.SprintDay; })
                    .take(1)
                    .toArray(function (lastSprintDayData) {
                        var lastSprintDay = 0;
                        var todoValue = -1;
                        var leftValue = -1;
                        if (lastSprintDayData.length > 0) {
                            lastSprintDay = lastSprintDayData[0].SprintDay + 1;
                            todoValue = lastSprintDayData[0].ToDo;
                            leftValue = lastSprintDayData[0].Left;
                        }
                        for (var i = lastSprintDay; i <= sprintDays; i++) {
                            self.SprintBurndown.add(new self.SprintBurndown.createNew({
                                SprintId: sprint.Id,
                                SprintDay: i,
                                ToDo: todoValue,
                                Left: leftValue
                            }));
                        }
                        p.resolve();
                    });
            }
        });

    return p.promise;
}
function afterUpdateCreateSprint() {
    return function (callbackHandler, sprintList) {
        var self = this;
        var fns = sprintList.map(function (s) { return updateBurndownDataList(s, self); });
        Q.all(fns)
            .then(function () {
                self.saveChanges(function () {
                    var fnUpdateConnectedData = updateConnectedDataSprintChanged();
                    fnUpdateConnectedData.apply(self, [function () {
                        callbackHandler();
                    }, sprintList]);
                });
            });
    };
}

function updateSprintBurndownData(sprint, context) {
    var p = Q.defer();
    var self = context;
    console.log("updateSprintBurndownData: ", sprint.Id);
    var sprintDay = moment().diff(sprint.StartDate, 'days');
    self.WorkItems
        .where(function (wrk) { return wrk.WorkItem_Sprint == this.sprintId && (wrk.Type == "Task" || wrk.Type == "Bug") && (wrk.State == "To Do" || wrk.State == "In Progress"); }, { sprintId: sprint.Id })
        .toArray(function (wrkItems) {

            var leftHour = wrkItems.reduce(function (previousValue, currentValue) { return previousValue + currentValue.RemainingWork; }, 0);
            var todoHour = wrkItems.filter(function (item) { return item.State == "To Do"; })
                .reduce(function (previousValue, currentValue) { return previousValue + currentValue.RemainingWork; }, 0);

            self.SprintBurndown
                .where(function (item) { return item.SprintId == this.sprint_id && ((item.SprintDay == this.sprintDay) || (item.SprintDay < this.sprintDay && (item.Left < 0 || item.ToDo < 0))); }, { sprint_id: sprint.Id, sprintDay: sprintDay })
                .toArray(function (bdData) {
                    bdData.forEach(function (bdEntity) {
                        self.attach(bdEntity);
                        if (bdEntity.SprintDay == sprintDay) {
                            bdEntity.Left = leftHour;
                            bdEntity.ToDo = todoHour;
                        }
                        else {
                            if (bdEntity.Left < 0) { bdEntity.Left = leftHour; }
                            if (bdEntity.ToDo < 0) { bdEntity.ToDo = todoHour; }
                        }
                    });
                    p.resolve();
                });
        });


    return p.promise;
}
function updateBurndownData() {
    return function (callbackHandler, workItemList) {
        var self = this;
        var wrkItemIdList = workItemList.map(function (wrkItem) { return wrkItem.Id; });

        self.WorkItems
          .where(function (item) { return item.Id in this.ids; }, { ids: wrkItemIdList })
          .map(function (item) { return item.WorkItem_Sprint; })
          .toArray({
              success: function (sprintIdList) {
                  self.Sprints
                      .where(function (item) { return item.Id in this.sprint_ids; }, { sprint_ids: sprintIdList })
                      .toArray(function (sprintList) {
                          var fns = sprintList.map(function (s) { return updateSprintBurndownData(s, self); });
                          Q.all(fns)
                              .then(function () {
                                  self.saveChanges(function () {
                                      var fnUpdateConnectedData = updateConnectedDataUserStoryChanged();
                                      fnUpdateConnectedData.apply(self, [function () {
                                          callbackHandler();
                                      }, workItemList]);
                                  });
                              });

                      });
              },
              error: function () { console.log("ERROR: ", arguments); }
          });

    };
}

function updateConnectedData() {
    return function (callBackHandler, workItemList) {
        var self = this;
        var projectIds = workItemList.map(function (wrkItem) { return wrkItem.WorkItem_Project === undefined ? null : wrkItem.WorkItem_Project; });
        var sprintIds = workItemList.map(function (wrkItem) { return wrkItem.WorkItem_Sprint === undefined ? null : wrkItem.WorkItem_Sprint; });
        var parentIds = workItemList.map(function (wrkItem) { return wrkItem.WorkItem_WorkItem === undefined ? null : wrkItem.WorkItem_WorkItem; });
        var fns = [];
        fns.push(self.Projects.where(function (item) { return item.Id in this.ids; }, { ids: projectIds }).toArray());
        fns.push(self.Sprints.where(function (item) { return item.Id in this.ids1; }, { ids1: sprintIds }).toArray());
        fns.push(self.WorkItems.where(function (item) { return item.Id in this.ids2; }, { ids2: parentIds }).toArray());

        self.Projects.where(function (item) { return item.Id in this.ids; }, { ids: projectIds }).toArray(function (projectList) {
            self.Sprints.where(function (item) { return item.Id in this.ids1; }, { ids1: sprintIds }).toArray(function (sprintList) {
                self.WorkItems.where(function (item) { return item.Id in this.ids2; }, { ids2: parentIds }).toArray(function (parentList) {
                    for (var i = 0; i < workItemList.length; i++) {
                        wrkItem = workItemList[i];
                        var project = projectList.filter(function (item) { return item.Id == wrkItem.WorkItem_Project; })[0];
                        var sprint = sprintList.filter(function (item) { return item.Id == wrkItem.WorkItem_Sprint; })[0];
                        var parent = parentList.filter(function (item) { return item.Id == wrkItem.WorkItem_WorkItem; })[0];
                        if (project) { wrkItem.ProjectName = project.Name; }
                        if (sprint) { wrkItem.SprintName = sprint.Name; }
                        if (parent) { wrkItem.ParentName = parent.Title; }
                    }
                    callBackHandler();
                });
            });
        });
    };
}

function updateConnectedDataSprintChanged() {
    return function (callBackHandler, sprintList) {
        var self = this;
        var sprintIds = sprintList.map(function (wrkItem) {
            return wrkItem.Id;
        });

        self.WorkItems.where(function (item) { return item.WorkItem_Sprint in this.ids1; }, { ids1: sprintIds }).toArray(function (workItemList) {
            for (var i = 0; i < workItemList.length; i++) {
                wrkItem = workItemList[i];
                var sprint = sprintList.filter(function (item) { return item.Id == wrkItem.WorkItem_Sprint; })[0];
                if (sprint) {
                    self.WorkItems.attach(wrkItem);
                    wrkItem.SprintName = sprint.Name;
                }
            }
            self.saveChanges(function () {
                callBackHandler();
            });

        });
    };
}
function updateConnectedDataProjectChanged() {
    return function (callBackHandler, projectList) {
        var self = this;
        var projectIds = projectList.map(function (wrkItem) { return wrkItem.Id; });

        self.WorkItems.where(function (item) { return item.WorkItem_Project in this.ids1; }, { ids1: projectIds }).toArray(function (workItemList) {
            for (var i = 0; i < workItemList.length; i++) {
                wrkItem = workItemList[i];
                var project = projectList.filter(function (item) { return item.Id == wrkItem.WorkItem_Project; })[0];
                if (project) {
                    self.WorkItems.attach(wrkItem);
                    wrkItem.ProjectName = project.Name;
                }
            }
            console.log("Update workItem after change project!");
            self.saveChanges(function () {
                callBackHandler();
            });

        });
    };
}
function updateConnectedDataUserStoryChanged() {
    return function (callBackHandler, userStoryItemList) {
        var self = this;
        var userStoryIds = userStoryItemList.filter(function (item) { return item.Type == "UserStory"; }).map(function (wrkItem) { return wrkItem.Id; });
        self.WorkItems.where(function (item) { return item.WorkItem_WorkItem in this.ids1; }, { ids1: userStoryIds }).toArray(function (workItemList) {
            for (var i = 0; i < workItemList.length; i++) {
                wrkItem = workItemList[i];
                var project = userStoryItemList.filter(function (item) { return item.Id == wrkItem.WorkItem_WorkItem; })[0];
                if (project) {
                    self.WorkItems.attach(wrkItem);
                    wrkItem.ParentName = project.Name;
                }
            }
            self.saveChanges(function () {
                callBackHandler();
            });

        });
    };
}

exports = module.exports = function (type) {
    type.extend("JayScrumFunctionImports", {
        constructor: function () {
            this.WorkItems['afterCreate'] = updateBurndownData;
            this.WorkItems['afterUpdate'] = updateBurndownData;
            this.WorkItems['beforeCreate'] = updateConnectedData;
            this.WorkItems['beforeUpdate'] = updateConnectedData;
            this.Projects['afterUpdate'] = updateConnectedDataProjectChanged;
            this.Sprints['afterCreate'] = afterUpdateCreateSprint;
            this.Sprints['afterUpdate'] = afterUpdateCreateSprint;
        },
        getSprintsData: $data.JayService.serviceFunction()
            .param("sprintIds", "Array")
            .returnsArrayOf("jayscrum.SprintExtended")
            (function (sprintIdList) {
                return function (success, error) {
                    var self = this;
                    var sprints = this.Sprints
                        .where(function (item) { return ((item.Id in this.sprintIds) || (item.StartDate <= this.now && item.FinishDate >= this.now)); }, { sprintIds: sprintIdList, now: new Date() })
                        .orderBy(function (item) { return item.FinishDate; })
                        .toArray();

                    Q.when(sprints)
                        .then(function (sprintList) {
                            var workitemQueries = sprintList.map(function (item) {
                                return self.WorkItems
                                    .where(function (item) { return item.WorkItem_Sprint == this.sprintId && item.State != "Done" && item.State != "Removed" && (item.Type == 'Task' || item.Type == 'Bug'); }, { sprintId: item.Id })
                                    .length();
                            });

                            Q.all(workitemQueries)
                                .then(function () {
                                    var data = workitemQueries.map(function (item, index) {
                                        var d = sprintList[index].initData;
                                        d.tasksLeft = item.valueOf();
                                        return new jayscrum.SprintExtended(d);
                                    });
                                    success(data);
                                })
                                .fail(function () { console.log(arguments); success([]); });
                        })
                        .fail(function () { console.log(arguments); success([]); });
                };
            }),
        getBurndownData: $data.JayService.serviceFunction()
            .param('sprintId', "string")
            .returns("$data.Object")
            (function (sprintId) {
                return function (success, error) {
                    var self = this;

                    var types = ["To Do", "In Progress", "Done"];
                    var workitemQueries = types.map(function (tName) {
                        return self.WorkItems
                            .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.State == this.typeName && (item.Type == 'Task' || item.Type == 'Bug'); }, { sprint_id: sprintId, typeName: tName })
                            .toArray();
                    });
                    workitemQueries.push(
                        self.WorkItems
                            .where(function (item) { return item.WorkItem_Sprint == this.sprint_id && item.Type == 'UserStory'; }, { sprint_id: sprintId })
                            .length()
                    );

                    Q.all(workitemQueries)
                        .then(function () {
                            var result = {
                                todo: workitemQueries[0].valueOf().length,
                                todo_hour: workitemQueries[0].valueOf().reduce(function (previousValue, currentValue, index, array) { return previousValue + currentValue.RemainingWork; }, 0),
                                inprogress: workitemQueries[1].valueOf().length,
                                inprogress_hour: workitemQueries[1].valueOf().reduce(function (previousValue, currentValue, index, array) { return previousValue + currentValue.RemainingWork; }, 0),
                                done: workitemQueries[2].valueOf().length,
                                done_hour: workitemQueries[2].valueOf().reduce(function (previousValue, currentValue, index, array) { return previousValue + currentValue.RemainingWork; }, 0),
                                userStory: workitemQueries[3].valueOf(),
                                task: 9999
                            };
                            result.task = result.todo + result.inprogress + result.done;

                            self.Sprints
                                .single(function (item) { return item.Id == this.sprint_id; },
                                { sprint_id: sprintId },
                                function (sprint) {

                                    self.SprintBurndown
                                        .where(function (item) { return item.SprintId == this.sprint_id; }, { sprint_id: sprintId })
                                        .orderBy(function (item) { return item.SprintDay; })
                                        .toArray(function (burndownData) {

                                            var collectBurndownData = function (bdData) {
                                                result.burnDown = {
                                                    startDate: sprint.StartDate,
                                                    endDate: sprint.FinishDate,
                                                    length: bdData.length
                                                };
                                                result.burnDown.remainingLine = [];
                                                result.burnDown.todoLine = [];
                                                result.burnDown.idealLine = [[0, bdData[0].Left < 0 ? 0 : bdData[0].Left], [bdData.length - 1, 0]];

                                                for (var i = 0; i < bdData.length; i++) {
                                                    if (bdData[i].Left >= 0) {
                                                        result.burnDown.remainingLine.push([i, bdData[i].Left]);
                                                    }
                                                    if (bdData[i].ToDo >= 0) {
                                                        result.burnDown.todoLine.push([i, bdData[i].ToDo]);
                                                    }
                                                }
                                                while (result.burnDown.remainingLine.length < 2) {

                                                    result.burnDown.remainingLine.push([result.burnDown.remainingLine.length,
                                                        result.burnDown.remainingLine.length === 0
                                                            ? 0
                                                            : result.burnDown.remainingLine[result.burnDown.remainingLine.length - 1][1]
                                                    ]);
                                                }
                                                while (result.burnDown.todoLine.length < 2) {
                                                    result.burnDown.todoLine.push([result.burnDown.todoLine.length,
                                                        result.burnDown.todoLine.length === 0
                                                            ? 0
                                                            : result.burnDown.todoLine[result.burnDown.todoLine.length - 1][1]
                                                    ]);
                                                }
                                                success(result);
                                            };

                                            if (burndownData.length === 0) {
                                                updateBurndownDataList(sprint, self)
                                                    .then(function () {
                                                        self.saveChanges(function () {
                                                            self.SprintBurndown
                                                                .where(function (item) { return item.SprintId == this.sprint_id; }, { sprint_id: sprintId })
                                                                .orderBy(function (item) { return item.SprintDay; })
                                                                .toArray(function (newBurndownData) {
                                                                    collectBurndownData(newBurndownData);
                                                                });
                                                        });
                                                    });
                                            } else {
                                                collectBurndownData(burndownData);
                                            }
                                        });
                                });

                        }, function (error) { console.log(error); });
                };
            })
    });
    JayScrumFunctionImports.annotateFromVSDoc();
    return JayScrumFunctionImports;
};