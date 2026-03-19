// ─────────────────────────────────────────────────────────
// auth.js — Simple password protection middleware
// ─────────────────────────────────────────────────────────

// Read password from environment
const PASSWORD = process.env.APP_PASSWORD || '';
const USERNAME = process.env.APP_USERNAME || 'reader';

// Express middleware: requires HTTP Basic Auth
function requireAuth(req, res, next) {
  // If no password is set, skip auth (allow public access)
  if (!PASSWORD) {
    return next();
  }

  const authHeader = req.get('Authorization');

  // Check for Basic Auth header
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // No credentials provided — send challenge
    res.set('WWW-Authenticate', 'Basic realm="Neutral News"');
    return res.status(401).send('Password required. Enter username and password in the popup.');
  }

  // Decode Base64 credentials
  const encoded = authHeader.slice(6); // Remove "Basic "
  let decoded;
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  } catch (err) {
    res.set('WWW-Authenticate', 'Basic realm="Neutral News"');
    return res.status(401).send('Invalid credentials.');
  }

  const [user, pass] = decoded.split(':');

  // Check username and password
  if (user === USERNAME && pass === PASSWORD) {
    return next(); // Auth passed
  }

  // Wrong credentials
  res.set('WWW-Authenticate', 'Basic realm="Neutral News"');
  return res.status(401).send('Invalid username or password.');
}

module.exports = { requireAuth };
