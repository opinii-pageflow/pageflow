
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdihrngybdmppuomjgcn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaWhybmd5YmRtcHB1b21qZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODAwMTAsImV4cCI6MjA4NjY1NjAxMH0.-GyuDAHkIsEmPBVPNb3qwMKPSIBa2C8elSgrSBOfBN8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const profileId = 'af940ab2-bf40-4d88-a584-7e73f52d06d4';
    const clientId = 'e16104bc-6718-498c-8438-d65287f32997';

    console.log('Step 1: Minimum fields');
    const { error: err1 } = await supabase.from('analytics_events').insert({
        client_id: clientId,
        profile_id: profileId,
        type: 'test_min'
    });
    console.log('Result 1:', err1 ? err1.code : 'OK');

    console.log('\nStep 2: Adding TS (ISOString)');
    const { error: err2 } = await supabase.from('analytics_events').insert({
        client_id: clientId,
        profile_id: profileId,
        type: 'test_ts',
        ts: new Date().toISOString()
    });
    console.log('Result 2:', err2 ? err2.code : 'OK');

    console.log('\nStep 3: Adding asset_id (String)');
    const { error: err3 } = await supabase.from('analytics_events').insert({
        client_id: clientId,
        profile_id: profileId,
        type: 'test_asset',
        asset_id: 'some-random-string'
    });
    console.log('Result 3:', err3 ? err3.code : 'OK');
}

test();
