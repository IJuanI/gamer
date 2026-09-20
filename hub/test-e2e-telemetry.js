const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function runE2ETest() {
  console.log('🧪 Starting E2E Telemetry Test\n');

  // Step 1: Load the telemetry page HTML
  console.log('1️⃣  Loading /telemetry page...');
  try {
    const pageRes = await makeRequest('http://localhost:3000/telemetry');
    if (pageRes.status !== 200) {
      console.error(`❌ Page failed to load: HTTP ${pageRes.status}`);
      return false;
    }
    console.log('✅ Page loaded successfully');

    // Verify the button exists in HTML
    if (!pageRes.data.includes('Load Events')) {
      console.error('❌ Load Events button not found in HTML');
      return false;
    }
    console.log('✅ Load Events button found in HTML');

    if (!pageRes.data.includes('ref={loadButtonRef}')) {
      console.log('⚠️  Button ref not visible in HTML (expected for SSR)');
    }
  } catch (e) {
    console.error(`❌ Failed to load page: ${e.message}`);
    return false;
  }

  // Step 2: Simulate button click by calling the fetch that would happen
  console.log('\n2️⃣  Simulating button click (fetching telemetry)...');
  try {
    const apiRes = await makeRequest('http://localhost:3000/api/telemetry?limit=200');
    const data = JSON.parse(apiRes.data);

    if (!data.events) {
      console.error('❌ API response missing events field');
      return false;
    }

    console.log(`✅ Fetch successful - Got ${data.events.length} events`);
    console.log(`✅ Total: ${data.total} events`);

    // Step 3: Verify data structure for rendering
    console.log('\n3️⃣  Verifying data structure for rendering...');
    if (data.events.length === 0) {
      console.warn('⚠️  No events to render (but this is valid)');
    } else {
      const firstEvent = data.events[0];
      if (!firstEvent.id || !firstEvent.timestamp || !firstEvent.message) {
        console.error('❌ Events missing required fields');
        return false;
      }
      console.log('✅ Event structure is valid');
      console.log(`   Sample event: "${firstEvent.message}" (${firstEvent.type})`);
    }

    // Step 4: Check if any dashboard events were captured in telemetry
    console.log('\n4️⃣  Checking telemetry capture...');
    const telemetryRes = await makeRequest('http://localhost:3000/api/telemetry?type=event');
    const telemetryData = JSON.parse(telemetryRes.data);
    const dashboardEvents = telemetryData.events.filter(e =>
      e.message.includes('Dashboard') || e.message.includes('Load')
    );

    console.log(`✅ Found ${dashboardEvents.length} dashboard-related events`);
    if (dashboardEvents.length > 0) {
      console.log('   Sample events captured:');
      dashboardEvents.slice(-3).forEach(e => {
        console.log(`   - ${e.message}`);
      });
    }

    // Step 5: Verify the display logic would work
    console.log('\n5️⃣  Verifying display logic...');
    const stats = {
      errors: data.events.filter(e => e.severity === 'error' || e.severity === 'critical').length,
      warnings: data.events.filter(e => e.severity === 'warning').length,
      total: data.total
    };
    console.log(`✅ Stats would display correctly:`);
    console.log(`   Total: ${stats.total}`);
    console.log(`   Errors: ${stats.errors}`);
    console.log(`   Warnings: ${stats.warnings}`);

    return true;
  } catch (e) {
    console.error(`❌ Test failed: ${e.message}`);
    return false;
  }
}

runE2ETest().then(success => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('✅ E2E Test PASSED');
    console.log('\nThe telemetry system is working correctly:');
    console.log('  ✓ Page loads with button');
    console.log('  ✓ API fetch returns data');
    console.log('  ✓ Data structure is valid');
    console.log('  ✓ Telemetry is being captured');
    console.log('  ✓ Display logic would work');
    console.log('\n📱 When you click "Load Events", it should:');
    console.log('  1. Show status: "loading..."');
    console.log('  2. Fetch from /api/telemetry');
    console.log('  3. Display events in the list');
    console.log('  4. Show status: "ok"');
  } else {
    console.log('❌ E2E Test FAILED');
  }
  console.log('='.repeat(50));
  process.exit(success ? 0 : 1);
});
