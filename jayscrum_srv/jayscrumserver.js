var $data = require('jaydata');
var ctx = require('./jayscrumcontext.js');
var $test = {};
var connect = require('connect');
var app = require('connect')();

app.use(connect.multipart());
app.use(connect.urlencoded());
app.use(connect.json());
app.use(connect.bodyParser());
app.use(connect.query());

ISODate = function(date){
    return new Date(date);
}

ObjectID = function(id){
    console.log('objectid:'+id);
    return id;
};


app.use('/', function(req, res){
    console.log('');console.log('');console.log('');
    console.log('Request start: '+req.method);
	if(req.url === "/favicon.ico"){
		console.log("get favicon");
		res.writeHead(401,{});
        res.end();
	}else{
	    //console.log(JSON.stringify(req.url));
	    if (req.method === 'GET'){
		$test.context = new LightSwitchApplication.ApplicationData({ name: 'mongoDB', databaseName: 'jayScrum' });
		$test.context.onReady(function(db){
		    var callback = function(result){
		        res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
                    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
                });
                res.write(JSON.stringify(result));
		        res.end();
		    };
		    
		    var compiled = req.query.expression || {};
		    
		    var qs = db[req.query.entitySet] || db;
		    if (compiled.$serviceOperation){
		        var fn = qs[compiled.$serviceOperation.name];
		        if ((typeof fn.returnType.isAssignableTo === 'function' && fn.returnType.isAssignableTo($data.Queryable))){
		            qs = fn.apply(this, compiled.$serviceOperation.params);
		        }else{
		            callback(fn.apply(this, compiled.$serviceOperation.params));
		        }
		    }else{
		        /*if (compiled.$include){
		            for (var i = 0; i < compiled.$include.length; i++){
		                qs += '.include("' + compiled.$include[i] + '")';
		            }
		        }*/
	/*console.log("//////////");
	console.log(JSON.stringify(compiled));
	console.log("//////////");*/
		        if (compiled.$filter) qs = qs.filter(compiled.$filter);
		        if (compiled.$order){
		            /*for (var i = 0; i < compiled.$order.length; i++){
		console.log(JSON.stringify(compiled.$order));
		console.log(compiled.$order[i].fn);
		                qs = qs[(JSON.parse(compiled.$order[i].direction) ? 'orderBy' : 'orderByDescending')](compiled.$order[i]);
		            }*/
				 qs = qs[JSON.parse(compiled.$order[1]) ? 'orderBy' : 'orderByDescending'](compiled.$order[0]);
		        }
		        if (compiled.$take) qs = qs.take(compiled.$take);
		        if (compiled.$skip) qs = qs.skip(compiled.$skip);
		        if (compiled.$length) qs.length(callback);
		        else qs.toArray(callback);
		    }
		});
	    }else if (req.method === 'POST'){
		$test.context = new LightSwitchApplication.ApplicationData({ name: 'mongoDB', databaseName: 'jayScrum' });
		$test.context.onReady(function(db){
		    var callback = $data.typeSystem.createCallbackSetting({
		        success: function(cnt){
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
                        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
                    });
		            res.write(cnt.toString());
		            res.end();
		        },
		        error: function(err){
		            res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'X-PINGOTHER, Content-Type',
                        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
                    });
                    res.write('ohoh');
		            res.end();
		        }
		    });
		    
		    var collections = JSON.parse(req.body.items);
		    
		    for (var es in collections){
		        var c = collections[es];
		        if (c.insertAll && c.insertAll.length){
		            for (var i = 0; i < c.insertAll.length; i++)
		                db[es].add(c.insertAll[i]);
		        }
		        
		        if (c.removeAll && c.removeAll.length){
		            for (var i = 0; i < c.removeAll.length; i++)
		                db[es].remove(c.removeAll[i]);
		        }
		        
		        if (c.updateAll && c.updateAll.length){
		            for (var i = 0; i < c.updateAll.length; i++){
		                var item = new db[es].createNew(c.updateAll[i]);
		                db[es].attach(item);
		                item.entityState = $data.EntityState.Modified;
		            }
		        }
		    }
		    
		    console.log(JSON.stringify(collections));
		    db.saveChanges(callback);
		});
	    }
	}
});

app.listen(3000);
console.log('Application setup finish, jaydata version: '+$data.version);
