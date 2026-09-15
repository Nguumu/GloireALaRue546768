import { cn } from "../cn";

export interface CardThumbnailProps {
  name: string;
  cardNumber: string;
  /** Small (list) image URL. Falls back to a text placeholder when absent — keeps
   * the grid usable before every printing has real art synced (section 2). */
  imageUrl?: string | null;
  className?: string;
}

export function CardThumbnail({ name, cardNumber, imageUrl, className }: CardThumbnailProps) {
  return (
    <div
      className={cn(
        "relative aspect-[5/7] w-full overflow-hidden rounded-xl border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-900",
        className,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
          <span className="text-xs font-medium text-surface-500 dark:text-surface-400">{cardNumber}</span>
          <span className="text-sm font-semibold text-surface-700 dark:text-surface-200">{name}</span>
        </div>
      )}
    </div>
  );
}
