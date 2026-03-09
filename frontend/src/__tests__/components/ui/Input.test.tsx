import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

vi.mock('@base-ui/react/input', () => ({
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
}))

import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-slot', 'input')
  })

  it('passes type prop correctly', () => {
    render(<Input type="email" />)
    const input = document.querySelector('input[type="email"]')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'email')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    const input = document.querySelector('input')
    expect(input).toHaveClass('custom-class')
  })

  it('supports disabled state', () => {
    render(<Input disabled />)
    const input = document.querySelector('input')
    expect(input).toBeDisabled()
  })

  it('handles onChange events', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'hello')
    expect(handleChange).toHaveBeenCalled()
  })
})
