var connection;
var selectedChannelId;
function sendMessage(){
    connection.sendMessage(document.getElementById("messageBar").value, selectedChannelId);
}

function messageRecieved(message){
    console.log(message.author+" sent a message saying "+message.contents);
}