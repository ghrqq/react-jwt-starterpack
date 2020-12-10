import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../App";
import UserSettings from "./UserSettings";

const Protected = () => {
  const [user] = useContext(UserContext);
  const [content, setcontent] = useState("You need to login");

  useEffect(() => {
    async function fetchProtected() {
      const result = await (
        await fetch("http://localhost:4000/protected", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.accesstoken}`,
          },
        })
      ).json();
      if (result.data) setcontent(result.data);
    }
    fetchProtected();
  }, [user]);

  const contentCompiler = () => {
    if (user.accesstoken === "") return <h2>You need to login!</h2>;
    if (user.type === 2) {
      return (
        <div>
          <UserSettings />
          <UserSettings />
          <UserSettings />
        </div>
      );
    } else {
      return <h2>You are not an admin!</h2>;
    }
  };

  return (
    <div>
      {content}
      {contentCompiler()}
    </div>
  );
};

export default Protected;
