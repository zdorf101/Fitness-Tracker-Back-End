const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");

router.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);

        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});


router.get("/health", async (req, res) => {
  const message = "All is well, enjoy the 200!";
  res.send({ message });
});

const usersRouter = require("./users");
router.use("/users", usersRouter);


const activitiesRouter = require("./activities");
router.use("/activities", activitiesRouter);


const routinesRouter = require("./routines");
router.use("/routines", routinesRouter);


const routineActivitiesRouter = require("./routineActivities");
router.use("/routine_activities", routineActivitiesRouter);

router.use((req, res, next) => {
  next({
    error: "Error!",
    name: "PageNotFound",
    message: "The page you are looking for is not here",
    status: 404,
  });
});


router.use((error, req, res, next) => {
  let errorStatus = 400;
  if (error.status) {
    errorStatus = error.status;
  }

  res.status(errorStatus).send({
    message: error.message,
    name: error.name,
    error: error.error,
  });
});
// GET /api/health
// ROUTER: /api/users
// ROUTER: /api/activities
// ROUTER: /api/routines
// ROUTER: /api/routine_activities

module.exports = router;