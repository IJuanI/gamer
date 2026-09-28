const bcrypt = require('bcryptjs');

const users = [
  { email: 'admin@local', displayName: 'Admin GamER', role: 'ADMIN', password: 'admin1234' },
  { email: 'editor@local', displayName: 'Editor GamER', role: 'EDITOR', password: 'editor1234' },
  { email: 'member@local', displayName: 'Miembro GamER', role: 'MEMBER', password: 'member1234' }
];

(async () => {
  console.log('INSERT INTO users (id, email, displayName, passwordHash, role, createdAt, updatedAt) VALUES');
  const rows = [];
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    const id = 'user-' + u.role.toLowerCase() + '-001';
    rows.push(`  ('${id}', '${u.email}', '${u.displayName}', '${hash}', '${u.role}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
  }
  console.log(rows.join(',\n') + ';');
})();
