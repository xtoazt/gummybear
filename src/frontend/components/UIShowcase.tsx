import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ContainerTextFlip } from './ui/container-text-flip';
import { MagicCard } from './ui/magic-card';
import { BorderBeam } from './ui/border-beam';
import { ShimmerButton } from './ui/shimmer-button';
import { NumberTicker } from './ui/number-ticker';
import { AnimatedGradientText } from './ui/animated-gradient-text';
import { GridPattern } from './ui/grid-pattern';
import { ScrollProgress } from './ui/scroll-progress';
import '../styles/showcase.css';

// Feature Tabs Component using DaisyUI tabs
const FeatureTabs = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs = [
    { id: 0, label: 'Animations' },
    { id: 1, label: 'Components' },
    { id: 2, label: 'Features' },
    { id: 3, label: 'Examples' }
  ];

  const content = [
    {
      title: 'Aceternity UI Animations',
      description: 'Smooth, performant animations powered by Framer Motion',
      features: ['Spotlight Effects', 'Gradient Animations', 'Spring Physics', 'Stagger Animations']
    },
    {
      title: 'DaisyUI Components',
      description: 'Beautiful, reusable components with full theme support',
      features: ['Theme Aware', 'Accessible', 'Responsive', 'Customizable']
    },
    {
      title: 'Modern Features',
      description: 'Full-featured chat experience with modern UX',
      features: ['@Mentions', 'Real-time Sync', 'Message Editing', 'Role Management']
    },
    {
      title: 'Component Examples',
      description: 'Explore interactive component demonstrations',
      features: ['Text Flip', 'Card Animations', 'Button States', 'Form Inputs']
    }
  ];

  return (
    <div className="w-full">
      <div className="tabs tabs-boxed mb-6 bg-base-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <MagicCard className="rounded-lg">
            <div className="card bg-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-2xl">{content[activeTab].title}</h2>
                <p className="text-base-content/70 mb-4">{content[activeTab].description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {content[activeTab].features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-base-content">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MagicCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Stats Component using DaisyUI stats with NumberTicker
const Stats = () => {
  const stats = [
    { value: 50, label: 'Components', suffix: '+' },
    { value: 100, label: 'Customizable', suffix: '%' },
    { value: 2, label: 'Faster Build', suffix: 'x' },
    { value: 24, label: 'Support', suffix: '/7' }
  ];

  return (
    <div className="stats shadow-xl w-full">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="stat"
        >
          <div className="stat-value text-3xl font-bold">
            <NumberTicker value={stat.value} delay={idx * 0.2} />
            {stat.suffix}
          </div>
          <div className="stat-title text-base-content/70">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

// Component Card using MagicCard
const ComponentCard = ({ title, desc, delay }: { title: string; desc: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="relative"
  >
    <MagicCard className="rounded-lg">
      <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-xl">{title}</h3>
          <p className="text-base-content/70">{desc}</p>
        </div>
      </div>
    </MagicCard>
  </motion.div>
);

// Pricing Card with BorderBeam for featured
const PricingCard = ({ name, price, features, featured = false }: { name: string; price: string; features: string[]; featured?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`relative card ${featured ? 'ring-2 ring-primary' : ''} bg-base-200 shadow-xl`}
  >
    {featured && <BorderBeam size={100} duration={8} />}
    <div className="card-body relative">
      <h2 className="card-title text-2xl">{name}</h2>
      <div className="flex items-baseline gap-2 mb-4">
        <AnimatedGradientText className="text-4xl font-bold">
          {price}
        </AnimatedGradientText>
        {price !== 'Free' && price !== 'Custom' && <span className="text-base-content/70 text-sm">/month</span>}
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-base-content/80">{feature}</span>
          </li>
        ))}
      </ul>
      <ShimmerButton className={`w-full ${featured ? '' : 'btn-outline'}`}>
        Get Started
      </ShimmerButton>
    </div>
  </motion.div>
);

export function UIShowcase() {
  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden">
      <ScrollProgress />
      <GridPattern className="opacity-40" />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <Link to="/app" className="btn btn-ghost btn-sm">
            ← Back to Chat
          </Link>
          <ThemeSwitcher />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <ContainerTextFlip
              words={["DaisyUI", "Aceternity", "MagicUI", "Showcase"]}
              interval={3000}
            />
          </h1>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            <AnimatedGradientText>
              Beautiful components built with DaisyUI, Aceternity UI, and MagicUI animations
            </AnimatedGradientText>
          </p>
        </motion.div>

        {/* Feature Tabs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            <AnimatedGradientText>Interactive Features</AnimatedGradientText>
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
          <Stats />
        </motion.section>

        {/* Component Gallery */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            <AnimatedGradientText>Component Gallery</AnimatedGradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ComponentCard
              title="Magic Cards"
              desc="Interactive cards with spotlight hover effects"
              delay={0}
            />
            <ComponentCard
              title="Animated Buttons"
              desc="Shimmer and gradient button animations"
              delay={0.1}
            />
            <ComponentCard
              title="Text Effects"
              desc="Gradient text and flip animations"
              delay={0.2}
            />
            <ComponentCard
              title="Number Animations"
              desc="Smooth counting number tickers"
              delay={0.3}
            />
            <ComponentCard
              title="Border Effects"
              desc="Animated beams along borders"
              delay={0.4}
            />
            <ComponentCard
              title="Grid Patterns"
              desc="Animated background patterns"
              delay={0.5}
            />
          </div>
        </motion.section>

        {/* Pricing Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">
            <AnimatedGradientText>Pricing</AnimatedGradientText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PricingCard
              name="Starter"
              price="Free"
              features={['Basic components', 'Community support', 'Documentation']}
            />
            <PricingCard
              name="Pro"
              price="$19"
              features={['50+ components', 'All templates', 'Lifetime updates', 'Commercial license']}
              featured={true}
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
          <MagicCard className="rounded-lg">
            <div className="card bg-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-3xl justify-center mb-4">
                  <AnimatedGradientText>Ready to Build Something Amazing?</AnimatedGradientText>
                </h2>
                <p className="text-base-content/70 mb-6 max-w-xl mx-auto">
                  Combine the power of DaisyUI, Aceternity UI, and MagicUI to create stunning interfaces
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link to="/app">
                    <ShimmerButton>
                      Launch Chat App
                    </ShimmerButton>
                  </Link>
                  <a href="https://daisyui.com" target="_blank" rel="noopener noreferrer">
                    <ShimmerButton>
                      View DaisyUI Docs
                    </ShimmerButton>
                  </a>
                </div>
              </div>
            </div>
          </MagicCard>
        </motion.section>
      </div>
    </div>
  );
}
