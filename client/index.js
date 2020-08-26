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
joining = () => { //just handling the switch... not actually joining a game
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
    
    if(joinBool == false) create_room(room_name, user_name);
    else join_room(room_name, user_name);
    
    window.location.replace("./room.html");
}
///////////////////////////////////////// SOCKET STUFF
var socket = io.connect();

// create room handler
create_room = (room_name, user_name) => {
    let data = {
        rName: room_name,
        uName: user_name
    }
    socket.emit('create_room', data);
};

// join room handler
join_room =(room_name, user_name) => {
    let data = {
        rName: room_name,
        uName: user_name
    }
    socket.emit('join_room', data);
};