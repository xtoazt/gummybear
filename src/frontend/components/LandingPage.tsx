import { Link } from 'react-router-dom';
import { Box, Container, Heading, Text, Button, Flex, Card } from '@radix-ui/themes';

export function LandingPage() {
  return (
    <Container 
      size="4" 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        padding: '2rem'
      }}
    >
      <Box style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        <Heading 
          size="9" 
          style={{ 
            color: '#ff6b6b',
            fontSize: '4rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '0 0 20px rgba(255, 107, 107, 0.3)',
            animation: 'glow 2s ease-in-out infinite alternate'
          }}
        >
          🍭 GummyBear
        </Heading>
        
        <Text 
          size="5" 
          style={{ 
            color: '#a0a0a0', 
            marginBottom: '3rem',
            display: 'block'
          }}
        >
          AI-Powered P2P Chat Platform
        </Text>
        
        <Card 
          style={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Heading size="6" mb="4">Welcome to GummyBear!</Heading>
          <Text size="3" color="gray" mb="4" style={{ display: 'block' }}>
            Experience the future of AI-powered chat with role-based access control, 
            custom components, and WebLLM integration.
          </Text>
          
          <Flex gap="3" justify="center" wrap="wrap">
            <Button 
              size="4" 
              asChild
              style={{ 
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                padding: '1rem 2rem',
                fontSize: '1.1rem'
              }}
            >
              <Link to="/app">🚀 Launch App</Link>
            </Button>
            <Button 
              size="4" 
              variant="outline"
              asChild
              style={{ 
                padding: '1rem 2rem',
                fontSize: '1.1rem'
              }}
            >
              <Link to="/demo">👀 View Demo</Link>
            </Button>
            <Button 
              size="4" 
              variant="outline"
              onClick={() => window.open('https://github.com/xtoazt/gummybear', '_blank')}
              style={{ 
                padding: '1rem 2rem',
                fontSize: '1.1rem'
              }}
            >
              📁 GitHub
            </Button>
          </Flex>
        </Card>
        
        <Flex 
          gap="4" 
          wrap="wrap" 
          justify="center"
          style={{ marginTop: '2rem' }}
        >
          <Card style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', textAlign: 'center', flex: '1 1 150px' }}>
            <Text size="6" mb="2" display="block">🤖</Text>
            <Heading size="4" mb="1">AI-Powered</Heading>
            <Text size="2" color="gray">WebLLM integration</Text>
          </Card>
          <Card style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', textAlign: 'center', flex: '1 1 150px' }}>
            <Text size="6" mb="2" display="block">🔒</Text>
            <Heading size="4" mb="1">Secure</Heading>
            <Text size="2" color="gray">Role-based access</Text>
          </Card>
          <Card style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', textAlign: 'center', flex: '1 1 150px' }}>
            <Text size="6" mb="2" display="block">⚡</Text>
            <Heading size="4" mb="1">Fast</Heading>
            <Text size="2" color="gray">Real-time messaging</Text>
          </Card>
          <Card style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', textAlign: 'center', flex: '1 1 150px' }}>
            <Text size="6" mb="2" display="block">🎨</Text>
            <Heading size="4" mb="1">Beautiful</Heading>
            <Text size="2" color="gray">Dark theme UI</Text>
          </Card>
        </Flex>
        
        <Box 
          mt="6" 
          p="4" 
          style={{ 
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '8px',
            color: '#ffc107'
          }}
        >
          <Text size="2" weight="bold" display="block" mb="1">
            Note:
          </Text>
          <Text size="2">
            This is a frontend demo. For full functionality with PHP backend and database integration, 
            please deploy to a PHP-compatible hosting service like Heroku, DigitalOcean, or AWS.
          </Text>
        </Box>
        
        <style>{`
          @keyframes glow {
            from { text-shadow: 0 0 20px rgba(255, 107, 107, 0.3); }
            to { text-shadow: 0 0 30px rgba(255, 107, 107, 0.6); }
          }
        `}</style>
      </Box>
    </Container>
  );
}

