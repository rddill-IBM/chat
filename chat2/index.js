let express = require('express'),
    app = express(),
    http = require('http').Server(app),
    cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv();;

    app.set('appName', 'chat');
    app.set('port', appEnv.port);
    app.set('views', __dirname + '/chat/tpl');
    app.engine('jade', require('jade').renderFile);
    app.set('view engine', 'jade');
    app.use('/', require("./chat/index"));

    var server = app.listen(app.get('port'), function() {console.log(app.get('appName')+' is Listening on port %d', server.address().port);});
//http.listen(3000);
