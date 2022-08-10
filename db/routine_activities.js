const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [activities],
    } = await client.query(
      `
        INSERT INTO routine_activities("routineId", "activityId", count, duration)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("routineId", "activityId") DO NOTHING
        RETURNING *;
  `,
      [routineId, activityId, count, duration]
    );

    return activities;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
      `
    SELECT *
    FROM routine_activities
    WHERE id=$1;
    `,
      [id]
    );
    return routineActivity;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routineActivities } = await client.query(
      `
    SELECT *
    FROM routine_activities
    WHERE "routineId"=$1;
    `,
      [id]
    );
    return routineActivities;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, idx) => `${key}=$${idx + 1}`)
    .join(",");
  if (!setString) {
    return;
  }
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
      `
  UPDATE routine_activities
  SET ${setString}
  WHERE id=${id}
  RETURNING *;
  `,
      Object.values(fields)
    );

    return routineActivity;
  } catch (error) {
    console.error;
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const {
      rows: [deletedRoutineActivity],
    } = await client.query(
      `
  DELETE FROM routine_activities
  WHERE id=$1
  RETURNING id;
  `,
      [id]
    );
    return deletedRoutineActivity;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
      `
  SELECT routine_activities.*, routines."creatorId"
  FROM routine_activities
  JOIN routines ON routine_activities."routineId"=routines.id
  WHERE routine_activities.id=$1 AND "creatorId"=$2;
  `,
      [routineActivityId, userId]
    );
    return routineActivity;
  } catch (error) {
    console.error;
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};