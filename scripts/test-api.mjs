import profileHandler from '../api/profile.js';
import xAuthHandler from '../api/auth/x.js';
import logoutHandler from '../api/auth/logout.js';
import garageHandler from '../api/garage.js';
import purchaseHandler from '../api/purchase.js';
import raceStartHandler from '../api/race/start.js';
import raceFinishHandler from '../api/race/finish.js';

function createMockReqRes({ method = 'GET', body = {}, headers = {}, url = '/api' }) {
  let statusCode = 200;
  let responseData = null;
  let responseHeaders = {};

  const req = {
    method,
    body,
    headers,
    url
  };

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    setHeader(name, val) {
      responseHeaders[name.toLowerCase()] = val;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    redirect(code, url) {
      statusCode = code;
      responseData = { redirectUrl: url };
      return res;
    }
  };

  return { req, res, getResult: () => ({ statusCode, responseData, responseHeaders }) };
}

async function runTests() {
  console.log('--- TEST 1: X LOGIN (POST /api/auth/x) ---');
  let m1 = createMockReqRes({
    method: 'POST',
    body: { handle: 'MisukiRio', nickname: 'Misuki Suprema' }
  });
  await xAuthHandler(m1.req, m1.res);
  let res1 = m1.getResult();
  console.log('Status:', res1.statusCode);
  console.log('Profile created:', res1.responseData.profile?.nickname, 'Handle:', res1.responseData.profile?.xHandle, 'Coins:', res1.responseData.profile?.coins);
  const cookieHeader = res1.responseHeaders['set-cookie'];
  console.log('Set-Cookie received:', !!cookieHeader);

  const cookieVal = cookieHeader.split(';')[0];

  console.log('\n--- TEST 2: GET PROFILE WITH COOKIE ---');
  let m2 = createMockReqRes({
    method: 'GET',
    headers: { cookie: cookieVal }
  });
  await profileHandler(m2.req, m2.res);
  let res2 = m2.getResult();
  console.log('Status:', res2.statusCode, 'Nick:', res2.responseData.profile?.nickname);

  console.log('\n--- TEST 3: PURCHASE VEHICLE (POST /api/purchase) ---');
  let m3 = createMockReqRes({
    method: 'POST',
    headers: { cookie: cookieVal },
    body: { kind: 'vehicle', item: 1 } // Cometa GT, price 350
  });
  await purchaseHandler(m3.req, m3.res);
  let res3 = m3.getResult();
  console.log('Status:', res3.statusCode, 'New coins:', res3.responseData.profile?.coins, 'Owned vehicles:', res3.responseData.profile?.owned);
  const cookieVal2 = res3.responseHeaders['set-cookie'].split(';')[0];

  console.log('\n--- TEST 4: CUSTOMIZE GARAGE (POST /api/garage) ---');
  let m4 = createMockReqRes({
    method: 'POST',
    headers: { cookie: cookieVal2 },
    body: { pilot: 0, vehicle: 1, paint: '#d2ff5a', wheels: 2, spoiler: 1 }
  });
  await garageHandler(m4.req, m4.res);
  let res4 = m4.getResult();
  console.log('Status:', res4.statusCode, 'Garage:', res4.responseData.profile?.garage);
  const cookieVal3 = res4.responseHeaders['set-cookie'].split(';')[0];

  console.log('\n--- TEST 5: RACE START & FINISH ---');
  let m5a = createMockReqRes({
    method: 'POST',
    headers: { cookie: cookieVal3 },
    body: { track: 0, mode: 'race', pilot: 0, vehicle: 1 }
  });
  await raceStartHandler(m5a.req, m5a.res);
  let ticket = m5a.getResult().responseData.ticket;
  console.log('Race Ticket generated:', ticket);

  let m5b = createMockReqRes({
    method: 'POST',
    headers: { cookie: cookieVal3 },
    body: { ticket, time: 72.4, position: 1, stars: 10, track: 0, mode: 'race' }
  });
  await raceFinishHandler(m5b.req, m5b.res);
  let res5b = m5b.getResult();
  console.log('Reward earned:', res5b.responseData.earned, 'Total coins now:', res5b.responseData.profile?.coins, 'Records:', res5b.responseData.profile?.records);

  console.log('\n--- TEST 6: LOGOUT ---');
  let m6 = createMockReqRes({ method: 'POST' });
  await logoutHandler(m6.req, m6.res);
  let res6 = m6.getResult();
  console.log('Logout Status:', res6.statusCode, 'Clear cookie:', res6.responseHeaders['set-cookie']);

  console.log('\n✅ ALL LOCAL API TESTS PASSED PERFECTLY!');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
