export interface Document {
    id: number;
    filename: string;
    file_size: number;
    page_count: number | null;
    file_type: "pdf" | "docx";
    group_id: number | null;
}

export interface DocumentGroup {
    id: number;
    name: string;
    documents: Document[];
}