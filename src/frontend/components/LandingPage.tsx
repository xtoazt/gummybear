import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const FeatureCard = ({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="relative group"
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
    <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 h-full">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  </motion.div>
);

export function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
      
      {/* Spotlight effect */}
      <motion.div
        className="absolute inset-0 opacity-0 dark:opacity-100"
        animate={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 107, 107, 0.15), transparent 40%)`
        }}
        transition={{ type: "spring", stiffness: 50, damping: 50 }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div variants={item} className="text-center mb-20">
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="text-7xl md:text-9xl font-bold mb-6 relative"
            >
              <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent animate-pulse">
                🍭 GummyBear
              </span>
            </motion.h1>
            
            <motion.p
              variants={item}
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              AI-Powered P2P Chat Platform with Role-Based Access Control
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-wrap gap-4 justify-center mb-16"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/app"
                  className="relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ff6b6b_0%,#ee5a52_50%,#ff6b6b_100%)]"></span>
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black px-8 py-3 text-lg font-semibold text-white backdrop-blur-3xl transition-all">
                    🚀 Launch App
                  </span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/showcase"
                  className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/50 px-8 py-3 text-lg font-semibold text-white backdrop-blur-3xl transition-all hover:border-white/40"
                >
                  <span>🎨 UI Showcase</span>
                  <div className="absolute inset-0 translate-x-[-100%] skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[100%] group-hover:duration-1000"></div>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/demo"
                  className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/50 px-8 py-3 text-lg font-semibold text-white backdrop-blur-3xl transition-all hover:border-white/40"
                >
                  <span>👀 View Demo</span>
                  <div className="absolute inset-0 translate-x-[-100%] skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[100%] group-hover:duration-1000"></div>
                </Link>
              </motion.div>

              <motion.a
                href="https://github.com/xtoazt/gummybear"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/50 px-8 py-3 text-lg font-semibold text-white backdrop-blur-3xl transition-all hover:border-white/40"
              >
                <span>📁 GitHub</span>
                <div className="absolute inset-0 translate-x-[-100%] skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[100%] group-hover:duration-1000"></div>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={container}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            <FeatureCard
              icon="🤖"
              title="AI-Powered"
              description="WebLLM integration for intelligent responses"
              delay={0.1}
            />
            <FeatureCard
              icon="🔒"
              title="Secure"
              description="Role-based access control system"
              delay={0.2}
            />
            <FeatureCard
              icon="⚡"
              title="Fast"
              description="Real-time messaging with WebRTC"
              delay={0.3}
            />
            <FeatureCard
              icon="🎨"
              title="Beautiful"
              description="Modern dark theme with animations"
              delay={0.4}
            />
          </motion.div>

          {/* CTA Card */}
          <motion.div
            variants={item}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Ready to get started?
              </h3>
              <p className="text-gray-400 mb-6">
                Experience the future of AI-powered chat with role-based access control, 
                custom components, and WebLLM integration.
              </p>
              <div className="flex gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/app"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
