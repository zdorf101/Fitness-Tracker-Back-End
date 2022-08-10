const express = require("express");
const { addActivityToRoutine } = require("../db/routine_activities");
const router = express.Router();
const {
  getAllPublicRoutines,
  createRoutine,
  getRoutineById,
  updateRoutine,
  destroyRoutine,
} = require("../db/routines");
const { requireUser } = require("./utils");


router.get("/", async (req, res, next) => {
  try {
    const response = await getAllPublicRoutines();

    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireUser, async (req, res, next) => {
  try {
    const { isPublic, name, goal } = req.body;
    const creatorId = req.user.id;
    const response = await createRoutine({ creatorId, isPublic, name, goal });

    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.patch("/:routineId", requireUser, async (req, res, next) => {
  const updateObj = {};
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;
  const { creatorId, name: originalName } = await getRoutineById(routineId);
  try {
    updateObj.isPublic = isPublic;
    if (name) {
      updateObj.name = name;
    }
    if (goal) {
      updateObj.goal = goal;
    }
    if (await getRoutineById(routineId)) {
      updateObj.id = routineId;
    } else {
      next({
        name: "RoutineNotFoundError",
        message: `Routine ${routineId} not found`,
        error: "Error!",
      });
    }
    if (creatorId === req.user.id) {
      const response = await updateRoutine(updateObj);
      res.send(response);
    } else {
      next({
        error: "Error!",
        name: "NotCreatorOfRoutine",
        message: `User ${req.user.username} is not allowed to update ${originalName}`,
        status: 403,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/:routineId", requireUser, async (req, res, next) => {
  const { routineId } = req.params;

  try {
    const response = await getRoutineById(routineId);
    const { name } = response;
    const routineCreatorId = response.creatorId;

    if (routineCreatorId === req.user.id) {
      await destroyRoutine(routineId);

      res.send(response);
    } else {
      next({
        error: "Error!",
        name: "NotCreatorOfRoutine",
        message: `User ${req.user.username} is not allowed to delete ${name}`,
        status: 403,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/:routineId/activities", async (req, res, next) => {
  const { routineId, activityId, count, duration } = req.body;
  try {
    const response = await addActivityToRoutine({
      routineId,
      activityId,
      count,
      duration,
    });
    response
      ? res.send(response)
      : next({
          error: "Error!",
          message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
          name: "CanNotDuplicateActivity/RoutineId",
        });
  } catch (error) {
    next(error);
  }
});

// GET /api/routines

// POST /api/routines

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;