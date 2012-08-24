/**
 * Created with JetBrains WebStorm.
 * User: peterzentai
 * Date: 8/20/12
 * Time: 12:09 PM
 * To change this template use File | Settings | File Templates.
 */

(function($data) {
var templateList = [
    ["jay-data-grid",
        "<form data-bind='submit:save'><table data-bind='visible: source' class='jay-data-grid' border='1'> \
            <thead>\
            <td data-bind='attr: {colspan: columns().length}'>\
            <span data-bind='text: $root.discriminatorValue'></span>\
                <a href='#' data-bind='click: addNew, text: \"New \" '></a> \
                <input type='submit' value='Save' data-bind='visible: pendingChanges' />\
                Sort: <select data-bind='options: columns, optionsValue: \"name\", optionsText: \"name\", value: sortColumn'></select>\
            </td>\
            </thead>\
            <!-- ko template: { name: 'jay-data-grid-head' } --> \
            <!-- /ko -->\
            <!-- ko template: { name: 'jay-data-grid-body' } --> \
            <!-- /ko -->\
            <tbody>\
            <td data-bind='attr: {colspan: columns().length}'>\
                <a href='#' data-bind='click: addNew, text: \"New \" '/> \
                <input type='submit' value='Save' data-bind='visible: pendingChanges'/>\
                <span data-bind='visible: pendingChanges, text: pendingStatusInfo()' />\
                <select data-bind='options: ko.utils.range(1,50), value: pageSize, visible: pageSize() > 0'></select>\
                <a hef='#' data-bind='click:goToPreviousPage'> < </a>\
                <select data-bind='options: pages, value: currentPage'></select>\
                <a hef='#' data-bind='click:goToNextPage'> > </a>\
            </td>\
            </tbody>\
        </table></form>"],

    ["jay-data-grid-head",
        "<thead class='jay-data-grid-columns'>\
           <tr class='jay-data-grid-columns-row' \
           data-bind=\"template: { name: 'jay-data-grid-header-cell', foreach: columns}\"\
           </tr>\
        </thead>"],


    ["jay-data-grid-body",
        "<tbody data-bind=\"template: {name: 'jay-data-grid-row', foreach: items}\"></tbody>"],

    ["jay-data-grid-row",
        "<tr  data-bind='foreach: $parent.columns'>\
            <!-- ko template: { name: ($data[\"isVirtual\"] ? 'jay-data-grid-control-cell' : 'jay-data-grid-data-cell') } -->\
            <!-- /ko -->\
        </tr>"],

    ["jay-data-grid-data-cell",
        "<td data-bind='template: $root.getTemplate($parent,$data)'></td>"],


    ["jay-data-grid-control-cell",
        "<td>\
            <div  data-bind='foreach: itemCommands'>\
                <span data-bind='with: $parents[1]'>\
                    <a href='#' data-bind='click: $parent.execute, visible: $parent.visible($parents[2]), text: $parent.displayName || \"command\"'></a> \
                </span>\
            </div>\
        </td>"],

    ["jay-data-text-cell",
        "<span data-bind='text: $parent[name]'></span>"],


    ["jay-data-grid-header-cell",
        "<td data-bind='text: $data[\"$displayName\"] || name'></td>"],

    ["jay-data-grid-Edm.String-editor",
        "<input data-bind='value: $parent[name], attr: { required: $data[\"required\"] }, css: { verror: $parent.ValidationErrors }' />" ],


    ["jay-data-grid-Edm.Int32-editor",
        "<input  type='range' min=1 max=10 \
data-bind='value: $parent[name], attr: { required: $data[\"required\"] }, css: { verror: $parent.ValidationErrors }' />" ],

    ["jay-data-grid-Edm.String-editor",
        "<input  data-bind='value: $parent[name], attr: { required: $data[\"required\"] }, css: { verror: $parent.ValidationErrors }' />" ]

];
    $data.jayGridTemplates = $data.jayGridTemplates || {};
    $data.jayGridTemplates.tableTemplate = templateList;
})($data);