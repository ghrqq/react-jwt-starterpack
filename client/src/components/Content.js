import React, { useContext } from "react";
import { Redirect } from "@reach/router";
import { UserContext } from "../App";

const Content = () => {
  const [user] = useContext(UserContext);
  if (!user.accesstoken) return <Redirect from="" to="login" noThrow />;
  return <div>This is the content. </div>;

  // Check if accesstoken is expired w/wo Apollo
};

export default Content;
