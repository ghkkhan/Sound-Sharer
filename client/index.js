// imports are not working ( ; _ ;) so all react components and all of the front end will be jam packed into this one file (lol).
const cc = React.createElement;
/******** FIRST UP ARE ALL THE COMPONENTS ********/
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
 * The Switch component is the twin set of buttons on the main page...
 * Only one of them is enabled at any given time. 
 * therefore it's name, the Switch.
 */
class Switch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //this state shouldn't even exist but i'm too lazy to go back and fix it...
            creatin:this.props.creatin,
        }
        localStorage.joinBool = !this.props.creatin;
    }

    //this is sooo bad....
    //i swear i'll fix this in the 38135836255th patch...
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
            cc("button", {id:"create_button", className:["switch",this.state.creatin? "disabled" : "enabled"].join(' '), onClick:this.create}, "Create"),
            cc("button", {type:"button", id:"join_button", className:["switch",this.state.creatin? "enabled" : "disabled"].join(' '), onClick:this.join}, "Join"),
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
        this.state = {
            lgnPage:this.props.stage,
            // songArray:["fea","vaer"],
            // userArray:["a", "b"],
        }
    }
    render() {
        let songs = this.props.songArray.map((song, index) => {
            return (
                cc('li',{key:index}, song)
            )
        });
        let users = this.props.userArray.map((user, index) => {
            return cc('li', {key:index}, user)
        }); 
        return(
            cc("div", {className:'scene'},
                cc('div', {className:'container containerSide', id:'songBar'}, 
                    this.props.stage ? null : cc('ul', null, songs)
                ),
                cc('div', {className:'container'}, 
                    cc("h2", {id:'mode'}, this.props.title),
                    this.props.encase
                ),
                cc('div', {className:'container containerSide', id:'userBar'},
                    (this.props.stage) ? null :  cc('ul', null, users)
                ),
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

class MusicScene extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            sName: "",
            file: ""
        }
    }
    song_change =() => {};
    enqueue = () => {};
    
    componentDidMount() {
        deploySecondPageJS();
    }
    
    //Change Song Name
    CSName = (e) => {
        this.setState({sName:e.target.value});
        console.log(`filename: ${this.state.sName}`);   
    };
    song_change = (e) => {
        this.setState({file:e.target.value})
        console.log(`file_name: ${e.target.value}`);
        // console.log(`file_size: ${e.target.value.size}`);
        // console.log(`file_type: ${e.target.value.type}`);
    }

    render() {
        return (
            cc('div', {id:"MSReturn"}, 
                cc('label', {className:"main_form"},"Upload File"),
                cc('input', {type:'file', id:'mp3Upload', onChange:this.song_change}),cc("br", null),cc("br", null),
                cc('input',{type:'text', id:"song-name", placeholder:"Enter the Song Name", onChange:this.CSName}),cc("br", null),
                cc('button', {id:'enqueue_file', onClick:window.enqueue},"Send it"),cc("br", null),

                // Audio Player
                cc('audio', {id:"audio_player", controls:true, autoPlay:true, muted:true}),
                cc('button', {id:"play_button"}, 'play'),
                cc('label', {id:"song_time"}, "Song time goes in here")
            ) 
        );
    }
}
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
            title: "Join a Room",
            encased: cc(Login, null),
            users:["a", "b"],
            songs:["c", "d"],
        };
    }
    creat = () => {
        this.setState({
            creating:true,
            title:this.state.createTitle,
        });
    }
    jon = () => {
        this.setState({
            creating:false,
            title:this.state.joinTitle,
        });
    }
    toMainPage = (data) => {
        // console.log("printer");
        this.setState({
            encased:cc(MusicScene, null),
            title: `Room: ${data.room_name}`,
            lgnPage:false,
        });
    }
    render() {

        let switchBody = {
            creatin: this.state.creating,
            creat: this.creat,
            jon: this.jon,
        }
        let ASBody = {
            id:"AScene",
            stage:this.state.lgnPage,
            title:this.state.title,
            encase:this.state.encased,
            songArray:this.state.songs,
            userArray:this.state.users
        }
        return(
            cc("div", null, 
                cc(HeadBar, { mid:cc(Switch, switchBody)} ),
                cc(ActionScene, ASBody),
                cc(Credits, null),
            )
        );
    };
}
const domContainer = document.querySelector('#root');
ReactDOM.render(cc(App, {ref:App => {window.App = App}}), domContainer);

///////////////////////////////////////// SOCKET STUFF FOR THE MAIN PAGE
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

socket.on("room-success", data => {
    console.log("Connection to room secured. Moving on to room-page.");
    // window.location.replace("./room.html");
    // Not replacing location but... changing the component... 
    // Thanks to this guy for teaching me about REFs: https://mtm.dev/update-component-state-outside-react/
    //without REFs, this would not be possible rn.

    /**
     * The data variable should have the following:
     * room-name
     * user-name
     * list of Users on it.
     * list of Songs on it.
     * Song Data
     * More to be added... when expanding the application...?
     */
    data = {
        room_name:localStorage.room_name,
        user_name:localStorage.user_name,
    }
    window.App.toMainPage(data);
    document.body.className += " magic";
});

////////////////////////////////////// SOCKET STUFF FOR THE MAIN PAGE ENDS HERE
////////////////////////////////////// SOCKET STUFF AND JS STUFF FOR ROOM PAGE BEGINS HERE
//                                  (most of the code below is copy pasted from the original room.js)

///////// GLOBAL VARS
var client = {
    song_queue: -1,
    song_index: -1,
    song_time: -1,
    song_play: false,
    desync_allowed: -1
}

var input, filename;
//everything that needs the page to first be loaded goes into this function...
deploySecondPageJS = () => {
    var audio = document.getElementById('audio_player');
    var uploader = new SocketIOFileUpload(socket);
    uploader.listenOnSubmit(document.getElementById("enqueue_file"),document.getElementById("mp3Upload"));
    console.log(`enqueue_file: ${document.getElementById("enqueue_file")}`);

    /////////////// FILE UPLOAD
    filename = ""; // keep track of name of file being uploaded
    input = document.getElementById('mp3Upload');
    console.log(`input: ${input}`);
    input.onchange = ()=>{
        console.log("prepared:", input.files.item(0).name);
        console.log(input.duration);
    };    

    /////////////// AUDIO PLAYER STREAMING
    document.getElementById("play_button").addEventListener("click", (event)=>{ 
        // start playing songs
        socket.emit('play_queue', {
            room_name: localStoratge.room_name
        })
    });
}

///////////////////////////////////////// SOCKET STUFF
/* var socket = io.connect();  */ // dont need this line because we're already connected to socket...
    
//REMOVE THIS PART. WE WILL ENTER ROOM WHEN BUTTON IS CLICKED....
socket.emit('enter_room', {
    rName: localStorage.room_name,
    uName: localStorage.user_name
})

socket.on("room_info", (data)=>{
    // get initial room info
    client.desync_allowed = data.desync_allowed;
})

socket.on("room_update", data => {
    // get info from server. sync client info with server info
    // sync queue
    client.song_queue = data.song_queue.map((song)=>{
        return song._song_name
    })
    document.getElementById("queue").innerText = client.song_queue;

    // sync song_index and whether song is playing
    if(client.song_index != data.song_index || client.song_play != data.song_play){
        console.log('REQUEST STREAM');
        socket.emit('client_stream_request', {
            room_name: localStorage.room_name,
            user_name: localStorage.user_name
        });
        client.song_index = data.song_index;

        // sync whether song is playing
        client.song_play = data.song_play
    }

    // sync song_time if too far off
    client.song_time = data.song_time; // client.song_time is pretty useless b/c of audio.currentTime
    if(Math.abs(client.song_time - audio.currentTime) > client.desync_allowed){
        audio.currentTime = client.song_time; // set time on audio player
    }

    console.log(client)
});

// /////////////// FILE UPLOAD
// var filename = ""; // keep track of name of file being uploaded
// var input = document.getElementById('mp3Upload');
// input.onchange = ()=>{
//     console.log("prepared:", input.files.item(0).name);
//     console.log(input.duration);
// };

//uploads the song....
Window.enqueue = () => {
    let data = {
        uploader: localStorage.user_name,
        room_name: localStorage.room_name,
        song_name: document.getElementById("song-name").value,
        file_name: input.files.item(0).name,
        file_size: input.files.item(0).size,
        file_type: input.files.item(0).type
    }
    socket.emit("queueing", data);
}



// /////////////// AUDIO PLAYER STREAMING
// document.getElementById("play_button").addEventListener("click", (event)=>{ 
//     // start playing songs
//     socket.emit('play_queue', {
//         room_name: localStorage.room_name
//     })
// });

// get audio information on load into audio player
ss(socket).on('audio-stream', function(stream, data) {
    parts = [];
    stream.on('data', function(chunk){
        console.log("loading song!");
        parts.push(chunk);
    });
    stream.on('end', function () {
        console.log("playing song!");
        audio.src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));
        audio.play();
    });
});