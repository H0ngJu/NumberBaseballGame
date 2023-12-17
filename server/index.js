const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

const rooms = {};

io.on("connection", (socket) => {
  console.log("User Connected");

  socket.on("joinRoom", ({ roomCode, numbers }) => {
    console.log(`A user joined the room ${roomCode}`);
    socket.join(roomCode);

    // 숫자 유효 확인
    if (isValidNumbers(numbers)) {
      if (!rooms[roomCode]) {
        rooms[roomCode] = {
          player1: { id: socket.id, numbers, guesses: [] },
          player2: { id: "", numbers: [], guesses: [] },
          turn: 1,
          history: [],
        };

        console.log("Room created:", rooms[roomCode]);
        io.to(roomCode).emit("updateGame", rooms[roomCode]);
      } else {
        // player 2가 아직 참가 X
        if (!rooms[roomCode].player2.id) {
          rooms[roomCode].player2 = { id: socket.id, numbers, guesses: [] };
          console.log("Player 2 joined:", rooms[roomCode].player2); // Add this line
          io.to(roomCode).emit("updateGame", rooms[roomCode]);
        } else {
          // player가 이미 2명이 찬 경우
          console.log("Room is already full:", rooms[roomCode]); // Add this line
          socket.emit("invalidRoom", "Room is already full");
        }
      }
    } else {
      // 유효하지 않은 숫자 -> 알리기
      socket.emit(
        "invalidNumbers",
        "Please enter a valid combination of four digits."
      );
    }
  });

  socket.on("play", ({ guess, roomCode }) => {
    console.log(`Player made a guess ${guess} in room ${roomCode}`);

    const room = rooms[roomCode];

    if (!room) {
      // 방이 없는 경우
      console.error(`Room ${roomCode} not found`);
      return;
    }

    const player = socket.id === room.player1.id ? "player1" : "player2";

    // 추측 목록에 추가
    room[player].guesses.push(guess);

    // 결과 처리
    const result = compareNumbers(
      guess,
      room[player === "player1" ? "player2" : "player1"].numbers
    );

    // 추측, 결과를 기록에 추가
    room.history.push({ guess, result });

    // turn 바꾸기
    room.turn = room.turn === 1 ? 2 : 1;

    io.to(roomCode).emit("updateGame", rooms[roomCode]);
  });

  socket.on("requestInitialGameState", ({ roomCode }) => {
    const room = rooms[roomCode];

    if (room) {
      socket.emit("updateGame", room);
    } else {
      console.error(`Room ${roomCode} not found`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

server.listen(5000, () =>
  console.log("server running => http://localhost:5000")
);

function isValidNumbers(numbers) {
  return true;
}

function compareNumbers(guess, target) {
  const result = { strike: 0, ball: 0, out: 0 };

  for (let i = 0; i < 4; i++) {
    if (guess[i] == target[i]) {
      //console.log("guess %d target %d", guess[i], target[i]);
      result.strike++;
    } else if (target.some((num) => num === guess[i])) {
      //console.log("guess %d target %d", guess[i], target[i]);
      result.ball++;
    }
    // console.log("guess %d target %d", guess[i], target[i]);
  }

  // out 계싼
  result.out = 4 - result.strike;

  return result;
}
