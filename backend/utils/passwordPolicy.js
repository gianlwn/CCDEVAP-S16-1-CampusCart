const MIN_LENGTH = 8;

function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= MIN_LENGTH &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)
  );
}

module.exports = { isValidPassword, MIN_LENGTH };
