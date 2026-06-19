const fs = require('fs');
let s = fs.readFileSync('server.js', 'utf-8');

const old = `app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }
  // Try external API first (server-to-server, no CORS)
  const ext = await forwardAuth('/Auth/login', { email, password });
  if (ext.ok) {
    const extUser = ext.data.user || {};
    const user = { id: extUser.id || Date.now(), name: extUser.name || email.split('@')[0], email, role: extUser.role || 'Customer' };
    const idx = users.findIndex(u => u.email === email);
    if (idx >= 0) users[idx] = user; else users.push(user);
    return res.json({ user, token: ext.data.token });
  }
  // Fall back to local mock — only allow registered users
  const existingUser = users.find(u => u.email === email);
  if (!existingUser) {
    return res.status(401).json({ message: 'Account not found. Please register first.' });
  }
  const token = \`mock-token-\${existingUser.id}\`;
  return res.json({ user: existingUser, token });
});`;

const replacement = `app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }
  // Try external API first (server-to-server, no CORS)
  const ext = await forwardAuth('/Auth/login', { email, password });
  if (ext.ok) {
    const extUser = ext.data.user || {};
    const user = { id: extUser.id || Date.now(), name: extUser.name || email.split('@')[0], email, role: extUser.role || 'Customer' };
    const idx = users.findIndex(u => u.email === email);
    if (idx >= 0) users[idx] = user; else users.push(user);
    return res.json({ user, token: ext.data.token });
  }
  // Only fall back to local mock if external API was unreachable (network error)
  if (ext.message === 'External API unreachable') {
    const existingUser = users.find(u => u.email === email);
    if (!existingUser) {
      return res.status(401).json({ message: 'Account not found. Please register first.' });
    }
    if (existingUser.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = \`mock-token-\${existingUser.id}\`;
    return res.json({ user: { id: existingUser.id, name: existingUser.name, email: existingUser.email, role: existingUser.role }, token });
  }
  // External API rejected the credentials — forward its error
  return res.status(ext.status || 401).json({ message: ext.message || 'Invalid email or password.' });
});`;

if (s.includes(old)) {
  s = s.replace(old, replacement);
  fs.writeFileSync('server.js', s, 'utf-8');
  console.log('Login endpoint updated successfully');
} else {
  console.log('Could not find exact match. Searching...');
  const idx = s.indexOf(`app.post('/api/auth/login'`);
  if (idx >= 0) {
    console.log('Found at index', idx);
    console.log('Context:', s.substring(idx, idx + 300));
  } else {
    console.log('Not found at all');
  }
}
