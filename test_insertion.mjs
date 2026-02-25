import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdihrngybdmppuomjgcn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaWhybmd5YmRtcHB1b21qZ2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODAwMTAsImV4cCI6MjA4NjY1NjAxMH0.-GyuDAHkIsEmPBVPNb3qwMKPSIBa2C8elSgrSBOfBN8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsertion() {
    console.log('🧪 Testing event insertion with ANON key and VALID IDs...');

    const testEvent = {
        client_id: 'e5c7b2f8-ff50-494f-bc00-bdad0347fb42',
        profile_id: 'af940ab2-bf40-4d88-a584-7e73f52d06d4',
        type: 'test_event_v2',
        asset_type: 'pix',
        ts: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('analytics_events')
        .insert([testEvent]);

    if (error) {
        console.error('❌ Insertion FAILED:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Insertion SUCCESSFUL!');
    }
}

testInsertion();
