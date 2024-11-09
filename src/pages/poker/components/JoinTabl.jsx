import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function JoinTabl() {
  const [user, setUser] = useState(null);
  const database = getDatabase();
  const joinInput = useRef();
  const navigate = useNavigate();
  const [joinInputValue, setJoinInputValue] = useState("");

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

  useEffect(() => {
    if (joinInput.current) {
      setJoinInputValue(joinInput.current.value);
    }
  }, []);

  function join() {
    if (joinInput.current && joinInput.current.value.length === 6) {
      set(
        ref(
          database,
          "table/" +
            joinInput.current.value.toUpperCase() +
            "/players/" +
            user.uid,
        ),
        {
          username:
            !user.isAnonymous && user.displayName
              ? user.displayName
              : "anonymous",
        },
      )
        .then(function () {
          navigate(`/poker/table?id=${joinInput.current.value.toUpperCase()}`);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("🚀 ~ loginUser ~ errorCode:", errorCode);
          console.log("🚀 ~ loginUser ~ errorMessage:", errorMessage);
        });
    }
  }

  return (
    <div>
      <div>
        <p>Присоединиться к группе:</p>
        <input
          type="text"
          ref={joinInput}
          maxLength="6"
          onChange={() => setJoinInputValue(joinInput.current.value)}
        />
        <button onClick={join} disabled={joinInputValue.length !== 6}>
          Присоединиться
        </button>
      </div>
    </div>
  );
}

export default JoinTabl;
