// Strips Mongo operator keys ($gt, $where, "a.b", ...) out of user-controlled
// input so it can never be interpreted as a query operator by Mongoose/MongoDB.
// Mutates objects in place instead of reassigning req.query/req.body, since
// Express 5 exposes req.query as a getter-only property.
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stripDangerousKeys(input) {
  if (Array.isArray(input)) {
    input.forEach(stripDangerousKeys);
    return input;
  }
  if (!isPlainObject(input)) return input;

  for (const key of Object.keys(input)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete input[key];
      continue;
    }
    stripDangerousKeys(input[key]);
  }
  return input;
}

function sanitizeInput(req, res, next) {
  stripDangerousKeys(req.body);
  stripDangerousKeys(req.query);
  stripDangerousKeys(req.params);
  next();
}

module.exports = sanitizeInput;
