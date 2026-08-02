// ponytail: matches the overlay segment MediaService.buildWatermarkOverlay bakes into
// image_url (backend/src/media/media.service.ts). If that transform's params change,
// update this regex too. Upgrade path: store the raw URL separately and drop this.
const WATERMARK_TRANSFORM = /\/fl_relative,g_[a-z_]+,l_newswave:logo,o_\d+,w_[\d.]+,x_\d+,y_\d+\//;

export function stripWatermark(url: string): string {
  return url.replace(WATERMARK_TRANSFORM, '/');
}

// fl_attachment forces the server to send Content-Disposition: attachment, so a plain
// <a href> triggers a real file download. Overlay is bigger + centered (vs the small
// corner CSS badge shown on-page) so it can't be cropped out of the saved copy.
const DOWNLOAD_TRANSFORM =
  'fl_attachment/fl_relative,g_center,l_newswave:logo,o_55,w_0.4';

export function buildDownloadUrl(url: string): string {
  return stripWatermark(url).replace(
    /image\/(upload|fetch)\//,
    `image/$1/${DOWNLOAD_TRANSFORM}/`,
  );
}
