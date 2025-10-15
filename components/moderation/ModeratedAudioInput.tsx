"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useModeration } from "@/lib/hooks/useModeration";
import { ModerationFeedback } from "./ModerationFeedback";
import { AudioModerationResult, ModerationAction } from "@/types/moderation";
import { Mic, Square, Play, Pause, Upload, Loader2 } from "lucide-react";

interface ModeratedAudioInputProps {
  onAudioValidated?: (audioFile: File, transcription: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  maxDuration?: number; // em segundos
  maxFileSize?: number; // em bytes
  strictMode?: boolean;
  className?: string;
}

export function ModeratedAudioInput({
  onAudioValidated,
  onValidationChange,
  maxDuration = 300, // 5 minutos
  maxFileSize = 25 * 1024 * 1024, // 25MB
  strictMode = false,
  className = "",
}: ModeratedAudioInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [moderationResult, setModerationResult] =
    useState<AudioModerationResult | null>(null);
  const [moderationAction, setModerationAction] =
    useState<ModerationAction | null>(null);
  const [isOverridden, setIsOverridden] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { moderateAudio, isLoading } = useModeration({
    strictMode,
    onModerationComplete: (result, action) => {
      const audioResult = result as AudioModerationResult;
      setModerationResult(audioResult);
      setModerationAction(action);
      setIsOverridden(false);

      const isValid =
        action.type === "allow" || (action.canOverride && isOverridden);
      // onValidationChange agora é chamado pelo useEffect

      if (isValid && audioBlob) {
        const audioFile = new File([audioBlob], "audio.webm", {
          type: audioBlob.type,
        });
        onAudioValidated?.(audioFile, audioResult.transcription);
      }
    },
  });

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        // Parar todas as tracks do stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Contador de duração
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            // Parar gravação quando atingir o limite
            setTimeout(() => stopRecording(), 0);
            return maxDuration;
          }
          return newDuration;
        });
      }, 1000);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      alert("Erro ao acessar o microfone. Verifique as permissões.");
    }
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, [isRecording]);

  const playAudio = useCallback(() => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [audioUrl, isPlaying]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > maxFileSize) {
        alert(
          `Arquivo muito grande. Máximo ${Math.round(
            maxFileSize / 1024 / 1024
          )}MB.`
        );
        return;
      }

      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
      setModerationResult(null);
      setModerationAction(null);
    },
    [maxFileSize]
  );

  const moderateCurrentAudio = useCallback(async () => {
    if (!audioBlob) return;

    const audioFile = new File([audioBlob], "audio.webm", {
      type: audioBlob.type,
    });
    try {
      await moderateAudio(audioFile);
    } catch (error) {
      console.error("Erro na moderação:", error);
    }
  }, [audioBlob, moderateAudio]);

  const handleOverride = useCallback(() => {
    setIsOverridden(true);
    // onValidationChange agora é chamado pelo useEffect

    if (audioBlob && moderationResult) {
      const audioFile = new File([audioBlob], "audio.webm", {
        type: audioBlob.type,
      });
      onAudioValidated?.(audioFile, moderationResult.transcription);
    }
  }, [audioBlob, moderationResult, onValidationChange, onAudioValidated]);

  const handleCancel = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setModerationResult(null);
    setModerationAction(null);
    setIsOverridden(false);
    // onValidationChange agora é chamado pelo useEffect
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Monitorar estado do áudio e notificar mudanças de validação
  useEffect(() => {
    const hasValidAudio = !!(
      audioBlob &&
      (!moderationResult ||
        moderationAction?.type === "allow" ||
        (moderationAction?.canOverride && isOverridden))
    );

    console.log("🎙️ Audio validation check:", {
      hasAudioBlob: !!audioBlob,
      hasModerationResult: !!moderationResult,
      actionType: moderationAction?.type,
      canOverride: moderationAction?.canOverride,
      isOverridden,
      finalValidation: hasValidAudio,
    });

    onValidationChange?.(hasValidAudio);
  }, [
    audioBlob,
    moderationResult,
    moderationAction,
    isOverridden,
    onValidationChange,
  ]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col space-y-3">
        {/* Controles de gravação */}
        <div className="flex items-center space-x-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              <Mic className="w-4 h-4" />
              <span>Gravar</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Parar</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload de arquivo de áudio"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRecording || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>

        {/* Indicador de gravação */}
        {isRecording && (
          <div className="flex items-center space-x-2 text-red-500">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Gravando... {formatDuration(recordingDuration)} /{" "}
              {formatDuration(maxDuration)}
            </span>
          </div>
        )}

        {/* Player de áudio */}
        {audioUrl && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <button
              onClick={playAudio}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            <div className="flex-1">
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="w-full"
                controls
              />
            </div>

            <button
              onClick={moderateCurrentAudio}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="text-sm">Verificar</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Resultado da moderação */}
      {moderationResult && moderationAction && !isOverridden && (
        <div className="space-y-3">
          {moderationResult.transcription && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Transcrição:
              </h4>
              <p className="text-sm text-gray-600">
                {moderationResult.transcription}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Qualidade:{" "}
                {moderationResult.transcriptionQuality === "good"
                  ? "Boa"
                  : moderationResult.transcriptionQuality === "fair"
                  ? "Regular"
                  : "Ruim"}
              </p>
            </div>
          )}

          <ModerationFeedback
            result={moderationResult}
            action={moderationAction}
            onOverride={
              moderationAction.canOverride ? handleOverride : undefined
            }
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
}
