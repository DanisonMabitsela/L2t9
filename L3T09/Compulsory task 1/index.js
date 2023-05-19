const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const port = 8000;

app.use(bodyParser.json());

// Authentication endpoint (/login)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check username and password
  if (username === "Kwena" && password === "secret") {
    const payload = {
      name: username,
      admin: true,
    };

    const token = jwt.sign(payload, "jwt-secret", { algorithm: "HS256" });

    res.send({ token });
  } else {
    res.status(403).send({ err: "Incorrect login!" });
  }
});

// Resource endpoint (/resource)
app.get("/resource", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ err: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "jwt-secret");
    res.send({
      msg: `Hello, ${decoded.name}! Your JSON Web Token has been verified.`,
    });
  } catch (err) {
    res.status(401).send({ err: "Invalid JWT" });
  }
});

// Admin resource endpoint (/admin_resource)
app.get("/admin_resource", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ err: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "jwt-secret");
    if (decoded.admin) {
      res.send({ msg: "Success! You have access to the admin resource." });
    } else {
      res
        .status(403)
        .send({ msg: "You are not authorized to access the admin resource." });
    }
  } catch (err) {
    res.status(401).send({ err: "Invalid JWT" });
  }
});

app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
