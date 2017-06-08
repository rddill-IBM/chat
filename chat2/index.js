let express = require('express'),
    sqlite3 = require('sqlite3'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    iconv = require('iconv-lite'),
    path = require('path'),
    sassMiddleware = require('node-sass-middleware'),
    fs = require('fs'),
    db = new sqlite3.Database('./chat/history.db');
  
    app.use('/chat', require("./chat/index"));
http.listen(3000);