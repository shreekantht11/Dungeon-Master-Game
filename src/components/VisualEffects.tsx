import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

interface VisualEffectsProps {
  type: 'combat-hit' | 'level-up' | 'heal' | 'magic' | 'victory' | 'ambient';
  trigger?: boolean;
  position?: { x: number; y: number };
}

const VisualEffects = ({ type, trigger, position = { x: 50, y: 50 } }: VisualEffectsProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenShake, setScreenShake] = useState(false);

  const generateParticles = (count: number, colorType: string) => {
    const colors = {
      destructive: '#ef4444',
      primary: '#3b82f6',
      success: '#22c55e',
      magic: '#a855f7',
      gold: '#fbbf24',
    };

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: position.x,
        y: position.y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1,
        size: Math.random() * 8 + 4,
        color: colors[colorType as keyof typeof colors] || colors.primary,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1000);
  };

  const generateAmbientParticles = () => {
    const interval = setInterval(() => {
      const newParticle: Particle = {
        id: Date.now(),
        x: Math.random() * 100,
        y: 100,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        life: 1,
        size: Math.random() * 4 + 2,
        color: '#ffffff',
      };
      setParticles((prev) => [...prev.slice(-20), newParticle]);
    }, 200);

    return () => clearInterval(interval);
  };

  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  };

  useEffect(() => {
    if (!trigger) {
      setParticles([]);
      setScreenShake(false);
      return;
    }

    switch (type) {
      case 'combat-hit':
        generateParticles(10, 'destructive');
        triggerScreenShake();
        break;
      case 'level-up':
        generateParticles(30, 'primary');
        break;
      case 'heal':
        generateParticles(15, 'success');
        break;
      case 'magic':
        generateParticles(20, 'magic');
        break;
      case 'victory':
        generateParticles(50, 'gold');
        break;
      case 'ambient':
        generateAmbientParticles();
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, type]);

  return (
    <>
      {/* Screen Shake Effect */}
      {screenShake && (
        <motion.div
          animate={{ x: [0, -5, 5, -5, 5, 0], y: [0, 5, -5, 5, -5, 0] }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 pointer-events-none z-50"
        />
      )}

      {/* Particle System */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ x: `${particle.x}%`, y: `${particle.y}%`, opacity: 1, scale: 1 }}
            animate={{
              x: `${particle.x + particle.vx}%`,
              y: `${particle.y + particle.vy}%`,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size}px ${particle.color}`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default VisualEffects;
