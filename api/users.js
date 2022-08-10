const express = require("express");
const router = express.Router();
const { createUser, getUserByUsername, getUser } = require("../db/users");
const jwt = require("jsonwebtoken");
const { requireUser } = require("./utils");
const {
  getPublicRoutinesByUser,
  getAllRoutinesByUser,
} = require("../db/routines");

router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (password.length < 8) {
      next({
        name: "PasswordShortError",
        message: `Password Too Short!`,
        error: "Error!",
      });
    }

    if (await getUserByUsername(username)) {
      next({
        name: "UserExistError",
        message: `User ${username} is already taken.`,
        error: "Error!",
      });
    }
    const response = await createUser({ username, password });
    const token = jwt.sign(
      {
        id: response.id,
        username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1w" }
    );

    res.send({
      message: "Thank you for signing up",
      token,
      user: response,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { password, username } = req.body;
  try {
    const user = await getUser({ username, password });
    if (!user) {
      next({
        name: "Login Error",
        message: "Invalid credentials",
        error: "Error!",
      });
    }


    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1w" }
    );

    res.send({
      message: "you're logged in!",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
});
router.get("/me", requireUser, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});
router.get("/:username/routines", async (req, res, next) => {
  try {
    const Username = req.params;

    if (req.user && Username.username === req.user.username) {
      const response = await getAllRoutinesByUser(Username);
      res.send(response);
    } else {
      const response = await getPublicRoutinesByUser(Username);
      res.send(response);
    }
  } catch (error) {
    next(error);
  }
});
// POST /api/users/login

// POST /api/users/register

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
