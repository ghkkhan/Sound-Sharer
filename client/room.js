var fileName = "placeholder";
var fire;
window.onload = function() {
    document.body.className += " magic";
}

///////////////////////////////////////// SOCKET STUFF
var socket = io.connect();

socket.emit('enter_room', {
    rName: localStorage.rName,
    uName: localStorage.uName
})