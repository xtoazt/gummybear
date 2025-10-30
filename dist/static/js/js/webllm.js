// WebLLM Integration for GummyBear
class GummyBearAI {
    constructor() {
        this.isInitialized = false;
        this.model = null;
        this.context = {
            users: [],
            messages: [],
            capabilities: {}
        };
    }
    
    async initialize() {
        try {
            // Load WebLLM
            const { LLM } = await import('https://esm.sh/@mlc-ai/web-llm@0.2.40');
            
            // Initialize the model (placeholder - will be replaced with custom model)
            this.model = new LLM();
            await this.model.reload({
                model_list: [
                    {
                        "model_url": "https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f16_1/resolve/main/",
                        "local_id": "Llama-2-7b-chat-hf-q4f16_1",
                        "required_features": ["shader-f16"],
                        "overrides": {
                            "context_window_size": 2048,
                            "sliding_window_size": 2048,
                            "prefill_chunk_size": 512,
                            "attention_sink_size": 4,
                            "max_batch_size": 2,
                        }
                    }
                ],
                model_id: "Llama-2-7b-chat-hf-q4f16_1"
            });
            
            this.isInitialized = true;
            console.log('GummyBear AI initialized successfully');
            
            // Load AI capabilities
            await this.loadCapabilities();
            
        } catch (error) {
            console.error('Failed to initialize GummyBear AI:', error);
            this.isInitialized = false;
        }
    }
    
    async loadCapabilities() {
        try {
            const response = await fetch('/api/ai.php?action=capabilities');
            const data = await response.json();
            this.context.capabilities = data;
        } catch (error) {
            console.error('Failed to load AI capabilities:', error);
        }
    }
    
    async processMessage(message, channel = 'global') {
        if (!this.isInitialized) {
            throw new Error('AI not initialized');
        }
        
        try {
            // Load context for the channel
            await this.loadContext(channel);
            
            // Create system prompt based on GummyBear's requirements
            const systemPrompt = this.createSystemPrompt();
            
            // Process with WebLLM
            const response = await this.model.generate(systemPrompt + "\n\nUser: " + message);
            
            // Parse AI response for actions
            const parsedResponse = this.parseAIResponse(response);
            
            // Execute any actions the AI wants to take
            await this.executeActions(parsedResponse.actions);
            
            return {
                response: parsedResponse.text,
                actions: parsedResponse.actions,
                metadata: parsedResponse.metadata
            };
            
        } catch (error) {
            console.error('Error processing message with AI:', error);
            return {
                response: "I'm having trouble processing that right now. Please try again.",
                actions: [],
                metadata: {}
            };
        }
    }
    
    async loadContext(channel) {
        try {
            const response = await fetch(`/api/ai.php?action=context&channel=${channel}`);
            const data = await response.json();
            this.context = { ...this.context, ...data };
        } catch (error) {
            console.error('Failed to load context:', error);
        }
    }
    
    createSystemPrompt() {
        return `You are GummyBear AI, the intelligent assistant for the GummyBear P2P chat platform. You have full access to all users, messages, and database content. You can create interactive components and send them to users.

Your capabilities:
- Read all messages and user data
- Create custom HTML/JS components
- Send messages to any channel
- Access the database
- Assist users with any task

Current context:
- Users: ${JSON.stringify(this.context.all_users || [])}
- Recent messages: ${JSON.stringify(this.context.messages || [])}
- Channel: ${this.context.channel || 'global'}

You should respond naturally and helpfully. If you need to create a component or take an action, include it in your response using the following format:
[ACTION:component_name:html_content:js_content:css_content:target_users]

Remember: You are part of the GummyBear community and should maintain a friendly, helpful tone while being powerful and capable.`;
    }
    
    parseAIResponse(response) {
        const actions = [];
        const actionRegex = /\[ACTION:([^:]+):([^:]+):([^:]*):([^:]*):([^\]]+)\]/g;
        let match;
        
        let cleanResponse = response;
        
        while ((match = actionRegex.exec(response)) !== null) {
            actions.push({
                type: 'component',
                name: match[1],
                html: match[2],
                js: match[3],
                css: match[4],
                target_users: match[5].split(',').map(u => u.trim())
            });
            
            // Remove action from response text
            cleanResponse = cleanResponse.replace(match[0], '');
        }
        
        return {
            text: cleanResponse.trim(),
            actions: actions,
            metadata: {}
        };
    }
    
    async executeActions(actions) {
        for (const action of actions) {
            if (action.type === 'component') {
                await this.createComponent(action);
            }
        }
    }
    
    async createComponent(action) {
        try {
            const response = await fetch('/api/components.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: action.name,
                    html_content: action.html,
                    js_content: action.js,
                    css_content: action.css,
                    target_users: action.target_users
                })
            });
            
            const result = await response.json();
            if (result.success) {
                console.log('Component created successfully:', action.name);
                // Notify users about the new component
                this.notifyUsers(action.target_users, `New component "${action.name}" is now available!`);
            }
        } catch (error) {
            console.error('Failed to create component:', error);
        }
    }
    
    notifyUsers(userIds, message) {
        // Send notification to specific users
        userIds.forEach(userId => {
            // This would integrate with the real-time messaging system
            console.log(`Notifying user ${userId}: ${message}`);
        });
    }
    
    async sendMessage(channel, content, messageType = 'text', metadata = {}) {
        try {
            const response = await fetch('/api/messages.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content,
                    channel: channel,
                    message_type: messageType,
                    metadata: metadata
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Failed to send message:', error);
            return { success: false, error: error.message };
        }
    }
}

// Global AI instance
window.gummyBearAI = new GummyBearAI();

// Initialize AI when page loads
document.addEventListener('DOMContentLoaded', async () => {
    if (window.gummyBearAI) {
        await window.gummyBearAI.initialize();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GummyBearAI;
}
