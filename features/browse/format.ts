const viewerFormatter = new Intl.NumberFormat("en-US");

export function formatViewerCount(count: number): string {
  return viewerFormatter.format(count);
}

export function formatViewerLabel(count: number): string {
  return `${formatViewerCount(count)} viewers`;
}
