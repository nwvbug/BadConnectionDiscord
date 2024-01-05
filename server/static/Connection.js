var connection;
var socket = io.connect("http://192.168.86.30:5000");
var currentDm = "";
socket.on("starting_up", function() {
    console.log("Server reached & handshake successful.")
    console.log("Awaiting user credentials")
});
socket.on('connect', function() {
    console.log("Sending initial connect handshake to server")
    socket.emit('starting_up', 'connection established');
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
        window.onbeforeunload = function (event) {
            console.log("Sending logoff...")
            socket.emit("logging_off", {"username":this.username})
        }
        hideCredentialsShowLoading()
    }

}

function connect(){
    token = document.getElementById("tk").value;
    username = document.getElementById("un").value;
    //console.log("sending: "+token+" | "+username)
    cn = new Connection(token, username);
    connection = cn;
}

function processMessage(message){
        if (message.intents == "message"){
            messageRecieved(message);
        } else if (message.intents == "startup"){
            console.log("User setup complete. NWVBUG Session Active.");
            document.getElementById("loadingdesc").innerText = "Authenticating your Discord account..."
        } else if (message.intents == "error"){
            console.error("Something went wrong.");
        } else if (message.intents == "init_client"){
            console.log("Discord authentication complete. Discord Session Active.")
            
            populate(message)
        }else {
            console.error("Unrecognized intents. Bad request. Intents: "+message.intents)
        }
}

function messageRecieved(message){
    console.log("Recieved Message from "+message.author.split("#")[0])
    if (message.author.split("#")[0] == currentDm){
        toAppend = `
                <div class="chat-message-container" data-id="${message.id}">
                    <div class="author">${message.author.split("#")[0]}</div>
                    <div class="chat-message">${message.content}</div>
                </div>    
            `
        document.getElementById("messageBox").innerHTML += toAppend;
        document.getElementById("messageBox").scrollTo(0, document.getElementById("messageBox").scrollHeight);

    } else {
        console.log("receieved from "+message.author.split("#")[0]+" but user is on "+currentDm)
    }
}

function prepMessage(){
    sendMessage(document.getElementById("messageBar").value, currentDm)
    document.getElementById("messageBar").value = "";
    

}

function sendMessage(message, to){
    let formattedMessage = {
        "intents":"message",
        "message":message,
        "to":to,
        "username":connection.username
    }
    socket.emit("json", JSON.stringify(formattedMessage))
    toAppend = `
        <div class="chat-message-container-self" data-id="">
            <div class="chat-message self">${message}</div>
        </div>    
    `
    document.getElementById("messageBox").innerHTML += toAppend;
    document.getElementById("messageBox").scrollTo(0, document.getElementById("messageBox").scrollHeight);
}

function hideCredentialsShowLoading(){
    document.getElementById("signinContainer").style.display = "none"
    document.getElementById("loader").style.display = "flex"
    document.getElementById("instructions").style.display = ""
}

function populate(list){
    parent = document.getElementById("tabs")
    console.log(list.dmsList)
    toAppend = ""
    for (var i = 0; i<list.dmsListLength; i++){
        var html = `
        <div class="tab" id='${list.dmsList[i]}' onclick='openDM("${list.dmsList[i]}")'>
            ${list.dmsList[i]}
        </div>
        `
        toAppend = toAppend+html;
    }
    parent.innerHTML += toAppend;
    document.getElementById("loader").style.display = "none"
}

function openDM(to){
    currentDm = to;
    document.getElementById("homescreen").style.display = "none";
    document.getElementById("loader").style.display = "flex"
    document.getElementById("loadingdesc").innerText = "Getting your messages with "+to
    elems = document.getElementsByClassName('tab')
    for(var i = 0; i<elems.length; i++){
        elems[i].className = "tab"
    }
    document.getElementById(to).classList += " tab-selected"
    req = {
        "intents":"openDM",
        "username":connection.username,
        "to":to
    }
    socket.on("openDM", function(data){
        console.log("DM Data retrieved")
        displayDMs(data)
    })
    socket.emit("json", JSON.stringify(req))

}

function displayDMs(list){
    console.log(list);
    var container = document.getElementById("messageBox")
    container.innerHTML = ""
    var appendString;
    for (var i = 0; i<list.length; i++){
        message = list[i]
        var toAppend;
        if (message.content == ""){
            message.content = "[image]"
        }
        if (message.author == connection.username){
            toAppend = `
                <div class="chat-message-container-self" data-id="${message.id}">
                    <div class="chat-message self">${message.content}</div>
                </div>    
            `
        } else {
            toAppend = `
                <div class="chat-message-container" data-id="${message.id}">
                    <div class="author">${message.author}</div>
                    <div class="chat-message">${message.content}</div>
                </div>    
            `
        }
        appendString = toAppend+appendString;
    }
    appendString = `<div class="largerButton" style='margin-bottom:50px; text-align:center;'>Load more messages</div>` + appendString
    container.innerHTML += appendString;
    document.getElementById("inpt").style.display = "flex"
    container.scrollTo(0, container.scrollHeight);
    document.getElementById("loader").style.display = "none"
    document.getElementById("loadingdesc").innerText = "Loading"
}