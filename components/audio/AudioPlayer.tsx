"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import "@/styles/progress.css";

interface AudioPlayerProps {
  audioUrl: string;
  waveformData?: number[];
  title?: string;
}

export function AudioPlayer({
  audioUrl,
  waveformData,
  title,
}: AudioPlayerProps) {
  const [currentAudioUrl, setCurrentAudioUrl] = useState(audioUrl);

  // Atualizar URL quando audioUrl mudar
  useEffect(() => {
    setCurrentAudioUrl(audioUrl);
    setHasError(false);
    setIsLoading(true);
  }, [audioUrl]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Timeout para evitar loading eterno
    const loadingTimeout = setTimeout(() => {
      console.log("Audio loading timeout, assuming ready");
      setIsLoading(false);
    }, 5000);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (isFinite(audio.duration) && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = async (e: Event) => {
      console.error("Audio error:", e);
      console.log("Audio URL:", currentAudioUrl);

      // Se for erro 400/403, tentar regenerar URL assinada
      if (currentAudioUrl.includes("supabase.co/storage")) {
        console.log("Attempting to regenerate signed URL");
        try {
          // Extrair informações da URL para regenerar
          const urlParts = currentAudioUrl.split("/");
          const bucketIndex =
            urlParts.findIndex((part) => part === "public") + 1;
          const bucketName = urlParts[bucketIndex];
          const filePath = urlParts.slice(bucketIndex + 1).join("/");

          console.log("Regenerating URL for:", { bucketName, filePath });

          // Aqui precisaríamos do cliente Supabase, mas não temos acesso
          // Por agora, apenas marcar como erro
        } catch (error) {
          console.error("Failed to regenerate URL:", error);
        }
      }

      setIsPlaying(false);
      setHasError(true);
      setIsLoading(false);
    };
    const handleCanPlay = () => {
      console.log("Audio can play:", audioUrl);
      setIsLoading(false);
      setHasError(false);
      clearTimeout(loadingTimeout);
    };
    const handleLoadStart = () => {
      console.log("Audio load start:", audioUrl);
      setIsLoading(true);
      setHasError(false);
    };
    const handleLoadedData = () => {
      console.log("Audio loaded data:", audioUrl);
      setIsLoading(false);
      setHasError(false);
      clearTimeout(loadingTimeout);
    };
    const handleLoadedMetadata = () => {
      console.log("Audio loaded metadata:", audioUrl);
      setIsLoading(false);
      setHasError(false);
      clearTimeout(loadingTimeout);
    };
    const handleCanPlayThrough = () => {
      console.log("Audio can play through:", audioUrl);
      setIsLoading(false);
      setHasError(false);
      clearTimeout(loadingTimeout);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);

    return () => {
      clearTimeout(loadingTimeout);
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
    };
  }, []);

  const togglePlay = async () => {
    console.log("togglePlay called", {
      isPlaying,
      audioUrl,
      audioRef: audioRef.current,
    });

    if (!audioRef.current) {
      console.log("No audio ref");
      return;
    }

    try {
      if (isPlaying) {
        console.log("Pausing audio");
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log("Attempting to play audio");
        console.log("Audio readyState:", audioRef.current.readyState);
        console.log("Audio networkState:", audioRef.current.networkState);

        // Tentar carregar o áudio se não estiver carregado
        if (audioRef.current.readyState === 0) {
          console.log("Audio not loaded, loading...");
          audioRef.current.load();
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar um pouco
        }

        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          await playPromise;
          console.log("Audio playing successfully");
          setIsPlaying(true);
        } else {
          console.log("Play promise is undefined");
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      console.log("Audio URL:", audioUrl);
      console.log("Audio element:", audioRef.current);
      console.log("Audio src:", audioRef.current?.src);
      console.log("Audio currentSrc:", audioRef.current?.currentSrc);
      // Reset playing state on error
      setIsPlaying(false);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
      <audio ref={audioRef} preload="metadata">
        <source src={currentAudioUrl} type="audio/webm" />
        <source src={currentAudioUrl} type="audio/mp4" />
        <source src={currentAudioUrl} type="audio/mpeg" />
        <source src={currentAudioUrl} />
        Seu navegador não suporta o elemento de áudio.
      </audio>

      {title && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 font-semibold">
            🎙️ Áudio Reflexão
          </p>
          {/* Debug info - remover depois */}
          <div className="text-xs text-gray-500 mt-1">
            <p>URL: {currentAudioUrl}</p>
            <p>Duration: {duration}s</p>
            <p>Loading: {isLoading ? "Yes" : "No"}</p>
            <p>Error: {hasError ? "Yes" : "No"}</p>
            <p>
              Waveform:{" "}
              {waveformData ? `${waveformData.length} points` : "Generated"}
            </p>
            <p>Progress: {progress.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Waveform Visual */}
      <div className="mb-4 h-20 flex items-end gap-0.5 bg-white rounded-lg p-2 waveform-container">
        {/* Debug info */}
        {(() => {
          console.log(
            "Waveform data:",
            waveformData,
            "Length:",
            waveformData?.length
          );
          return null;
        })()}
        {(() => {
          const dataToUse =
            waveformData && waveformData.length > 0
              ? waveformData
              : Array.from({ length: 50 }, () => Math.random() * 80 + 20); // Entre 20% e 100%

          return dataToUse.map((height, i) => {
            const isActive = (progress / 100) * dataToUse.length > i;
            const safeHeight = Math.max(8, Math.min(100, Math.round(height))); // Entre 8% e 100%

            return (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all ${
                  isActive ? "bg-purple-600" : "bg-purple-200"
                }`}
                style={{ height: `${safeHeight}%` }}
              />
            );
          });
        })()}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-4">
        {hasError ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center mb-2">
              <span className="text-white text-xl">⚠️</span>
            </div>
            <p className="text-sm text-red-600 mb-2">Erro ao carregar áudio</p>
            <button
              type="button"
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                if (audioRef.current) {
                  audioRef.current.load();
                }
              }}
              className="text-xs text-purple-600 hover:text-purple-700 underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={togglePlay}
            disabled={isLoading}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 rounded-full flex items-center justify-center transition-colors shadow-lg"
            aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 text-white" />
            ) : (
              <Play className="w-7 h-7 text-white ml-1" />
            )}
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative h-2 bg-purple-200 rounded-full overflow-hidden cursor-pointer">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              const time = parseFloat(e.target.value);
              if (audioRef.current) {
                audioRef.current.currentTime = time;
              }
              setCurrentTime(time);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Controle de tempo do áudio"
          />
          <div
            className={`h-full bg-purple-600 transition-all w-[${Math.round(
              progress
            )}%]`}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between">
        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            aria-label={isMuted ? "Ativar som" : "Silenciar"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-600" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-20"
            aria-label="Controle de volume"
          />
        </div>

        {/* Playback Speed */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 mr-1 hidden sm:inline">
            Velocidade:
          </span>
          {[1, 1.5, 2, 4].map((rate) => (
            <button
              key={rate}
              onClick={() => changeSpeed(rate)}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                playbackRate === rate
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
