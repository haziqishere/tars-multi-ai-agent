// Chat Types
export interface Message {
    id: string;
    content: string;
    sender: MessageSender;
    timestamp: number;
  }
  
  export type MessageSender = 'user' | 'ai';
  
  export interface ChatState {
    messages: Message[];
    isMinimized: boolean;
    isTyping: boolean;
  }
  
  export interface ChatInputProps {
    onSubmit: (message: string) => void;
    disabled?: boolean;
  }
  
  export interface ChatMessageProps {
    message: Message;
    isLatest: boolean;
  }