// --- ESTILOS FPGA ---
export const fpgaStyle = {
  canvas: { 
    width: '100vw', 
    height: '100vh', 
    background: 'url(/fpga-bg.avif) center / contain no-repeat',
    backgroundSize: '60%',
    backgroundAttachment: 'scroll',
    backgroundColor: '#0b1118',
  },

  buttonNode: (isOn) => ({
    width: '52px',
    height: '52px',
    borderRadius: '6px',
    background: 'radial-gradient(circle 16px at center, #1a1a1a, #1a1a1a 16px, #7e7e7e 16px)',
    border: '2px solid #707070',
    cursor: 'pointer',
    transition: 'all 0.1s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isOn
      ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
      : '0 2px 4px rgba(0, 0, 0, 0.2)',
  }),

  ledNode: (isOn, color) => {
    const colorConfig = {
      red: { fill: '#ff5c70', glow: 'rgba(255, 92, 112, 0.55)', border: '#5c5c5c' },
      green: { fill: '#79ff8a', glow: 'rgba(121, 255, 138, 0.45)', border: '#5c5c5c' },
      blue: { fill: '#7cc9ff', glow: 'rgba(124, 201, 255, 0.45)', border: '#5c5c5c' },
      default: { fill: '#21e906', glow: 'rgba(33, 233, 6, 0.35)', border: '#5c5c5c' },
    };
    const config = colorConfig[color] || colorConfig.default;

    return {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: isOn ? config.fill : '#ffffff',
      border: `3px solid ${isOn ? config.border : '#5c5c5c'}`,
      boxShadow: isOn
        ? `0 0 18px 6px ${config.glow}`
        : '0 0 0 4px rgba(0,0,0,0.08)',
      transition: 'all 0.2s ease-in-out',
      margin: '0 auto',
    };
  },

  digitNode: {
    width: '108px',
    height: '132px',
    borderRadius: '18px',
    background: 'linear-gradient(180deg, #07111c, #081623)',
    border: '3px solid #9b9999',
    position: 'relative',
    padding: '12px',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 0 20px rgba(86, 168, 239, 0.16)',
  },
};

export const digitPatterns = {
  0: [true, true, true, true, true, true, false],
  1: [false, false, true, false, true, false, false],
  2: [true, false, true, true, false, true, true],
  3: [true, false, true, false, true, true, true],
  4: [false, true, true, false, true, false, true],
  5: [true, true, false, false, true, true, true],
  6: [true, true, false, true, true, true, true],
  7: [true, false, true, false, true, false, false],
  8: [true, true, true, true, true, true, true],
  9: [true, true, true, false, true, true, true],
};

export const segmentStyle = (active) => ({
  position: 'absolute',
  background: active ? '#ffffff' : 'rgba(255, 255, 255, 0.16)',
  borderRadius: '4px',
  transition: 'background 0.2s ease-in-out',
});
