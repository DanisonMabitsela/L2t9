const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const port = 8000;

app.use(bodyParser.json());

// Define the users and their permissions
const users = [
  { username: "Mazvita", permissions: ["/a"] },
  { username: "Meagan", permissions: ["/a", "/b"] },
  { username: "Kabelo", permissions: ["/b", "/c"] },
];

// Authentication endpoint (/login)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Authenticate the user and retrieve their permissions
  const user = users.find((u) => u.username === username);
  if (user && password === "secret") {
    const payload = {
      name: username,
      permissions: user.permissions,
    };

    const token = jwt.sign(payload, "jwt-secret", { algorithm: "HS256" });

    res.send({ token });
  } else {
    res.status(403).send({ err: "Incorrect login!" });
  }
});

// verifying the JWT and check permissions
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ err: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "jwt-secret");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send({ err: "Invalid JWT" });
  }
}

// Route-specific middleware to check permissions
function checkPermissions(permissions) {
  return function (req, res, next) {
    const userPermissions = req.user.permissions;

    for (const permission of permissions) {
      if (!userPermissions.includes(permission)) {
        return res.status(403).send({ err: "Unauthorized" });
      }
    }

    next();
  };
}

// Protected routes
app.get("/a", authenticate, checkPermissions(["/a"]), (req, res) => {
  res.send({ msg: "You have access to route /a." });
});

app.get("/b", authenticate, checkPermissions(["/b"]), (req, res) => {
  res.send({ msg: "You have access to route /b." });
});

app.get("/c", authenticate, checkPermissions(["/c"]), (req, res) => {
  res.send({ msg: "You have access to route /c." });
});

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
