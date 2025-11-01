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
  metadata?: {
    reactions?: Record<string, number[]>;
    edited?: boolean;
    edited_at?: string;
    mentions?: number[];
  };
  created_at: string;
  updated_at?: string;
  username: string;
  role: string;
}

export interface PendingChange {
  id: number;
  change_type: string;
  title: string;
  description?: string;
  action_data: {
    action: string;
    params: any;
  };
  requested_by: number;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  approved_by?: number;
  reviewed_at?: string;
  executed_at?: string;
  created_at: string;
}

export type Channel = 'global' | 'support' | 'kajigs' | 'finder' | 'dms' | 'settings' | 'code';

export interface ChannelInfo {
  name: string;
  icon: string;
  description: string;
}
