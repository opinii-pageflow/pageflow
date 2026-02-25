
import { supabase } from './lib/supabase.js';

async function diagnose() {
    console.log('--- DIAGNOSIS START ---');
    try {
        // Fetch only 1 row with select(*) to see all available columns
        const { data, error } = await supabase
            .from('analytics_events')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Supabase error:', error);
            return;
        }

        if (data && data.length > 0) {
            console.log('✅ Successfuly fetched 1 row.');
            console.log('Available columns in first row:', Object.keys(data[0]));
        } else {
            console.log('⚠️ No data found in analytics_events table.');
        }
    } catch (err) {
        console.error('❌ Diagnostic script failed:', err);
    }
}

diagnose();
