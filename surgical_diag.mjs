
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdihrngybdmppuomjgcn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaWhybmd5YmRtcHB1b21qZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODAwMTAsImV4cCI6MjA4NjY1NjAxMH0.-GyuDAHkIsEmPBVPNb3qwMKPSIBa2C8elSgrSBOfBN8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiag() {
    console.log('--- SURGICAL ANALYTICS DIAGNOSTIC ---');

    // 1. Get a real profile/client ID
    const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, client_id, slug')
        .eq('slug', 'opinii')
        .single();

    if (pErr || !profiles) {
        console.error('❌ Could not find test profile:', pErr);
        return;
    }

    const { id: profileId, client_id: clientId } = profiles;
    console.log(`Found Profile: ${profileId} | Client: ${clientId}`);

    // 2. Insert a test event
    const testType = 'diag_view_' + Date.now();
    console.log(`Inserting test event type: ${testType}`);

    const { error: insErr } = await supabase
        .from('analytics_events')
        .insert({
            client_id: clientId,
            profile_id: profileId,
            type: 'view',
            asset_type: 'diag',
            asset_id: testType,
            ts: new Date().toISOString()
        });

    if (insErr) {
        console.error('❌ Insertion failed:', insErr);
        return;
    }
    console.log('✅ Insertion successful!');

    // 3. Verify existence
    console.log('Verifying event existence...');
    const { data: verifyData, error: vErr } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('asset_id', testType)
        .single();

    if (vErr || !verifyData) {
        console.error('❌ Verification failed (event not found):', vErr);
    } else {
        console.log('✅ Event verified in DB:', JSON.stringify(verifyData, null, 2));
    }

    // 4. Test RPC Summary for this specific insertion
    console.log('\nTesting RPC Summary update (starting from now):');
    const start = new Date();
    start.setMinutes(start.getMinutes() - 1); // Last minute

    const { data: rpcRes, error: rpcErr } = await supabase.rpc('get_analytics_summary_v1', {
        p_profile_id: profileId,
        p_client_id: clientId,
        p_start_date: start.toISOString(),
        p_end_date: new Date().toISOString(),
        p_source_filter: 'all'
    });

    if (rpcErr) console.error('❌ RPC error:', rpcErr);
    else console.log('✅ RPC results for the last minute:', JSON.stringify(rpcRes, null, 2));
}

runDiag();
