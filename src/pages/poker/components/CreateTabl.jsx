import { getDatabase, ref, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateTabl() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
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

  const database = getDatabase();

  function generateRandomString(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  const randomString = generateRandomString(6);

  function createTable() {
    set(ref(database, "table/" + randomString + "/start/"), {
      seconds: -1,
    });
    set(ref(database, "table/" + randomString + "/players/" + user.uid), {
      username:
        !user.isAnonymous && user.displayName ? user.displayName : "anonymous",
    })
      .then(function () {
        navigate("/poker/table?id=" + randomString);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("🚀 ~ loginUser ~ errorCode:", errorCode);
        console.log("🚀 ~ loginUser ~ errorMessage:", errorMessage);
      });
  }

  return (
    <div>
      <button onClick={createTable}>create Table</button>
    </div>
  );
}

export default CreateTabl;
