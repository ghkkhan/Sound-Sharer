// User class

module.exports = class User{
    constructor(name, socket){
        this._name = name;
        this._socket = socket;
    }
    get name(){
        return this._name;
    }
    get socket(){
        return this._socket;
    }
}