import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Terminal Component
const Terminal = ({ command, output, delay = 0 }: { command: string; output: string[]; delay?: number }) => {
  const [displayedOutput, setDisplayedOutput] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < output.length) {
          setDisplayedOutput(prev => [...prev, output[index]]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [output, delay]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="bg-black border border-green-500/30 rounded-lg p-4 font-mono text-sm shadow-lg shadow-green-500/10">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-4 text-green-400/50 text-xs">gummybear@terminal</span>
      </div>
      <div className="space-y-1">
        <div className="text-green-400">
          <span className="text-green-500">$</span> {command}
        </div>
        {displayedOutput.map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${line.includes('ERROR') ? 'text-red-400' : line.includes('✅') ? 'text-green-400' : 'text-gray-300'}`}
          >
            {line}
          </motion.div>
        ))}
        {showCursor && <span className="text-green-400">▋</span>}
      </div>
    </div>
  );
};

// ASCII Art Component
const ASCIIArt = ({ art, delay = 0 }: { art: string; delay?: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.pre
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      className="text-green-400 font-mono text-xs leading-tight text-center"
    >
      {art}
    </motion.pre>
  );
};

const gummyBearASCII = `
╔═══════════════════════════════════╗
║    🍭 GUMMYBEAR UI SHOWCASE 🍭    ║
║                                   ║
║   Aceternity + Magic UI Pro       ║
║   Terminal + Modern              ║
╚═══════════════════════════════════╝
`;

// Magic UI Pro-style Feature Tabs
const FeatureTabs = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs = [
    { id: 0, label: 'Animations', icon: '✨' },
    { id: 1, label: 'Components', icon: '🎨' },
    { id: 2, label: 'Terminal', icon: '💻' },
    { id: 3, label: 'Modern', icon: '🚀' }
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
      title: 'Terminal Aesthetics',
      description: 'Retro terminal styling meets modern web',
      features: ['ASCII Art', 'Command Prompts', 'Monospace Typography', 'Green-on-Black Theme']
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
          <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {content[activeTab].title}
            </h3>
            <p className="text-gray-400 mb-4">{content[activeTab].description}</p>
            <div className="grid grid-cols-2 gap-3">
              {content[activeTab].features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="text-green-400">▸</span>
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
    <div className={`relative bg-black/50 backdrop-blur-sm border rounded-2xl p-6 h-full ${
      highlighted ? 'border-pink-500/50' : 'border-white/10'
    }`}>
      <div className="mb-4">
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
          className="text-center"
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
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full bg-black overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
      
      <motion.div
        className="absolute inset-0 opacity-0 dark:opacity-100"
        animate={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 107, 107, 0.15), transparent 40%)`
        }}
        transition={{ type: "spring", stiffness: 50, damping: 50 }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link to="/" className="inline-block mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </motion.div>
          </Link>
          
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl md:text-8xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
              UI Showcase
            </span>
          </motion.h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the perfect blend of Aceternity UI animations and Magic UI Pro components, 
            mixed with retro terminal aesthetics
          </p>
        </motion.div>

        {/* ASCII Art Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16 bg-black/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-8"
        >
          <ASCIIArt art={gummyBearASCII} />
        </motion.div>

        {/* Terminal Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent flex items-center gap-3">
            <span className="text-green-400 font-mono">$</span>
            Terminal Interface
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Terminal
              command="npm run showcase"
              output={[
                '✅ Loading Aceternity UI components...',
                '✅ Initializing Magic UI Pro elements...',
                '✅ Applying terminal aesthetics...',
                '✅ UI Showcase ready!',
                '',
                '🎨 Components loaded: 50+',
                '✨ Animations active: 100%',
                '💻 Terminal mode: Enabled'
              ]}
              delay={300}
            />
            <Terminal
              command="gummybear --ui-mode hybrid"
              output={[
                '🍭 GummyBear UI System v2.0',
                '',
                'Features:',
                '  • Aceternity UI animations',
                '  • Magic UI Pro components',
                '  • Terminal aesthetics',
                '  • Modern design patterns',
                '',
                'Status: READY'
              ]}
              delay={800}
            />
          </div>
        </motion.section>

        {/* Feature Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Interactive Features
          </h2>
          <FeatureTabs />
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
            <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <Stats />
            </div>
          </div>
        </motion.section>

        {/* Component Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Component Gallery
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '✨', title: 'Animated Cards', desc: 'Glassmorphism with hover effects' },
              { icon: '🎨', title: 'Gradient Buttons', desc: 'Spinning gradient borders' },
              { icon: '💫', title: 'Spotlight Effects', desc: 'Mouse-following spotlight' },
              { icon: '🔮', title: 'Terminal UI', desc: 'Retro command-line aesthetics' },
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
                <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 h-full">
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
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
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
            <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Ready to Build Something Amazing?
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Combine the power of Aceternity UI and Magic UI Pro to create stunning interfaces
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ff6b6b_0%,#ee5a52_50%,#ff6b6b_100%)]"></span>
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black px-8 py-3 text-lg font-semibold text-white backdrop-blur-3xl">
                    Get Started
                  </span>
                </motion.button>
                <Link to="/app">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-black/50 border border-white/20 rounded-full text-white font-semibold hover:border-white/40 transition-all"
                  >
                    Launch App
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

