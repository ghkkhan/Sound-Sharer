//joinBool is a boolean value... if false, the user is creating a new room
var joinBool = false;

var room_name = "room"
var user_name = "user"

creating = () => { //just handling the switch... not actually creating a game
    document.getElementById("create_button").className = "switch disabled";
    document.getElementById("join_button").className = "switch enabled";
    document.getElementById("mode").innerHTML = "Create Room";
    joinBool = false;

}
joining = () => {//just handling the switch... not actually joining a game
    document.getElementById("create_button").className = "switch enabled";
    document.getElementById("join_button").className = "switch disabled";
    document.getElementById("mode").innerHTML = "Join Room";
    joinBool = true;
}

//actually enter/joining a game...
enter = () => {
    room_name = document.getElementById("rName").value;
    user_name = document.getElementById("uName").value;

    localStorage.room_name = room_name;
    localStorage.user_name = user_name;
    window.location.replace("./client/room.html");
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