async function generateId(Model, field, prefix) {
  const regex = new RegExp(`^${prefix}\\d+$`);
  const last = await Model.findOne({ [field]: regex }).sort({ [field]: -1 });
  const lastNum = last ? parseInt(last[field].replace(prefix, "")) : 0;
  return `${prefix}${lastNum + 1}`;
}
module.exports = generateId;
