import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ContainerTextFlip } from './ui/container-text-flip';
import { MagicCard } from './ui/magic-card';
import { ShimmerButton } from './ui/shimmer-button';
import { AnimatedGradientText } from './ui/animated-gradient-text';
import { GridPattern } from './ui/grid-pattern';

const FeatureCard = ({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="relative"
  >
    <MagicCard className="rounded-lg h-full">
      <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow border border-base-300 h-full">
        <div className="card-body">
          <div className="text-4xl mb-3">{icon}</div>
          <h3 className="card-title text-xl">{title}</h3>
          <p className="text-base-content/70">{description}</p>
        </div>
      </div>
    </MagicCard>
  </motion.div>
);

export function LandingPage() {
  return (
    <div className="min-h-screen bg-base-100 relative overflow-hidden">
      <GridPattern className="opacity-30" />
      
      <div className="container mx-auto px-4 py-20 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-6xl md:text-8xl font-bold mb-6"
          >
            <ContainerTextFlip
              words={["GummyBear", "DaisyUI", "Aceternity", "MagicUI"]}
              interval={3000}
            />
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-base-content/70 mb-12 max-w-2xl mx-auto"
          >
            <AnimatedGradientText>
              AI-Powered P2P Chat Platform with Role-Based Access Control
            </AnimatedGradientText>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <Link to="/app">
              <ShimmerButton>
                Launch App
              </ShimmerButton>
            </Link>
            <Link to="/showcase">
              <ShimmerButton>
                UI Showcase
              </ShimmerButton>
            </Link>
            <Link to="/demo">
              <ShimmerButton>
                View Demo
              </ShimmerButton>
            </Link>
            <a
              href="https://github.com/xtoazt/gummybear"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ShimmerButton>
                GitHub
              </ShimmerButton>
            </a>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
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
            description="Modern UI with DaisyUI, Aceternity & MagicUI"
            delay={0.4}
          />
        </motion.div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="relative"
        >
          <MagicCard className="rounded-lg">
            <div className="card bg-base-200 shadow-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-3">
                  <AnimatedGradientText>Ready to get started?</AnimatedGradientText>
                </h2>
                <p className="text-base-content/70 mb-6">
                  Experience the future of AI-powered chat with role-based access control, 
                  custom components, and WebLLM integration.
                </p>
                <div className="card-actions">
                  <Link to="/app">
                    <ShimmerButton>
                      Get Started
                    </ShimmerButton>
                  </Link>
                  <Link to="/showcase">
                    <ShimmerButton>
                      View Components
                    </ShimmerButton>
                  </Link>
                </div>
              </div>
            </div>
          </MagicCard>
        </motion.div>
      </div>
    </div>
  );
}
