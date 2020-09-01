'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Main = function (_React$Component) {
  _inherits(Main, _React$Component);

  function Main(props) {
    _classCallCheck(this, Main);

    var _this = _possibleConstructorReturn(this, (Main.__proto__ || Object.getPrototypeOf(Main)).call(this, props));

    _this.creating = function () {
      _this.setState({
        creating: true,
        title: "Create a Room!"
      });
    };

    _this.joining = function () {
      _this.setState({
        creating: false,
        title: "Join a Room!"
      });
    };

    _this.enter = function () {
      var room_name = document.getElementById("rName").value;
      var user_name = document.getElementById("uName").value;

      localStorage.room_name = room_name;
      localStorage.user_name = user_name;
      localStorage.joinBool = _this.state.creating;

      if (_this.state.creating == true) create_room(room_name, user_name);else join_room(room_name, user_name);

      // await a reply from the Server before moving on...
      // window.location.replace("./room.html");
    };

    _this.state = {
      creating: false,
      title: "Join a Room!"
    };
    return _this;
  }

  //actually  /joining a game...


  _createClass(Main, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { id: "holder" },
          React.createElement(
            "button",
            { type: "button", id: "create_button", className: ["switch", this.state.creating ? "disabled" : "enabled"].join(' '), onClick: this.creating },
            "Create"
          ),
          React.createElement(
            "button",
            { type: "button", id: "join_button", className: ["switch", this.state.creating ? "enabled" : "disabled"].join(' '), onClick: this.joining },
            "Join"
          )
        ),
        React.createElement("br", null),
        React.createElement("br", null),
        React.createElement(
          "div",
          { className: "container" },
          React.createElement(
            "h2",
            { id: "mode" },
            this.state.title
          ),
          React.createElement(
            "form",
            null,
            React.createElement(
              "label",
              { className: "main_form" },
              "Room Name"
            ),
            React.createElement("br", null),
            React.createElement("input", { className: "main_form", type: "text", id: "rName", name: "rName", placeholder: "Room Name" }),
            React.createElement("br", null),
            React.createElement(
              "label",
              { className: "main_form" },
              "User ID"
            ),
            React.createElement("br", null),
            React.createElement("input", { className: "main_form", type: "text", id: "uName", name: "uName", placeholder: "Smith" }),
            React.createElement("br", null)
          ),
          React.createElement(
            "button",
            { id: "enter_room", name: "enter_room", onClick: this.enter },
            "Enter"
          )
        )
      );
    }
  }]);

  return Main;
}(React.Component);

var domContainer = document.querySelector('#testID');
ReactDOM.render(React.createElement(Main), domContainer);

///////////////////////////////////////// SOCKET STUFF
var socket = io.connect();

// create room handler
function create_room(room_name, user_name) {
  var data = {
    rName: room_name,
    uName: user_name
  };
  socket.emit('create_room', data);
};

// join room handler
function join_room(room_name, user_name) {
  var data = {
    rName: room_name,
    uName: user_name
  };
  socket.emit('join_room', data);
};

//error checking steps...
socket.on("room-success", function (data) {
  console.log("Connection to room secured. Moving on to room-page.");
  window.location.replace("./room.html");
});

socket.on("room-error", function (data) {
  console.log("eror occured. Please try again");
  if (data.status == "RAE") {
    console.log("Room Already Exists. pick another room");
    alert("There is already a room with the same name that you've picked... Please pick another name.");
  } else if (data.status == "ROOM-DNE") {
    console.log("Room name doesn't exist.");
    alert("The room you are trying to join does not exist. Please check the entry and try again.");
  }
  document.getElementById("rName").value = "";
});