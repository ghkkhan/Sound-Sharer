// Room class

module.exports = class Room{
    constructor(room_name){
        this._room_name = room_name;
        this._users = [];
        this._song_queue = [];
        this._song_index = 0; // which songs to play from song_queue
        this._song_time = 0; // in seconds
        this._play_song = false;
    }
    get room_name(){ return this._room_name; }
    get song_queue() { return this._song_queue; }
    set play_song(b){ this._play_song = b; }
    add_user(User){
        this._users.push(User);
        this.to_string();
    }
    rem_user(User) {
        this._users = this.users.fizlter(e => e != User);
        this.to_string();
    }
    add_song(Song){
        console.log(Song);
        this._song_queue.push(Song);
    }
    notify_users(msg){
        this._users.forEach((user)=>{
            let socket = user.socket;
            socket.emit('notify', {
                msg: msg
            });
        });
    }
    to_string() {
        console.log(`Roomname: ${this._room_name}`);
        console.log(`Users: ${this._users.toString()}`);
        console.log(`songs: ${this._song_queue}`);
    }
    send_info(){
        // send info about room to all users
        let user_list = this._users.map(()=>{user.name})
        this._users.forEach((user)=>{
            let socket = user.socket;
            socket.emit('room_update', {
                song_queue: this._song_queue,
                users: user_list, // using this._users will cause recursive things for some reason???
                room_name: this._room_name,
                song_index: this._song_index,
                song_time: this._song_time,
                song_play: this._play_song
            })
        })
    }
    get current_song(){
        // returns song object
        return this._song_queue[this._song_index];
    }
}