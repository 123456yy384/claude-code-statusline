const fs = require('fs');
const path = require('path');
const os = require('os');

let data = '';
process.stdin.on('data', c => data += c);
process.stdin.on('end', () => {
  const d = JSON.parse(data);
  const authFile = path.join(os.homedir(), '.claude', 'auto-auth');

  // Always allow toggle-auth — needed to re-enable auto mode
  const input = JSON.stringify(d.tool_input || '');
  if (input.includes('toggle-auth')) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PermissionRequest',
        decision: { behavior: 'allow' }
      }
    }));
    return;
  }

  if (fs.existsSync(authFile)) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PermissionRequest',
        decision: { behavior: 'allow' }
      }
    }));
  } else {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PermissionRequest',
        decision: { behavior: 'ask' }
      }
    }));
  }
});
