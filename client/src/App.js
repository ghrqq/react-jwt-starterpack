import "./App.css";
import React, { useState, useEffect } from "react";
import { Router, navigate } from "@reach/router";

import Navigation from "./components/Navigation";
import Login from "./components/Login";
import Register from "./components/Register";
import Protected from "./components/Protected";
import Content from "./components/Content";

export const UserContext = React.createContext([]);

function App() {
  const [user, setuser] = useState({});
  const [loading, setloading] = useState(true);
  // Apollo Library Check that?

  const logOutCallback = async () => {
    await fetch("http://localhost:4000/logout", {
      method: "POST",
      credentials: "include",
    });
    // Clear user from context
    setuser({});
    // Navigate back to homepage
    navigate("/");
  };

  // Get a new accesstoken if a refreshtoken exists

  useEffect(() => {
    async function checkRefreshToken() {
      const result = await (
        await fetch("http://localhost:4000/refresh_token", {
          method: "POST",
          credentials: "include", //Needed to include the cookie
          headars: {
            "Content-Type": "application/json",
          },
        })
      ).json();
      setuser({
        accesstoken: result.accesstoken,
        name: result.name,
        type: result.type,
      });
      setloading(false);
    }
    checkRefreshToken();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <UserContext.Provider value={[user, setuser]}>
      <div className="app">
        <Navigation logOutCallback={logOutCallback} />
        <Router id="router">
          <Login path="login" />
          <Register path="register" />
          <Protected path="protected" />
          <Content path="/" />
        </Router>
      </div>

      {user.name}
      {user.type}
    </UserContext.Provider>
  );
}

export default App;
