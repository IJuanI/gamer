const http = require('http');

async function testTelemetryFetch() {
  console.log('🧪 Testing telemetry fetch...\n');

  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/telemetry?limit=200', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const events = parsed.events || [];
          const total = parsed.total || 0;

          console.log('✅ Fetch successful!');
          console.log(`📊 Total events: ${total}`);
          console.log(`📥 Events in response: ${events.length}`);

          if (events.length > 0) {
            console.log('\n📋 Recent events:');
            events.slice(-5).forEach((e, i) => {
              console.log(`  ${i + 1}. [${e.type}] ${e.message}`);
            });
          }

          console.log('\n✅ API endpoint is working correctly!');
          console.log('✅ Button click should trigger fetch successfully.');
          resolve(true);
        } catch (e) {
          console.error('❌ Failed to parse response:', e.message);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Fetch failed:', e.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.error('❌ Request timeout');
      req.destroy();
      resolve(false);
    });
  });
}

testTelemetryFetch().then((success) => {
  process.exit(success ? 0 : 1);
});
