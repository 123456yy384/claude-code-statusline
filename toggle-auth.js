const fs = require('fs');
const path = require('path');
const os = require('os');

const authFile = path.join(os.homedir(), '.claude', 'auto-auth');

if (fs.existsSync(authFile)) {
  fs.unlinkSync(authFile);
  console.log('🔒 AUTO OFF — each action will ask for confirmation');
} else {
  fs.writeFileSync(authFile, '');
  console.log('🔓 AUTO ON — all actions auto-approved (via PermissionRequest hook)');
}
