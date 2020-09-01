'use strict';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      creating: false,
      title:"Join a Room!"
    };
  }
  creating = () => {
    this.setState({
      creating:true,
      title:"Create a Room!"
    });
  }
  joining = () => {
    this.setState({
      creating:false,
      title:"Join a Room!"
    });
  }

  //actually  /joining a game...
  enter = () => {
    var room_name = document.getElementById("rName").value;
    var user_name = document.getElementById("uName").value;

    localStorage.room_name = room_name;
    localStorage.user_name = user_name;
    localStorage.joinBool = this.state.creating;
        
    if(this.state.creating == true) create_room(room_name, user_name);
    else join_room(room_name, user_name);
    
    // await a reply from the Server before moving on...
    // window.location.replace("./room.html");
  }
  render() {
    return(
      <div>
        <div id="holder">
          <button type="button" id="create_button" className={["switch",this.state.creating? "disabled" : "enabled"].join(' ')} onClick={this.creating}>Create</button>
          <button type="button" id="join_button" className={["switch",this.state.creating? "enabled" : "disabled"].join(' ')} onClick={this.joining}>Join</button>
        </div>
        <br />
        <br />
        <div className="container">
          <h2 id="mode">{this.state.title}</h2>
          <form>
            <label className="main_form" >Room Name</label>
            <br />
            <input className="main_form" type="text" id="rName" name="rName" placeholder="Room Name"/>
            <br />
            <label className="main_form" >User ID</label>
            <br />
            <input className="main_form" type="text" id="uName" name="uName" placeholder="Smith" />
            <br />
          </form>
          <button id="enter_room" name="enter_room" onClick={this.enter}>Enter</button>
        </div>
      </div>
    );
  }
}

const domContainer = document.querySelector('#testID');
ReactDOM.render(React.createElement(Main), domContainer);

///////////////////////////////////////// SOCKET STUFF
var socket = io.connect();

// create room handler
function create_room (room_name, user_name){
    let data = {
        rName: room_name,
        uName: user_name
    }
    socket.emit('create_room', data);
};

// join room handler
function join_room (room_name, user_name) {
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