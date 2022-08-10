const client = require("./client");

async function createActivity({ name, description }) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
  INSERT INTO activities(name, description)
  VALUES ($1, $2)
  ON CONFLICT (name) DO NOTHING
  RETURNING *;
  `,
      [name, description]
    );

    return activity;
  } catch (error) {
    console.error;
  }
}
async function getAllActivities() {
  try {
    const { rows: activities } = await client.query(`
    SELECT *
    FROM activities;
    `);
    return activities;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function getActivityById(id) {
  try {
    const {
      rows: [activities],
    } = await client.query(
      `
    SELECT *
    FROM activities
    WHERE id=$1;
    `,
      [id]
    );
    return activities;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function getActivityByName(name) {
  try {
    const {
      rows: [activities],
    } = await client.query(
      `
    SELECT *
    FROM activities
    WHERE name=$1
    `,
      [name]
    );
    return activities;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function attachActivitiesToRoutines(routines) {
  const routinesToReturn = [...routines];
  const binds = routines.map((_, index) => `$${index + 1}`).join(", ");
  const routineIds = routines.map((routine) => routine.id);
  if (!routineIds?.length) return [];
  try {
    const { rows: activities } = await client.query(
      `
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${binds});
    `,
      routineIds
    );

    for (const routine of routinesToReturn) {
      const activitiesToAdd = activities.filter(
        (activity) => activity.routineId === routine.id
      );
      routine.activities = activitiesToAdd;
    }
    return routinesToReturn;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function updateActivity({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, idx) => `"${key}"=$${idx + 1}`)
    .join(",");
  try {
    const {
      rows: [activities],
    } = await client.query(
      `
    UPDATE activities
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `,
      Object.values(fields)
    );
    return activities;
  } catch (error) {
    console.error;
    throw error;
  }
// database functions
// select and return an array of all activities
// return the new activity

// don't try to update the id
// do update the name and description
// return the updated activity

}
module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};

