import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const notificationVariants = {
  hidden: { opacity: 0, y: -50, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, type: "spring", damping: 10, stiffness: 100 } },
  exit: { opacity: 0, y: -50, scale: 0.8, transition: { duration: 0.2 } },
};

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 3000); // Notification disappears after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeClasses = {
    success: 'bg-primary',
    error: 'bg-red-500',
  };

  return (
    <motion.div
      className={`fixed top-5 left-1/2 -translate-x-1/2 p-4 rounded-lg text-white font-bold z-50 flex items-center justify-between shadow-lg ${typeClasses[type]} font-body`}
      variants={notificationVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <span>{message}</span>
      <button onClick={onClose} className="bg-transparent border-none text-white text-xl ml-4 cursor-pointer">&times;</button>
    </motion.div>
  );
};

export default Notification;