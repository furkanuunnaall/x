// Keep Expo's no-watch mode usable on Macs without Watchman, including a QR.
const { spawn } = require('node:child_process');
const { createRequire } = require('node:module');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const fromExpo = createRequire(require.resolve('expo/package.json'));
const fromCLI = createRequire(fromExpo.resolve('@expo/cli/package.json'));
const { toQR } = fromCLI('toqr');

async function freePort(port = 8083) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', err => err.code === 'EADDRINUSE' && port < 8100
      ? resolve(freePort(port + 1)) : reject(err));
    server.listen(port, '0.0.0.0', () => server.close(() => resolve(port)));
  });
}
function printQR(url) {
  const qr = toQR(url), size = Math.sqrt(qr.length);
  console.log('\nHAZIR — Telefonunuzla aşağıdaki QR kodunu okutun.\n');
  const darkAt = (x, y) => x >= 0 && y >= 0 && x < size && y < size && qr[y * size + x];
  for (let y = -4; y < size + 4; y += 2) {
    let row = '\x1b[30;47m';
    for (let x = -4; x < size + 4; x++) {
      const top = darkAt(x, y), bottom = darkAt(x, y + 1);
      row += top ? (bottom ? '█' : '▀') : (bottom ? '▄' : ' ');
    }
    console.log(row + '\x1b[0m');
  }
  console.log(`\nTelefon bağlantısı: ${url}`);
  console.log('Terminali açık tutun. Durdurmak için Control + C.\n');
}
async function main() {
  const interfaces = os.networkInterfaces();
  const addresses = [...(interfaces.en0 || []), ...Object.values(interfaces).flat()];
  const host = addresses.find(a => a && a.family === 'IPv4' && !a.internal)?.address;
  if (!host) throw new Error('Wi-Fi bağlantısı bulunamadı. Bilgisayarı Wi-Fi ağına bağlayıp yeniden deneyin.');
  const port = await freePort();
  const cli = path.join(path.dirname(require.resolve('expo/package.json')), 'bin/cli');
  const child = spawn(process.execPath, [cli, 'start', '--go', '--lan', '--port', String(port)], {
    stdio: 'inherit', env: { ...process.env, CI: '1', REACT_NATIVE_PACKAGER_HOSTNAME: host },
  });
  let finished = false;
  child.on('error', err => { finished = true; console.error(err.message); process.exitCode = 1; });
  child.on('exit', code => { finished = true; process.exitCode = code || 0; });
  process.once('SIGINT', () => { finished = true; child.kill('SIGINT'); });
  process.once('SIGTERM', () => { finished = true; child.kill('SIGTERM'); });
  for (let attempt = 0; attempt < 90 && !finished; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/status`, {signal: AbortSignal.timeout(1000)});
      if ((await response.text()).includes('packager-status:running')) {
        printQR(`exp://${host}:${port}`);
        return;
      }
    } catch { /* Server may still be starting. */ }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!finished) console.error('Başlatma uzadı. Terminaldeki hata mesajını paylaşın.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
