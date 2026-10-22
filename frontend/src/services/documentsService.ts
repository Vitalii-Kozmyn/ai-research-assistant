import api from "./api";

export interface Document {
    id: number;
    filename: string;
    file_type: string;
    file_size: number;
    page_count: number | null;
    status: string;
    created_at: string;
}

export interface DocumentGroup {
    id: number;
    name: string;
    created_at: string;
    updated_at: string | null;
}

export async function getDocuments(): Promise<Document[]> {
    const response = await api.get<Document[]>("/documents");
    return response.data;
}

export async function getDocumentGroups(): Promise<DocumentGroup[]> {
    const response = await api.get<DocumentGroup[]>("/document-groups");
    return response.data;
}

export async function getGroupDocuments(groupId: number): Promise<Document[]> {
    const response = await api.get<Document[]>(`/document-groups/${groupId}/documents`);
    return response.data;
}

export async function uploadDocument(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<Document>("/documents/upload", formData);
    return response.data;
}

export async function createDocumentGroup(name: string): Promise<DocumentGroup> {
    const response = await api.post<DocumentGroup>("/document-groups", { name });
    return response.data;
}

export async function renameDocumentGroup(groupId: number, name: string): Promise<DocumentGroup> {
    const response = await api.put<DocumentGroup>(`/document-groups/${groupId}`, { name });
    return response.data;
}

export async function deleteDocumentGroup(groupId: number): Promise<void> {
    await api.delete(`/document-groups/${groupId}`);
}

export async function addDocumentToGroup(groupId: number, documentId: number): Promise<void> {
    await api.post(`/document-groups/${groupId}/documents`, { document_id: documentId });
}

export async function removeDocumentFromGroup(groupId: number, documentId: number): Promise<void> {
    await api.delete(`/document-groups/${groupId}/documents/${documentId}`);
}

export async function deleteDocument(documentId: number): Promise<void> {
    await api.delete(`/documents/${documentId}`);
}
