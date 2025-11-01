import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../styles/showcase.css';

// Feature Tabs Component
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
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <>
                <motion.div
                  layoutId="activeTabIndicator"
                  className="tab-indicator"
                />
                <motion.div
                  layoutId="activeTabGlow"
                  className="tab-glow"
                />
              </>
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
          transition={{ duration: 0.3 }}
          className="tab-content-wrapper"
        >
          <div className="glass-card tab-content">
            <h3 className="gradient-text-pink tab-title">{content[activeTab].title}</h3>
            <p className="tab-description">{content[activeTab].description}</p>
            <div className="features-grid">
              {content[activeTab].features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, x: 4 }}
                  className="feature-item"
                >
                  <motion.div 
                    className="feature-dot"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                  />
                  <span className="feature-text">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Pricing Card Component
const PricingCard = ({ name, price, features, highlighted = false }: { name: string; price: string; features: string[]; highlighted?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className={`pricing-card ${highlighted ? 'highlighted' : ''}`}
  >
    {highlighted && <div className="pricing-glow" />}
    <div className={`glass-card pricing-content ${highlighted ? 'highlighted-border' : ''}`}>
      <div className="pricing-header">
        <h3 className="pricing-name">{name}</h3>
        <div className="pricing-price">
          <span className="animated-gradient">{price}</span>
        </div>
      </div>
      <ul className="pricing-features">
        {features.map((feature, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="pricing-feature-item"
          >
            <motion.span 
              className="checkmark"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              ✓
            </motion.span>
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`pricing-button ${highlighted ? 'highlighted-button' : 'normal-button'}`}
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
    <div className="stats-grid">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="stat-card glass-card"
        >
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-value gradient-text-pink">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
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
    <div className="showcase-container">
      {/* Animated Gradient Background */}
      <div className="bg-gradient-1" />
      <div className="bg-gradient-2" />
      
      {/* Spotlight Effect */}
      <motion.div
        className="spotlight"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 107, 107, 0.25), rgba(168, 85, 247, 0.15), transparent 50%)`
        }}
        transition={{ type: "spring", stiffness: 50, damping: 50 }}
      />

      {/* Grid Pattern */}
      <div className="grid-pattern" />
      
      {/* Animated Orbs */}
      <motion.div
        className="orb orb-1"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="orb orb-2"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Content */}
      <div className="showcase-content">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="showcase-header"
        >
          <Link to="/app" className="back-link">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="back-link-content"
            >
              ← Back to Chat
            </motion.div>
          </Link>
          
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="showcase-title"
          >
            <motion.span
              animate={{
                backgroundPosition: ["0%", "100%", "0%"]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              className="animated-gradient showcase-title-text"
            >
              🍭 GummyBear
            </motion.span>
          </motion.h1>
          <p className="showcase-subtitle">
            Experience the perfect blend of <span className="text-pink">Aceternity UI</span> animations and <span className="text-purple">Magic UI Pro</span> components
          </p>
        </motion.div>

        {/* Feature Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="showcase-section"
        >
          <h2 className="section-title gradient-text-pink">
            Interactive Features
          </h2>
          <FeatureTabs />
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="showcase-section"
        >
          <div className="stats-wrapper">
            <div className="stats-glow" />
            <div className="glass-card stats-container">
              <Stats />
            </div>
          </div>
        </motion.section>

        {/* Component Gallery */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="showcase-section"
        >
          <h2 className="section-title gradient-text-purple">
            Component Gallery
          </h2>
          <div className="components-grid">
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
                className="component-card-wrapper"
              >
                <div className="component-glow" />
                <div className="glass-card glass-card-hover component-card">
                  <div className="component-icon">{item.icon}</div>
                  <h3 className="component-title gradient-text-purple">{item.title}</h3>
                  <p className="component-desc">{item.desc}</p>
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
          className="showcase-section"
        >
          <h2 className="section-title gradient-text-purple">
            Simple Pricing
          </h2>
          <div className="pricing-grid">
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
          className="showcase-section cta-section"
        >
          <div className="cta-wrapper">
            <div className="cta-glow" />
            <div className="glass-card cta-content">
              <h2 className="cta-title gradient-text-pink">
                Ready to Build Something Amazing?
              </h2>
              <p className="cta-description">
                Combine the power of Aceternity UI and Magic UI Pro to create stunning interfaces
              </p>
              <div className="cta-buttons">
                <Link to="/app">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cta-button primary-button"
                  >
                    Launch Chat App
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
