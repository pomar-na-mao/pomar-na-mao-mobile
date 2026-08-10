// Stub for TurboModuleRegistry when running on web.
// These native modules are not available on web.
'use strict';

export function get() {
  return null;
}

export function getEnforcing() {
  return {};
}

export function requireModule() {
  return null;
}

export default { get, getEnforcing, requireModule };
