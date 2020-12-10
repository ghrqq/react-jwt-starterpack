const { sign } = require("jsonwebtoken");

const createAccessToken = (userId, name, type) => {
  return sign(
    {
      userId,
      name,
      type,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
};
const createRefreshToken = (userId) => {
  return sign(
    {
      userId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const sendAccessToken = (res, req, accesstoken, name, type) => {
  res.send({
    accesstoken,
    email: req.body.email,
    name,
    type,
  });
};

const sendRefreshToken = (res, refreshtoken) => {
  res.cookie("refreshtoken", refreshtoken, {
    //Change the token name
    httpOnly: true,
    path: "/refresh_token", //Change the path name accordingly
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
  sendAccessToken,
};
