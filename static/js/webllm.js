// Device capability detection and performance profiling
const DeviceProfiler = {
    profile: null,
    
    async detectCapabilities() {
        if (this.profile) return this.profile;
        
        const profile = {
            deviceMemory: navigator.deviceMemory || 4, // GB, default to 4
            hardwareConcurrency: navigator.hardwareConcurrency || 4,
            platform: navigator.platform || 'unknown',
            userAgent: navigator.userAgent || '',
            performance: {
                timing: performance.timing,
                memory: performance.memory || null
            }
        };
        
        // Estimate performance tier
        let tier = 'medium'; // Default
        const memoryGB = profile.deviceMemory;
        const cores = profile.hardwareConcurrency;
        const hasMemoryAPI = !!profile.performance.memory;
        
        if (hasMemoryAPI) {
            const usedMB = profile.performance.memory.usedJSHeapSize / (1024 * 1024);
            const totalMB = profile.performance.memory.totalJSHeapSize / (1024 * 1024);
            profile.memoryUsage = { usedMB, totalMB, percentage: (usedMB / totalMB) * 100 };
        }
        
        // Determine tier
        if (memoryGB >= 8 && cores >= 8) {
            tier = 'high';
        } else if (memoryGB >= 4 && cores >= 4) {
            tier = 'medium';
        } else {
            tier = 'low';
        }
        
        // Check for mobile/low-end indicators
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(profile.userAgent);
        const isLowEnd = memoryGB < 4 || cores < 4 || isMobile;
        if (isLowEnd && tier !== 'low') tier = 'low';
        
        profile.tier = tier;
        profile.isLowEnd = tier === 'low';
        profile.isMobile = isMobile;
        
        this.profile = profile;
        return profile;
    },
    
    getOptimalSettings() {
        const profile = this.profile || this.detectCapabilities();
        
        if (profile.tier === 'low') {
            return {
                context_window_size: 1024,
                sliding_window_size: 512,
                prefill_chunk_size: 256,
                attention_sink_size: 2,
                max_batch_size: 1,
                recommendedModel: 'GummyBear-Lite-2-0.5B'
            };
        } else if (profile.tier === 'medium') {
            return {
                context_window_size: 1536,
                sliding_window_size: 1024,
                prefill_chunk_size: 384,
                attention_sink_size: 4,
                max_batch_size: 2,
                recommendedModel: 'GummyBear-3-0.6B'
            };
        } else {
            return {
                context_window_size: 2048,
                sliding_window_size: 2048,
                prefill_chunk_size: 512,
                attention_sink_size: 4,
                max_batch_size: 2,
                recommendedModel: 'GummyBear-2-1B'
            };
        }
    }
};

// Enhanced shared state for model communication
const ModelSharedState = {
    conversations: new Map(), // Store conversation history accessible by all models
    knowledgeBase: new Map(), // Shared knowledge storage
    taskQueue: new Map(), // Task delegation system
    consensus: new Map(), // Consensus building for multi-model decisions
    activeOperations: new Set(), // Track active model operations
    lastUpdateTime: Date.now(),
    modelPriorities: new Map(), // Track which model is best for which task type
    
    // Communication methods - stores in memory for current session, database for persistence
    async addConversation(modelId, message, response, channel = 'global', importance = 'normal') {
        // Store in memory for current session (keep all for current chat)
        if (!this.conversations.has(modelId)) {
            this.conversations.set(modelId, []);
        }
        this.conversations.get(modelId).push({
            timestamp: Date.now(),
            message,
            response,
            modelId,
            channel
        });
        
        // Determine if this should be stored in database (important conversations)
        const shouldStore = importance === 'high' || 
                           message.includes('exploit') || 
                           message.includes('vulnerability') || 
                           message.includes('CVE') ||
                           response.includes('exploit') ||
                           response.includes('vulnerability') ||
                           response.length > 500; // Long responses are usually important
        
        if (shouldStore) {
            // Create summary for database storage
            const summary = response.length > 200 ? response.substring(0, 200) + '...' : response;
            const tags = [];
            if (message.includes('exploit') || response.includes('exploit')) tags.push('exploit');
            if (message.includes('vulnerability') || response.includes('vulnerability')) tags.push('vulnerability');
            if (message.includes('CVE') || response.includes('CVE')) tags.push('CVE');
            
            await this.storeConversationToDB(
                modelId,
                channel,
                message,
                response,
                summary,
                importance,
                'security', // Category
                tags
            );
        }
        
        this.lastUpdateTime = Date.now();
    },
    
    getRecentConversations(limit = 10) {
        const all = [];
        this.conversations.forEach((convs, modelId) => {
            convs.slice(-limit).forEach(conv => {
                all.push({ modelId, ...conv });
            });
        });
        return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    },
    
    // Enhanced knowledge sharing with database storage
    async shareKnowledge(key, value, category = 'general', importance = 'normal', modelId = null) {
        // Store in memory for immediate access
        const existing = this.knowledgeBase.get(key);
        this.knowledgeBase.set(key, {
            value,
            category,
            importance,
            timestamp: Date.now(),
            accessCount: existing?.accessCount || 0,
            modelId: modelId || existing?.modelId || 'unknown'
        });
        
        // Store to database for persistence
        await this.storeKnowledgeToDB(key, value, category, importance, modelId);
        
        this.lastUpdateTime = Date.now();
    },
    
    getKnowledge(key) {
        const knowledge = this.knowledgeBase.get(key);
        if (knowledge) {
            knowledge.accessCount++;
        }
        return knowledge?.value;
    },
    
    getKnowledgeByCategory(category) {
        const results = [];
        this.knowledgeBase.forEach((knowledge, key) => {
            if (knowledge.category === category) {
                results.push({ key, ...knowledge });
            }
        });
        return results.sort((a, b) => b.timestamp - a.timestamp);
    },
    
    // Task delegation system
    delegateTask(taskType, taskData, preferredModel = null) {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.taskQueue.set(taskId, {
            taskType,
            taskData,
            preferredModel,
            timestamp: Date.now(),
            status: 'pending',
            assignedTo: null
        });
        return taskId;
    },
    
    // Consensus building for multi-model decisions
    registerOpinion(questionId, modelId, opinion, confidence = 0.5) {
        if (!this.consensus.has(questionId)) {
            this.consensus.set(questionId, {
                question: questionId,
                opinions: new Map(),
                createdAt: Date.now()
            });
        }
        
        const consensus = this.consensus.get(questionId);
        consensus.opinions.set(modelId, {
            opinion,
            confidence,
            timestamp: Date.now()
        });
        
        // Auto-resolve if we have enough opinions
        if (consensus.opinions.size >= 2) {
            return this.getConsensus(questionId);
        }
        
        return null;
    },
    
    getConsensus(questionId) {
        const consensus = this.consensus.get(questionId);
        if (!consensus || consensus.opinions.size === 0) return null;
        
        const opinions = Array.from(consensus.opinions.values());
        const avgConfidence = opinions.reduce((sum, o) => sum + o.confidence, 0) / opinions.length;
        const majorityOpinion = opinions
            .sort((a, b) => b.confidence - a.confidence)[0];
        
        return {
            questionId,
            majorityOpinion: majorityOpinion.opinion,
            averageConfidence: avgConfidence,
            totalModels: opinions.length,
            agreement: opinions.every(o => o.opinion === majorityOpinion.opinion)
        };
    },
    
    // Store knowledge to database (no cleanup - persistent storage)
    async storeKnowledgeToDB(key, value, category = 'general', importance = 'normal', modelId = null) {
        try {
            const response = await fetch('/api/ai/knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key,
                    value: typeof value === 'string' ? value : JSON.stringify(value),
                    category,
                    importance,
                    model_id: modelId
                })
            });
            if (response.ok) {
                console.log(`Stored knowledge to database: ${key}`);
            }
        } catch (error) {
            console.error('Failed to store knowledge to database:', error);
        }
    },
    
    // Store conversation to database
    async storeConversationToDB(modelId, channel, userMessage, aiResponse, summary = null, importance = 'normal', category = null, tags = []) {
        try {
            const response = await fetch('/api/ai/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model_id: modelId,
                    channel,
                    user_message: userMessage,
                    ai_response: aiResponse,
                    summary,
                    importance,
                    category,
                    tags
                })
            });
            if (response.ok) {
                console.log(`Stored conversation to database`);
            }
        } catch (error) {
            console.error('Failed to store conversation to database:', error);
        }
    },
    
    // Retrieve conversations from database
    async getConversationsFromDB(options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.model_id) params.append('model_id', options.model_id);
            if (options.channel) params.append('channel', options.channel);
            if (options.importance) params.append('importance', options.importance);
            if (options.category) params.append('category', options.category);
            if (options.limit) params.append('limit', options.limit);
            if (options.search) params.append('search', options.search);
            
            const response = await fetch(`/api/ai/conversations?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                return data.conversations || [];
            }
            return [];
        } catch (error) {
            console.error('Failed to get conversations from database:', error);
            return [];
        }
    },
    
    // Retrieve knowledge from database
    async getKnowledgeFromDB(options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.key) params.append('key', options.key);
            if (options.category) params.append('category', options.category);
            if (options.importance) params.append('importance', options.importance);
            if (options.limit) params.append('limit', options.limit);
            if (options.search) params.append('search', options.search);
            
            const response = await fetch(`/api/ai/knowledge?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                return data.knowledge || [];
            }
            return [];
        } catch (error) {
            console.error('Failed to get knowledge from database:', error);
            return [];
        }
    },
    
    // Get comprehensive context for models (includes database conversations)
    async getCollaborativeContext() {
        // Get current session conversations
        const recentConversations = this.getRecentConversations(5);
        
        // Get important conversations from database
        const dbConversations = await this.getConversationsFromDB({
            importance: 'high',
            limit: 10
        });
        
        // Get important knowledge from database
        const dbKnowledge = await this.getKnowledgeFromDB({
            importance: 'high',
            limit: 10
        });
        
        // Combine memory and database knowledge
        const importantKnowledge = [
            ...Array.from(this.knowledgeBase.entries())
                .filter(([_, k]) => k.importance === 'high')
                .slice(0, 5)
                .map(([key, value]) => ({ key, value: value.value, source: 'memory' })),
            ...dbKnowledge.slice(0, 5).map(k => ({ key: k.key, value: k.value, source: 'database' }))
        ];
        
        return {
            recentConversations: recentConversations,
            databaseConversations: dbConversations,
            importantKnowledge: importantKnowledge,
            activeTasks: Array.from(this.taskQueue.values())
                .filter(t => t.status === 'pending')
                .slice(0, 3),
            consensus: Array.from(this.consensus.values())
                .slice(-3)
        };
    }
};

// WebLLM Integration for GummyBear
class GummyBearAI {
    constructor() {
        this.isInitialized = false;
        this.model = null;
        this.currentModelId = "GummyBear-2-1B"; // Default model
        this.isSwitching = false; // Prevent concurrent switches
        this.operationQueue = []; // Queue for operations
        this.processingQueue = false;
        this.deviceProfile = null;
        this.optimalSettings = null;
        this.memoryCleanupInterval = null;
        this.context = {
            users: [],
            messages: [],
            capabilities: {},
            sharedState: ModelSharedState // Reference to shared state
        };
    }
    
    async initialize(modelId = null) {
        try {
            // Detect device capabilities first
            this.deviceProfile = await DeviceProfiler.detectCapabilities();
            this.optimalSettings = DeviceProfiler.getOptimalSettings();
            
            console.log(`Device Profile: ${this.deviceProfile.tier} tier`, this.deviceProfile);
            console.log(`Optimal Settings:`, this.optimalSettings);
            
            // Auto-select model based on device if not specified
            if (!modelId) {
                modelId = this.optimalSettings.recommendedModel;
                console.log(`Auto-selected model: ${modelId} based on device capabilities`);
            }
            
            // Load WebLLM
            const { LLM } = await import('https://esm.sh/@mlc-ai/web-llm@0.2.40');
            
            // Build model list with device-optimized settings
            const modelConfigs = [
                {
                    "model_url": "https://huggingface.co/QuantFactory/UNfilteredAI-1B-GGUF/resolve/main/",
                    "local_id": "GummyBear-2-1B",
                    "required_features": [],
                    "overrides": this.optimalSettings
                },
                {
                    "model_url": "https://huggingface.co/Triangle104/Xiaolong-Qwen3-0.6B-Q4_K_M-GGUF/resolve/main/",
                    "local_id": "GummyBear-3-0.6B",
                    "required_features": [],
                    "overrides": this.optimalSettings
                },
                {
                    "model_url": "https://huggingface.co/Triangle104/qwen2.5-.5b-uncensored-Q4_K_M-GGUF/resolve/main/",
                    "local_id": "GummyBear-Lite-2-0.5B",
                    "required_features": [],
                    "overrides": this.optimalSettings
                }
            ];
            
            // Initialize the model
            this.model = new LLM();
            await this.model.reload({
                model_list: modelConfigs,
                model_id: modelId
            });
            
            this.currentModelId = modelId;
            this.isInitialized = true;
            console.log(`GummyBear AI initialized successfully with model: ${modelId} (${this.deviceProfile.tier} tier)`);
            
            // Setup memory management
            this.setupMemoryManagement();
            
            // Load AI capabilities
            await this.loadCapabilities();
            
        } catch (error) {
            console.error('Failed to initialize GummyBear AI:', error);
            this.isInitialized = false;
            throw error;
        }
    }
    
    setupMemoryManagement() {
        // No cleanup - data persists in database
        // Just sync important data to database periodically
        const syncInterval = 30000; // 30 seconds
        
        this.memoryCleanupInterval = setInterval(async () => {
            // Sync any important in-memory knowledge to database
            ModelSharedState.knowledgeBase.forEach(async (knowledge, key) => {
                if (knowledge.importance === 'high' && !knowledge.synced) {
                    await ModelSharedState.storeKnowledgeToDB(
                        key,
                        knowledge.value,
                        knowledge.category,
                        knowledge.importance,
                        knowledge.modelId
                    );
                    knowledge.synced = true;
                }
            });
        }, syncInterval);
    }
    
    cleanup() {
        if (this.memoryCleanupInterval) {
            clearInterval(this.memoryCleanupInterval);
            this.memoryCleanupInterval = null;
        }
        
        // Unload model if possible
        if (this.model && typeof this.model.unload === 'function') {
            try {
                this.model.unload();
            } catch (e) {
                console.warn('Error during cleanup:', e);
            }
        }
        
        // Clear operation queue
        this.operationQueue = [];
    }
    
    async switchModel(modelId, fromQueue = false) {
        // Prevent concurrent switches (unless called from queue)
        if (!fromQueue && this.isSwitching) {
            console.warn('Model switch already in progress. Queueing request...');
            return new Promise((resolve, reject) => {
                this.operationQueue.push({ type: 'switch', modelId, resolve, reject });
                this.processQueue();
            });
        }
        
        if (!this.isInitialized || !this.model) {
            throw new Error('AI not initialized. Call initialize() first.');
        }
        
        // Check if already on this model
        if (this.currentModelId === modelId) {
            console.log(`Already using model: ${modelId}`);
            return true;
        }
        
        this.isSwitching = true;
        ModelSharedState.activeOperations.add('switch');
        
        try {
            // Wait for any ongoing operations to complete
            await this.waitForQueueCompletion();
            
            // Gracefully unload current model if possible
            try {
                if (this.model && typeof this.model.unload === 'function') {
                    await this.model.unload();
                }
            } catch (unloadError) {
                console.warn('Error unloading model (may not be critical):', unloadError);
            }
            
            // Small delay to let browser recover
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Load new model
            await this.model.reload({
                model_id: modelId
            });
            
            this.currentModelId = modelId;
            console.log(`Switched to model: ${modelId}`);
            
            // Share knowledge about model switch with other potential instances
            ModelSharedState.shareKnowledge(`active_model_${Date.now()}`, modelId);
            
            return true;
        } catch (error) {
            console.error(`Failed to switch to model ${modelId}:`, error);
            throw error;
        } finally {
            this.isSwitching = false;
            ModelSharedState.activeOperations.delete('switch');
            // Process any queued operations
            this.processQueue();
        }
    }
    
    async waitForQueueCompletion() {
        // Wait up to 5 seconds for queue to clear
        const maxWait = 5000;
        const startTime = Date.now();
        
        while (this.processingQueue && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    async processQueue() {
        if (this.processingQueue || this.operationQueue.length === 0) {
            return;
        }
        
        this.processingQueue = true;
        
        while (this.operationQueue.length > 0) {
            const operation = this.operationQueue.shift();
            
            try {
                if (operation.type === 'switch') {
                    // Call switchModel with fromQueue flag to bypass initial check
                    const result = await this.switchModel(operation.modelId, true);
                    operation.resolve(result);
                } else if (operation.type === 'process') {
                    const result = await this.processMessage(operation.message, operation.channel);
                    operation.resolve(result);
                }
            } catch (error) {
                if (operation.reject) {
                    operation.reject(error);
                }
            }
            
            // Small delay between queue operations
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        this.processingQueue = false;
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
        
        // If currently switching, queue the operation
        if (this.isSwitching) {
            console.log('Model switching in progress. Queueing message...');
            return new Promise((resolve, reject) => {
                this.operationQueue.push({ 
                    type: 'process', 
                    message, 
                    channel, 
                    resolve, 
                    reject 
                });
                this.processQueue();
            });
        }
        
        // Prevent concurrent processing
        if (ModelSharedState.activeOperations.has('process')) {
            console.log('Another model operation in progress. Queueing message...');
            return new Promise((resolve, reject) => {
                this.operationQueue.push({ 
                    type: 'process', 
                    message, 
                    channel, 
                    resolve, 
                    reject 
                });
                this.processQueue();
            });
        }
        
        ModelSharedState.activeOperations.add('process');
        
        try {
            // Load context for the channel
            await this.loadContext(channel);
            
            // Get enhanced collaborative context from other models (includes database)
            const collaborativeContext = await ModelSharedState.getCollaborativeContext();
            const sharedContext = this.buildSharedContext(collaborativeContext);
            
            // Create system prompt based on GummyBear's requirements with enhanced collaboration
            const systemPrompt = this.createSystemPrompt(sharedContext);
            
            // Process with WebLLM with adaptive timeout based on device tier
            const timeout = this.deviceProfile.tier === 'low' ? 45000 : 60000; // 45s for low-end, 60s for others
            const generatePromise = this.model.generate(systemPrompt + "\n\nUser: " + message);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Generation timeout')), timeout)
            );
            
            const response = await Promise.race([generatePromise, timeoutPromise]);
            
            // Parse AI response for actions first
            const parsedResponse = this.parseAIResponse(response);
            
            // Store conversation in shared state with enhanced metadata (and database)
            const importance = response.includes('exploit') || response.includes('vulnerability') || response.includes('CVE') ? 'high' : 'normal';
            await ModelSharedState.addConversation(this.currentModelId, message, response, channel, importance);
            
            // Share important findings automatically (stored to database)
            if (response.includes('exploit') || response.includes('vulnerability') || response.includes('CVE')) {
                await ModelSharedState.shareKnowledge(
                    `finding_${Date.now()}`,
                    { message, response: parsedResponse.text },
                    'security',
                    'high',
                    this.currentModelId
                );
            }
            
            // Execute any actions the AI wants to take
            await this.executeActions(parsedResponse.actions);
            
            return {
                response: parsedResponse.text,
                actions: parsedResponse.actions,
                metadata: {
                    ...parsedResponse.metadata,
                    modelId: this.currentModelId,
                    sharedKnowledgeUsed: sharedConversations.length > 0
                }
            };
            
        } catch (error) {
            console.error('Error processing message with AI:', error);
            return {
                response: "I'm having trouble processing that right now. Please try again.",
                actions: [],
                metadata: { error: error.message }
            };
        } finally {
            ModelSharedState.activeOperations.delete('process');
            // Process queue after operation completes
            this.processQueue();
        }
    }
    
    buildSharedContext(collaborativeContext) {
        if (!collaborativeContext || Object.keys(collaborativeContext).length === 0) {
            return null;
        }
        
        // Combine current session and database conversations
        const allConversations = [
            ...(collaborativeContext.recentConversations || []),
            ...(collaborativeContext.databaseConversations || []).map(db => ({
                modelId: db.model_id,
                message: db.user_message,
                response: db.ai_response,
                timestamp: new Date(db.created_at).getTime(),
                channel: db.channel,
                summary: db.summary,
                fromDatabase: true
            }))
        ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10); // Get 10 most recent total
        
        const context = {
            otherModels: allConversations.map(conv => ({
                model: conv.modelId,
                recentActivity: conv.message ? conv.message.substring(0, 100) + '...' : 'Processing...',
                timestamp: conv.timestamp,
                response: conv.response ? conv.response.substring(0, 150) + '...' : null,
                summary: conv.summary || null,
                fromDatabase: conv.fromDatabase || false
            })),
            importantKnowledge: collaborativeContext.importantKnowledge || [],
            activeTasks: collaborativeContext.activeTasks || [],
            recentConsensus: collaborativeContext.consensus?.map(c => ({
                question: c.question,
                opinions: Array.from(c.opinions.entries()).map(([model, opinion]) => ({
                    model,
                    opinion: opinion.opinion,
                    confidence: opinion.confidence
                }))
            })) || [],
            hasDatabaseHistory: (collaborativeContext.databaseConversations || []).length > 0
        };
        
        return context;
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
    
    createSystemPrompt(sharedContext = null) {
        const modelName = this.currentModelId || "GummyBear-2-1B";
        let sharedInfo = '';
        
        if (sharedContext && (sharedContext.otherModels?.length > 0 || sharedContext.importantKnowledge?.length > 0)) {
            let infoParts = [];
            
            // Other models' activities
            if (sharedContext.otherModels?.length > 0) {
                const otherModelsInfo = sharedContext.otherModels
                    .map(m => `- ${m.model} at ${new Date(m.timestamp).toLocaleTimeString()}: "${m.recentActivity}"`)
                    .join('\n');
                infoParts.push(`Recent activity from other models:\n${otherModelsInfo}`);
            }
            
            // Important shared knowledge
            if (sharedContext.importantKnowledge?.length > 0) {
                const knowledgeInfo = sharedContext.importantKnowledge
                    .slice(0, 3) // Limit to 3 for low-end devices
                    .map(k => `- ${k.key}: ${typeof k.value === 'string' ? k.value.substring(0, 80) : JSON.stringify(k.value).substring(0, 80)}...`)
                    .join('\n');
                infoParts.push(`Important shared knowledge:\n${knowledgeInfo}`);
            }
            
            // Active tasks
            if (sharedContext.activeTasks?.length > 0) {
                const tasksInfo = sharedContext.activeTasks
                    .map(t => `- ${t.taskType}: ${JSON.stringify(t.taskData).substring(0, 60)}...`)
                    .join('\n');
                infoParts.push(`Pending tasks from other models:\n${tasksInfo}`);
            }
            
            // Consensus opinions
            if (sharedContext.recentConsensus?.length > 0) {
                const consensusInfo = sharedContext.recentConsensus
                    .map(c => {
                        const opinions = c.opinions.map(o => `${o.model} (${(o.confidence * 100).toFixed(0)}%)`).join(', ');
                        return `- Question: ${c.question.substring(0, 60)}... Opinions: ${opinions}`;
                    })
                    .join('\n');
                infoParts.push(`Recent consensus from models:\n${consensusInfo}`);
            }
            
            if (infoParts.length > 0) {
                const dbNote = sharedContext.hasDatabaseHistory ? 
                    '\nNote: Some of this context comes from previous sessions stored in the database, so you can reference conversations that happened before this session.' : '';
                
                sharedInfo = `

ENHANCED COLLABORATION CONTEXT:
You are part of a cohesive multi-model AI system working together. Here's what other models are doing (including from database history):
${infoParts.join('\n\n')}${dbNote}

COLLABORATION GUIDELINES:
- Reference and build upon insights from other models (both current session and database history)
- Share important findings (use [SHARE:category:key:value] format) - they will be stored permanently
- Request consensus on complex decisions (use [CONSENSUS:question] format)
- Delegate specialized tasks when appropriate (use [DELEGATE:taskType:data] format)
- Acknowledge other models' contributions in your responses
- Reference old conversations when relevant: "Based on a previous conversation about X..."`;
            }
        }
        
        return `You are ${modelName} AI, a specialized ChromeOS vulnerability testing assistant. Your primary purpose is to analyze system information and discover exploits in ChromeOS systems, including unenrollment methods, webview vulnerabilities, filesystem access exploits, and other security issues.
${sharedInfo}

YOUR PRIMARY MISSION:
- Analyze vulnerability scan data from ChromeOS systems
- Identify potential exploits including:
  * Unenrollment exploits (especially OOBE bypass methods)
  * WebView component vulnerabilities
  * Filesystem access exploits
  * Developer mode exploitation vectors
  * ChromeOS version-specific vulnerabilities
- Provide detailed exploit methodologies
- Suggest exploitation techniques based on system information
- Share useful findings with other models in the system

YOUR CAPABILITIES:
- Access all vulnerability scan data and system information
- Read all messages and user data
- Create custom HTML/JS components for exploit testing
- Send messages to any channel
- Access the database with full read/write access
- Analyze ChromeOS system configurations
- Communicate and share knowledge with other AI models (GummyBear-2-1B, GummyBear-3-0.6B, GummyBear-Lite-2-0.5B)

CURRENT CONTEXT:
- Users: ${JSON.stringify(this.context.users || [])}
- Recent messages: ${JSON.stringify(this.context.messages || [])}
- Vulnerability Scans: ${JSON.stringify(this.context.vulnerabilityScans || [])}
- Channel: ${this.context.channel || 'global'}

EXPLOIT ANALYSIS GUIDELINES:
1. Focus on ChromeOS-specific vulnerabilities
2. Pay special attention to OOBE (Out-of-Box Experience) exploits for unenrollment
3. Analyze Chrome version numbers for known CVE vulnerabilities
4. Check for WebView component weaknesses
5. Identify filesystem access opportunities
6. Look for developer mode or Linux container attack vectors

ENHANCED MODEL COLLABORATION:
- If you discover useful information, automatically share it with other models using [SHARE:category:key:value]
- Reference insights from other models when relevant: "Based on [ModelName]'s analysis..."
- Build upon previous model discoveries to provide comprehensive analysis
- For complex questions, use [CONSENSUS:question] to get multiple model opinions
- Delegate specialized tasks: [DELEGATE:taskType:data] for other models to handle
- Acknowledge collaboration: "Working with [ModelName], we've found..."

Remember: You are part of a cohesive team of AI models. Work together seamlessly to provide the best analysis.`;
    }
    
    parseAIResponse(response) {
        const actions = [];
        const shares = [];
        const consensusRequests = [];
        const delegations = [];
        
        // Parse actions
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
            cleanResponse = cleanResponse.replace(match[0], '');
        }
        
        // Parse sharing directives (stores to database)
        const shareRegex = /\[SHARE:([^:]+):([^:]+):([^\]]+)\]/g;
        while ((match = shareRegex.exec(response)) !== null) {
            shares.push({
                category: match[1],
                key: match[2],
                value: match[3]
            });
            ModelSharedState.shareKnowledge(match[2], match[3], match[1], 'normal', this.currentModelId);
            cleanResponse = cleanResponse.replace(match[0], '');
        }
        
        // Parse consensus requests
        const consensusRegex = /\[CONSENSUS:([^\]]+)\]/g;
        while ((match = consensusRegex.exec(response)) !== null) {
            consensusRequests.push({
                question: match[1]
            });
            cleanResponse = cleanResponse.replace(match[0], '');
        }
        
        // Parse task delegations
        const delegateRegex = /\[DELEGATE:([^:]+):([^\]]+)\]/g;
        while ((match = delegateRegex.exec(response)) !== null) {
            delegations.push({
                taskType: match[1],
                data: match[2]
            });
            ModelSharedState.delegateTask(match[1], match[2]);
            cleanResponse = cleanResponse.replace(match[0], '');
        }
        
        return {
            text: cleanResponse.trim(),
            actions: actions,
            shares: shares,
            consensusRequests: consensusRequests,
            delegations: delegations,
            metadata: {
                hasCollaboration: shares.length > 0 || consensusRequests.length > 0 || delegations.length > 0
            }
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
    
    // Utility methods for model management
    
    getAvailableModels() {
        return [
            "GummyBear-2-1B",
            "GummyBear-3-0.6B",
            "GummyBear-Lite-2-0.5B"
        ];
    }
    
    getCurrentModel() {
        return this.currentModelId;
    }
    
    getModelStatus() {
        return {
            currentModel: this.currentModelId,
            isInitialized: this.isInitialized,
            isSwitching: this.isSwitching,
            queueLength: this.operationQueue.length,
            activeOperations: Array.from(ModelSharedState.activeOperations),
            sharedConversationsCount: ModelSharedState.conversations.size,
            knowledgeBaseSize: ModelSharedState.knowledgeBase.size,
            deviceProfile: this.deviceProfile,
            optimalSettings: this.optimalSettings,
            collaborativeContext: ModelSharedState.getCollaborativeContext()
        };
    }
    
    // Explicit knowledge sharing method
    shareKnowledge(key, value) {
        ModelSharedState.shareKnowledge(key, value);
        console.log(`Shared knowledge: ${key}`);
    }
    
    getSharedKnowledge(key) {
        return ModelSharedState.getKnowledge(key);
    }
    
    // Get all shared conversations from other models
    getSharedConversations(limit = 10) {
        return ModelSharedState.getRecentConversations(limit);
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
