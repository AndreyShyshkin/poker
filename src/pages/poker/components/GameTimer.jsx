import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import Game from "./Game";

const GameTimer = () => {
  const database = getDatabase();
  const urlParams = new URLSearchParams(window.location.search);
  const randomString = urlParams.get("id");
  const [showStartGame, setShowStartGame] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  let serverTimeOffset = 0;
  const offsetRef = ref(database, ".info/serverTimeOffset");

  useEffect(() => {
    const unsubscribeOffset = onValue(offsetRef, (snapshot) => {
      serverTimeOffset = snapshot.val();
    });

    const gameRef = ref(database, `table/${randomString}/start/`);
    const unsubscribeGame = onValue(gameRef, (snapshot) => {
      const { seconds, startAt } = snapshot.val();
      const interval = setInterval(() => {
        const calculatedTimeLeft =
          seconds * 1000 - (Date.now() - startAt - serverTimeOffset);

        if (calculatedTimeLeft < 0) {
          clearInterval(interval);
          setShowStartGame(true);
          setTimeLeft(0);
        } else {
          setTimeLeft(Math.floor(calculatedTimeLeft / 1000));
        }
      }, 100);

      return () => clearInterval(interval);
    });

    return () => {
      unsubscribeOffset();
      unsubscribeGame();
    };
  }, [database, randomString, offsetRef]);

  return (
    <div>
      {timeLeft !== null && !showStartGame && (
        <div>{timeLeft} seconds left</div>
      )}
      {showStartGame && <Game />}
    </div>
  );
};

export default GameTimer;
