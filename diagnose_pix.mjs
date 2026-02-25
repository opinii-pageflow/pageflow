import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdihrngybdmppuomjgcn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaWhybmd5YmRtcHB1b21qZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODAwMTAsImV4cCI6MjA4NjY1NjAxMH0.-GyuDAHkIsEmPBVPNb3qwMKPSIBa2C8elSgrSBOfBN8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosePix() {
    console.log('🚀 Diagnosing PIX Events...');

    // 1. Check for pix_copied events in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log(`\n--- 1. Checking 'pix_copied' events since ${thirtyDaysAgo.toISOString()} ---`);
    const { data: pixEvents, error: pixError } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('type', 'pix_copied')
        .gte('ts', thirtyDaysAgo.toISOString());

    if (pixError) {
        console.error('❌ Error fetching PIX events:', pixError);
    } else {
        console.log(`✅ Found ${pixEvents.length} 'pix_copied' events.`);
        if (pixEvents.length > 0) {
            console.log('Sample event:', JSON.stringify(pixEvents[0], null, 2));
        }
    }

    // 2. Check for ANY event with asset_type = 'pix'
    console.log(`\n--- 2. Checking any events with asset_type = 'pix' ---`);
    const { data: assetPixEvents, error: assetPixError } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('asset_type', 'pix')
        .gte('ts', thirtyDaysAgo.toISOString());

    if (assetPixError) {
        console.error('❌ Error fetching asset-type PIX events:', assetPixError);
    } else {
        console.log(`✅ Found ${assetPixEvents.length} events with asset_type = 'pix'.`);
        if (assetPixEvents.length > 0) {
            console.log('Sample event:', JSON.stringify(assetPixEvents[0], null, 2));
        }
    }

    // 3. Check for specific types that might be used for PIX
    console.log(`\n--- 3. Checking for other types (pix, PIX) ---`);
    const { data: otherPix, error: otherPixErr } = await supabase
        .from('analytics_events')
        .select('*')
        .in('type', ['pix', 'PIX', 'copy_pix'])
        .gte('ts', thirtyDaysAgo.toISOString());

    if (otherPixErr) {
        console.error('❌ Error fetching other PIX types:', otherPixErr);
    } else {
        console.log(`✅ Found ${otherPix.length} events with alternative types.`);
    }

    // 4. Test RPC for PIX
    const { data: profiles } = await supabase.from('profiles').select('client_id').limit(1);
    if (profiles && profiles.length > 0) {
        const cid = profiles[0].client_id;
        console.log(`\n--- 4. RPC test for client ${cid} ---`);
        const { data: rpcData } = await supabase.rpc('get_analytics_summary_v1', {
            p_profile_id: 'all',
            p_client_id: cid,
            p_start_date: thirtyDaysAgo.toISOString(),
            p_end_date: new Date().toISOString(),
            p_source_filter: 'all'
        });
        console.log('RPC pixCopies:', rpcData?.pixCopies);
    }
}

diagnosePix();
