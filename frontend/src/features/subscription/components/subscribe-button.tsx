import type { SubscribeButtonProps } from '@/features/subscription'

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
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-peach px-5 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-peach/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
    </button>
  )
}
