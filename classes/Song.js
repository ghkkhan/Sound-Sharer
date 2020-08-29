// Song class

module.exports = class Song {
    constructor(file_name, song_name, uploader, duration){
        this._file_name = file_name;
        this._song_name = song_name;
        this._uploader = uploader; // user name
        this._duration = duration; // in seconds
    }
    get file_name(){
        return this._file_name;
    }
    get song_name(){
        return this._song_name;
    }
    get duration(){
        return this._duration;
    }
}