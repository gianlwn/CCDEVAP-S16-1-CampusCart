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
