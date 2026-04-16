export const DIFFICULTY_SETTINGS = {
  EASY: {
    name: 'Easy',
    toleranceSec: 0.040,      // 40ms - Very generous
    winDurationSec: 3.0,     // 3s - Fast success
    pitchToleranceBpm: 0.2,  // Easy to hit with slider
    nudgeAmount: 0.010       // 10ms - Effective movement
  },
  MEDIUM: {
    name: 'Medium',
    toleranceSec: 0.020,     // 20ms
    winDurationSec: 4.0,     // 4s
    pitchToleranceBpm: 0.05,
    nudgeAmount: 0.005       // 5ms
  },
  PRO: {
    name: 'Pro',
    toleranceSec: 0.004,     // 4ms - Professional grade
    winDurationSec: 5.0,     // 5s
    pitchToleranceBpm: 0.01,
    nudgeAmount: 0.001       // 1ms
  }
};

// Global config - Change this to switch difficulty across all levels
export const CURRENT_DIFFICULTY = 'EASY'; 
