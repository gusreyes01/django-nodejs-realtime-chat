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
// io.configure(function(){
//     io.set('authorization', function(data, accept){
//         if(data.headers.cookie){
//             data.cookie = cookie_reader.parse(data.headers.cookie);
//             return accept(null, true);
//         }
//         return accept('error', false);
//     });
//     io.set('log level', 1);
// });

var sockets = {};
var users = {};
var connectCounter = 0;
var handshakeData;


 io.use(function(socket, next) {
  var handshakeData = socket.request;
    if(handshakeData.headers.cookie){
        handshakeData.cookie = cookie_reader.parse(handshakeData.headers.cookie);
        connectCounter++;
        var user_id = socket.handshake.query.user_id;

        var bandera_con = false;
        for(var x in users) {
            if(users[x] === user_id) {
                // El usuario tiene otra pestaña abierta por lo que activamos la bandera para no emitir mensaje
                bandera_con = true;
                break;
            }
        }

        if(!(bandera_con)){
            // Cambiamos a estatus online en conexion de usuario
            var user_status = {};
            user_status.user_id = user_id;
            user_status.status = "is-online";
            io.emit('status_change', user_status);            
        }

        users[socket.id] = user_id;
        console.log(users);

        socket.emit("on_connect", users);

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

        for (var x in users) {
            if (users[x] === String(rec_user_id)) {

                // Obtenemos el socket id de la persona a quien va dirigido
                socketid = x;
                // Usamos emit en lugar de send por ser mas completo  http://stackoverflow.com/questions/11498508/socket-emit-vs-socket-send
                io.to(socketid).emit('chat_receive', json);
                var clients = Object.keys(io.engine.clients);

            }
        }

    });

io.sockets.on('connection', function (socket) {

var clients = findClientsSocket(null, '/') ;
    
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

    // Se llama al desconectar el socket
    socket.on('disconnect', function() {
        setTimeout(function() {

            var user_id = socket.handshake.query.user_id;
            delete users[socket.id];

            var bandera_disc = false;

            for (var x in users) {
                if (users[x] === user_id) {
                    // El usuario tiene otra pestaña abierta por lo que activamos la bandera para no emitir mensaje
                    bandera_disc = true;
                    break;
                }
            }

            if (!(bandera_disc)) {
                // Cambiamos a estatus offline en desconexion de usuario
                var user_status = {};
                user_status.user_id = user_id;
                user_status.status = "is-offline";
                io.emit('status_change', user_status);
                connectCounter--;
            }

            //console.log(users);

            socket.removeAllListeners("message");

            }, 4000);

        });

    

});



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
