export function isDebug() {
  const url = new URL(window.location.href);
  const debug = url.searchParams.get('debug');
  return debug !== null;
}

export function skipMenu() {
  const url = new URL(window.location.href);
  return url.searchParams.get('skipmenu') !== null;
}
