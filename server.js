const express = require("express");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const cors = require("cors");
const { verify } = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");
const { fakeDB } = require("./fakeDB");
const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
  sendAccessToken,
} = require("./tokens");
const { isAuth } = require("./isAuth");

const app = express();

// 1. Register a user
// 2. Login a user
// 3. Logout a user
// 4. Setup a protected route
// 5. Get a new accesstoken with a refresh token

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Needed to be able to read body data

app.use(express.json()); //to support JSON-encoder bodies

app.use(
  express.urlencoded({
    extended: true,
  })
); // support URL-encoded bodies

// 1. Register a user

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = fakeDB.find((user) => user.email === email);
    if (user) throw new Error("User already exists");
    // 2. If user not exists hash the password
    const hashedPassword = await hash(password, 10);
    // 3. Insert the user in 'database'
    fakeDB.push({
      id: fakeDB.length,
      email,
      password: hashedPassword,
    });

    res.send({
      message: "User Created",
    });

    console.log(fakeDB);
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
});

// Login a user

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user in 'database'. If not exist send error.
    const user = fakeDB.find((user) => user.email === email);
    if (!user) throw new Error("User does not exist");

    // 2. Compare crypted password and see if it checks out. Send error if not

    const valid = await compare(password, user.password);
    if (!valid) throw new Error("Password is not correct.");
    // 3. Create a refresh and accesstoken
    const accesstoken = createAccessToken(user.id, user.name, user.type);
    const refreshtoken = createRefreshToken(user.id);
    // Versions of tokens???

    // 4. Put the refreshtoken in the DB;
    user.refreshtoken = refreshtoken;
    console.log(fakeDB);

    // 5. Send tokens. Refresh token as a cookie and accesstoken as a regular response
    sendRefreshToken(res, refreshtoken);
    sendAccessToken(res, req, accesstoken, user.name, user.type);
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
});

// 3. Logout a user

app.post("/logout", (_req, res) => {
  res.clearCookie("refreshtoken", { path: "/refresh_token" }); // Change the token name accordingly
  return res.send({
    message: "Logged out",
  });
});

// 4. Protected route
app.post("/protected", async (req, res) => {
  try {
    const userDetail = isAuth(req);
    console.log("userId: ", userDetail.userId);

    // if (userDetail.userId !== null) {
    //   res.send({
    //     data: "This is protected data.",
    //   });
    // }

    if (userDetail.type === 2) {
      res.send({
        data: "You are an admin.",
      });
    } else {
      res.send({
        data: "Welcome user.",
      });
    }
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
});
app.post("/protected-admin", async (req, res) => {
  try {
    const userDetail = isAuth(req);
    console.log("userId: ", userDetail.userId);

    // if (userDetail.userId !== null) {
    //   res.send({
    //     data: "This is protected data.",
    //   });
    // }

    if (userDetail.type === 2) {
      res.send({
        data: "Congratulations for making this far!",
      });
    } else {
      res.send({
        data: "You are not allowed to see this.",
      });
    }
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
});

// 5. Get a new access token with a refresh token

app.post("/refresh_token", (req, res) => {
  // Change the route
  const token = req.cookies.refreshtoken;
  // If no token in request
  if (!token)
    return res.send({
      accesstoken: "",
    });

  // If token there is a in request verify it.
  let payload = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.send({ accesstoken: "" });
  }

  const user = fakeDB.find((user) => user.id === payload.userId);
  if (!user) return res.send({ accesstoken: "" });

  // If user exists, check if refresh token exists on user
  if (user.refreshtoken !== token) {
    return res.send({ accesstoken: "" });
  }

  console.log("refresh_token user: ", user);

  // If token exists, create new Refresh token and Access token

  const accesstoken = createAccessToken(user.id, user.name, user.type);
  const refreshtoken = createRefreshToken(user.id);
  user.refreshtoken = refreshtoken;

  // If everything ok, send new refreshtoken and accesstoken
  sendRefreshToken(res, refreshtoken);
  return res.send({
    accesstoken,
    userId: user.id,
    name: user.name,
    type: user.type,
  });
});

app.listen(process.env.PORT, () =>
  console.log(`Server is running on port ${process.env.PORT}`)
);
