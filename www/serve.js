var c = require('connect');
var app = c();

app.use("/", c.static("/home/nochtap/GitRepo/jayscrum/www"));
app.listen(8080);
