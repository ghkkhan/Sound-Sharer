document.getElementById("mode").innerHTML += localStorage.room_name;

var fileName = "placeholder";
var fire;
window.onload = function() {
    document.body.className += " magic";
    window.setTimeout(addContent, 1.5 * 1000);
}
pageContent = '<label class="main_form" for="room_name">Upload File</label><input type="file" id="mp3Upload"/><br /><br /><input type="text" id="song-name" placeholder="Enter the Song Name"><br /><!-- <input type="file" id="song_byte" accept=".mp3" onchange="fileUpdate()"> --><button id="enqueue_file" onclick="enqueue()">Send it</button><br /><audio controls><!-- <source src="horse.ogg" type="audio/ogg"> --><!-- <source src="horse.mp3" type="audio/mpeg"> --><!-- Your browser does not support the audio element. --></audio><br /><textarea id="queue">lol</textarea><br /><label id="song_time">Song time goes in here</label>'


addContent = () => {
    document.getElementById("Con").innerHTML += pageContent;
}


///////// GLOBAL VARS
var client = {
    song_queue: -1,
    song_index: -1,
    song_time: -1,
    song_play: false,
    desync_allowed: -1
}
var audio = document.getElementById('audio_player');


///////////////////////////////////////// SOCKET STUFF
var socket = io.connect();
var uploader = new SocketIOFileUpload(socket);
// uploader.listenOnInput(document.getElementById("mp3Upload"));
uploader.listenOnSubmit(document.getElementById("enqueue_file"),document.getElementById("mp3Upload"));

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

/////////////// FILE UPLOAD
var filename = ""; // keep track of name of file being uploaded
var input = document.getElementById('mp3Upload');
input.onchange = ()=>{
    console.log("prepared:", input.files.item(0).name);
    console.log(input.duration);
};
enqueue = () => {
    let data = {
        uploader:localStorage.user_name,
        room_name:localStorage.room_name,
        song_name:document.getElementById("song-name").value,
        file_name: input.files.item(0).name,
        file_size: input.files.item(0).size,
        file_type: input.files.item(0).type
    }
    socket.emit("queueing", data);
}


/////////////// AUDIO PLAYER STREAMING
document.getElementById("play_button").addEventListener("click", (event)=>{ 
    // start playing songs
    socket.emit('play_queue', {
        room_name: localStorage.room_name
    })
});


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