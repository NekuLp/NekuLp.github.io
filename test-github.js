const https = require('https');

https.get('https://github.com/users/NekuLp/contributions?from=2022-01-01&to=2022-12-31', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    require('fs').writeFileSync('github.html', data);
    console.log('Saved github.html, length:', data.length);
  });
}).on('error', err => console.log('Error:', err.message));
