import type { ID } from "./common";

export interface Conversation {
  id: ID;
  participantIds: [ID, ID];
  createdAt: string;
}

export interface ChatMessage {
  id: ID;
  conversationId: ID;
  senderId: ID;
  body: string;
  readAt: string | null;
  createdAt: string;
}
