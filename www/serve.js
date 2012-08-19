var c = require('connect');
var app = c();

app.use("/", c.static("/home/nochtap/GitRepo/jayscrum/JayScrum"));
app.listen(8080);