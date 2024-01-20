var connection = null;
var socket = io.connect(window.location.href);
var currentDm = "";
socket.on("starting_up", function() {
    console.log("Server reached & handshake successful.")
    console.log("Awaiting user credentials")
});
socket.on('connect', function() {
    console.log("Sending initial connect handshake to server")
    socket.emit('starting_up', 'connection established');
});
socket.on('reset_id', function(data) {
    console.log("Server forced ID reset")
    window.localStorage.setItem("user_id", null)
    toRem = document.getElementsByClassName("normalLogin")
    for (var i = 0; i<toRem.length; i++){
        toRem[i].style.display=""
    }
    document.getElementById("signinContainer").style.display = "flex"
    loadingOff()
    document.getElementById("instructions").style.display = "none"
    document.getElementById("tokenDirections").innerText = "Your nwvbugFast sign-in has expired. Please re-enter your Discord token. This happens periodically."
    toAdd = document.getElementsByClassName("altLogin")
    for (var i = 0; i<toAdd.length; i++){
        toAdd[i].style.display="none"
    }
})

function checkIfUsed(){
    if(window.localStorage.getItem("user_id") != null && window.localStorage.getItem("user_id") != ""){
        toRem = document.getElementsByClassName("normalLogin")
        for (var i = 0; i<toRem.length; i++){
            toRem[i].style.display="none"
        }
        toAdd = document.getElementsByClassName("altLogin")
        for (var i = 0; i<toAdd.length; i++){
            toAdd[i].style.display=""
        }
        document.getElementById("altName").innerText = window.localStorage.getItem("username")
    }
}

function switchUser(){
    window.localStorage.setItem("user_id", null)
    window.localStorage.setItem("username", null)
    toRem = document.getElementsByClassName("normalLogin")
    for (var i = 0; i<toRem.length; i++){
        toRem[i].style.display=""
    }
    toAdd = document.getElementsByClassName("altLogin")
    for (var i = 0; i<toAdd.length; i++){
        toAdd[i].style.display="none"
    }
}

class Connection{

    constructor(selftoken){
        this.selftoken = selftoken
        this.establish(true);
    }

    establish(isNew){
        let onConnection
        if (window.localStorage.getItem("user_id") != null && window.localStorage.getItem("user_id") != "" && window.localStorage.getItem("user_id")!="null"){
            console.log("user id is "+window.localStorage.getItem("user_id")+", so reconnecting")
            onConnection = {
                "intents":"startup",
                "message":null,
                "channel":null,
                "discordtoken":this.selftoken,
                "user_id":window.localStorage.getItem("user_id")
            }
        } else {
            onConnection = {
                "intents":"startup",
                "message":null,
                "channel":null,
                "discordtoken":this.selftoken,
            }
        }
        socket.emit("json", JSON.stringify(onConnection))
        if (isNew){
            socket.on("json", function(data){
                processMessage(data)
            });
            window.onbeforeunload = function (event) {
                console.log("Sending logoff...")
                socket.emit("logging_off", {"username":this.user_id})
            }
        }
        hideCredentialsShowLoading()
    }

    updateInfo(tk){
        this.selftoken = tk;
    }

}

function connect(str){
    var token;
    if (str == 'ovr'){
        token = "NWVBUG OVERRIDE VIA USER_ID";
    }
    else {
        token = document.getElementById("tk").value;
        //console.log("sending: "+token+" | "+username)
    }
    if (connection != null){
        connection.updateInfo(token)
        connection.establish(false)
    }
    else {
        cn = new Connection(token);
        connection = cn;
    }
}

function processMessage(message){
        if (message.intents == "message"){
            messageRecieved(message);
        } else if (message.intents == "startup"){
            console.log("User setup complete. NWVBUG Session Active.");
            console.log("Storing user id...")
            window.localStorage.setItem("user_id", message.user_id)
            connection.user_id = message.user_id
        } else if (message.intents == "error"){
            console.error("Something went wrong.");
        } else if (message.intents == "init_client"){
            var wage = document.getElementById("messageBar");
            wage.addEventListener("keydown", function (e) {
                if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
                    prepMessage()
                }
            });
            console.log("Discord authentication complete. Discord Session Active.")
            
            populate(message)
        }else {
            console.error("Unrecognized intents. Bad request. Intents: "+message.intents)
        }
}

function messageRecieved(message){
    console.log("Recieved Message from "+message.author.split("#")[0])
    if (message.author.split("#")[0] == currentDm){
        list = document.getElementById("messageBox").children;
        prev = list[list.length-1];
        var toAppend;
        if (prev.className == "chat-message-container-self"){
            toAppend = `
            <div class="chat-message-container" data-id="${message.id}">
                <div class="chat-message">${message.content}
            `
        }
        else {
            toAppend = `
            <div class="chat-message-container" data-id="">
                <div class="chat-message" style='border-radius: 5px 20px 20px 20px'>${message.content}
            `
            prev.children[0].style.borderBottomLeftRadius = "5px"
            prev.children[0].style.marginBottom = "2px"
        }
        
        if (message.hasOwnProperty("images")){
            for (var j = 0; j<message.images.length; j++){
                toAppend = toAppend + `
                <img src='${message.images[j].url}' style='max-width:25vw; max-height:400px; border-radius:10px;'>
            `
            }
        }
        toAppend = toAppend + "</div></div>"
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
        "username":connection.username,
        "user_id":connection.user_id
    }
    socket.emit("json", JSON.stringify(formattedMessage))
    list = document.getElementById("messageBox").children;
    prev = list[list.length-1];
    var toAppend;
    if (prev.className == "chat-message-container"){
        toAppend = `
        <div class="chat-message-container-self" data-id="">
            <div class="chat-message self">${message}</div>
        </div>    
        `
    }
    else {
        toAppend = `
        <div class="chat-message-container-self" data-id="">
            <div class="chat-message self" style='border-radius: 20px 5px 20px 20px'>${message}</div>
        </div>    
        `
        prev.children[0].style.borderBottomRightRadius = "5px"
        prev.children[0].style.marginBottom = "2px"
    }
    
    document.getElementById("messageBox").innerHTML += toAppend;
    document.getElementById("messageBox").scrollTo(0, document.getElementById("messageBox").scrollHeight);
}

function hideCredentialsShowLoading(){
    console.log("hiding sign in screen")
    document.getElementById("signinContainer").style.display = "none"
    loadingOn()
    document.getElementById("instructions").style.display = ""
}

function populate(list){
    parent = document.getElementById("tabs")
    connection.username = list.username
    window.localStorage.setItem("username", connection.username)
    console.log(list.dmsList)
    toAppend = ""
    for (var i = 0; i<list.dmsListLength; i++){
        var html = `
        <div class="tab" id='${list.dmsList[i]}' onclick='openDM("${list.dmsList[i]}")'>
            ${list.dmsList[i]}
            <div style='border-radius:100000px; background-color:red; width:10%; height:10%;'></div>
        </div>
        `
        toAppend = toAppend+html;
    }
    parent.innerHTML += toAppend;
    loadingOff()
}

function openDM(to){
    currentDm = to;
    document.getElementById("homescreen").style.display = "none";
    loadingOn();
    elems = document.getElementsByClassName('tab')
    for(var i = 0; i<elems.length; i++){
        elems[i].className = "tab"
    }
    document.getElementById(to).classList += " tab-selected"
    req = {
        "intents":"openDM",
        "user_id":connection.user_id,
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
    container.innerHTML = null
    var appendString = ""
    for (var i = 0; i<list.length; i++){
        message = list[i]
        var toAppend;
        console.log(message)
        
        if (message.author == connection.username){
            toAppend = `
                <div class="chat-message-container-self" data-id="${message.id}">        
            `
            authorName = `<div class="author">${message.author}</div>`

            if (i+1 < list.length && list[i+1].author == message.author){
                if (i-1>=0 && list[i-1].author == message.author){
                    toAppend = toAppend + `<div class="chat-message self" style='margin-bottom:2px; border-radius:20px 5px 5px 20px'>${message.content}`
                }
                else {
                    toAppend = toAppend + `<div class="chat-message self" style=' border-radius:20px 5px 20px 20px'>${message.content}`
                }
            } else {
                if (i-1>=0 && list[i-1].author == message.author){
                    toAppend = toAppend + `<div class="chat-message self" style='margin-bottom:2px; border-radius:20px 20px 5px 20px'>${message.content}`
                }
                else {
                    toAppend = toAppend + `<div class="chat-message self">${message.content}`
                }

            }
            if (message.hasOwnProperty("images")){
                for (var j = 0; j<message.images.length; j++){
                    toAppend = toAppend + `
                    <img src='${message.images[j].url}' style='max-width:25vw; max-height:400px; border-radius:10px;'>
                `
                }
            }
            
        } else {
            toAppend = `
                <div class="chat-message-container" data-id="${message.id}">        
            `
            authorName = `<div class="author">${message.author}</div>`

            if (i+1 < list.length && list[i+1].author == message.author){
                if (i-1>=0 && list[i-1].author == message.author){
                    toAppend = toAppend + `<div class="chat-message" style='margin-bottom:2px; border-radius:5px 20px 20px 5px'>${message.content}`
                }
                else {
                    toAppend = toAppend + `<div class="chat-message" style=' border-radius:5px 20px 20px 20px'>${message.content}`
                }
            } else {
                if (i-1>=0 && list[i-1].author == message.author){
                    toAppend = toAppend + authorName + `<div class="chat-message" style='margin-bottom:2px; border-radius:20px 20px 20px 5px'>${message.content}`
                }
                else {
                    toAppend = toAppend + authorName + `<div class="chat-message">${message.content}`
                }

            }
            if (message.hasOwnProperty("images")){
                for (var j = 0; j<message.images.length; j++){
                    toAppend = toAppend + `
                    <img src='${message.images[j].url}' style='max-width:25vw; max-height:400px; border-radius:10px;'>
                `
                }
            }
        }
        toAppend = toAppend + "</div></div>"
        appendString = toAppend+appendString;
    }
    appendString = `<div class="largerButton" style='margin-bottom:50px; text-align:center;'>Load more messages</div>` + appendString
    container.innerHTML += appendString;
    document.getElementById("inpt").style.display = "flex"
    container.scrollTo(0, container.scrollHeight);
    loadingOff()
}

var loadingInterval;
function loadingOn(){
    document.getElementById("loader").style.display = "flex";
    document.getElementById("loadingdesc").innerText = loadingSayings[parseInt(Math.random()*(loadingSayings.length-1))];
    loadingInterval = setInterval(getLoadingSaying, 4000);
}

function loadingOff(){
    clearInterval(loadingInterval)
    document.getElementById("loader").style.display = "none";
}

function getLoadingSaying(){
    document.getElementById("loadingdesc").setAttribute("class", "loader-fade");

    setTimeout(() => {
        document.getElementById("loadingdesc").innerText = loadingSayings[parseInt(Math.random()*(loadingSayings.length-1))];
        document.getElementById("loadingdesc").setAttribute("class", "loader-show");
    }, 500)
}

var loadingSayings = [
    "Connecting you to other humans... or sentient toasters, whichever comes first.",
    "Patience is a virtue, except when it comes to loading screens. In that case, it's a minor inconvenience.",
    "Fetching your server... don't worry, we haven't lost it in the void... yet.",
    "Did you know the average person spends 2 years of their life waiting for loading screens? Don't worry, we're working on reducing that. To zero. Eventually.",
    "Taking a minute to load? Don't worry, that's just us perfecting your entrance music.",
    "Your chat is almost here. Think of it as digital purgatory, but with better wi-fi.",
    "Downloading server rules… Please read them. Just kidding, nobody does. But maybe you should?",
    "Shuffling virtual chairs… don't worry, we always leave the comfy one for you.",
    "Whistling to the server hamsters… they get cranky if they don't hear a tune.",
    "If you hear whispering during this loading screen, it's just the servers having a philosophical debate about the nature of data. Don't judge, they're trying their best.",
    "Loading... making sure the chat pixels are perfectly aligned.",
    "Walking to Discord HQ",
    "Folding your messages like origami masterpieces.",
    "Launching the carrier pigeons"
]