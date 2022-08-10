const client = require("./client");
const bcrypt = require("bcrypt");

async function createUser({ username, password }) {
  try {
    const SALT_COUNT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
    const {
      rows: [user],
    } = await client.query(
      `
    INSERT INTO users(username, password)
    VALUES ($1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING username,id;
    `,
      [username, hashedPassword]
    );

    return user;
  } catch (error) {
    console.error;
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    SELECT id, username
    FROM users
    WHERE id=$1;
    `,
      [userId]
    );

    return user;
  } catch (error) {
    console.error;
    throw error;
  }
}

async function getUserByUsername(userName) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
SELECT *
FROM users
WHERE username=$1;
`,
      [userName]
    );
    return user;
  } catch (error) {
    console.error;
    throw error;
  }
}
async function getUser({ username, password }) {
  try {
    getUserById;
    const checkUser = await getUserByUsername(username);
    const hashedPassword = checkUser.password;
    const isValid = await bcrypt.compare(password, hashedPassword);

    if (isValid) {
      const {
        rows: [user],
      } = await client.query(
        `
      SELECT id, username
      FROM users
      WHERE username=$1 AND password=$2;
      `,
        [username, hashedPassword]
      );

      return user;
    } else {
      return null;
    }
  } catch (error) {
    console.error;
    throw error;
  }
}
module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
