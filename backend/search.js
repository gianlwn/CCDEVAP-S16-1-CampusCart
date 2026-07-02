function filterListings(
  items,
  { category, query, conditions, minPrice, maxPrice },
) {
  let results = items;
  if (category && category !== "all") {
    results = results.filter((i) => i.category === category);
  }
  if (query) {
    results = results.filter((i) => {
      const categories = i.categories?.length ? i.categories : [i.category];
      return (
        i.name.toLowerCase().includes(query) ||
        (i.description?.toLowerCase() || "").includes(query) ||
        (i.seller?.toLowerCase() || "").includes(query) ||
        categories.some((c) => (c || "").toLowerCase().includes(query))
      );
    });
  }
  if (conditions && conditions.length) {
    results = results.filter((i) => conditions.includes(i.condition));
  }
  if (minPrice > 0) {
    results = results.filter((i) => i.price >= minPrice);
  }
  if (maxPrice < Infinity) {
    results = results.filter((i) => i.price <= maxPrice);
  }
  return results;
}
