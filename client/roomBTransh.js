var fileName = "placeholder";
var fire;
window.onload = function() {
    document.body.className += " magic";
}
enqueue = () => {
    console.log("sending it");
    let data = {
        username: localStorage.username,
        roomname: localStorage.roomname,
        filename: fileName,
        file: fire
    }
    socket.emit("addSong", data);
}

// code for properly getting the file... apparently....
fileUpdate = (e) => {
    fileName = e.target.value.split("\\").pop();
    const input = e.target;
    if('files' in input && input.files.length > 0) {
        placeFileContent(input.files[0]);
    }
}
placeFileContent = (file) => {
    readFileContent(file).then(content => {
        fire = content;
    });
}
readFileContent = (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result);
        reader.onerror = event => reject(error);
        reader.readAsText(file);
    });
}