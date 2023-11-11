import { useEffect, useState } from "react";
import "./Main.css";
import Footer from "../Footer/Footer";

const Main = ({ socket, roomCode }) => {
  const [canPlay, setCanPlay] = useState(true);

  useEffect(() => {
    socket.on("updateGame", (id) => {
      console.log("use Effect", id);
      //setBoard((data) => ({ ...data, [id]: "O" }));
      setCanPlay(true);
    });

    return () => socket.off("updateGame");
  });

  return (
    <main>
      <div className="title">Number Baseball Game</div>
      <div className="subTitle">Let's play game with other!</div>
    </main>
  );
};

export default Main;
