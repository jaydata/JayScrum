/**
 * Created with JetBrains WebStorm.
 * User: peterzentai
 * Date: 8/16/12
 * Time: 12:39 PM
 * To change this template use File | Settings | File Templates.
 */
(function() {
    var templateEngine = new ko.nativeTemplateEngine();

    templateEngine.addTemplate = function(templateName, templateMarkup) {
        document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
    };

    //todo displayName

    function regiserTemplates(templates) {
        for(var i = 0; i < templates.length; i++) {
            templateEngine.addTemplate(templates[i][0], templates[i][1]);
        }
    }


    regiserTemplates($data.jayGridTemplates.tableTemplate);

    function getColumnsMetadata(source, fields, itemCommands) {
        var entityType = null;

        source = ko.utils.unwrapObservable(source);
        if (source instanceof $data.EntitySet) {
            entityType = source.elementType;
        } else if (source instanceof $data.Queryable ) {
            entityType = source._defaultType;
        }
        var props = [].concat(entityType.memberDefinitions.getPublicMappedProperties());
        if (fields.length > 0) {
            var res = [];
            for(var i = 0; i < fields.length; i++) {
                var propname = fields[i].name || fields[i];
                var prop = null;
                j = 0;
                while(!prop && j < props.length) {
                    if (props[j].name === propname) {
                        prop = props[j];
                    }
                    j++;
                }
                if (prop) {
                    res.push(prop);
                }
            }
            props = res;
        }
//        props.push( {
//            name: 'ValidationErrors',
//            type: 'Array'
//        });
//
//        props.push( {
//            name: 'entityState',
//            type: 'int'
//        });

        if (itemCommands.length > 0) {
            var meta = {
                isVirtual : true,
                name: 'controls',
                type: 'itemCommands',
                itemCommands: itemCommands
            };
            props.push(meta);
        }

        return props;
    };

    ko.bindingHandlers['readValue'] = {
        'update': function (element, valueAccessor) {
            var v = valueAccessor();
            var eset = ko.utils.unwrapObservable(v.source);
            var key = ko.utils.unwrapObservable(v.key);
            if (!key) {
                return;
            }

            var field = ko.utils.unwrapObservable(v.field);
            var keyField = eset.createNew.memberDefinitions.getKeyProperties()[0].name;


            eset.filter("it." + keyField.toString() + " == this.value", { value: key})
                .map("it." + field)
                .forEach(function(item) {
                    ko.utils.setTextContent(element, item);
                }
            );

        }
    };

    ko.bindingHandlers.jayGrid = {

        init: function() {
            return { 'controlsDescendantBindings': true };
        },

        update: function(element, viewModelAccessor, allBindingsAccessor, vModel) {
            //console.dir(vModel);
            var viewModel = viewModelAccessor(), allBindings = allBindingsAccessor();

            var source = null, fields = [];


            if (viewModel instanceof $data.EntitySet || viewModel instanceof $data.Queryable) {
                source = viewModel;
            } else {
                source = viewModel.source;
            };

            source = ko.isObservable(source) ? source: ko.observable(source);

            var fieldTemplates = {};


            if (! element.typeTemplates) {
                element.typeTemplates = {};
                var children = element.childNodes;
                for(var i = 0; i < children.length; i++) {
                    var child = children[i];
                    var tmpName = undefined;
                    if (child.nodeType == 1) {
                        tmpName = child.getAttribute("data-type-template");
                        if (tmpName) {
                            var rndId = Math.random().toString().replace(".","").replace(",","");
                            child.setAttribute("id", rndId);
                            element.typeTemplates[tmpName] = rndId;
                            document.body.appendChild(child);
                            console.log("template registered:" + tmpName );
                        }
                    }
                }
            }


            if (! element.nameTemplates) {
                element.nameTemplates = {};
                var children = element.childNodes;
                for(var i = 0; i < children.length; i++) {
                    var child = children[i];
                    var tmpName = undefined;
                    if (child.nodeType == 1) {
                        tmpName = child.getAttribute("data-name-template");
                        if (tmpName) {
                            var rndId = Math.random().toString().replace(".","").replace(",","");
                            child.setAttribute("id", rndId);
                            element.nameTemplates[tmpName] = rndId;
                            document.body.appendChild(child);
                            console.log("template registered:" + tmpName );
                        }
                    }
                }
            }
            fields = viewModel.fields || [];


            function _model() {
                for (var j in vModel) {
                    this[j] = vModel[j];
                };

                for(var j in viewModel) {
                    this[j] = viewModel[j];
                };

                console.log("Grid model created");
                var self = this;

                self.pageSize = ko.isObservable(viewModel.pageSize) ? viewModel.pageSize : ko.observable(viewModel.pageSize || 10);

                self.itemCount = ko.observable(100);

                self.currentPage = ko.observable(0);

                self.source = source;



                self.source.subscribe( function(){
                    self.sortColumn('');
                }, 'beforeChange');

                self.items =  viewModel.items || ko.observableArray([]);

                if (self.monitorItems) {
                    self.monitorItems(self.items);
                }

                self.objectsToDelete = ko.observableArray([]);
                self.objectsInEditMode = ko.observableArray([]);



                self.save =  function() {

                    console.dir("Saving changes: " + arguments);

                    var source = ko.utils.unwrapObservable(self.source);
                    console.log("Items in tracker:" + source.entityContext.stateManager.trackedEntities.length);
                    ccc = source.entityContext;
                    for(var i = 0; i < self.objectsToDelete().length; i++) {
                        console.log("items found");
                        var item = self.objectsToDelete()[i];
                        source.remove(item);
                    }
                    function doSave() {
                        source.entityContext.saveChanges( function() {
                            console.log("Items in tracker #2:" + source.entityContext.stateManager.trackedEntities.length);
                            self.refresh(Math.random());
                            self.objectsToDelete.removeAll();
                            self.objectsInEditMode.removeAll()
                        })
                    }

                    if (self.beforeSave) {
                        var r = self.beforeSave(source);
                        if (typeof r === 'function') {
                            r(
                                function() {
                                    doSave();
                                },
                                function() {
                                    console.log("aborted by client code");
                                }
                            )
                        } else {
                            doSave();
                        }

                    } else {
                        doSave();
                    }
                };



                self.pendingChanges = ko.computed( function() {
                    return this.objectsToDelete().length > 0 ||
                        this.objectsInEditMode().length > 0;
                }, this);

                self.pendingStatusInfo = function() {
                    var es = ko.utils.unwrapObservable(self.source);
                    if (!es) { return "-" };
                    return "Number of tracked changes: " + es.entityContext.stateManager.trackedEntities.length;
                }

                self.removeAll = function() {
                    var entitySet = ko.utils.unwrapObservable(self.source);
//                    es.removeAll( function() {
//                        alert("removed!");
//                    })

                    var keyname = entitySet.defaultType.memberDefinitions.getKeyProperties()[0].name;
                    entitySet.map("it." + keyname).toArray(function(ids) {
                        ids.forEach( function(id) {
                            var obj = { };
                            obj[keyname] = id;
                            entitySet.remove(obj);
                        });
                        entitySet.entityContext.saveChanges( function() {
                            self.refresh(Math.random());
                        })
                    });
                    //alert("it." + );
                };

                self.addNew = function() {
                    var es = ko.utils.unwrapObservable(self.source);
                    var o = new es.createNew();
                    o = o.asKoObservable();
                    var idx = self.items().length;



                    o.getColumns = function() {
                        var result = [];
                        for (var i = 0; i < self.columns().length; i++) {
                            var col = {
                                rowIndex: idx,
                                columnIndex: i,
                                value: this[self.columns()[i].name],
                                name: self.columns()[i].name,
                                metadata: self.columns()[i],
                                owner: this,
                                itemCommands: itemCommands
                            }
                            result.push(col);
                        }
                        return result;
                    }


                    var v = ko.utils.unwrapObservable(self.discriminatorValue),
                        f = ko.utils.unwrapObservable(self.discriminatorColumn);
                    if (v && f) {
                        console.log(f + ":" + v);
                        o[f](v);
                    }
                    if (self.defaultValues) {
                        for(var m in self.defaultValues) {
                            o[m](ko.utils.unwrapObservable(self.defaultValues[m]));
                        }
                    }
                    self.objectsInEditMode.push(o);
                    ko.utils.unwrapObservable(source).add(o);

                    if (self.afterAddNew) {
                        var r = self.afterAddNew( o, self );
                        if (typeof r === 'function') {
                            r(function(ok) {
                                ok(self.items.push(o));
                            });
                        } else {
                            self.items.push(o);
                        }
                    } else {
                        self.items.push(o);

                    }


                };



                var itemCommands = [
                    {
                        displayName: 'Edit',
                        commandName: 'edit',

                        visible: function( item ) {
                            return self.objectsInEditMode.indexOf(item) < 0;
                        },

                        execute: function( item ) {
                            var es = ko.utils.unwrapObservable(self.source);
                            es.attach(item);
                            self.objectsInEditMode.push(item);
                        }
                    },
                    {
                        displayName: 'Revert',
                        commandName: 'revert',

                        visible: function( item ) {
                            return self.objectsInEditMode.indexOf(item) > -1;
                        },

                        execute: function( item ) {
                            var es = ko.utils.unwrapObservable(self.source);
                            es.detach(item);
                            self.objectsInEditMode.remove(item);
                        }
                    },
                    {
                        displayName: 'Delete',
                        commandName : 'delete',

                        execute: function( item ) {
                            self.objectsToDelete.push(item);
                        },

                        visible: function( item ) {
                            return self.objectsToDelete.indexOf(item) < 0;
                        }


                    },
                    {
                        displayName: 'Undo delete',
                        commandName : 'undelete',

                        execute: function( item ) {
                            self.objectsToDelete.remove(item);
                        },

                        visible: function( item ) {
                            return self.objectsToDelete.indexOf(item) > -1;
                        }


                    }
                ].concat(viewModel.itemCommands || []);


                var cols = [];
                var sortColName = '';

                var srcval = ko.utils.unwrapObservable(self.source);
                if ( srcval !== undefined && srcval !== null)
                {
                    cols = getColumnsMetadata(srcval, fields, itemCommands);
                    sortColName = cols[0].name;
                };

                self.columns = ko.observableArray(cols);

                function getKoItemColumns(rowIndex) {
                    var result = [];
                    for (var i = 0; i < self.columns().length; i++) {
                        var col = {
                            rowIndex: rowIndex,
                            columnIndex: i,
                            value: this[self.columns()[i].name],
                            name: self.columns()[i].name,
                            metadata: self.columns()[i],
                            owner: this,
                            itemCommands: itemCommands
                        }
                        result.push(col);
                    }
                    return result;
                }

                self.extendItem = function(koItem) {
                    koItem.getColumns = getKoItemColumns;
                    if( self.itemExtender ) {
                        self.itemExtender( koItem );
                    }
                }

                self.sortColumn = ko.observable(sortColName);
                self.sortDirection = ko.observable(true);


                self.defaultValues = viewModel.defaultValues;

                self.columnNames = ko.computed( function() {
                    return this.columns().map( function(memDef) { return memDef.name });
                }, this);

                self.selectedItem = ko.observable();

                self.pages = ko.computed( function() {
                    return ko.utils.range(0, this.itemCount() / this.pageSize());
                }, this);

                self.goToNextPage = function() {
                    self.currentPage( self.currentPage() + 1);
                };

                self.goToPreviousPage = function() {
                    self.currentPage( self.currentPage() - 1);
                }

                //console.log("model builder:" + viewModel.discriminatorColumn);
                self.discriminatorColumn = viewModel.discriminatorColumn; // || ko.observable();
                self.discriminatorValue = viewModel.discriminatorValue; //|| ko.observable();

                self.refresh = ko.observable();

                self.itemsTrigger = ko.computed( function(){
                    if (ko.utils.unwrapObservable(this.source) == null) {
                        return;
                    }
                    var q = this.source();

                    var ref = this.refresh();

                    var column = ko.utils.unwrapObservable(this.discriminatorColumn);
                    var value = ko.utils.unwrapObservable(this.discriminatorValue);

                    if (column && !(value) ) {
                        return;
                    }

                    if (value  && column) {
                        q = q.filter("it." + column + " == '" + value + "'");
                    }

                    var sortColumn = this.sortColumn();

                    if (!q.defaultType.memberDefinitions["$" + sortColumn]) {
                        sortColumn = '';
                    }

                    return q
                        .order(sortColumn)
                        .skip(this.pageSize() * this.currentPage())
                        .take(this.pageSize())
                        .toArray(
                        function (entities) {
                            self.items.removeAll();
                            for(var i = 0; i < entities.length; i++) {
                                var item = entities[i];
                                var koItem = item.asKoObservable();
                                self.extendItem(koItem);
                                self.items.push( koItem );
                            }

                        }
                    );
                }, this);



                self.getTemplate =  function(propertyOwner, metadata) {
                    var nameSuffix = '';

                    if (! (metadata.resolvedName && metadata.stringName)) {
                        metadata.stringName = Container.getName(metadata.type);
                        metadata.resolvedName = Container.resolveName(metadata.type);
                    };

                    if (self.objectsInEditMode.indexOf(propertyOwner) > -1) {
                        var templateId;
                        return element.nameTemplates[metadata.name + "-editor"] ||
                            element.typeTemplates[metadata.stringName + "-editor"] ||
                            element.typeTemplates[metadata.resolvedName + "-editor"] ||
                            (document.getElementById('jay-data-grid-' + metadata.resolvedName + '-editor') ?
                                'jay-data-grid-' + metadata.resolvedName + '-editor' :
                                'jay-data-grid-generic-editor');
                        //nameSuffix = '-editor';
                    } else {

                    };



                    var named = metadata.name + '-display';
                    var f = element.nameTemplates[named] || 'xxx';

                    var result = element.nameTemplates[metadata.name + '-display'] ||
                        element.typeTemplates[metadata.stringName + '-display'] ||
                        element.typeTemplates[metadata.resolvedName + '-display'] ||
                        (document.getElementById('jay-data-grid-' + metadata.resolvedName + '-display') ?
                            'jay-data-grid-' + metadata.resolvedName + '-display' :
                            'jay-data-grid-generic-display');


                    return result;

                }



            }


            var receiveEvents = viewModel.receiveEvents !== false;


            while(element.firstChild) {
                ko.removeNode(element.firstChild);
            }

            var gridTemplateName = allBindings.gridTemplate || "jay-data-grid";

            var container = element.appendChild( document.createElement("div"));

            ko.renderTemplate(  gridTemplateName,
                new _model(),
                {templateEngine: templateEngine},
                container,
                "replaceNode");



            //source.take(200).toArray(model.items);
        }

    }

})();