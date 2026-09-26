const DEV_TUNNEL_BACKEND = 'https://25j12v6k-8080.uks1.devtunnels.ms';

export const API_BASE_URL = window.location.hostname.endsWith('.devtunnels.ms')
  ? DEV_TUNNEL_BACKEND
  : 'http://localhost:8080';

export function backendUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
