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

//actually  /joining a game...
enter = () => {
    room_name = document.getElementById("rName").value;
    user_name = document.getElementById("uName").value;

    localStorage.room_name = room_name;
    localStorage.user_name = user_name;
    localStorage.joinBool = joinBool;
        
    if(joinBool == false) create_room(room_name, user_name);
    else join_room(room_name, user_name);
    
    // await a reply from the Server before moving on...
    // window.location.replace("./room.html");
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

//error checking steps...
socket.on("room-success", data => {
    console.log("Connection to room secured. Moving on to room-page.");
    window.location.replace("./room.html");
});

socket.on("room-error", data => {
    console.log("eror occured. Please try again");
    if(data.status == "RAE"){
        console.log("Room Already Exists. pick another room");
        
        alert("There is already a room with the same name that you've picked... Please pick another name.");
    }
    else if(data.status == "ROOM-DNE") {
        console.log("Room name doesn't exist.");
        alert("The room you are trying to join does not exist. Please check the entry and try again.");
    }
    document.getElementById("rName").value = "";
});
