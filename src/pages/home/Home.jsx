import "./Home.css";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

function Home() {
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
  return (
    <>
      <div>
        {user ? (
          <span>
            Вы вошли в систему как{" "}
            {!user.isAnonymous && user.displayName
              ? user.displayName
              : "anonymous"}
          </span>
        ) : (
          <Link to="../auth">login</Link>
        )}
      </div>
    </>
  );
}

export default Home;
