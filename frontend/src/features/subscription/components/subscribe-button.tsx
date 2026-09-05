import type { SubscribeButtonProps } from "@/features/subscription";

export function SubscribeButton({
  disabled = false,
  label,
  onClick,
}: SubscribeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex rounded-full bg-peach px-5 py-3 font-semibold text-white transition hover:bg-peach/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
    </button>
  );
}
