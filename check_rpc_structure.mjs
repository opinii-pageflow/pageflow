import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdihrngybdmppuomjgcn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaWhybmd5YmRtcHB1b21qZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODAwMTAsImV4cCI6MjA4NjY1NjAxMH0.-GyuDAHkIsEmPBVPNb3qwMKPSIBa2C8elSgrSBOfBN8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRpc() {
    const { data: profiles } = await supabase.from('profiles').select('client_id').limit(1);
    const cid = profiles[0].client_id;

    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - 30);

    const { data, error } = await supabase.rpc('get_analytics_summary_v1', {
        p_profile_id: 'all',
        p_client_id: cid,
        p_start_date: start.toISOString(),
        p_end_date: now.toISOString(),
        p_source_filter: 'all'
    });

    if (error) {
        console.error(error);
    } else {
        console.log('--- FULL RPC DATA ---');
        console.log(JSON.stringify(data, null, 2));
    }
}

checkRpc();
