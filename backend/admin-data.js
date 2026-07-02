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
