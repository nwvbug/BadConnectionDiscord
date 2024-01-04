var connection;
var socket = io.connect("http://192.168.86.30:5000");
socket.on("connecting", function() {
    console.log("Server reached & handshake successful.")
});
socket.on('connect', function() {
    socket.emit('connecting', 'connection established');
});

class Connection{

    constructor(selftoken, uname){
        this.selftoken = selftoken
        this.username = uname
        this.establish();
    }

    establish(){
        
        let onConnection = {
            "intents":"startup",
            "message":null,
            "channel":null,
            "discordtoken":this.selftoken,
            "username":this.username
        }
        socket.emit("json", JSON.stringify(onConnection))
        socket.on("json", function(data){
            processMessage(data)
        });
        
    }

    processMessage(message){
        let data = message.data;
        let parsed = JSON.parse(data);
        if (parsed.intents == "message"){
            messageRecieved(parsed);
        } else if (parsed.intents == "startup"){
            console.log("User setup complete. NWVBUG Session Active.");
            
        } else if (parsed.intents == "error"){
            console.error("Something went wrong.");
        } else {
            console.error("Unrecognized intents. Bad request.")
        }
    }

    sendMessage(message, channel){
        let formattedMessage = {
            "intents":"message",
            "message":message,
            "channel":channel,
            "discordtoken":this.selftoken,
            "username":this.username
        }
        socket.send("json", formattedMessage, json=true)
    }


}

function connect(){
    token = document.getElementById("tk").value;
    username = document.getElementById("un").value;
    console.log("sending: "+token+" | "+username)
    cn = new Connection(token, username);
    connection = cn;
}