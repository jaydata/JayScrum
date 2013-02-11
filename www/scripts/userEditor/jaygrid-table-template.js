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
                <div class='scroll-list pivot-default-opacity scrollable-list animate bottom45' id='settingPageScroll'>\
                    <div class='scroller-list reset'>\
                        <div class='list detail maxlist' >\
                                <div class='ohidden margint15' data-bind='visible: source' class='action-buttons'>\
                                    <span data-x-bind='text: $root.discriminatorValue'></span>\
                                </div>\
                                <table data-bind='visible: source' class='jay-data-grid metro-table margin' border='0'> \
                                    <!-- ko template: { name: 'jay-data-grid-head' } --> \
                                    <!-- /ko -->\
                                    <!-- ko template: { name: 'jay-data-grid-body' } --> \
                                    <!-- /ko -->\
                                </table>\
                        </div>\
                    </div>\
                </div>\
                <div id='user-actionbar' class='metro-actionbar opened'>\
                    <ul>\
                        <li class='icon-action add' data-bind='click: addNew'></li>\
                        <li class='icon-action save' data-bind='visible: pendingChanges'><input class='btn btn-success icon-action save' type='submit' value='' /></li>\
                    </ul>\
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
            </tr>\
            <tr class='subrow' data-bind='foreach: getControlCells'>\
                <td data-bind='attr: { colspan: colspan, \"data-template\": templateName }, template: { name: templateName, data: viewModel }'></td>\
            </tr>"
        ],

        ["jay-data-grid-data-cell",
            "<td data-bind='template: $root.getTemplate($data.owner,$data.metadata)'></td>"],

        ["jay-data-grid-control-cell",
            "<td>\
                <div class='tacenter' data-bind='foreach: itemCommands'>\
                    <span class='icon-action' data-bind='click: execute.bind($data,$parents[1]), \
                                           visible: visible.call($data,$parents[1]), attr: { class: \"icon-action \" + displayName.toLowerCase() }'></span>\
                </div>\
            </td>"],

        ["jay-data-grid-header-cell",
            "<th data-bind='text: $data[\"$displayName\"] || name'></th>"],

        ["jay-data-grid-generic-display",
            "<span data-bind='text: value'></span>"],

        ["jay-data-grid-$data.Boolean-display",
            "<div class='metro-checkbox white fnone_'>\
                '<input class='disabled' type='checkbox' data-bind='checked: value' disabled='disabled' class='input-checkbox' />\
                '<label data-bind='attr: { for: $parent[name] }'></label>'\
            </div>"],

        ["jay-data-grid-$data.String-display",
            '<span data-bind="text: value"></span>'],

        ["jay-data-grid-$data.Array-display",
            '[<span data-bind="foreach: value"><span data-bind="text:$data"></span></span>]'],

        ["jay-data-grid-generic-editor",
            '<input type="text" class="input-text" data-bind="value: value, attr: { required: metadata.required }" />'],

        ["jay-data-grid-$data.Boolean-editor",
            "<div class='metro-checkbox white fnone_'>\
                '<input type='checkbox' value='None' class='input-checkbox' data-bind='checked: $parent[name], attr: { id: $parent[name] }' />\
                '<label data-bind='attr: { for: $parent[name] }'></label>'\
            </div>"],

        ["jay-data-grid-Edm.String-editor",
            '<input type="text" class="input-text" data-bind="value: value, attr: { required: metadata[\"required\"] }, css: { verror: owner.ValidationErrors }" />' ],

        ["jay-data-grid-Edm.Int32-editor",
            "<input type='range' min=1 max=10 \
                data-bind='value: value, attr: { required: $data[\"required\"] }, css: { verror: owner.ValidationErrors }' />" ]
    ];

    $data.jayGridTemplates = $data.jayGridTemplates || {};
    $data.jayGridTemplates.tableTemplate = templateList;
})($data);