const MIN_LENGTH = 8;

function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= MIN_LENGTH &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password)
  );
}

module.exports = { isValidPassword, MIN_LENGTH };
