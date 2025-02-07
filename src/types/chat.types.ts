export interface ChatRoom {
    id: string;
    name: string;
    description: string;
    image: string;
    messageLength: number;
    lastMessageTime: string;
}

export interface ChatMessage {
    id: string;
    content: string;
    senderPublicKey: string;
    timestamp: string;
    files: ChatFile[];
}

export interface ChatFile {
    id: string;
    name: string;
}

