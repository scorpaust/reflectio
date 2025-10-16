import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with children text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should render with primary variant by default', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByText('Primary')
      expect(button).toHaveClass('from-purple-600', 'to-blue-600')
    })

    it('should render with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByText('Secondary')
      expect(button).toHaveClass('bg-gray-200', 'text-gray-800')
    })

    it('should render with ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByText('Ghost')
      expect(button).toHaveClass('bg-transparent', 'text-gray-700')
    })

    it('should render with danger variant', () => {
      render(<Button variant="danger">Delete</Button>)
      const button = screen.getByText('Delete')
      expect(button).toHaveClass('bg-red-600', 'text-white')
    })
  })

  describe('Sizes', () => {
    it('should render with medium size by default', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByText('Medium')
      expect(button).toHaveClass('px-4', 'py-2', 'text-base')
    })

    it('should render with small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByText('Small')
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
    })

    it('should render with large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByText('Large')
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<Button isLoading>Submit</Button>)
      expect(screen.getByText('A carregar...')).toBeInTheDocument()
      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    })

    it('should disable button when isLoading is true', () => {
      render(<Button isLoading>Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should render loading spinner SVG', () => {
      const { container } = render(<Button isLoading>Submit</Button>)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should have opacity-50 class when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('disabled:opacity-50')
    })
  })

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick} disabled>Click</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick} isLoading>Click</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should forward ref correctly', () => {
      const ref = jest.fn()
      render(<Button ref={ref}>Ref Test</Button>)
      expect(ref).toHaveBeenCalled()
    })

    it('should pass through button type attribute', () => {
      render(<Button type="submit">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should pass through aria-label', () => {
      render(<Button aria-label="Close modal">X</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Close modal')
    })
  })

  describe('Accessibility', () => {
    it('should have correct role', () => {
      render(<Button>Button</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Press</Button>)

      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })

    it('should have focus ring classes', () => {
      render(<Button>Focus</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-offset-2')
    })
  })
})
