const fs = require('node:fs');
const path = require('node:path');
require('node:dns').setDefaultResultOrder('ipv4first');
async function main() {
  const config = fs.readFileSync(path.join(process.env.APPDATA, 'xdg.config/.wrangler/config/default.toml'), 'utf8');
  const token = config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
  if (!token) throw new Error('Run wrangler login first.');
  const api = async resource => {
    const r = await fetch(`https://api.cloudflare.com/client/v4/${resource}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await r.json();
    if (!data.success) return { error: data.errors?.map(e => ({ code: e.code, message: e.message })), status: r.status };
    return data.result;
  };
  const zones = await api('zones?name=infonewsupdate24.com');
  if (!Array.isArray(zones) || !zones.length) { console.log(JSON.stringify({ zones })); return; }
  const zone = zones[0];
  console.log(JSON.stringify({ zone: { id: zone.id, name: zone.name, status: zone.status, plan: zone.plan?.name, account: zone.account.id } }));
  for (const [name, resource] of [
    ['dns', `zones/${zone.id}/dns_records?name=www.infonewsupdate24.com`],
    ['routes', `zones/${zone.id}/workers/routes`],
    ['subscriptions', `accounts/${zone.account.id}/subscriptions`],
    ['workerSettings', `accounts/${zone.account.id}/workers/account-settings`],
    ['entitlements', `accounts/${zone.account.id}/entitlements`],
  ]) {
    const data = await api(resource);
    console.log(JSON.stringify({ [name]: name === 'dns' && Array.isArray(data)
      ? data.map(d => ({ id: d.id, name: d.name, type: d.type, content: d.content, proxied: d.proxied }))
      : name === 'subscriptions' && Array.isArray(data)
        ? data.map(d => ({ state: d.state, ratePlan: d.rate_plan?.id, name: d.rate_plan?.public_name })) : data }));
  }
  const response = await fetch('https://www.infonewsupdate24.com/');
  console.log(JSON.stringify({ hosting: { status: response.status, server: response.headers.get('server'), cloudflareRay: response.headers.get('cf-ray') } }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
