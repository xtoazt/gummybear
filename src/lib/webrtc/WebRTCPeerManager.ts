/**
 * WebRTC Peer Manager
 * Manages peer-to-peer connections using WebRTC, inspired by Chitchatter
 * Uses HTTP-based signaling for serverless compatibility
 */

export interface PeerConnection {
  peerId: string;
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  username: string;
  role: string;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  from: string;
  to: string;
  data: any;
}

export class WebRTCPeerManager {
  private peers: Map<string, PeerConnection> = new Map();
  private myPeerId: string;
  private token: string;
  private apiBaseUrl: string;
  private onMessageCallback?: (from: string, message: any) => void;
  private onPeerConnected?: (peerId: string, username: string) => void;
  private onPeerDisconnected?: (peerId: string) => void;
  private signalingPollInterval: number = 2000; // Poll every 2 seconds
  private signalingTimer?: NodeJS.Timeout;

  constructor(token: string, apiBaseUrl: string = '/api') {
    this.myPeerId = crypto.randomUUID();
    this.token = token;
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Initialize the peer manager and start signaling
   */
  async initialize(): Promise<void> {
    // Register this peer
    await this.registerPeer();
    
    // Start polling for signaling data
    this.startSignalingPoll();
    
    // Periodically refresh peer list and heartbeat
    setInterval(() => {
      this.registerPeer(); // Heartbeat
      this.updatePeerList();
    }, 10000);
    
    // Initial peer list update
    await this.updatePeerList();
  }

  /**
   * Register this peer with the server
   */
  private async registerPeer(): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/signaling/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ peerId: this.myPeerId })
      });
    } catch (error) {
      console.error('Failed to register peer:', error);
    }
  }

  /**
   * Get list of online peers and establish connections
   */
  private async updatePeerList(): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/signaling/peers`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) return;
      
      const { peers } = await response.json();
      
      // Connect to new peers
      for (const peer of peers) {
        if (peer.peerId !== this.myPeerId && !this.peers.has(peer.peerId)) {
          await this.connectToPeer(peer.peerId, peer.username, peer.role);
        }
      }
    } catch (error) {
      console.error('Failed to update peer list:', error);
    }
  }

  /**
   * Start polling for signaling messages
   */
  private startSignalingPoll(): void {
    this.signalingTimer = setInterval(async () => {
      try {
        const response = await fetch(`${this.apiBaseUrl}/signaling/poll/${this.myPeerId}`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
        
        if (!response.ok) return;
        
        const { data } = await response.json();
        
        if (data) {
          await this.handleSignalingData(data);
        }
      } catch (error) {
        console.error('Failed to poll signaling:', error);
      }
    }, this.signalingPollInterval);
  }

  /**
   * Handle incoming signaling data
   */
  private async handleSignalingData(data: any): Promise<void> {
    if (data.type === 'offer') {
      await this.handleOffer(data.from, data.offer);
    } else if (data.type === 'answer') {
      await this.handleAnswer(data.from, data.answer);
    } else if (data.type === 'ice-candidate' && data.candidates) {
      for (const candidateData of data.candidates) {
        await this.handleIceCandidate(candidateData.from, candidateData.candidate);
      }
    }
  }

  /**
   * Connect to a peer
   */
  private async connectToPeer(peerId: string, username: string, role: string): Promise<void> {
    if (this.peers.has(peerId)) {
      return; // Already connected
    }

    const connection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Create data channel for messaging
    const dataChannel = connection.createDataChannel('messages', {
      ordered: true
    });

    this.setupDataChannel(dataChannel, peerId, username);

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendIceCandidate(peerId, event.candidate);
      }
    };

    // Handle connection state changes
    connection.onconnectionstatechange = () => {
      if (connection.connectionState === 'connected') {
        this.onPeerConnected?.(peerId, username);
      } else if (connection.connectionState === 'disconnected' || 
                 connection.connectionState === 'failed') {
        this.disconnectPeer(peerId);
      }
    };

    // Store peer connection
    this.peers.set(peerId, {
      peerId,
      connection,
      dataChannel,
      username,
      role
    });

    // Create and send offer
    try {
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      await this.sendOffer(peerId, offer);
    } catch (error) {
      console.error('Failed to create offer:', error);
      this.disconnectPeer(peerId);
    }
  }

  /**
   * Handle incoming offer
   */
  private async handleOffer(from: string, offer: RTCSessionDescriptionInit): Promise<void> {
    let peer = this.peers.get(from);
    
    if (!peer) {
      // Create new peer connection for incoming offer
      const connection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Handle incoming data channel
      connection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        // Get username/role from peer list (we'll store it when we get the answer)
        this.setupDataChannel(dataChannel, from, '');
      };

      // Handle ICE candidates
      connection.onicecandidate = (event) => {
        if (event.candidate) {
          this.sendIceCandidate(from, event.candidate);
        }
      };

      // Handle connection state
      connection.onconnectionstatechange = () => {
        if (connection.connectionState === 'connected') {
          this.onPeerConnected?.(from, '');
        } else if (connection.connectionState === 'disconnected' || 
                   connection.connectionState === 'failed') {
          this.disconnectPeer(from);
        }
      };

      peer = {
        peerId: from,
        connection,
        dataChannel: null,
        username: '',
        role: ''
      };
      
      this.peers.set(from, peer);
    }

    try {
      await peer.connection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);
      await this.sendAnswer(from, answer);
    } catch (error) {
      console.error('Failed to handle offer:', error);
      this.disconnectPeer(from);
    }
  }

  /**
   * Handle incoming answer
   */
  private async handleAnswer(from: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.peers.get(from);
    if (!peer) return;

    try {
      await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Failed to handle answer:', error);
      this.disconnectPeer(from);
    }
  }

  /**
   * Handle ICE candidate
   */
  private async handleIceCandidate(from: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peer = this.peers.get(from);
    if (!peer) return;

    try {
      await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
    }
  }

  /**
   * Setup data channel event handlers
   */
  private setupDataChannel(
    dataChannel: RTCDataChannel, 
    peerId: string, 
    username: string
  ): void {
    dataChannel.onopen = () => {
      console.log(`Data channel opened with ${peerId}`);
    };

    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.onMessageCallback?.(peerId, message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };

    dataChannel.onclose = () => {
      console.log(`Data channel closed with ${peerId}`);
    };
  }

  /**
   * Send offer to peer via signaling server
   */
  private async sendOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/signaling/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          peerId: this.myPeerId,
          targetPeerId: peerId,
          offer
        })
      });
    } catch (error) {
      console.error('Failed to send offer:', error);
    }
  }

  /**
   * Send answer to peer via signaling server
   */
  private async sendAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/signaling/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          peerId: this.myPeerId,
          targetPeerId: peerId,
          answer
        })
      });
    } catch (error) {
      console.error('Failed to send answer:', error);
    }
  }

  /**
   * Send ICE candidate to peer via signaling server
   */
  private async sendIceCandidate(peerId: string, candidate: RTCIceCandidate): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/signaling/ice-candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          peerId: this.myPeerId,
          targetPeerId: peerId,
          candidate: candidate.toJSON()
        })
      });
    } catch (error) {
      console.error('Failed to send ICE candidate:', error);
    }
  }

  /**
   * Send message to a specific peer
   */
  sendMessage(peerId: string, message: any): void {
    const peer = this.peers.get(peerId);
    if (peer && peer.dataChannel && peer.dataChannel.readyState === 'open') {
      peer.dataChannel.send(JSON.stringify(message));
    } else {
      console.warn(`Cannot send message to ${peerId}: data channel not ready`);
    }
  }

  /**
   * Broadcast message to all connected peers
   */
  broadcastMessage(message: any): void {
    for (const [peerId, peer] of this.peers.entries()) {
      if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
        peer.dataChannel.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Disconnect from a peer
   */
  disconnectPeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
      peer.connection.close();
      this.peers.delete(peerId);
      this.onPeerDisconnected?.(peerId);
    }
  }

  /**
   * Disconnect from all peers and cleanup
   */
  disconnectAll(): void {
    if (this.signalingTimer) {
      clearInterval(this.signalingTimer);
    }
    
    for (const peerId of this.peers.keys()) {
      this.disconnectPeer(peerId);
    }
    
    this.peers.clear();
  }

  /**
   * Get list of connected peer IDs
   */
  getConnectedPeers(): string[] {
    return Array.from(this.peers.keys());
  }

  /**
   * Get peer information
   */
  getPeer(peerId: string): PeerConnection | undefined {
    return this.peers.get(peerId);
  }

  /**
   * Set callback for incoming messages
   */
  onMessage(callback: (from: string, message: any) => void): void {
    this.onMessageCallback = callback;
  }

  /**
   * Set callback for peer connection
   */
  onPeerConnect(callback: (peerId: string, username: string) => void): void {
    this.onPeerConnected = callback;
  }

  /**
   * Set callback for peer disconnection
   */
  onPeerDisconnect(callback: (peerId: string) => void): void {
    this.onPeerDisconnected = callback;
  }
}

