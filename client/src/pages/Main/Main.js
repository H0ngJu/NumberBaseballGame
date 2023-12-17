import { useEffect, useState } from "react";
import Cell from "./Cell";
import "./Main.css";

const Main = ({ socket, roomCode }) => {
  const [playerNumbers, setPlayerNumbers] = useState([]); // Player's own numbers
  const [opponentNumbers, setOpponentNumbers] = useState([]); // Opponent's numbers
  const [guess, setGuess] = useState("");
  const [canPlay, setCanPlay] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    socket.emit("requestInitialGameState", { roomCode });

    socket.on("updateGame", (data) => {
      console.log("Received updateGame event:", data);

      if (data && data[socket.id] && data[socket.id].numbers) {
        setPlayerNumbers(data[socket.id].numbers);
      }

      if (data && data.player1 && data.player1.numbers) {
        setOpponentNumbers(data.player1.numbers);
      } else if (data && data.player2 && data.player2.numbers) {
        setOpponentNumbers(data.player2.numbers);
      }

      if (data) {
        // 현재 접속한 플레이어의 ID
        const currentPlayerId = socket.id;

        // 상대방 플레이어의 ID
        const opponentPlayerId =
          currentPlayerId === data.player1.id
            ? data.player2.id
            : data.player1.id;

        // 상대방의 숫자를 가져옴
        const opponentNumbers =
          currentPlayerId === data.player1.id
            ? data.player1.numbers
            : data.player2.numbers;

        // 자신의 숫자를 가져옴
        const playerNumbers =
          data[currentPlayerId] && data[currentPlayerId].numbers;

        setOpponentNumbers(opponentNumbers);
        setPlayerNumbers(playerNumbers);
        setHistory(data.history);
        setCanPlay(true);
      }

      setHistory(data ? data.history : []);
      setCanPlay(true);
    });

    // 오는 msg listening
    socket.on("receiveMessage", (data) => {
      console.log(`Received message: ${data.message} from ${data.sender}`);
    });

    return () => {
      socket.off("updateGame");
      socket.off("receiveMessage");
    };
  }, [socket]);

  const handleCellClick = (e) => {
    if (canPlay) {
      const digit = e.currentTarget.innerText;
      setGuess((prevGuess) =>
        prevGuess.length < 4 ? prevGuess + digit : prevGuess
      );
    }
  };

  const handleSendGuess = () => {
    socket.emit("play", { guess, roomCode });
    setCanPlay(false);
  };

  const handleSendMessage = (message) => {
    socket.emit("sendMessage", { message, roomCode });
  };

  return (
    <main>
      <section className="main-section">
        <div className="numbers-section">
          <div className="number-input">
            <input
              type="number"
              placeholder="Enter your guess"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
            />
            <button onClick={handleSendGuess}>Submit Guess</button>
          </div>
          <div className="my-numbers">
            My Numbers: {opponentNumbers.join(" ")}
          </div>
        </div>
        <div className="history-section">
          <h2>Guess History</h2>
          <ul>
            {history.map((item, index) => (
              <li key={index}>
                {item.guess} - {item.result.strike} Strike(s),{" "}
                {item.result.ball} Ball(s), {item.result.out} Out(s)
              </li>
            ))}
          </ul>
        </div>
        <div className="main-grid">
          {playerNumbers?.map((number, index) => (
            <Cell
              key={index}
              handleCellClick={handleCellClick}
              id={index.toString()}
              text={number}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Main;
