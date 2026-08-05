function titleCase(str) {
  return str
    .trim()
    .split(/\s+/)
    .map((word) =>
      word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join("-"),
    )
    .join(" ");
}
module.exports = titleCase;
