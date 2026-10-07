import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

/** Scholar AI brand tile — a gradient-capped graduation mark. */
export function BrandMark({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl gradient-button",
        className,
      )}
    >
      <GraduationCap className={cn("size-5", iconClassName)} />
    </span>
  );
}

export function BrandLockup({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <BrandMark />
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Scholar <span className="text-gradient">AI</span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn("flex items-center gap-2.5", className)}
      >
        {content}
      </button>
    );
  }

  return <span className={cn("flex items-center gap-2.5", className)}>{content}</span>;
}
