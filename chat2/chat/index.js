let express = require('express'),
    router = express.Router(),
    sqlite3 = require('sqlite3'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    iconv = require('iconv-lite'),
    path = require('path'),
    sassMiddleware = require('node-sass-middleware'),
    fs = require('fs'),
    db = new sqlite3.Database('./history.db');

// DB
if (!fs.existsSync(__dirname + '/history.db'))
    db.run("CREATE TABLE message (id INTEGER PRIMARY KEY AUTOINCREMENT,txt TEXT)");


// VIEWS SETTINGS
console.log("__dirname is: "+__dirname);

app.set('views', __dirname + '/tpl');
app.engine('jade', require('jade').renderFile);
app.set('view engine', 'jade');
app.use(sassMiddleware({
    src: path.join(__dirname, '/tpl'),
    dest: path.join(__dirname, '/tpl'),
    debug: true,
    indentedSyntax: true,
    outputStyle: 'compressed',
}));
//app.use(express.static(__dirname + '/tpl'));


// ROUTER
router.get("/", function (req, res) {
	try{
		res.render('page');
	} catch(err){
		console.log(err)
	}


});


// DOP FUNC
function addMesToDB(txt) {
    var stmt = db.prepare("INSERT INTO message (txt) VALUES (?)");
    stmt.run(txt);
    stmt.finalize();
}
function loadLast10() {
    db.each("SELECT * FROM message LIMIT 10", function(err, row) {
        io.emit('new message show', row.txt);
    });
}
function loadAll() {
    db.each("SELECT * FROM message", function(err, row) {
        io.emit('new message show', row.txt);
    });
}
function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}


// EMIT
let name = '';
io.on('connection', function(socket){
    io.sockets.on('connection', function (client) {});
    socket.on('login', function(msg){
        if(msg == '888') name = 'Оксана';
        else if(msg == '8888') name = 'Виталий';
        if(msg == '888' || msg == '8888') {
            addMesToDB(getDateTime() + ' <span class="name">Вошел пользователь: ' + name + '</span>');
            loadLast10();
        }
    });
    socket.on('loadAll', function(msg){
        loadAll();
    });
    socket.on('new message send', function(msg){
        io.emit('new message show', getDateTime() + ' <span class="name">' + name + ':</span> <span class="msg">' + msg + '</span>');
        addMesToDB(getDateTime() + ' <span class="name">' + name + ':</span> ' + msg);
    });
    socket.on('disconnect', function () {
        io.emit('new message show', getDateTime() + '  <span class="name">Вышел пользователь: ' + name + '</span>');
        addMesToDB(getDateTime() + '  <span class="name">Вышел пользователь: ' + name + '</span>');
    });
});

module.exports = router;
