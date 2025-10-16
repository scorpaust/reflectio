import { cn, formatDate, getInitials } from '../utils'

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('should merge simple class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
    })

    it('should merge Tailwind classes correctly (overriding)', () => {
      // tailwind-merge should handle conflicting Tailwind classes
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })

    it('should handle arrays of classes', () => {
      expect(cn(['class1', 'class2'])).toContain('class1')
      expect(cn(['class1', 'class2'])).toContain('class2')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      })
      expect(result).toContain('class1')
      expect(result).not.toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle undefined and null values', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
    })

    it('should handle empty input', () => {
      expect(cn()).toBe('')
    })
  })

  describe('formatDate', () => {
    it('should format date to Portuguese locale', () => {
      const result = formatDate('2024-01-15')
      // Portuguese format example: "15 de janeiro de 2024"
      expect(result).toMatch(/\d{1,2}/)
      expect(result).toContain('de')
    })

    it('should handle ISO date strings', () => {
      const result = formatDate('2024-12-25T10:30:00Z')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle different date formats', () => {
      const result = formatDate('2024-03-01')
      expect(result).toBeTruthy()
      expect(result).toContain('2024')
    })

    it('should format with full month name', () => {
      const result = formatDate('2024-06-15')
      // Should contain month name in Portuguese
      expect(result.toLowerCase()).toMatch(/janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/)
    })
  })

  describe('getInitials', () => {
    it('should return initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should return initials in uppercase', () => {
      expect(getInitials('jane smith')).toBe('JS')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should handle three or more names', () => {
      expect(getInitials('John Paul Smith')).toBe('JP')
    })

    it('should handle names with accents', () => {
      expect(getInitials('José Maria')).toBe('JM')
    })

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('')
    })

    it('should handle multiple spaces between names', () => {
      expect(getInitials('John  Doe')).toBe('JD')
    })

    it('should only return first 2 initials', () => {
      expect(getInitials('One Two Three Four')).toBe('OT')
      expect(getInitials('One Two Three Four').length).toBe(2)
    })

    it('should handle names with special characters', () => {
      const result = getInitials('João D\'Silva')
      expect(result.length).toBeLessThanOrEqual(2)
      expect(result).toMatch(/^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝ']+$/)
    })
  })
})
