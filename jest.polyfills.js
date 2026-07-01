process.env.EXPO_PUBLIC_SUPABASE_URL ??= 'http://127.0.0.1:54321';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??= 'test-anon-key';

const { TextDecoder, TextEncoder } = require('util');

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

if (typeof global.ReadableStream === 'undefined' || typeof global.TransformStream === 'undefined') {
  const streams = require('stream/web');
  global.ReadableStream = global.ReadableStream ?? streams.ReadableStream;
  global.TransformStream = global.TransformStream ?? streams.TransformStream;
}

if (typeof global.BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    constructor() {}
    close() {}
    postMessage() {}
    addEventListener() {}
    removeEventListener() {}
  };
}
