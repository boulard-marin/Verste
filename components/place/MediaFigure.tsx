import Image from "next/image";

import type { ResolvedMedia } from "@/lib/travel/media";

/**
 * A photo or a short loop, always with its origin: filled dot for a VERSTE
 * field photograph, hollow dot and full credit for a free-licence image.
 */
export function MediaFigure({
  media,
  sizes,
  priority = false,
  wide = false,
  className = "",
  frameClassName = "",
}: {
  media: ResolvedMedia;
  sizes: string;
  priority?: boolean;
  wide?: boolean;
  className?: string;
  frameClassName?: string;
}) {
  const useWide = wide && media.wide;
  const src = useWide ? media.wide!.src : media.type === "video" ? media.poster! : media.src;
  const width = useWide ? media.wide!.width : media.width;
  const height = useWide ? media.wide!.height : media.height;
  return (
    <figure className={className}>
      <div className={`relative overflow-hidden bg-night ${frameClassName}`}>
        {media.type === "video" ? (
          <video
            src={media.src}
            poster={media.poster}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-label={media.alt}
            className="h-full w-full object-cover motion-reduce:hidden"
          />
        ) : null}
        <Image
          src={src}
          alt={media.type === "video" ? "" : media.alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={media.blurDataURL}
          className={`h-full w-full object-cover ${media.type === "video" ? "hidden motion-reduce:block" : ""}`}
        />
      </div>
      <figcaption className="mt-3 flex items-baseline gap-2 text-fg-2">
        <span
          aria-hidden="true"
          className={`inline-block size-[7px] shrink-0 translate-y-[-1px] rounded-full border border-current ${media.kind === "verste" ? "bg-current" : ""}`}
        />
        <span className="text-[0.8rem] leading-snug">
          <span className="label mr-2">{media.kind === "verste" ? "Photographie VERSTE" : "Image libre"}</span>
          {media.caption}
          {media.credit && (
            <span className="block opacity-80">
              {media.credit.author} ·{" "}
              {media.credit.licenseUrl ? (
                <a href={media.credit.licenseUrl} className="underline decoration-fg/30 underline-offset-2 hover:decoration-fg" rel="license noreferrer">
                  {media.credit.license}
                </a>
              ) : (
                media.credit.license
              )}{" "}
              ·{" "}
              <a href={media.credit.source} className="underline decoration-fg/30 underline-offset-2 hover:decoration-fg" rel="noreferrer">
                Wikimedia Commons
              </a>
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
