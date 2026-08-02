// ponytail: matches the overlay segment MediaService.buildWatermarkOverlay bakes into
// image_url (backend/src/media/media.service.ts). If that transform's params change,
// update this regex too. Upgrade path: store the raw URL separately and drop this.
const WATERMARK_TRANSFORM = /\/fl_relative,g_[a-z_]+,l_newswave:logo,o_\d+,w_[\d.]+,x_\d+,y_\d+\//;

export function stripWatermark(url: string): string {
  return url.replace(WATERMARK_TRANSFORM, '/');
}
