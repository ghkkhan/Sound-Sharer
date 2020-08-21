//joinBool is a boolean value... if false, the user is creating a new room
var joinBool = false;


var room_name = "room";
var user_name = "user";

creating = () => {
    document.getElementById("create_button").className = "switch disabled";
    document.getElementById("join_button").className = "switch enabled";
    document.getElementById("mode").innerHTML = "Create Room";
    joinBool = false;

}
joining = () => {
    document.getElementById("create_button").className = "switch enabled";
    document.getElementById("join_button").className = "switch disabled";
    document.getElementById("mode").innerHTML = "Join Room";
    joinBool = true;
}
enter = () => {
    room_name = document.getElementById("rName").value;
    user_name = document.getElementById("uName").value;

    //the data is stored... send to server-side through socket or something...
    // change page to either the newly created room or go to an existing room...
}


///////////////////////////////////////// SOCKET STUFF
var socket = io.connect();

test = document.getElementById('create_button');
test.addEventListener('click', ()=>{
    console.log('hi')
    socket.emit('test')
})

// create room handler


function create_room(rName, uName){
    socket.emit('create_room', {
        rName: rName,
        uName: uName
    });
};

// join room handler
function join_room(rName, uName){
    socket.emit('join_room', {
        rName: rName,
        uName: uName
    });
};