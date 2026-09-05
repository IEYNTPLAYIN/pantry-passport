import React from 'react'

import type { ProductCardProps } from '@/features/products'

const nutritionFieldOrder = [
  'energyKcal',
  'fat',
  'saturatedFat',
  'carbohydrates',
  'sugars',
  'fiber',
  'proteins',
  'salt',
] as const

export function ProductCard({
  labels,
  onSubscribe,
  product,
}: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-card border border-white/60 bg-white/85 shadow-soft backdrop-blur">
      <div className="aspect-[4/3] bg-mellow">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-ink/65">
            {labels.noImage}
          </div>
        )}
      </div>
      <div className="space-y-4 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-meadow">
            {product.brand ?? 'Open Food Facts'}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ink">
            {product.name}
          </h3>
        </div>

        {product.nutrition ? (
          <section className="rounded-3xl bg-canvas p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/70">
              {labels.nutritionTitle}
            </h4>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {nutritionFieldOrder
                .filter((key) => product.nutrition?.[key] !== undefined)
                .map((key) => (
                  <div key={key} className="rounded-2xl bg-white px-3 py-2">
                    <dt className="text-xs font-medium text-ink/65">
                      {labels.nutritionLabels[key]}
                    </dt>
                    <dd className="mt-1 text-base font-semibold">
                      {product.nutrition?.[key]}
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
        ) : product.nutritionLocked ? (
          <section className="rounded-3xl border border-dashed border-oat bg-canvas p-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/75">
              {labels.lockedTitle}
            </h4>
            <p className="mt-3 text-sm leading-6 text-ink/75">
              {labels.lockedBody}
            </p>
            <button
              type="button"
              onClick={onSubscribe}
              className="mt-4 inline-flex rounded-full bg-peach px-4 py-2 text-sm font-semibold text-white transition hover:bg-peach/90"
            >
              {labels.subscribe}
            </button>
          </section>
        ) : null}
      </div>
    </article>
  )
}
