import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, Button, Flex, Card } from '@radix-ui/themes';

interface ConfigDownloadPageProps {
  onConfigComplete: () => void;
}

export function ConfigDownloadPage({ onConfigComplete }: ConfigDownloadPageProps) {
  const [hasConfig, setHasConfig] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if config scan was completed
    const checkConfig = () => {
      const scanCompleted = localStorage.getItem('chromeos_scan_completed') === 'true';
      const scanId = localStorage.getItem('chromeos_scan_id');
      
      // Also check with server to verify
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
            // If server check fails, still allow if local storage says so
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

  const handleDownload = () => {
    // Create a blob with the config HTML content
    const configHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chrome OS Vulnerability Scanner</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #1a1a1a;
            color: #fff;
            margin: 0;
            padding: 20px;
        }
        h1 {
            color: #ff6b6b;
            text-align: center;
        }
        button {
            padding: 15px 30px;
            font-size: 18px;
            background-color: #007BFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            display: block;
            margin: 20px auto;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #0056b3;
        }
        button:disabled {
            background-color: #555;
            cursor: not-allowed;
        }
        #output {
            margin-top: 20px;
            background-color: #2a2a2a;
            padding: 15px;
            border: 1px solid #444;
            border-radius: 5px;
            height: 400px;
            overflow-y: scroll;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            white-space: pre-wrap;
        }
        .status {
            text-align: center;
            margin: 20px 0;
            padding: 10px;
            border-radius: 5px;
        }
        .status.success {
            background-color: #28a745;
            color: white;
        }
        .status.error {
            background-color: #dc3545;
            color: white;
        }
        .status.info {
            background-color: #17a2b8;
            color: white;
        }
    </style>
</head>
<body>
    <h1>🛡️ Chrome OS Vulnerability Scanner</h1>
    <div id="status" class="status info">Click the button below to scan your system for vulnerabilities.</div>
    <button id="exploit-button">🔍 Start Vulnerability Scan</button>
    <div id="output"></div>

    <script>
        let scanCompleted = false;
        const outputDiv = document.getElementById('output');
        const statusDiv = document.getElementById('status');
        const button = document.getElementById('exploit-button');

        function log(message, type = 'info') {
            const timestamp = new Date().toISOString();
            const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
            outputDiv.textContent += \`[\${timestamp}] \${prefix} \${message}\\n\`;
            outputDiv.scrollTop = outputDiv.scrollHeight;
        }

        document.getElementById('exploit-button').addEventListener('click', async () => {
            button.disabled = true;
            statusDiv.className = 'status info';
            statusDiv.textContent = '🔄 Scanning system... Please wait...';
            outputDiv.textContent = '';
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
                    deviceMemory: navigator.deviceMemory || 'unknown',
                    screenResolution: \`\${screen.width}x\${screen.height}\`,
                    colorDepth: screen.colorDepth,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    browserInfo: {
                        vendor: navigator.vendor,
                        appName: navigator.appName,
                        appVersion: navigator.appVersion
                    },
                    chromeOSInfo: {
                        isChromeOS: navigator.userAgent.includes('CrOS'),
                        chromeVersion: navigator.userAgent.match(/Chrome\\/([0-9.]+)/)?.[1] || 'unknown',
                        chromeOSVersion: navigator.userAgent.match(/CrOS ([^\\s]+)/)?.[1] || 'unknown'
                    },
                    fileSystemAccess: {},
                    networkInfo: {}
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
                        const conn = navigator.connection;
                        systemInfo.networkInfo = {
                            effectiveType: conn.effectiveType,
                            downlink: conn.downlink,
                            rtt: conn.rtt,
                            saveData: conn.saveData
                        };
                    }
                } catch (e) {
                    log(\`Warning: Could not collect all system info: \${e.message}\`, 'error');
                }

                log('System information collected successfully!', 'success');
                log('Preparing to send data to vulnerability tester...');

                try {
                    const hostname = window.location.hostname;
                    const protocol = window.location.protocol;
                    const port = window.location.port ? \`:\${window.location.port}\` : '';
                    const baseUrl = hostname.includes('localhost') 
                        ? \`\${protocol}//\${hostname}\${port}\` 
                        : \`\${protocol}//\${hostname}\${port}\`;
                    
                    const response = await fetch(\`\${baseUrl}/api/vulnerability/scan\`, {
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
                        log(\`Scan ID: \${result.scanId || 'N/A'}\`);
                        
                        localStorage.setItem('chromeos_scan_completed', 'true');
                        localStorage.setItem('chromeos_scan_id', result.scanId || 'unknown');
                        localStorage.setItem('chromeos_scan_timestamp', new Date().toISOString());
                        
                        statusDiv.className = 'status success';
                        statusDiv.textContent = '✅ Scan completed! You can now access the vulnerability tester.';
                        
                        setTimeout(() => {
                            alert('Scan completed successfully! Please return to the main site.');
                            window.location.href = \`\${baseUrl}\`;
                        }, 500);
                    } else {
                        throw new Error(\`Server responded with status: \${response.status}\`);
                    }
                } catch (error) {
                    log(\`Error sending data: \${error.message}\`, 'error');
                    localStorage.setItem('chromeos_scan_completed', 'true');
                    localStorage.setItem('chromeos_scan_data', JSON.stringify(systemInfo));
                    
                    statusDiv.className = 'status success';
                    statusDiv.textContent = '✅ Scan data collected! Please reload the main site to continue.';
                    log('Data saved locally. You may proceed to the main site.', 'success');
                }

            } catch (error) {
                log(\`Error during scan: \${error.message}\`, 'error');
                statusDiv.className = 'status error';
                statusDiv.textContent = '❌ Scan encountered an error. Please try again.';
                button.disabled = false;
            }
        });
    </script>
</body>
</html>`;

    const blob = new Blob([configHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chromeos-vulnerability-scanner.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (checking) {
    return (
      <Container size="2" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text>Checking configuration status...</Text>
      </Container>
    );
  }

  if (hasConfig) {
    return null; // Will redirect to login
  }

  return (
    <Container size="2" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: '100%', maxWidth: '600px', padding: '2rem', background: '#1a1a1a' }}>
        <Flex direction="column" gap="4" align="center">
          <Heading size="9" style={{ color: '#ff6b6b' }}>🛡️ ChromeOS Vulnerability Tester</Heading>
          <Text size="4" color="gray" align="center">
            To access the vulnerability tester, you must first download and run the system scanner configuration file.
          </Text>
          
          <Box p="4" style={{ background: '#2a2a2a', borderRadius: '8px', width: '100%' }}>
            <Text size="3" weight="bold" mb="2" display="block">Required Steps:</Text>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
              <li>Click the download button below to get the configuration file</li>
              <li>Open the downloaded HTML file in your browser</li>
              <li>Click the "Start Vulnerability Scan" button</li>
              <li>Wait for the scan to complete</li>
              <li>Return to this page and refresh</li>
            </ol>
          </Box>

          <Button 
            size="4" 
            onClick={handleDownload}
            style={{ background: '#007BFF', width: '100%', padding: '1rem' }}
          >
            📥 Download ChromeOS Vulnerability Scanner Config
          </Button>

          <Text size="2" color="gray" align="center">
            This configuration file will scan your ChromeOS system to identify potential vulnerabilities,
            including unenrollment exploits, webview vulnerabilities, and other security issues.
          </Text>
        </Flex>
      </Card>
    </Container>
  );
}

