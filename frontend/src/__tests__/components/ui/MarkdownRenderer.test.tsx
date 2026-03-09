import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders markdown content as HTML', () => {
    const { container } = render(<MarkdownRenderer content="Hello world" />)
    expect(container.textContent).toContain('Hello world')
  })

  it('renders headings correctly', () => {
    const { container } = render(<MarkdownRenderer content="# Heading One" />)
    const h1 = container.querySelector('h1')
    expect(h1).toBeInTheDocument()
    expect(h1?.textContent).toBe('Heading One')
  })

  it('renders bold text', () => {
    const { container } = render(<MarkdownRenderer content="**bold text**" />)
    const strong = container.querySelector('strong')
    expect(strong).toBeInTheDocument()
    expect(strong?.textContent).toBe('bold text')
  })

  it('renders italic text', () => {
    const { container } = render(<MarkdownRenderer content="_italic text_" />)
    const em = container.querySelector('em')
    expect(em).toBeInTheDocument()
    expect(em?.textContent).toBe('italic text')
  })

  it('renders links', () => {
    const { container } = render(
      <MarkdownRenderer content="[Click here](https://example.com)" />
    )
    const link = container.querySelector('a')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link?.textContent).toBe('Click here')
  })

  it('renders code blocks', () => {
    const { container } = render(
      <MarkdownRenderer content={'```\nconst x = 1\n```'} />
    )
    const code = container.querySelector('code')
    expect(code).toBeInTheDocument()
  })

  it('has prose class for typography', () => {
    const { container } = render(<MarkdownRenderer content="test" />)
    const wrapper = container.firstElementChild
    expect(wrapper?.className).toMatch(/prose/)
  })
})
