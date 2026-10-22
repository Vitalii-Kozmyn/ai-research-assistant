
import api from "./api";

export interface Chat {
    id: number;
    title: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface ChatDocument {
    id: number;
    filename: string;
    file_type: string;
    file_size: number;
    page_count: number | null;
    status: string;
    created_at: string;
}

export interface Message {
    id: number;
    chat_id: number;
    role: string;
    content: string;
    created_at: string;
}

export interface MessageSource {
    document: string;
    page: number;
}

export interface ChatMessageResponse {
    answer: string;
    sources: MessageSource[];
}

export async function getChats(): Promise<Chat[]> {
    const response = await api.get<Chat[]>("/chats");
    return response.data;
}

export async function getChat(chatId: number): Promise<Chat> {
    const response = await api.get<Chat>(`/chats/${chatId}`);
    return response.data;
}

export async function createChat(documentIds: number[]): Promise<Chat> {
    const response = await api.post<Chat>("/chats", {
        document_ids: documentIds,
    });

    return response.data;
}

export async function renameChat(chatId: number, title: string): Promise<Chat> {
    const response = await api.put<Chat>(`/chats/${chatId}`, {
        title,
    });

    return response.data;
}

export async function deleteChat(chatId: number): Promise<void> {
    await api.delete(`/chats/${chatId}`);
}

export async function getChatDocuments(chatId: number): Promise<ChatDocument[]> {
    const { data } = await api.get<ChatDocument[]>(`/chats/${chatId}/documents`);

    return data;
}

export async function addDocumentToChat(chatId: number, documentId: number): Promise<void> {
    await api.post(`/chats/${chatId}/documents`, {document_id: documentId,});
}

export async function removeDocumentFromChat(chatId: number, documentId: number): Promise<void> {
    await api.delete(`/chats/${chatId}/documents/${documentId}`);
}

export async function getChatMessages(chatId: number): Promise<Message[]> {
    const response = await api.get<Message[]>(`/chats/${chatId}/messages`);

    return response.data;
}

export async function sendChatMessage(chatId: number, content: string): Promise<ChatMessageResponse> {
    const response = await api.post<ChatMessageResponse>(
        `/chats/${chatId}/messages`,
        { content }
    );

    return response.data;
}

