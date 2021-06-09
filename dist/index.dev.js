"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var express = require("express");

var app = express();

var server = require("http").Server(app);

var io = require("socket.io")(server, {
  cors: {
    origin: "*"
  }
});

var users = [];
io.on("connection", function (socket) {
  var clientId = socket.id;
  socket.on("join", function (data) {
    console.log(data); // io.emit("message", { user, message:"aaa has joined the chat!" });
  });
  socket.on("message", function (_ref) {
    var user = _ref.user,
        message = _ref.message;
    io.emit("message", {
      user: user,
      message: message
    });
  });
  socket.on("users", function (user) {
    user["clientId"] = clientId;
    users = [].concat(_toConsumableArray(users), [user]);
    io.emit("users", users);
  });
  socket.on("disconnect", function () {
    var disconnectedUser = users.find(function (user) {
      return user.clientId === clientId;
    });
    users = users.filter(function (user) {
      return user.clientId !== clientId;
    });
    io.emit("users", users);
    io.emit("message", {
      user: disconnectedUser,
      message: "".concat(disconnectedUser.username, " has left chat!")
    });
  });
});
server.listen(5000, function () {
  console.log("listening on port 5000");
});