import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import { ProductCard } from '@/features/products'

describe('ProductCard', () => {
  it('shows the premium lock state without exposing nutrition values', () => {
    const onSubscribe = vi.fn()

    render(
      <ProductCard
        product={{
          id: '1',
          name: 'Granola',
          brand: 'Brand',
          imageUrl: null,
          language: 'en',
          nutrition: null,
          nutritionAvailable: true,
          nutritionLocked: true,
        }}
        onSubscribe={onSubscribe}
        labels={{
          noImage: 'No image',
          nutritionTitle: 'Nutrition',
          lockedTitle: 'Locked',
          lockedBody: 'Hidden until subscribed',
          subscribe: 'Subscribe',
          nutritionLabels: {
            energyKcal: 'Energy',
            fat: 'Fat',
            saturatedFat: 'Sat',
            carbohydrates: 'Carbs',
            sugars: 'Sugars',
            fiber: 'Fiber',
            proteins: 'Protein',
            salt: 'Salt',
          },
        }}
      />
    )

    expect(screen.getByText('Locked')).toBeTruthy()
    expect(screen.queryByText('Nutrition')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(onSubscribe).toHaveBeenCalledTimes(1)
  })
})
