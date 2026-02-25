
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdihrngybdmppuomjgcn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaWhybmd5YmRtcHB1b21qZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODAwMTAsImV4cCI6MjA4NjY1NjAxMH0.-GyuDAHkIsEmPBVPNb3qwMKPSIBa2C8elSgrSBOfBN8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAnalytics() {
    console.log('--- TESTING ANALYTICS RPC & QUERY ---');

    try {
        const { data: profiles } = await supabase.from('profiles').select('client_id').limit(1);
        if (!profiles || profiles.length === 0) {
            console.log('❌ No profiles found or auth failed.');
            return;
        }
        const testClientId = profiles[0].client_id;
        console.log(`Using ClientID: ${testClientId}`);

        const now = new Date();
        const start = new Date();
        start.setDate(now.getDate() - 30);

        console.log('\nTesting RPC get_analytics_summary_v1 (profile_id="all"):');
        const { data: rpcAll, error: rpcErr } = await supabase.rpc('get_analytics_summary_v1', {
            p_profile_id: 'all',
            p_client_id: testClientId,
            p_start_date: start.toISOString(),
            p_end_date: now.toISOString(),
            p_source_filter: 'all'
        });

        if (rpcErr) console.error('❌ RPC Error:', rpcErr);
        else console.log('✅ RPC Result (all):', JSON.stringify(rpcAll, null, 2));

        // Test with a specific profile
        const { data: profileIdData } = await supabase.from('profiles').select('id').eq('client_id', testClientId).limit(1);
        if (profileIdData && profileIdData.length > 0) {
            const pid = profileIdData[0].id;
            console.log(`\nTesting RPC for specific profile: ${pid}`);
            const { data: rpcSingle, error: rpcSingleErr } = await supabase.rpc('get_analytics_summary_v1', {
                p_profile_id: pid,
                p_client_id: testClientId,
                p_start_date: start.toISOString(),
                p_end_date: now.toISOString(),
                p_source_filter: 'all'
            });
            if (rpcSingleErr) console.error('❌ RPC Single Error:', rpcSingleErr);
            else console.log('✅ RPC Result (single):', JSON.stringify(rpcSingle, null, 2));
        }

    } catch (err) {
        console.error('❌ Test failed:', err);
    }
}

testAnalytics();
