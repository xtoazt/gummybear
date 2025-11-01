import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function ChromeOSScanner({ onComplete }: { onComplete?: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<'info' | 'success' | 'error'>('info');

  useEffect(() => {
    const scanCompleted = localStorage.getItem('chromeos_scan_completed') === 'true';
    if (scanCompleted) {
      setCompleted(true);
      setStatus('success');
    }
  }, []);

  const log = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    setOutput(prev => [...prev, `[${timestamp}] ${prefix} ${message}`]);
  };

  const handleScan = async () => {
    if (completed || scanning) return;

    setScanning(true);
    setStatus('info');
    setOutput([]);
    
    log('Initializing ChromeOS vulnerability scanner...');

    try {
      const systemInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory || 'unknown',
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        browserInfo: {
          vendor: navigator.vendor,
          appName: navigator.appName,
          appVersion: navigator.appVersion
        },
        chromeOSInfo: {
          isChromeOS: navigator.userAgent.includes('CrOS'),
          chromeVersion: navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'unknown',
          chromeOSVersion: navigator.userAgent.match(/CrOS ([^\s]+)/)?.[1] || 'unknown'
        },
        fileSystemAccess: {} as any,
        networkInfo: {} as any
      };

      log('Collecting system information...');

      try {
        if ('showDirectoryPicker' in window) {
          systemInfo.fileSystemAccess.supported = true;
          log('File System Access API: Supported');
        } else {
          systemInfo.fileSystemAccess.supported = false;
          log('File System Access API: Not supported');
        }

        if ('connection' in navigator) {
          const conn = (navigator as any).connection;
          systemInfo.networkInfo = {
            effectiveType: conn.effectiveType,
            downlink: conn.downlink,
            rtt: conn.rtt,
            saveData: conn.saveData
          };
        }
      } catch (e: any) {
        log(`Warning: Could not collect all system info: ${e.message}`, 'error');
      }

      log('System information collected successfully!', 'success');
      log('Preparing to send data to vulnerability tester...');

      try {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : '';
        const baseUrl = `${protocol}//${hostname}${port}`;
        
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
        const response = await fetch(`${baseUrl}${API_BASE_URL}/vulnerability/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(systemInfo),
          mode: 'cors'
        });

        if (response.ok) {
          const result = await response.json();
          log('✅ Data successfully sent to vulnerability tester!', 'success');
          log(`Scan ID: ${result.scanId || 'N/A'}`);
          
          localStorage.setItem('chromeos_scan_completed', 'true');
          localStorage.setItem('chromeos_scan_id', result.scanId || 'unknown');
          localStorage.setItem('chromeos_scan_timestamp', new Date().toISOString());
          
          setStatus('success');
          setCompleted(true);
          
          if (onComplete) {
            setTimeout(() => {
              onComplete();
            }, 1000);
          }
        } else {
          throw new Error(`Server responded with status: ${response.status}`);
        }
      } catch (error: any) {
        log(`Error sending data: ${error.message}`, 'error');
        localStorage.setItem('chromeos_scan_completed', 'true');
        localStorage.setItem('chromeos_scan_data', JSON.stringify(systemInfo));
        
        setStatus('success');
        setCompleted(true);
        log('Data saved locally. You may proceed to the main site.', 'success');
        
        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      }

    } catch (error: any) {
      log(`Error during scan: ${error.message}`, 'error');
      setStatus('error');
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full mx-auto"
        >
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-bold mb-8 text-center"
          >
            <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
              🛡️ Chrome OS Vulnerability Scanner
            </span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-center mb-8 p-6 rounded-lg border ${
              status === 'success' 
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : status === 'error'
                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
            }`}
          >
            {completed ? (
              <p className="text-xl font-bold">
                ✅ Scan completed! You can now access the vulnerability tester.
              </p>
            ) : scanning ? (
              <p className="text-xl font-bold">
                🔄 Scanning system... Please wait...
              </p>
            ) : (
              <p className="text-xl font-bold">
                Click the button below to scan your system for vulnerabilities.
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <motion.button
              onClick={handleScan}
              disabled={scanning || completed}
              whileHover={!completed && !scanning ? { scale: 1.02 } : {}}
              whileTap={!completed && !scanning ? { scale: 0.98 } : {}}
              className={`relative w-full inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black ${
                completed || scanning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#007BFF_0%,#0056b3_50%,#007BFF_100%)]"></span>
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black px-6 py-3 text-base font-semibold text-white backdrop-blur-3xl">
                {completed ? '✅ Scan Completed' : scanning ? '🔄 Scanning...' : '🔍 Start Vulnerability Scan'}
              </span>
            </motion.button>
          </motion.div>

          {output.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 h-[400px] overflow-y-auto"
            >
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-all">
                {output.join('\n')}
              </pre>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
