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
///////////////////////////////////////// SOCKET STUFF
var socket = io.connect();
var uploader = new SocketIOFileUpload(socket);
// uploader.listenOnInput(document.getElementById("mp3Upload"));
uploader.listenOnSubmit(document.getElementById("enqueue_file"),document.getElementById("mp3Upload"));

socket.emit('enter_room', {
    rName: localStorage.rName,
    uName: localStorage.uName
})

socket.on("room_info", data => {
    //user info and stuff...
    document.getElementById("queue").innerText = data.song_queue;
});

/////////////// FILE UPLOAD
var filename = ""; // keep track of name of file being uploaded
var input = document.getElementById('mp3Upload');
input.onchange = ()=>{
    console.log("prepared:", input.files.item(0).name);
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
    console.log('play button')
    socket.emit('client-stream-request', {
        file: 'redbone'
    })
  });


var audio = document.getElementById('audio_player');
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