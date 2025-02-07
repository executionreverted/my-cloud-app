export interface ChatRoom {
    seed: string;
    name: string;
    description: string;
    image: string;
}

export interface ChatMessage {
    content: string;
    senderPublicKey: string;
    timestamp: number;
    files: ChatFile[];
}

export interface ChatFile {
    id: string;
    name: string;
    base64: string;
}

export interface RoomAutobaseMetadata {
    lastActive: string;
    messageLength: string;
    [key: string]: any;
}
