import { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, Button } from '@radix-ui/themes';

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
    setStatus('info');
    
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
    <Container 
      size="3" 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#1a1a1a',
        padding: '2rem'
      }}
    >
      <Box style={{ width: '100%', maxWidth: '800px' }}>
        <Heading 
          size="8" 
          style={{ 
            color: '#ff6b6b', 
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          🛡️ Chrome OS Vulnerability Scanner
        </Heading>
        
        <Box
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
            padding: '1rem',
            borderRadius: '8px',
            background: 
              status === 'success' ? 'rgba(40, 167, 69, 0.2)' :
              status === 'error' ? 'rgba(220, 53, 69, 0.2)' :
              'rgba(23, 162, 184, 0.2)',
            border: `1px solid ${
              status === 'success' ? 'rgba(40, 167, 69, 0.5)' :
              status === 'error' ? 'rgba(220, 53, 69, 0.5)' :
              'rgba(23, 162, 184, 0.5)'
            }`,
            color: 
              status === 'success' ? '#28a745' :
              status === 'error' ? '#dc3545' :
              '#17a2b8'
          }}
        >
          {completed ? (
            <Text size="4" weight="bold">
              ✅ Scan completed! You can now access the vulnerability tester.
            </Text>
          ) : scanning ? (
            <Text size="4" weight="bold">
              🔄 Scanning system... Please wait...
            </Text>
          ) : (
            <Text size="4" weight="bold">
              Click the button below to scan your system for vulnerabilities.
            </Text>
          )}
        </Box>

        <Button
          onClick={handleScan}
          disabled={scanning || completed}
          size="4"
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            background: completed ? '#555' : '#007BFF',
            cursor: completed ? 'not-allowed' : 'pointer',
            marginBottom: '2rem'
          }}
        >
          {completed ? '✅ Scan Completed' : scanning ? '🔄 Scanning...' : '🔍 Start Vulnerability Scan'}
        </Button>

        {output.length > 0 && (
          <Box
            style={{
              background: '#2a2a2a',
              padding: '1.5rem',
              border: '1px solid #444',
              borderRadius: '8px',
              height: '400px',
              overflowY: 'auto',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap' as const
            }}
          >
            <Text style={{ color: '#fff', lineHeight: 1.6 }}>
              {output.join('\n')}
            </Text>
          </Box>
        )}
      </Box>
    </Container>
  );
}

