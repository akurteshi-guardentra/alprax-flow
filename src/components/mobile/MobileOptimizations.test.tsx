import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MobileOptimizations } from './MobileOptimizations'

describe('MobileOptimizations', () => {
  it('renders children and sets viewport meta without crashing', () => {
    render(
      <MobileOptimizations>
        <div data-testid="child">Hello</div>
      </MobileOptimizations>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()

    const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null
    expect(meta).not.toBeNull()
  })
})