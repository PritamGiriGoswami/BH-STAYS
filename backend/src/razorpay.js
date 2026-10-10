const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

function razorpayCredentials() {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!keyId || !keySecret) return null;
  if (/^replace-|change-me/i.test(keyId) || /^replace-|change-me/i.test(keySecret)) return null;
  return { keyId, keySecret };
}

async function razorpayApiGet(resourcePath) {
  const creds = razorpayCredentials();
  if (!creds) {
    throw new Error('Razorpay is not configured.');
  }
  const response = await fetch(`${RAZORPAY_API_BASE}${resourcePath}`, {
    method: 'GET',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64'),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.description || `Razorpay request failed (${response.status}).`;
    throw new Error(message);
  }
  return data;
}

module.exports = { razorpayCredentials, razorpayApiGet };
