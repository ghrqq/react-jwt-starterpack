import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../App";

const UserSettings = () => {
  const [user] = useContext(UserContext);
  const [content, setcontent] = useState("Some content will come here.");

  useEffect(() => {
    async function fetchProtected() {
      const result = await (
        await fetch("http://localhost:4000/protected-admin", {
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

  return (
    <div>
      Only admin can see this.
      {content}
    </div>
  );
};

export default UserSettings;
