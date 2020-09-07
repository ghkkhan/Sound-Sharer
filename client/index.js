// imports are not working ( ; _ ;) so all react components and all of the front end will be jam packed into this one file (lol).
const cc = React.createElement;


/********  FIRST UP ARE ALL THE COMPONENTS ********/
/*
 * First up is the Header. The banner on all pages... so to speak...
 */
 class HeadBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            switchBar: props.mid
        };
    }
    render() {
        return (
            cc('div', null,
                cc('h1', {id:"title"}, "Shared Audio"),
                this.state.switchBar,
                // cc('div', {id:"holder"}, this.state.switchBar)
            )
        );
    }
}

/* 
 * The Switch component is the twin set of buttons. 
 * Only one of them is enabled at any given time. 
 * therefore it's name, the Switch.
 */
class Switch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            creatin:this.props.creatin,
        }
        localStorage.joinBool =  this.props.creatin;
    }
    create = () => {
        this.setState({
            creatin:true,
        });
        localStorage.joinBool = false;
        this.props.creat();
    }
    join = () => {
        this.setState({
            creatin: false,
        });
        localStorage.joinBool =  true;
        this.props.jon();
    }
    render() {
        return(
            cc("div", {id:"holder"}, 
            cc("button", {id:"create_button", className:["switch",this.state.creatin? "enabled" : "disabled"].join(' '), onClick:this.create}, "Create"),
            cc("button", {type:"button", id:"join_button", className:["switch",this.state.creatin? "disabled" : "enabled"].join(' '), onClick:this.join}, "Join"),
            )
        );
    }
}

/**
 * The ActionScene... where the main bit of the entire web-app will be displayed...
 * from the join/create content to the song uploaders and the music palyer...
 */
class ActionScene extends React.Component {
    constructor(props) {
        //not much here for now because this is just an empty holder...
        super(props);
        this.state = {}
    }
    render() {
        return(
            //only has one thing of any significance... which is the 'encase' variable... for now
            cc("div", {className:'container'}, 
                cc("h2", {id:'mode'}, this.props.title),
                this.props.encase
            )
        )
    }
}

// The Login Component just allows the user to create a room or join an existing room...
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    //actually  /joining a game...
    enter = () => {
        var room_name = document.getElementById("rName").value;
        var user_name = document.getElementById("uName").value;

        localStorage.room_name = room_name;
        localStorage.user_name = user_name;
        // console.log(localStorage.joinBool); LocalStorage FTW!

        if(localStorage.joinBool === "true") { // apparently localstorage stores data as strings...
            join_room(room_name, user_name);
        }
        else {
            create_room(room_name, user_name);
        }

        // await a reply from the Server before moving on...
        // window.location.replace("./room.html");
    }
    render() {
        return(
            cc("div", null,
                cc("form", null,
                    cc("label",{className:"main_form"}, "Room Name"),cc("br", null),
                    cc("input", {className:"main_form", type:"text", id:"rName", placeholder:"Dungeon"}),cc("br", null),
                    cc("label", {className:"main_form"}, "User ID"),cc("br", null),
                    cc("input", {className:"main_form", type:"text", id:"uName", placeholder:"Smith"}),cc("br", null),
                ),
                cc("button", {id:"enter_room", name:"enter_room", onClick:this.enter}, "Enter")
            )
        )
    }
}

// TODO: MusicScene
// TODO: SlideLeft
// TODO: SlideRight


// the credits component just puts our name on display near the bottom of the page...
class Credits extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return(
            cc("div",null, null)
        )
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lgnPage:true,
            creating: false, 
            joinTitle:"Join a Room!",
            createTitle: "Create a Room!",
        };
    }

    creat = () => {
        this.setState({
            creating:true,
        });
    }
    jon = () => {
        this.setState({
            creating:false,
        });
    }
    render() {
        return(
            // <div>
            //     {/* <HeadBar mid={<Switch />} /> */}
            //     {/* <ActionScene encase={<Login />} />
            //     <Credits /> */}
            // </div>
            
            cc("div", null, 
                cc(HeadBar, { mid:cc(Switch, {creatin:this.state.creating, creat:this.creat, jon:this.jon})} ),
                cc(ActionScene, { title: this.state.creating ? (this.state.createTitle) : (this.state.joinTitle), encase:cc(Login,null ), creating:this.state.creating}),
                cc(Credits, null)
            )
        );
    };
}
const domContainer = document.querySelector('#root');
ReactDOM.render(cc(App), domContainer);

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