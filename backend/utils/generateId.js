async function generateId(Model, field, prefix) {
  const regex = new RegExp(`^${prefix}\\d+$`);
  const docs = await Model.find({ [field]: regex }, { [field]: 1, _id: 0 });
  const maxNum = docs.reduce((max, doc) => {
    const n = parseInt(doc[field].replace(prefix, ""), 10);
    return n > max ? n : max;
  }, 0);
  return `${prefix}${maxNum + 1}`;
}
module.exports = generateId;
