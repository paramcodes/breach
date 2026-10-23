const viewerFormatter = new Intl.NumberFormat("en-US");

export function formatViewerCount(count: number): string {
  return viewerFormatter.format(count);
}

export function formatViewerLabel(count: number): string {
  const unit = count === 1 ? "viewer" : "viewers";
  return `${formatViewerCount(count)} ${unit}`;
}
