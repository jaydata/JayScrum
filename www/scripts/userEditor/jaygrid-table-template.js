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
            "<form data-bind='submit:save'>\
            <div data-bind='visible: source' class='action-buttons'>\
                <span class='iblock'>\
                    <span data-x-bind='text: $root.discriminatorValue'></span>\
                    <a class='btn btn-info' href='#' data-bind='click: addNew'><i class='icon-plus icon-white'></i> New</a> \
                    <a class='btn btn-danger' href='#' data-bind='click:removeAll'><i class='icon-trash icon-white'></i> Remove all</a>\
                    <input class='btn btn-success' type='submit' value='Save' data-bind='visible: pendingChanges' />\
                </span>\
                <span class='iblock pull-right'>\
                    <span class='title'>Sort:</span><select class='input-medium' data-bind='options: columns, optionsValue: \"name\", optionsText: \"name\", value: sortColumn'></select>\
                </span>\
            </div>\
            <table data-bind='visible: source' class='jay-data-grid table table-bordered table-hover' border='0'> \
                <!-- ko template: { name: 'jay-data-grid-head' } --> \
                <!-- /ko -->\
                <!-- ko template: { name: 'jay-data-grid-body' } --> \
                <!-- /ko -->\
            </table>\
                <div data-bind='visible: source' class='action-buttons'>\
                    <span class='iblock'>\
                        <a class='btn btn-info' href='#' data-bind='click: addNew'><i class='icon-plus icon-white'></i> New</a> \
                        <input class='btn btn-success' type='submit' value='Save' data-bind='visible: pendingChanges'/>\
                    </span>\
                    <br \>\
                    <span class='iblock margint10'>\
                        <select class='input-small' data-bind='options: ko.utils.range(1,50), value: pageSize, visible: pageSize() > 0'></select>\
                        <span data-bind='visible: pendingChanges, text: pendingStatusInfo()' />\
                    </span>\
                    <div class='pagination pagination-centered'>\
                        <ul>\
                        <li><a href='#' data-bind='click:goToPreviousPage'>&#171;</a>\</li>\
                        <li><select class='input-mini' data-bind='options: pages, value: currentPage'></select></li>\
                        <li><a href='#' data-bind='click:goToNextPage'>&#187;</a></li>\
                        </ul>\
                    </div>\
                </div>\
            </form>"],

        ["jay-data-grid-head",
            "<thead class='jay-data-grid-columns'>\
               <tr class='jay-data-grid-columns-row' \
               data-bind=\"template: { name: 'jay-data-grid-header-cell', foreach: columns}\"\
               </tr>\
            </thead>"],


        ["jay-data-grid-body",
            "<tbody data-bind=\"template: {name: 'jay-data-grid-row', foreach: items}\"></tbody>"],

        ["jay-data-grid-row",
            "<tr  data-bind='template: { foreach: $data.getColumns($index) } '>\
                <!-- ko template: { name: (metadata[\"isVirtual\"] ? 'jay-data-grid-control-cell' : 'jay-data-grid-data-cell') } -->\
                <!-- /ko -->\
            </tr>"],


        ["jay-data-grid-data-cell",
            "<td data-bind='template: $root.getTemplate($data.owner,$data.metadata)'></td>"],


//    visible: visible($parents[1]), \
//    click: $data.execute, \
        //<span data-bind='with: $parent'>\
        //</span>\
        ["jay-data-grid-control-cell",
            "<td>\
                <div  data-bind='foreach: itemCommands'>\
                    <a href='#' class='btn' data-bind='click: execute.bind($data,$parents[1]), \
                                           visible: visible.call($data,$parents[1]), text: displayName'></a>\
                </div>\
            </td>"],

        ["jay-data-grid-header-cell",
            "<th data-bind='text: $data[\"$displayName\"] || name'></th>"],

        ["jay-data-grid-generic-display",
            "<span data-bind='text: value'></span>"],

        ["jay-data-grid-$data.Boolean-display",
            '<input type="checkbox" data-bind="checked: value" disabled />'],

        ["jay-data-grid-$data.String-display",
            '<span data-bind="text: value"></span>'],

        ["jay-data-grid-$data.Array-display",
            '[<span data-bind="foreach: value"><span data-bind="text:$data"></span></span>]'],

        ["jay-data-grid-generic-editor",
            '<input type="text" data-bind="value: value, attr: { required: metadata.required }" />'],

        ["jay-data-grid-$data.Boolean-editor",
            '<input type="checkbox" data-bind="checked: $parent[name]"  />'],

        ["jay-data-grid-Edm.String-editor",
            "<input type='text' data-bind='value: value, attr: { required: metadata[\"required\"] }, css: { verror: owner.ValidationErrors }' />" ],

        ["jay-data-grid-Edm.Int32-editor",
            "<input type='range' min=1 max=10 \
data-bind='value: value, attr: { required: $data[\"required\"] }, css: { verror: owner.ValidationErrors }' />" ]

    ];
    $data.jayGridTemplates = $data.jayGridTemplates || {};
    $data.jayGridTemplates.tableTemplate = templateList;
})($data);