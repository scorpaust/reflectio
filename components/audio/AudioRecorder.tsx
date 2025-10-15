"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AudioRecorderProps {
  onAudioReady: (blob: Blob, duration: number) => void;
  maxDuration?: number; // em segundos
}

export function AudioRecorder({
  onAudioReady,
  maxDuration = 600,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Tentar diferentes formatos de áudio para compatibilidade (ordem de preferência)
      const supportedTypes = [
        "audio/mp4",
        "audio/mpeg",
        "audio/wav",
        "audio/webm;codecs=opus",
        "audio/webm",
      ];

      let mimeType = "";
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log("Using audio format:", type);
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        // Calcular duração
        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          const audioDuration = audio.duration;
          console.log("Audio duration from metadata:", audioDuration);
          if (
            isFinite(audioDuration) &&
            !isNaN(audioDuration) &&
            audioDuration > 0
          ) {
            setDuration(Math.floor(audioDuration));
          } else {
            // Fallback para tempo de gravação se não conseguir obter duração
            console.log("Using recording time as fallback:", recordingTime);
            setDuration(recordingTime);
          }
        };

        audio.onerror = (error) => {
          console.error("Error loading audio for duration:", error);
          setDuration(recordingTime);
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Erro ao acessar microfone. Verifique as permissões.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith("audio/")) {
      alert("Por favor, selecione um arquivo de áudio");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("O áudio deve ter menos de 50MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioBlob(file);
    setAudioUrl(url);

    // Calcular duração
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      const audioDuration = audio.duration;
      if (isFinite(audioDuration) && !isNaN(audioDuration)) {
        setDuration(Math.floor(audioDuration));
      } else {
        // Fallback: estimar duração baseada no tamanho do arquivo
        const estimatedDuration = Math.floor(file.size / 16000); // Estimativa aproximada
        setDuration(estimatedDuration);
      }
    };
  };

  const handleConfirm = () => {
    if (audioBlob) {
      onAudioReady(audioBlob, duration);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {!audioBlob ? (
        <>
          {/* Recording Interface */}
          {!isRecording ? (
            <div className="flex flex-col gap-4">
              <Button type="button" onClick={startRecording} className="w-full">
                <Mic className="w-5 h-5 mr-2" />
                Gravar Reflexão em Áudio
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              <input
                type="file"
                id="audio-upload"
                accept="audio/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="audio-upload"
                className="inline-block w-full cursor-pointer"
              >
                <div className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
                  <Upload className="w-5 h-5" />
                  Fazer Upload de Áudio
                </div>
              </label>

              <p className="text-xs text-gray-500 text-center">
                Máximo: {maxDuration / 60} minutos • Formatos: MP3, WAV, M4A,
                WEBM
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                    <Mic className="w-10 h-10 text-white" />
                  </div>
                  {!isPaused && (
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                  )}
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  {formatTime(recordingTime)}
                </p>
                <p className="text-sm text-gray-600">
                  {isPaused ? "⏸ Pausado" : "🔴 Gravando..."}
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  onClick={pauseRecording}
                  variant="secondary"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Continuar
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Pausar
                    </>
                  )}
                </Button>
                <Button type="button" onClick={stopRecording} variant="danger">
                  <Square className="w-4 h-4 mr-1" />
                  Parar
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Preview do Áudio:</p>
            <audio src={audioUrl!} controls className="w-full" />
            <p className="text-xs text-gray-500 mt-2">
              Duração: {formatTime(duration)}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={discardRecording}
              variant="ghost"
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Descartar
            </Button>
            <Button type="button" onClick={handleConfirm} className="flex-1">
              Confirmar e Continuar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
