export const buttonHover = {
  hover: { scale: 1.05, transition: { duration: 0.2, ease: "easeInOut" } },
  tap: { scale: 0.95 }
};

export const favoriteBounce = {
  tap: { scale: [1, 1.2, 1], transition: { duration: 0.3 } }
};

export const modalFadeSlide = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } }
};

export const cardHover = {
  hover: { translateY: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }
};

export const shimmer = {
  animate: {
    backgroundPosition: ["-200% 0", "200% 0"],
  },
  transition: {
    duration: 1.5,
    ease: "linear",
    repeat: Infinity,
  },
};

export const underlineAnimation = {
  hover: { width: "100%", transition: { duration: 0.3 } },
  initial: { width: "0%" }
};

export const rotateAnimation = {
  rotate: 360,
  transition: { duration: 0.3, ease: "easeInOut" }
};

export const expandOnFocus = {
  focus: { width: "300px", transition: { duration: 0.3, ease: "easeInOut" } },
  initial: { width: "200px" }
};

export const chipRemove = {
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

export const parallaxEffect = (scrollYProgress) => {
  return {
    y: scrollYProgress.map(y => y * 100) // Adjust multiplier for desired parallax strength
  };
};

export const numberMorph = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, y: 10, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

export const checkboxRipple = {
  tap: { scale: 1.1, opacity: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

export const strikeThrough = {
  checked: { width: "100%", transition: { duration: 0.3, ease: "easeOut" } },
  unchecked: { width: "0%" }
};

export const slideInConfirmation = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
};

export const floatingLabel = {
  focus: { y: -20, fontSize: "0.75rem" },
  blur: { y: 0, fontSize: "1rem" }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

export const slideUpStagger = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
