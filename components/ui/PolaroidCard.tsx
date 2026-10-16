import Image from "next/image";
import { cx } from "@/lib/utils";

type PolaroidCardProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/** Carte polaroïd : cadre blanc cassé texturé, ombre portée. Rotation via parent/GSAP. */
export function PolaroidCard({ src, alt, className, priority = false }: PolaroidCardProps) {
  return (
    <figure
      className={cx(
        "polaroid-frame pointer-events-none rounded-[6px] p-3 pb-10 shadow-[0_24px_60px_-16px_rgba(60,40,20,0.45)]",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3px] bg-paper">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 60vw, 300px" className="object-cover" priority={priority} />
      </div>
    </figure>
  );
}
