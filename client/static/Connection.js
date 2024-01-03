class Connection{

    constructor(selftoken, uname){
        this.selftoken = selftoken
        this.username = uname
        this.establish();
    }

    establish(){
        this.websocket = new WebSocket("ws://localhost:8765")
        let onConnection = {
            "intents":"startup",
            "message":null,
            "channel":null,
            "discordtoken":this.selftoken,
            "username":this.username
        }
       this.websocket.addEventListener("open", (event) => {
           this.websocket.send(JSON.stringify(onConnection));
        })
       this.websocket.addEventListener("message", (event) => {
            console.log("Message from server.");
            this.processMessage(event);

        })
        
    }

    processMessage(message){
        let data = message.data;
        let parsed = JSON.parse(data);
        if (parsed.intents == "message"){
            messageRecieved(parsed);
        } else if (parsed.intents == "startup"){
            if (parsed.message == "Connected to Lye"){
                console.log("Connection to Lye Successful");
            } else if (parsed.message == "Connected to Discord"){
                console.log("Lye proxy connected to Discord Successfully");
            }
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
        this.websocket.send(formattedMessage)
    }


}

function connect(){
    token = document.getElementById("tk").value;
    username = document.getElementById("un").value;
    console.log("sending: "+token+" | "+username)
    cn = new Connection(token, username);
    connection = cn;
}