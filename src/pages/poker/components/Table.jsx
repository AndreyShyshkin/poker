import { useEffect, useLayoutEffect, useState } from "react";
import {
  getDatabase,
  ref,
  update,
  onValue,
  off,
  serverTimestamp,
  onDisconnect,
  set,
  remove,
} from "firebase/database";
import StartGame from "./GameTimer.jsx";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Table() {
  const database = getDatabase();
  const urlParams = new URLSearchParams(window.location.search);
  const randomString = urlParams.get("id");

  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  const [showStartGame, setShowStartGame] = useState(false);
  useEffect(() => {
    if (randomString) {
      const participantsRef = ref(database, `table/${randomString}`);

      // Listening for changes in Firebase
      const unsubscribe = onValue(participantsRef, (snapshot) => {
        const participants = snapshot.val();
        if (participants && participants.players) {
          const playerKeys = Object.keys(participants.players);
          if (playerKeys.length >= 2) {
            if (participants.start && participants.start.seconds === -1) {
              update(ref(database, `table/${randomString}/start/`), {
                startAt: serverTimestamp(),
                seconds: 10,
              });
              update(
                ref(database, `table/${randomString}/players/${playerKeys[0]}`),
                { dealer: true },
              );
            }
            setShowStartGame(true);
          } else {
            setShowStartGame(false);
          }
        }
      });

      return () => off(participantsRef, "value", unsubscribe);
    }
  }, [randomString, database]);

  useLayoutEffect(() => {
    function checkPlayer() {
      return new Promise((resolve) => {
        const playerRef = ref(database, `table/${randomString}/`);
        onValue(playerRef, (snapshot) => {
          const participants = snapshot.val();
          if (participants && participants.players) {
            const playerKeys = Object.keys(participants.players);
            if (playerKeys.length <= 1) {
              resolve(true); // Возвращаем true через resolve
            } else {
              resolve(false); // Возвращаем false через resolve
            }
          } else {
            resolve(false); // Если данных нет, возвращаем false
          }
        });
      });
    }

    if (user && user.uid) {
      const userStatusRef = ref(
        database,
        `table/${randomString}/players/${user.uid}/`,
      );
      const groupRef = ref(database, `table/${randomString}/`);
      const connectedRef = ref(database, ".info/connected");

      checkPlayer().then((currentPlayer) => {
        // Отслеживание подключения
        const connectedListener = onValue(connectedRef, (snapshot) => {
          if (snapshot.val() === true) {
            // Устанавливаем статус "online"
            update(userStatusRef, { status: "online" });
            if (currentPlayer) {
              onDisconnect(groupRef).set({ status: null });
            } else {
              onDisconnect(userStatusRef).set({ status: null });
            }
          } else {
            if (currentPlayer) {
              set(groupRef, { status: null });
            } else {
              set(userStatusRef, { status: null });
            }
          }
        });

        return () => off(connectedRef, connectedListener);
      });
    }
  }, [user, randomString, database]);
  return (
    <div>
      <h1>Table</h1>
      {showStartGame && <StartGame />}
    </div>
  );
}

export default Table;
