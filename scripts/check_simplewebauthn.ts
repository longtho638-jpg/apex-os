import * as SimpleWebAuthn from '@simplewebauthn/server';

console.log('Exports:', Object.keys(SimpleWebAuthn));
// We can't easily inspect types at runtime, but we can check if the function exists
console.log('verifyAuthenticationResponse type:', typeof SimpleWebAuthn.verifyAuthenticationResponse);
