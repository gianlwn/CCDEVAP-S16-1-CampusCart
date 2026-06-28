/**
 * Generates the next sequential ID for a collection.
 * e.g. generateId(User, 'user_id', 'user_id_') → 'user_id_9'
 */
async function generateId(Model, field, prefix) {
  const regex = new RegExp(`^${prefix}\\d+$`);
  const last = await Model.findOne({ [field]: regex }).sort({ [field]: -1 });
  const lastNum = last ? parseInt(last[field].replace(prefix, '')) : 0;
  return `${prefix}${lastNum + 1}`;
}

module.exports = generateId;
