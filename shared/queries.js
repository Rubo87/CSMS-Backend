const getUsersQuery = "SELECT * FROM users";
const getUserQueryById = "SELECT * FROM users WHERE id = $1";
const createUserQuery = 'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)';
const deleteUserQueryById = "DELETE FROM users WHERE id = $1";
const updateUserQueryById = "UPDATE users SET first_name = $1, last_name = $2, age = $3, active = $4 WHERE id = $5";


module.exports = {
    getUsersQuery,
    getUserQueryById,
    createUserQuery,
    deleteUserQueryById,
    updateUserQueryById
  };