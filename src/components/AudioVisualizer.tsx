import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  timeDomainData: Uint8Array<ArrayBuffer> | null;
  frequencyData: Uint8Array<ArrayBuffer> | null;
  isVoiceActive: boolean;
  isRecording: boolean;
  noiseGateThresholdDb: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  timeDomainData,
  frequencyData,
  isVoiceActive,
  isRecording,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    if (!isRecording || !timeDomainData || timeDomainData.length === 0) {
      // Idle animated subtle wave
      const time = Date.now() * 0.003;
      ctx.beginPath();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.02 + time) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      return;
    }

    // 1. Draw Frequency Spectrum Bars in the background
    if (frequencyData && frequencyData.length > 0) {
      const barCount = 42;
      const barWidth = (width / barCount) - 2;
      const step = Math.floor(frequencyData.length / barCount);

      for (let i = 0; i < barCount; i++) {
        const val = frequencyData[i * step] / 255;
        const barHeight = val * (height * 0.7);
        const x = i * (barWidth + 2);
        const y = height - barHeight;

        // Highlight human vocal formant range (bars 5 to 22)
        const isVocalBin = i >= 4 && i <= 24;
        if (isVoiceActive) {
          ctx.fillStyle = isVocalBin
            ? 'rgba(6, 182, 212, 0.45)' // Cyan for active vocal range
            : 'rgba(16, 185, 129, 0.25)'; // Emerald for harmonics
        } else {
          ctx.fillStyle = 'rgba(71, 85, 105, 0.2)'; // Dim slate when gate closed
        }

        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }

    // 2. Draw Live Oscilloscope Waveform Line
    const sliceWidth = width / timeDomainData.length;
    ctx.lineWidth = isVoiceActive ? 2.5 : 1.5;
    ctx.strokeStyle = isVoiceActive ? '#22d3ee' : '#64748b'; // Cyan glow if voice live, slate if gate muted
    ctx.beginPath();

    let x = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
      const v = timeDomainData[i] / 128.0; // 0 to 2
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();

    // 3. Center line indicator & Voice status badge on canvas
    if (isRecording) {
      ctx.fillStyle = isVoiceActive ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(16, 16, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '10px ui-sans-serif, system-ui, sans-serif';
      ctx.fillStyle = isVoiceActive ? '#34d399' : '#fbbf24';
      ctx.fillText(
        isVoiceActive ? 'VOICE ISOLATED' : 'NOISE GATE FILTERING',
        28,
        20
      );
    }
  }, [timeDomainData, frequencyData, isVoiceActive, isRecording]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] shadow-inner">
      <canvas
        ref={canvasRef}
        className="w-full h-36 sm:h-44 block"
      />
    </div>
  );
};
