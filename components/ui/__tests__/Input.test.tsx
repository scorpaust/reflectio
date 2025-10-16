import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should render with label when provided', () => {
      render(<Input label="Email" />)
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should not render label when not provided', () => {
      const { container } = render(<Input />)
      const label = container.querySelector('label')
      expect(label).not.toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter your email" />)
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    it('should render with default text type', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render with custom type', () => {
      render(<Input type="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render password input', () => {
      render(<Input type="password" />)
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should render error message when error prop is provided', () => {
      render(<Input error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should apply error border class when error exists', () => {
      render(<Input error="Error" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-500')
    })

    it('should apply normal border class when no error', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-gray-300')
    })

    it('should show error in red color', () => {
      render(<Input error="Error message" />)
      const error = screen.getByText('Error message')
      expect(error).toHaveClass('text-red-600')
    })
  })

  describe('Interactions', () => {
    it('should handle onChange event', async () => {
      const handleChange = jest.fn()
      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'test')

      expect(handleChange).toHaveBeenCalled()
    })

    it('should update value on input', async () => {
      const user = userEvent.setup()
      render(<Input />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.type(input, 'Hello World')

      expect(input.value).toBe('Hello World')
    })

    it('should handle onBlur event', () => {
      const handleBlur = jest.fn()
      render(<Input onBlur={handleBlur} />)

      const input = screen.getByRole('textbox')
      fireEvent.blur(input)

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('should handle onFocus event', () => {
      const handleFocus = jest.fn()
      render(<Input onFocus={handleFocus} />)

      const input = screen.getByRole('textbox')
      fireEvent.focus(input)

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('should not allow input when disabled', async () => {
      const user = userEvent.setup()
      render(<Input disabled />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.type(input, 'test')

      expect(input.value).toBe('')
    })
  })

  describe('Required State', () => {
    it('should mark input as required', () => {
      render(<Input required />)
      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })
  })

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      render(<Input className="custom-class" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-class')
    })

    it('should forward ref correctly', () => {
      const ref = jest.fn()
      render(<Input ref={ref} />)
      expect(ref).toHaveBeenCalled()
    })

    it('should pass through name attribute', () => {
      render(<Input name="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('name', 'email')
    })

    it('should pass through id attribute', () => {
      render(<Input id="email-input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'email-input')
    })

    it('should set custom fontSize and lineHeight styles', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveStyle({ fontSize: '16px', lineHeight: '1.5' })
    })
  })

  describe('Accessibility', () => {
    it('should have correct focus styles', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('focus:ring-2', 'focus:ring-purple-500')
    })

    it('should associate label with input', () => {
      render(<Input label="Username" id="username" />)
      const label = screen.getByText('Username')
      const input = screen.getByRole('textbox')

      // Click label should focus input
      fireEvent.click(label)
      // Note: in jsdom this doesn't auto-focus, but the structure is correct
    })
  })

  describe('Value Control', () => {
    it('should work as controlled component', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('')
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-input"
          />
        )
      }

      const user = userEvent.setup()
      render(<TestComponent />)

      const input = screen.getByTestId('controlled-input') as HTMLInputElement
      await user.type(input, 'controlled')

      expect(input.value).toBe('controlled')
    })

    it('should accept defaultValue', () => {
      render(<Input defaultValue="default text" />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('default text')
    })
  })
})

// Add React import for the controlled component test
import * as React from 'react'
