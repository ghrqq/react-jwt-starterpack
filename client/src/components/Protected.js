import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../App";

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

  return <div>{content}</div>;
};

export default Protected;
