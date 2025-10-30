export interface User {
  id: number;
  username: string;
  role: 'king' | 'admin' | 'support' | 'twin' | 'bankinda';
  status: 'pending' | 'approved' | 'banned';
  created_at: string;
  last_seen: string;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id?: number;
  channel: string;
  content: string;
  message_type: 'text' | 'component' | 'ai';
  metadata: Record<string, any>;
  created_at: string;
  username: string;
  role: string;
}

export interface AccessRequest {
  id: number;
  user_id: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: number;
  created_at: string;
  reviewed_at?: string;
  username: string;
}

export interface CustomComponent {
  id: number;
  creator_id: number;
  name: string;
  html_content: string;
  js_content: string;
  css_content: string;
  target_users: number[];
  created_at: string;
}

export interface AIResponse {
  response: string;
  actions: AIAction[];
  metadata: Record<string, any>;
}

export interface AIAction {
  type: 'component' | 'message' | 'role_change';
  name?: string;
  html?: string;
  js?: string;
  css?: string;
  target_users?: number[];
  message?: string;
  channel?: string;
  user_id?: number;
  new_role?: string;
}

export type Channel = 'global' | 'support' | 'kajigs' | 'finder' | 'dms' | 'settings';

export interface ChannelInfo {
  name: string;
  icon: string;
  description: string;
}
