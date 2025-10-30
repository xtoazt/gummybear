import React, { useState } from 'react';
import { Box, Container, Heading, TextField, Button, Text, Flex } from '@radix-ui/themes';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    setError('');
    onLogin(username, password);
  };

  return (
    <Container size="2" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box style={{ width: '100%', maxWidth: '400px' }}>
        <Flex direction="column" gap="4" align="center" mb="6">
          <Heading size="9" style={{ color: '#ff6b6b' }}>🍭 GummyBear</Heading>
          <Text size="3" color="gray">AI-Powered P2P Chat Platform</Text>
        </Flex>

        <Box p="6" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <Box>
                <Text size="2" weight="medium" mb="2" as="label" htmlFor="username">
                  Username
                </Text>
                <TextField.Root
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  size="3"
                />
              </Box>

              <Box>
                <Text size="2" weight="medium" mb="2" as="label" htmlFor="password">
                  Password
                </Text>
                <TextField.Root
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  size="3"
                />
              </Box>

              {error && (
                <Text size="2" color="red">
                  {error}
                </Text>
              )}

              <Button type="submit" size="3" style={{ width: '100%', background: '#ff6b6b' }}>
                Login
              </Button>
            </Flex>
          </form>
        </Box>

        <Flex gap="4" mt="6" wrap="wrap" justify="center">
          <Box p="3" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center', flex: '1 1 150px' }}>
            <Text size="5" mb="2" display="block">🤖</Text>
            <Text size="2" weight="bold">AI-Powered</Text>
            <Text size="1" color="gray">WebLLM integration</Text>
          </Box>
          <Box p="3" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center', flex: '1 1 150px' }}>
            <Text size="5" mb="2" display="block">🔒</Text>
            <Text size="2" weight="bold">Secure</Text>
            <Text size="1" color="gray">Role-based access</Text>
          </Box>
          <Box p="3" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center', flex: '1 1 150px' }}>
            <Text size="5" mb="2" display="block">⚡</Text>
            <Text size="2" weight="bold">Fast</Text>
            <Text size="1" color="gray">Real-time messaging</Text>
          </Box>
        </Flex>
      </Box>
    </Container>
  );
}
