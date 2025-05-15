import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Log the 404 error and show a toast
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    toast.info("Looks like you're lost! Why not create a new story? 📖", {
      duration: 4000,
      position: "top-center",
      action: {
        label: "Create Story",
        onClick: () => navigate("/"),
      },
    });
  }, [location.pathname, navigate]);

  // Animation variants for the 404 text
  const textVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      },
    },
  };

  // Animation variants for background elements
  const bgElementVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 0.2,
      scale: 1,
      transition: {
        delay: i * 0.5,
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    }),
  };

  // Glassmorphism card style
  const glassCardStyle = `
    backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  `;

  return (
    <div
      className={`min-h-screen font-sans flex items-center justify-center transition-colors duration-700 ${theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white"
          : "bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 text-gray-800"
        }`}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
          body, html {
            font-family: 'Poppins', sans-serif;
          }
          .glow-on-hover {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }
          .glow-on-hover:hover {
            transform: translateY(-3px);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          }
          .glow-on-hover::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.2),
              transparent
            );
            transition: 0.5s;
          }
          .glow-on-hover:hover::before {
            left: 100%;
          }
        `}
      </style>

      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={bgElementVariants}
          className={`absolute top-1/5 left-1/6 w-80 h-80 rounded-full ${theme === "dark" ? "bg-purple-600" : "bg-pink-400"
            } blur-3xl opacity-20`}
        />
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={bgElementVariants}
          className={`absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full ${theme === "dark" ? "bg-blue-600" : "bg-indigo-400"
            } blur-3xl opacity-20`}
        />
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={bgElementVariants}
          className={`absolute top-2/3 left-1/3 w-72 h-72 rounded-full ${theme === "dark" ? "bg-indigo-600" : "bg-violet-400"
            } blur-3xl opacity-20`}
        />
      </div>

      {/* 404 Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`relative z-10 text-center p-10 rounded-3xl ${glassCardStyle} max-w-md`}
      >
        <div
          className={`absolute inset-0 ${theme === "dark"
              ? "bg-gradient-to-br from-purple-500/10 to-indigo-500/10"
              : "bg-gradient-to-br from-blue-200/10 to-pink-200/10"
            }`}
        />
        <div className="relative z-10">
          <motion.h1
            variants={textVariants}
            initial="initial"
            animate="animate"
            className="text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
          >
            404
          </motion.h1>
          <p
            className={`text-xl mb-6 ${theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
          >
            Oops! The page you’re looking for doesn’t exist. Let’s get you back to storytelling! ✨
          </p>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`glow-on-hover inline-block px-6 py-3 rounded-full text-lg font-semibold ${theme === "dark"
                ? "bg-purple-600/30 text-purple-200 hover:bg-purple-600/50"
                : "bg-indigo-500/30 text-indigo-800 hover:bg-indigo-500/50"
              } transition-all duration-300`}
          >
            Return to Home
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;