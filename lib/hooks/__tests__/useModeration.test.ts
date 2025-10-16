import { renderHook, act, waitFor } from '@testing-library/react'
import { useModeration } from '../useModeration'
import { ModerationResult, AudioModerationResult } from '@/types/moderation'

// Mock fetch globally
global.fetch = jest.fn()

describe('useModeration Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useModeration())

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(typeof result.current.moderateText).toBe('function')
      expect(typeof result.current.moderateAudio).toBe('function')
    })
  })

  describe('moderateText', () => {
    it('should successfully moderate text with safe content', async () => {
      const mockResult: ModerationResult = {
        flagged: false,
        categories: {},
        severity: 'none',
        confidence: 0.1,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const { result } = renderHook(() => useModeration())

      let moderationResult
      await act(async () => {
        moderationResult = await result.current.moderateText('Hello world')
      })

      expect(moderationResult).toEqual({
        result: mockResult,
        action: {
          type: 'allow',
          message: 'Conteúdo aprovado',
          canOverride: false,
        },
      })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should block high severity content', async () => {
      const mockResult: ModerationResult = {
        flagged: true,
        categories: { violence: true },
        severity: 'high',
        confidence: 0.9,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const { result } = renderHook(() => useModeration())

      let moderationResult
      await act(async () => {
        moderationResult = await result.current.moderateText('Inappropriate content')
      })

      expect(moderationResult).toEqual({
        result: mockResult,
        action: {
          type: 'block',
          message: 'Conteúdo bloqueado por violar nossas diretrizes da comunidade',
          canOverride: false,
        },
      })
    })

    it('should warn on medium severity content', async () => {
      const mockResult: ModerationResult = {
        flagged: true,
        categories: { hate: true },
        severity: 'medium',
        confidence: 0.7,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const { result } = renderHook(() => useModeration())

      let moderationResult
      await act(async () => {
        moderationResult = await result.current.moderateText('Questionable content')
      })

      expect(moderationResult?.action.type).toBe('warn')
      expect(moderationResult?.action.canOverride).toBe(true)
    })

    it('should send content for review when confidence is moderate', async () => {
      const mockResult: ModerationResult = {
        flagged: true,
        categories: { spam: true },
        severity: 'low',
        confidence: 0.6,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const { result } = renderHook(() => useModeration())

      let moderationResult
      await act(async () => {
        moderationResult = await result.current.moderateText('Suspicious content')
      })

      expect(moderationResult?.action.type).toBe('review')
    })

    it('should set loading state during moderation', async () => {
      const mockResult: ModerationResult = {
        flagged: false,
        categories: {},
        severity: 'none',
        confidence: 0.1,
      }

      let resolvePromise: any
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise(resolve => {
          resolvePromise = resolve
        })
      )

      const { result } = renderHook(() => useModeration())

      act(() => {
        result.current.moderateText('Test')
      })

      // Should be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Resolve the promise
      await act(async () => {
        resolvePromise({
          ok: true,
          json: async () => mockResult,
        })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should handle fetch errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const { result } = renderHook(() => useModeration())

      await act(async () => {
        try {
          await result.current.moderateText('Test')
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Erro na moderação')
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useModeration())

      await act(async () => {
        try {
          await result.current.moderateText('Test')
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Network error')
    })

    it('should call onModerationComplete callback', async () => {
      const mockResult: ModerationResult = {
        flagged: false,
        categories: {},
        severity: 'none',
        confidence: 0.1,
      }

      const onModerationComplete = jest.fn()

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const { result } = renderHook(() =>
        useModeration({ onModerationComplete })
      )

      await act(async () => {
        await result.current.moderateText('Test')
      })

      expect(onModerationComplete).toHaveBeenCalledWith(
        mockResult,
        expect.objectContaining({ type: 'allow' })
      )
    })

    it('should use strict mode option', async () => {
      const mockResult: ModerationResult = {
        flagged: true,
        categories: { spam: true },
        severity: 'low',
        confidence: 0.4,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const { result } = renderHook(() =>
        useModeration({ strictMode: true })
      )

      let moderationResult
      await act(async () => {
        moderationResult = await result.current.moderateText('Test')
      })

      // In strict mode, even low severity should warn
      expect(moderationResult?.action.type).toBe('warn')
    })

    it('should use autoBlock option', async () => {
      const mockResult: ModerationResult = {
        flagged: true,
        categories: { violence: true },
        severity: 'medium',
        confidence: 0.85,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const { result } = renderHook(() =>
        useModeration({ autoBlock: true })
      )

      let moderationResult
      await act(async () => {
        moderationResult = await result.current.moderateText('Test')
      })

      // High confidence with autoBlock should block
      expect(moderationResult?.action.type).toBe('block')
    })
  })

  describe('moderateAudio', () => {
    it('should successfully moderate audio file', async () => {
      const mockResult: AudioModerationResult = {
        flagged: false,
        categories: {},
        severity: 'none',
        confidence: 0.1,
        transcription: 'Hello world',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const { result } = renderHook(() => useModeration())
      const audioFile = new File(['audio'], 'test.mp3', { type: 'audio/mp3' })

      let moderationResult
      await act(async () => {
        moderationResult = await result.current.moderateAudio(audioFile)
      })

      expect(moderationResult).toEqual({
        result: mockResult,
        action: {
          type: 'allow',
          message: 'Conteúdo aprovado',
          canOverride: false,
        },
      })
    })

    it('should send FormData with audio file', async () => {
      const mockResult: AudioModerationResult = {
        flagged: false,
        categories: {},
        severity: 'none',
        confidence: 0.1,
        transcription: 'Test audio',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      const { result } = renderHook(() => useModeration())
      const audioFile = new File(['audio'], 'test.mp3', { type: 'audio/mp3' })

      await act(async () => {
        await result.current.moderateAudio(audioFile)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/moderation/audio',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      )
    })

    it('should handle audio moderation errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const { result } = renderHook(() => useModeration())
      const audioFile = new File(['audio'], 'test.mp3', { type: 'audio/mp3' })

      await act(async () => {
        try {
          await result.current.moderateAudio(audioFile)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Erro na moderação do áudio')
    })

    it('should set loading state during audio moderation', async () => {
      const mockResult: AudioModerationResult = {
        flagged: false,
        categories: {},
        severity: 'none',
        confidence: 0.1,
        transcription: 'Test',
      }

      let resolvePromise: any
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        new Promise(resolve => {
          resolvePromise = resolve
        })
      )

      const { result } = renderHook(() => useModeration())
      const audioFile = new File(['audio'], 'test.mp3', { type: 'audio/mp3' })

      act(() => {
        result.current.moderateAudio(audioFile)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      await act(async () => {
        resolvePromise({
          ok: true,
          json: async () => mockResult,
        })
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('Error Handling', () => {
    it('should clear error on new moderation attempt', async () => {
      // First call fails
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('First error'))

      const { result } = renderHook(() => useModeration())

      await act(async () => {
        try {
          await result.current.moderateText('Test 1')
        } catch (error) {}
      })

      expect(result.current.error).toBe('First error')

      // Second call succeeds
      const mockResult: ModerationResult = {
        flagged: false,
        categories: {},
        severity: 'none',
        confidence: 0.1,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      })

      await act(async () => {
        await result.current.moderateText('Test 2')
      })

      expect(result.current.error).toBe(null)
    })
  })
})
