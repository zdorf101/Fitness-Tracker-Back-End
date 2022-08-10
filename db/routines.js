const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routines],
    } = await client.query(
      `
  INSERT INTO routines("creatorId", "isPublic", name, goal)
  VALUES ($1,$2,$3,$4)
  RETURNING *;
  `,
      [creatorId, isPublic, name, goal]
    );
    return routines;
  } catch (error) {
    console.error;
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
  SELECT *
  FROM routines
  WHERE id=$1;
  `,
      [id]
    );

    return routine;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function getRoutinesWithoutActivities() {
  try {
    const { rows: routinesWithoutActivities } = await client.query(`
  SELECT *
  FROM routines;
  `);
    return routinesWithoutActivities;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
SELECT routines.*, users.username AS "creatorName"
FROM routines
JOIN users ON routines."creatorId"=users.id;
`);

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error;
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows } = await client.query(`
    SELECT routines.*, users.username AS "creatorName" 
    FROM routines
    JOIN users ON  routines."creatorId"=users.id
    WHERE "isPublic"='true';
    `);
    const routinesToReturn = await attachActivitiesToRoutines(rows);

    return routinesToReturn;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(
      `
    SELECT routines.*, users.username AS "creatorName" 
    FROM routines
    JOIN users ON  routines."creatorId"=users.id
    WHERE "username"=$1;
    `,
      [username]
    );

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error;
    throw error;
  }
}
async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(
      `
    SELECT routines.*, users.username AS "creatorName" 
    FROM routines
    JOIN users ON  routines."creatorId"=users.id
    WHERE "isPublic"='true' AND "username"=$1;
    `,
      [username]
    );
    return attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error;
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(
      `
    SELECT routines.*, users.username AS "creatorName", routine_activities."activityId"
    FROM routines
    JOIN users ON routines."creatorId"=users.id
    JOIN routine_activities ON routines.id=routine_activities."routineId"
    WHERE "activityId"=$1 AND "isPublic"='true';
    `,
      [id]
    );

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error;
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, idx) => `"${key}"=$${idx + 1}`)
    .join(",");
  if (!setString) {
    return;
  }
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
    UPDATE routines
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `,
      Object.values(fields)
    );
    return routine;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function destroyRoutine(id) {
  try {
    await client.query(
      `
  DELETE FROM routine_activities
  WHERE "routineId"=$1;
  `,
      [id]
    );
    await client.query(
      `
  DELETE FROM routines
  WHERE id=$1;
  `,
      [id]
    );
  } catch (error) {
    console.error;
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};