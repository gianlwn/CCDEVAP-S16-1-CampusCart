function applyItemReview(items, id, rating, comment) {
  return items.map((item) =>
    item.id === id
      ? { ...item, userRating: rating, userComment: comment }
      : item,
  );
}
function updateRatingEntry(ratings, id, star, review) {
  return ratings.map((r) => (r.id === id ? { ...r, rating: star, review } : r));
}
function removeRatingById(ratings, id) {
  return ratings.filter((r) => r.id !== id);
}
function removeCartItemById(items, id) {
  return items.filter((i) => String(i.id) !== String(id));
}
function submitItemReview(items, id, rating, comment) {
  if (!rating) return { success: false, error: "no_rating" };
  if (!items.find((c) => c.id === id))
    return { success: false, error: "not_found" };
  return { success: true, items: applyItemReview(items, id, rating, comment) };
}
function editRatingEntry(ratings, id, star, review) {
  const item = ratings.find((r) => r.id === id);
  if (!item) return { success: false, error: "not_found" };
  return {
    success: true,
    ratings: updateRatingEntry(
      ratings,
      id,
      star || item.rating,
      review || item.review,
    ),
  };
}
function deleteRatingRecord(ratings, id) {
  return { success: true, ratings: removeRatingById(ratings, id) };
}
function claimCartItem(items, id) {
  const item = items.find((i) => String(i.id) === String(id));
  if (!item) return { success: false, error: "not_found" };
  return {
    success: true,
    itemName: item.name,
    items: removeCartItemById(items, id),
  };
}
function cancelCartItem(items, id) {
  const item = items.find((i) => String(i.id) === String(id));
  if (!item) return { success: false, error: "not_found" };
  return {
    success: true,
    itemName: item.name,
    items: removeCartItemById(items, id),
  };
}
