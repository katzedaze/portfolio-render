import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

vi.mock('next/image', () => ({
  default: ({ src, alt, fill: _fill, unoptimized: _u, ...rest }: Record<string, unknown>) => <img src={src as string} alt={alt as string} {...rest} />,
}))

vi.mock('lucide-react', () => ({
  Upload: () => null,
  X: ({ className }: { className?: string }) => <span data-testid="x-icon" className={className} />,
  ImageIcon: () => null,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick, onDragOver, onDragLeave, onDrop }: {
    children: React.ReactNode
    className?: string
    onClick?: () => void
    onDragOver?: (e: React.DragEvent) => void
    onDragLeave?: (e: React.DragEvent) => void
    onDrop?: (e: React.DragEvent) => void
  }) => (
    <div
      data-testid="card"
      className={className}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
    </div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, ...props }: { children: React.ReactNode; onClick?: () => void; type?: string } & Record<string, unknown>) =>
    <button onClick={onClick} type={type as 'button' | 'submit' | 'reset'} {...props}>{children}</button>,
}))

import { ImageUpload } from '@/components/ui/ImageUpload'

describe('ImageUpload', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('renders upload area when no value', () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)
    expect(screen.getByText(/drag & drop or click to upload/i)).toBeInTheDocument()
  })

  it('shows "Drag & drop or click to upload" text', () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)
    expect(screen.getByText('Drag & drop or click to upload')).toBeInTheDocument()
  })

  it('shows preview when value prop is provided', () => {
    const onChange = vi.fn()
    render(<ImageUpload value="https://example.com/image.jpg" onChange={onChange} />)
    const img = screen.getByAltText('Upload preview')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('shows error for invalid file type', async () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText(/invalid file type/i)).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows error for file too large (>5MB)', async () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'large.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })
    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText(/file is too large/i)).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('calls onChange with file on valid selection', async () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    fireEvent.change(input, { target: { files: [file] } })

    expect(onChange).toHaveBeenCalledWith(file)
  })

  it('calls onChange with null on remove', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ImageUpload value="https://example.com/image.jpg" onChange={onChange} />)

    // The remove button is the "destructive" button next to the X icon
    const buttons = screen.getAllByRole('button')
    // Find the button that triggers remove (variant="destructive")
    const removeButton = buttons.find(btn => btn.querySelector('[data-testid="x-icon"]'))
    expect(removeButton).toBeDefined()
    await user.click(removeButton!)

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('shows drag state when dragging over', () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)

    const uploadArea = screen.getByTestId('card')
    fireEvent.dragOver(uploadArea, {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    })

    expect(screen.getByText('Drop image here')).toBeInTheDocument()
  })
})
