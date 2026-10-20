import confetti from 'canvas-confetti';

export function fireCelebration() {
  const count = 120;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#a855f7', '#6366f1', '#06b6d4'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#ec4899', '#8b5cf6', '#14b8a6'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export const triggerConfetti = fireCelebration;
