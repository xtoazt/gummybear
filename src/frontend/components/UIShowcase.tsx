import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Magic UI Pro-style Feature Tabs
const FeatureTabs = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs = [
    { id: 0, label: 'Animations', icon: '✨' },
    { id: 1, label: 'Components', icon: '🎨' },
    { id: 2, label: 'Features', icon: '🚀' },
    { id: 3, label: 'Modern', icon: '💫' }
  ];

  const content = [
    {
      title: 'Aceternity UI Animations',
      description: 'Smooth, performant animations powered by Framer Motion',
      features: ['Spotlight Effects', 'Gradient Animations', 'Spring Physics', 'Stagger Animations']
    },
    {
      title: 'Magic UI Components',
      description: 'Beautiful, reusable components inspired by Magic UI Pro',
      features: ['Animated Cards', 'Glassmorphism', 'Gradient Buttons', 'Interactive Hover States']
    },
    {
      title: 'Discord-Like Features',
      description: 'Full-featured chat experience with modern UX',
      features: ['@Mentions', 'Emoji Reactions', 'Message Editing', 'Role Management']
    },
    {
      title: 'Modern UI Elements',
      description: 'Cutting-edge design patterns and interactions',
      features: ['Backdrop Blur', 'Gradient Text', 'Micro-interactions', 'Responsive Design']
    }
  ];

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-6 border-b border-white/10">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === tab.id ? 'text-white' : 'text-gray-500'
            }`}
            whileHover={{ y: -2 }}
          >
            {tab.icon} {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-red-500"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
          <div className="relative bg-black/70 border border-white/20 rounded-xl p-8 shadow-xl" style={{ backdropFilter: 'blur(12px)' }}>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {content[activeTab].title}
            </h3>
            <p className="text-gray-400 mb-6">{content[activeTab].description}</p>
            <div className="grid grid-cols-2 gap-4">
              {content[activeTab].features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500"></div>
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Pricing Card Component (Magic UI Pro style)
const PricingCard = ({ name, price, features, highlighted = false }: { name: string; price: string; features: string[]; highlighted?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className={`relative group ${highlighted ? 'md:scale-105' : ''}`}
  >
    {highlighted && (
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-50"></div>
    )}
    <div className={`relative bg-black/70 border rounded-2xl p-8 h-full shadow-lg ${
      highlighted ? 'border-pink-500/50' : 'border-white/20'
    }`} style={{ backdropFilter: 'blur(12px)' }}>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2 text-white">{name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
            {price}
          </span>
        </div>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-2 text-sm text-gray-300"
          >
            <span className="text-green-400">✓</span>
            {feature}
          </motion.li>
        ))}
      </ul>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          highlighted
            ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
            : 'bg-black/50 border border-white/20 text-white hover:border-white/40'
        }`}
      >
        Get Started
      </motion.button>
    </div>
  </motion.div>
);

// Stats Component
const Stats = () => {
  const stats = [
    { value: '50+', label: 'Components', icon: '🎨' },
    { value: '100%', label: 'Customizable', icon: '⚡' },
    { value: '2x', label: 'Faster Build', icon: '🚀' },
    { value: '24/7', label: 'Support', icon: '💬' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="text-center p-6 bg-black/70 border border-white/20 rounded-xl shadow-lg hover:border-white/30 transition-colors"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <div className="text-4xl mb-2">{stat.icon}</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-gray-400">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

export function UIShowcase() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full bg-black relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30 pointer-events-none"></div>
      
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 107, 107, 0.15), transparent 40%)`
        }}
        transition={{ type: "spring", stiffness: 50, damping: 50 }}
      />

      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Link to="/app" className="inline-block mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
            >
              ← Back to Chat
            </motion.div>
          </Link>
          
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent block">
              🍭 GummyBear
            </span>
          </motion.h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto px-4">
            Experience the perfect blend of Aceternity UI animations and Magic UI Pro components
          </p>
        </motion.div>

        {/* Feature Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Interactive Features
          </h2>
          <FeatureTabs />
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative bg-black/70 border border-white/20 rounded-2xl p-8 shadow-xl" style={{ backdropFilter: 'blur(12px)' }}>
              <Stats />
            </div>
          </div>
        </motion.section>

        {/* Component Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Component Gallery
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '✨', title: 'Animated Cards', desc: 'Glassmorphism with hover effects' },
              { icon: '🎨', title: 'Gradient Buttons', desc: 'Spinning gradient borders' },
              { icon: '💫', title: 'Spotlight Effects', desc: 'Mouse-following spotlight' },
              { icon: '🔮', title: 'Modern UI', desc: 'Clean, beautiful aesthetics' },
              { icon: '⚡', title: 'Fast Animations', desc: '60fps smooth transitions' },
              { icon: '🎭', title: 'Magic Interactions', desc: 'Micro-animations everywhere' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-black/70 border border-white/20 rounded-lg p-6 h-full shadow-lg" style={{ backdropFilter: 'blur(12px)' }}>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Pricing Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Simple Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="Free"
              features={['Basic components', 'Community support', 'Documentation']}
            />
            <PricingCard
              name="Pro"
              price="$199"
              features={['50+ components', 'All templates', 'Lifetime updates', 'Commercial license']}
              highlighted={true}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              features={['Everything in Pro', 'Priority support', 'Custom components', 'Team collaboration']}
            />
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="relative group max-w-4xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative bg-black/70 border border-white/20 rounded-2xl p-12 shadow-2xl" style={{ backdropFilter: 'blur(12px)' }}>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Ready to Build Something Amazing?
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Combine the power of Aceternity UI and Magic UI Pro to create stunning interfaces
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/app">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none"
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ff6b6b_0%,#ee5a52_50%,#ff6b6b_100%)]"></span>
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black px-8 py-3 text-lg font-semibold text-white backdrop-blur-3xl">
                      Launch Chat App
                    </span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
