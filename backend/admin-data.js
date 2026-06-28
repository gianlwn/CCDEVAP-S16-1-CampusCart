const _adminsData = [
  {
    username: "Mikyla Kirsten Aguirre",
    email: "mikyla_kirsten_aguirre@dlsu.edu.ph",
    status: "active",
  },
  {
    username: "Giancarlo Lawan",
    email: "giancarlo_lawan@dlsu.edu.ph",
    status: "active",
  },
  {
    username: "Bernard Florian Llagas",
    email: "bernard_florian_llagas@dlsu.edu.ph",
    status: "inactive",
  },
  {
    username: "Sky Hannah Parado",
    email: "sky_parado@dlsu.edu.ph",
    status: "active",
  },
  {
    username: "Camille Erika Sarabia",
    email: "camille_erika_sarabia@dlsu.edu.ph",
    status: "active",
  },
  { username: "Rafael Tan", email: "rafael_tan@dlsu.edu.ph", status: "active" },
  {
    username: "Jose Dela Vega",
    email: "jose_delavega@dlsu.edu.ph",
    status: "active",
  },
  {
    username: "Maria Santos",
    email: "maria_santos@dlsu.edu.ph",
    status: "active",
  },
  {
    username: "Luis Fernandez",
    email: "luis_fernandez@dlsu.edu.ph",
    status: "inactive",
  },
  { username: "Ana Cruz", email: "ana_cruz@dlsu.edu.ph", status: "active" },
  {
    username: "Carlos Ramos",
    email: "carlos_ramos@dlsu.edu.ph",
    status: "active",
  },
  {
    username: "Lea Bautista",
    email: "lea_bautista@dlsu.edu.ph",
    status: "active",
  },
  {
    username: "Diego Navarro",
    email: "diego_navarro@dlsu.edu.ph",
    status: "inactive",
  },
];
const _usersData = [
  {
    username: "Andie Kirsten Woo",
    email: "andie_woo@dlsu.edu.ph",
    dateJoined: "Jun 12, 2026",
    status: "active",
  },
  {
    username: "Alexa Nicole Pleyto",
    email: "alexa_pleyto@dlsu.edu.ph",
    dateJoined: "May 28, 2026",
    status: "suspended",
  },
  {
    username: "Christine Cote",
    email: "tintin_cote@dlsu.edu.ph",
    dateJoined: "Apr 04, 2026",
    status: "banned",
  },
  {
    username: "Marco Dela Cruz",
    email: "marco_delacruz@dlsu.edu.ph",
    dateJoined: "Mar 15, 2026",
    status: "active",
  },
  {
    username: "Ria Magpantay",
    email: "ria_magpantay@dlsu.edu.ph",
    dateJoined: "Feb 20, 2026",
    status: "active",
  },
  {
    username: "Janna Reyes",
    email: "janna_reyes@dlsu.edu.ph",
    dateJoined: "Jan 08, 2026",
    status: "active",
  },
  {
    username: "Eli Santos",
    email: "eli_santos@dlsu.edu.ph",
    dateJoined: "Dec 02, 2025",
    status: "suspended",
  },
  {
    username: "Dana Flores",
    email: "dana_flores@dlsu.edu.ph",
    dateJoined: "Nov 19, 2025",
    status: "active",
  },
  {
    username: "Paolo Mendoza",
    email: "paolo_mendoza@dlsu.edu.ph",
    dateJoined: "Oct 15, 2025",
    status: "active",
  },
  {
    username: "Bianca Torres",
    email: "bianca_torres@dlsu.edu.ph",
    dateJoined: "Sep 22, 2025",
    status: "active",
  },
  {
    username: "Kyle Reyes",
    email: "kyle_reyes@dlsu.edu.ph",
    dateJoined: "Aug 10, 2025",
    status: "suspended",
  },
  {
    username: "Lia Castillo",
    email: "lia_castillo@dlsu.edu.ph",
    dateJoined: "Jul 30, 2025",
    status: "active",
  },
  {
    username: "Noel Garcia",
    email: "noel_garcia@dlsu.edu.ph",
    dateJoined: "Jun 05, 2025",
    status: "banned",
  },
  {
    username: "Sofia Aquino",
    email: "sofia_aquino@dlsu.edu.ph",
    dateJoined: "May 18, 2025",
    status: "active",
  },
  {
    username: "Anton Villanueva",
    email: "anton_villanueva@dlsu.edu.ph",
    dateJoined: "Apr 02, 2025",
    status: "active",
  },
];
const _listingApprovalsData = [
  {
    productName: "Casio FX-991EX",
    listingId: "LST-1001",
    price: 250,
    seller: "Kathryn Bernardo",
    category: "Electronics",
    condition: "Good",
    description:
      "Scientific calculator in great condition. Minor scratches on the back. Comes with the original case.",
    images: ["Photo 1", "Photo 2", "Photo 3"],
  },
  {
    productName: "Chemistry Lab Kit",
    listingId: "LST-1002",
    price: 950,
    seller: "Kimi Antonelli",
    category: "Lab Tools",
    condition: "New",
    description:
      "Brand new lab kit, never opened. Bought for CHEM1 but ended up not using it.",
    images: ["Photo 1", "Photo 2"],
  },
  {
    productName: "Engineering Mechanics Textbook",
    listingId: "LST-1003",
    price: 500,
    seller: "Garrett Graham",
    category: "Books",
    condition: "Used",
    description:
      "Meriam & Kraige, 7th edition. Pages are highlighted but still very readable.",
    images: ["Photo 1"],
  },
  {
    productName: "DLSU PE Uniform Set",
    listingId: "LST-1004",
    price: 310,
    seller: "Jeron Teng",
    category: "Clothing",
    condition: "Good",
    description: "XL size, worn only a few times. Washed and clean.",
    images: ["Photo 1", "Photo 2", "Photo 3", "Photo 4"],
  },
  {
    productName: "Arduino Mega 2560",
    listingId: "LST-1005",
    price: 480,
    seller: "Ria Magpantay",
    category: "Electronics",
    condition: "Used",
    description:
      "Fully functional Arduino Mega. Tested before listing. No shields included.",
    images: ["Photo 1", "Photo 2"],
  },
  {
    productName: "Fluid Mechanics Textbook",
    listingId: "LST-1006",
    price: 380,
    seller: "Marco Dela Cruz",
    category: "Books",
    condition: "Good",
    description:
      "Cengel & Cimbala, 3rd edition. Some annotations in pencil, easy to erase.",
    images: ["Photo 1"],
  },
  {
    productName: "Lab Goggles (Pack of 2)",
    listingId: "LST-1007",
    price: 120,
    seller: "Dana Flores",
    category: "Lab Tools",
    condition: "New",
    description:
      "Never used, sealed pack. Safety goggles required for CHEM lab.",
    images: ["Photo 1", "Photo 2"],
  },
  {
    productName: "DLSU Lanyard + ID Holder",
    listingId: "LST-1008",
    price: 80,
    seller: "Janna Reyes",
    category: "Others",
    condition: "Good",
    description:
      "Official DLSU lanyard, slightly used. ID holder is still clear and intact.",
    images: ["Photo 1"],
  },
  {
    productName: "Organic Chemistry Textbook",
    listingId: "LST-1009",
    price: 420,
    seller: "Paolo Mendoza",
    category: "Books",
    condition: "Good",
    description:
      "Wade 8th edition. Some highlighting throughout but text is clear and readable.",
    images: ["Photo 1", "Photo 2"],
  },
  {
    productName: "Graph Paper Pads (3 packs)",
    listingId: "LST-1010",
    price: 75,
    seller: "Bianca Torres",
    category: "School Supplies",
    condition: "New",
    description:
      "Sealed packs, never opened. Bought extras by mistake for MATH class.",
    images: ["Photo 1"],
  },
  {
    productName: "TI-84 Plus Graphing Calculator",
    listingId: "LST-1011",
    price: 1200,
    seller: "Kyle Reyes",
    category: "Electronics",
    condition: "Good",
    description:
      "Fully functional. Battery replaced last month. Comes with protective cover and manual.",
    images: ["Photo 1", "Photo 2", "Photo 3"],
  },
  {
    productName: "DLSU Engineering Uniform",
    listingId: "LST-1012",
    price: 450,
    seller: "Lia Castillo",
    category: "Clothing",
    condition: "Used",
    description:
      "Medium size, worn for one term only. Washed and in good condition.",
    images: ["Photo 1", "Photo 2"],
  },
  {
    productName: "Breadboard + Jumper Wires Kit",
    listingId: "LST-1013",
    price: 180,
    seller: "Noel Garcia",
    category: "Electronics",
    condition: "Good",
    description:
      "830-point breadboard with 65-piece jumper wire set. Used for one project only.",
    images: ["Photo 1"],
  },
  {
    productName: "Data Structures and Algorithms Book",
    listingId: "LST-1014",
    price: 560,
    seller: "Sofia Aquino",
    category: "Books",
    condition: "Used",
    description:
      "Cormen et al., 3rd edition. Annotations in pencil on a few pages, otherwise clean.",
    images: ["Photo 1", "Photo 2"],
  },
];
const _categoriesData = [
  { categoryName: "Electronics" },
  { categoryName: "Clothing" },
  { categoryName: "School Supplies" },
  { categoryName: "Books" },
  { categoryName: "Lab Tools" },
  { categoryName: "Others" },
  { categoryName: "Instruments" },
  { categoryName: "Sports & Fitness" },
];
const _reportsData = [
  {
    reportType: "User Report",
    reportId: "RPT-3012",
    reporter: "Andie Kirsten Woo",
    status: "Pending Review",
    reason: "Spam account repeatedly posting misleading listings.",
    subject: "User: @marie_santos",
    date: "Jun 14, 2026",
  },
  {
    reportType: "Listing Report",
    reportId: "RPT-3013",
    reporter: "Alexa Nicole Pleyto",
    status: "Pending Review",
    reason: "Possible scam listing requesting payment outside the website.",
    subject: "Listing: Casio FX-991EX",
    date: "Jun 15, 2026",
  },
  {
    reportType: "User Report",
    reportId: "RPT-3014",
    reporter: "Christine Cote",
    status: "Pending Review",
    reason: "Hate speech directed toward another user in listing comments.",
    subject: "User: @jay_ramos",
    date: "Jun 15, 2026",
  },
  {
    reportType: "Review Report",
    reportId: "RPT-3015",
    reporter: "Mara R.",
    status: "Pending Review",
    reason:
      "Review contains false information and is clearly from a competitor account.",
    subject: "Review on: Scientific Calculator",
    date: "Jun 16, 2026",
  },
  {
    reportType: "Listing Report",
    reportId: "RPT-3016",
    reporter: "Sam V.",
    status: "Pending Review",
    reason: "Listing price is grossly inflated compared to market value.",
    subject: "Listing: Arduino Uno Kit",
    date: "Jun 17, 2026",
  },
  {
    reportType: "User Report",
    reportId: "RPT-3017",
    reporter: "Eli Santos",
    status: "Pending Review",
    reason:
      "User is sending unsolicited messages to buyers asking for payment via GCash only.",
    subject: "User: @kai_a",
    date: "Jun 18, 2026",
  },
  {
    reportType: "Listing Report",
    reportId: "RPT-3018",
    reporter: "Janna Reyes",
    status: "Pending Review",
    reason: "Item listed is prohibited under campus marketplace rules.",
    subject: "Listing: Chemistry Lab Kit",
    date: "Jun 19, 2026",
  },
  {
    reportType: "Listing Report",
    reportId: "RPT-3019",
    reporter: "Paolo Mendoza",
    status: "Pending Review",
    reason:
      "Listing photos are stolen from another platform. Seller is not the original owner.",
    subject: "Listing: DLSU PE Uniform Set",
    date: "Jun 20, 2026",
  },
  {
    reportType: "User Report",
    reportId: "RPT-3020",
    reporter: "Bianca Torres",
    status: "Pending Review",
    reason:
      "User refused to complete a transaction after payment was sent outside the platform.",
    subject: "User: @noel_garcia",
    date: "Jun 21, 2026",
  },
  {
    reportType: "Review Report",
    reportId: "RPT-3021",
    reporter: "Dana Flores",
    status: "Pending Review",
    reason:
      "Review contains abusive language and is clearly targeted harassment toward the seller.",
    subject: "Review on: Lab Goggles",
    date: "Jun 22, 2026",
  },
  {
    reportType: "Listing Report",
    reportId: "RPT-3022",
    reporter: "Kyle Reyes",
    status: "Pending Review",
    reason:
      "Duplicate listing posted multiple times to push other sellers down the queue.",
    subject: "Listing: Arduino Mega 2560",
    date: "Jun 23, 2026",
  },
  {
    reportType: "User Report",
    reportId: "RPT-3023",
    reporter: "Lia Castillo",
    status: "Pending Review",
    reason:
      "Account appears to be a bot creating fake listings with no intention to sell.",
    subject: "User: @bot_seller99",
    date: "Jun 23, 2026",
  },
];
// --- Low-level accessors ---
function getAdmins() {
  return _adminsData;
}
function addAdminRecord(name, email) {
  _adminsData.push({ username: name, email, status: "active" });
}
function editAdminRecord(oldName, newName, email) {
  const admin = _adminsData.find((a) => a.username === oldName);
  if (admin) {
    admin.username = newName;
    admin.email = email;
  }
}
function revokeAdminAccess(name) {
  const admin = _adminsData.find((a) => a.username === name);
  if (admin) admin.status = "inactive";
}
function getUsers() {
  return _usersData;
}
function updateUserStatus(email, newStatus) {
  const user = _usersData.find((u) => u.email === email);
  if (user) user.status = newStatus;
}
function getListingApprovals() {
  return _listingApprovalsData;
}
function processApprovalRecord(listingId) {
  const idx = _listingApprovalsData.findIndex((l) => l.listingId === listingId);
  if (idx !== -1) _listingApprovalsData.splice(idx, 1);
}
function getCategories() {
  return _categoriesData;
}
function addCategoryRecord(name) {
  _categoriesData.push({ categoryName: name });
}
function editCategoryRecord(oldName, newName) {
  const cat = _categoriesData.find((c) => c.categoryName === oldName);
  if (cat) cat.categoryName = newName;
}
function deleteCategoryRecord(name) {
  const idx = _categoriesData.findIndex((c) => c.categoryName === name);
  if (idx !== -1) _categoriesData.splice(idx, 1);
}
function getReports() {
  return _reportsData;
}
// --- High-level CRUD handlers (validate + mutate + return result) ---
function createAdmin(name, email) {
  if (!name || !email) return { success: false, error: "missing_fields" };
  addAdminRecord(name, email);
  return { success: true };
}
function updateAdmin(oldName, newName, email) {
  if (!newName || !email) return { success: false, error: "missing_fields" };
  editAdminRecord(oldName, newName, email);
  return { success: true };
}
function revokeAdmin(name) {
  const admin = getAdmins().find((a) => a.username === name);
  if (!admin) return { success: false, error: "not_found" };
  if (admin.status === "inactive")
    return { success: false, error: "already_revoked" };
  revokeAdminAccess(name);
  return { success: true };
}
function setUserStatus(email, newStatus) {
  if (!newStatus) return { success: false, error: "missing_fields" };
  updateUserStatus(email, newStatus);
  return { success: true };
}
function toggleUserBan(email) {
  const user = getUsers().find((u) => u.email === email);
  if (!user) return { success: false, error: "not_found" };
  const wasBanned = user.status === "banned";
  const newStatus = wasBanned ? "active" : "banned";
  updateUserStatus(email, newStatus);
  return { success: true, newStatus, wasBanned };
}
function processApproval(listingId, action) {
  processApprovalRecord(listingId);
  return { success: true, action };
}
function createCategory(name) {
  if (!name) return { success: false, error: "missing_fields" };
  addCategoryRecord(name);
  return { success: true };
}
function updateCategory(oldName, newName) {
  if (!newName) return { success: false, error: "missing_fields" };
  editCategoryRecord(oldName, newName);
  return { success: true };
}
function removeCategory(name) {
  deleteCategoryRecord(name);
  return { success: true };
}
