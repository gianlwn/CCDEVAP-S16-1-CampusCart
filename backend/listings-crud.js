function updateListingFields(listings, id, updates) {
  return listings.map((l) => (l.id === id ? { ...l, ...updates } : l));
}

function removeListingById(listings, id) {
  return listings.filter((l) => l.id !== id);
}

function buildNewListing(
  name,
  price,
  category,
  condition,
  description,
  quantity,
  location,
) {
  return {
    id: Date.now(),
    name,
    price: parseFloat(price),
    category,
    condition,
    description,
    quantity: parseInt(quantity) || 1,
    location,
    status: "pending_review",
    created: new Date().toISOString(),
  };
}

function saveListingEdit(
  listings,
  id,
  name,
  price,
  category,
  condition,
  location,
  description,
  quantity,
) {
  if (!listings.find((l) => l.id === id))
    return { success: false, error: "not_found" };
  if (!name || !price) return { success: false, error: "missing_fields" };
  return {
    success: true,
    listings: updateListingFields(listings, id, {
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity) || 1,
      category,
      condition,
      location,
      description,
    }),
  };
}

function deleteListingRecord(listings, id) {
  return { success: true, listings: removeListingById(listings, id) };
}
