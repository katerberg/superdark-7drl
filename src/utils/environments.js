export function isDebug() {
  const url = new URL(window.location.href);
  const debug = url.searchParams.get('debug');
  return debug !== null;
}
