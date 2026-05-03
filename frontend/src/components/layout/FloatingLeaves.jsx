import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const leaves = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: `${12 + ((i * 23) % 82)}%`,
  duration: 20 + ((i * 7) % 18),
  delay: (i * 3) % 20,
  size: 10 + ((i * 5) % 20),
}));

const FloatingLeaves = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          initial={{ 
            x: leaf.x,
            y: '-10%', 
            rotate: 0,
            opacity: 0 
          }}
          animate={{ 
            y: '110%', 
            rotate: 360,
            opacity: [0, 0.15, 0.15, 0]
          }}
          transition={{ 
            duration: leaf.duration,
            repeat: Infinity, 
            delay: leaf.delay,
            ease: "linear"
          }}
          className="absolute text-primary"
        >
          <Leaf size={leaf.size} strokeWidth={0.5} />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingLeaves;
