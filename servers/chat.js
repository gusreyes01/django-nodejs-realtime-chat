var http = require('http');

var server = http.createServer(function(request, response){
    console.log('Create Server');
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write('Socket.io server up');
    response.end();
}).listen(4000);

var io = require('socket.io').listen(server);
var cookie_reader = require('cookie');
var querystring = require('querystring');
 
 // Antes de 1.0
// var redis = require('socket.io/node_modules/redis');


// Excluimos redis
var redis = require('redis');

var sub = redis.createClient();

//Subscribe to the Redis chat channel
sub.subscribe('chat');
 
// Antes de 1.0
//Configure socket.io to store cookie set by Django
/*
io.configure(function(){
    io.set('authorization', function(data, accept){
        if(data.headers.cookie){
            data.cookie = cookie_reader.parse(data.headers.cookie);
            return accept(null, true);
        }
        return accept('error', false);
    });
    io.set('log level', 1);
});
*/

var sockets = {};
var users = {};
var connectCounter = 0;
var handshakeData;


 io.use(function(socket, next) {
  var handshakeData = socket.request;
    if(handshakeData.headers.cookie){
        // if()
        handshakeData.cookie = cookie_reader.parse(handshakeData.headers.cookie);
        connectCounter++;
        var user_id = socket.handshake.query.user_id;
        users[user_id] = socket.id;
        next();
    }else{
        console.log("Not authorized",handshakeData.headers.cookie );
    next(new Error('not authorized'));
    }
  // make sure the handshake data looks good as before
  // if error do this:
    // 
  // else just call next
  
});

    //Recibimos mensaje de Redis(Django) como json y lo enviamos al cliente
    sub.on('message', function(channel, message){
        console.log(message);
        var json = JSON.parse(message);
        var rec_user_id = json.rec_user_id;
        // socket.send(message);
        if (rec_user_id){
            // Obtenemos el socket id de la persona a quien va dirigido
            socketid = users[rec_user_id];
            // Usamos emit en lugar de send por ser mas completo  http://stackoverflow.com/questions/11498508/socket-emit-vs-socket-send

            io.to(socketid).emit('chat_receive', json);
            var clients = Object.keys(io.engine.clients);
        }else{
            //Para todos los usuarios
            io.emit('message_receive', json.message);
        }


    });

io.sockets.on('connection', function (socket) {

// var clients = findClientsSocket(null, '/') ;
    
    // console.log(connectCounter);





    
    //Client is sending message through socket.io
    socket.on('send_message', function (message) {
        console.log(message);
        values = querystring.stringify({
            comment: message.Message,
            UserToId: message.UserToId,
            sessionid: socket.handshake.query.sessionid,
        });
        
        var options = {
            host: 'localhost',
            port: 9000,
            path: '/node_api',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': values.length
            }
        };
        //Send message to Django server
        var req = http.request(options, function(res){
            res.setEncoding('utf8');
            //Print out error message
            res.on('data', function(message){     
                if(message != 'Everything worked :)'){
                    console.log("Error :"+String(message));
                }
            });
        });
        // Escribimos a Django por HTTP POST
        req.write(values, function(err) { req.end(); });
        req.end();

    });

socket.on('disconnect', function() {
    connectCounter--;
    socket.removeAllListeners("message");
} );


});


/*
function findClientsSocket(roomId, namespace) {
    var res = [], ns = io.of(namespace ||"/");    // the default namespace is "/"

    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId) ;
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            } else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}
*/
