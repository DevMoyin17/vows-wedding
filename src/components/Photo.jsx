import { photoUrl } from "../lib/media";

/**
 * Responsive photograph.
 * `photo` is a { local, cloud } object from wedding.photos; when Cloudinary
 * is configured this renders f_auto,q_auto transforms with a 2x srcset,
 * otherwise it picks the best bundled xs/md/lg variant.
 */
export function Photo({ photo, alt = "", width, height, className, style, loading = "lazy", crop = "fill", gravity = "auto", onLoad }) {
  const src = photoUrl(photo, { w: width, h: height, crop, gravity });
  const srcSet = photoUrl(photo, { w: width, h: height, crop, gravity, dpr: 2 });

  return (
    <img
      src={src}
      srcSet={srcSet}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={loading}
      decoding="async"
      draggable={false}
      onLoad={onLoad}
    />
  );
}
