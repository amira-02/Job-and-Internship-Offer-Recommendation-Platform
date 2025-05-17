import React from 'react';
import { motion } from 'framer-motion';
import '../styles/AuthIllustration.css';

const AuthIllustration = ({ type }) => {
  const loginVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const registerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="auth-illustration">
      {type === 'login' ? (
        <motion.div
          className="illustration-container login"
          initial="hidden"
          animate="visible"
          variants={loginVariants}
        >
          <motion.div className="illustration-circle" animate={pulseAnimation}>
            <svg viewBox="0 0 200 200" className="illustration-svg">
              <motion.path
                d="M40,100 C40,65 65,40 100,40 C135,40 160,65 160,100 C160,135 135,160 100,160 C65,160 40,135 40,100"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                animate={{
                  pathLength: [0, 1],
                  transition: { duration: 2, ease: "easeInOut" }
                }}
              />
              <motion.circle
                cx="100"
                cy="100"
                r="30"
                fill="currentColor"
                animate={floatingAnimation}
              />
              <motion.path
                d="M85,100 L95,110 L115,90"
                stroke="white"
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              />
            </svg>
          </motion.div>
          <motion.div className="illustration-particles">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                animate={{
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="illustration-container register"
          initial="hidden"
          animate="visible"
          variants={registerVariants}
        >
          <motion.div className="illustration-circle" animate={pulseAnimation}>
            <svg viewBox="0 0 200 200" className="illustration-svg">
              <motion.path
                d="M40,100 C40,65 65,40 100,40 C135,40 160,65 160,100 C160,135 135,160 100,160 C65,160 40,135 40,100"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                animate={{
                  pathLength: [0, 1],
                  transition: { duration: 2, ease: "easeInOut" }
                }}
              />
              <motion.path
                d="M85,80 L115,80 M100,65 L100,95"
                stroke="currentColor"
                strokeWidth="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              />
            </svg>
          </motion.div>
          <motion.div className="illustration-particles">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                animate={{
                  x: [0, Math.random() * 120 - 60],
                  y: [0, Math.random() * 120 - 60],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AuthIllustration; 