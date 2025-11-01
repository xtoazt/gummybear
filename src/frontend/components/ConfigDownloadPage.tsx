import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChromeOSScanner } from './ChromeOSScanner';
import { useNavigate } from 'react-router-dom';

interface ConfigDownloadPageProps {
  onConfigComplete: () => void;
}

export function ConfigDownloadPage({ onConfigComplete }: ConfigDownloadPageProps) {
  const [hasConfig, setHasConfig] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkConfig = () => {
      const scanCompleted = localStorage.getItem('chromeos_scan_completed') === 'true';
      const scanId = localStorage.getItem('chromeos_scan_id');
      
      if (scanCompleted && scanId) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
        fetch(`${API_BASE_URL}/vulnerability/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scanId })
        })
          .then(res => res.json())
          .then(data => {
            if (data.verified) {
              setHasConfig(true);
              onConfigComplete();
            } else {
              setHasConfig(false);
            }
            setChecking(false);
          })
          .catch(() => {
            setHasConfig(scanCompleted);
            setChecking(false);
          });
      } else {
        setHasConfig(false);
        setChecking(false);
      }
    };

    checkConfig();
  }, [onConfigComplete]);

  if (checking) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400"
        >
          Checking configuration status...
        </motion.div>
      </div>
    );
  }

  if (hasConfig) {
    return null;
  }

  if (showScanner) {
    return (
      <ChromeOSScanner 
        onComplete={() => {
          setHasConfig(true);
          onConfigComplete();
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h1 className="text-5xl font-bold mb-6 text-center">
                <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
                  🛡️ ChromeOS Vulnerability Tester
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 text-center mb-8">
            To access the vulnerability tester, you must first run the system scanner.
              </p>
          
              <div className="mb-8 p-4 bg-black/50 border border-white/10 rounded-lg">
                <h3 className="text-lg font-bold mb-2 text-white">Choose an option:</h3>
                <p className="text-sm text-gray-400">
              You can either run the scanner directly in your browser (recommended) or download a standalone scanner file.
                </p>
              </div>

              <div className="space-y-3">
                <motion.button
              onClick={() => setShowScanner(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
            >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#007BFF_0%,#0056b3_50%,#007BFF_100%)]"></span>
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black px-6 py-3 text-base font-semibold text-white backdrop-blur-3xl">
              🔍 Run Scanner Now
                  </span>
                </motion.button>
            
                <motion.button
              onClick={() => navigate('/scanner')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-black/50 border border-white/20 rounded-full text-white font-semibold hover:border-white/40 transition-all"
            >
              🌐 Open Scanner Page
                </motion.button>
              </div>

              <p className="text-sm text-gray-500 text-center mt-6">
            This scanner will analyze your ChromeOS system to identify potential vulnerabilities,
            including unenrollment exploits, webview vulnerabilities, and other security issues.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
