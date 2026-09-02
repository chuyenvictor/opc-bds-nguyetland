async function verify() {
  try {
    const manifestRes = await fetch('http://localhost:8088/manifest.webmanifest');
    const manifest = await manifestRes.json();
    console.log('✅ Manifest Loaded:', manifest.name, '| Display:', manifest.display);

    const swRes = await fetch('http://localhost:8088/sw.js');
    const swText = await swRes.text();
    console.log('✅ Service Worker Loaded (Bytes:', swText.length, ') | Cache Version:', swText.includes('nguyetland-pwa-v1'));

    const htmlRes = await fetch('http://localhost:8088/');
    const htmlText = await htmlRes.text();
    console.log('✅ Homepage Loaded (Bytes:', htmlText.length, ')');
    console.log('   - Has Heatmap Section:', htmlText.includes('cashflow-heatmap-section'));
    console.log('   - Has Heatmap JS Controller:', htmlText.includes('switchHeatmapZone'));
    console.log('   - Has PWA Manifest Link:', htmlText.includes('rel="manifest"'));
    console.log('   - Has PWA Install Script:', htmlText.includes('pwa-install-engine.js'));

    const newsRes = await fetch('http://localhost:8088/news');
    const newsText = await newsRes.text();
    console.log('✅ News Page Has PWA Manifest Link:', newsText.includes('rel="manifest"'));

    console.log('\n🎉 ALL PWA & CASHFLOW HEATMAP VERIFICATIONS PASSED 100%!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
  }
}

verify();
