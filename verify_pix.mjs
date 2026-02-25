
import { normalizeEvent } from './lib/eventNormalizer.js';

const mockEvent = {
    id: 'test-id',
    clientId: 'client-1',
    profileId: 'profile-1',
    type: 'pix_copied',
    source: 'direct',
    ts: Date.now()
};

const mockProfiles = [
    { id: 'profile-1', displayName: 'Test Profile' }
];

try {
    const normalized = normalizeEvent(mockEvent, mockProfiles);
    console.log('--- TEST RESULT ---');
    console.log('Input Type:', mockEvent.type);
    console.log('Output assetType:', normalized.assetType);
    console.log('Output assetId:', normalized.assetId);
    console.log('Output assetLabel:', normalized.assetLabel);

    if (normalized.assetType === 'pix' && normalized.assetId === 'pix') {
        console.log('✅ SUCCESS: PIX normalization is working.');
    } else {
        console.log('❌ FAILURE: PIX normalization failed.');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ ERROR RUNNING TEST:', error);
    process.exit(1);
}
