import type { MouseEvent } from "react";
import type { Document } from "../services/documentsService";

interface FileItemProps {
    document: Document;
    selected: boolean;
    disabled?: boolean;
    onToggle: (documentId: number) => void;
    onContextMenu: (
        documentId: number,
        x: number,
        y: number
    ) => void;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileItem({document, selected, disabled = false, onToggle, onContextMenu,}: FileItemProps) {
    const isPdf = document.file_type.toLowerCase().includes("pdf");

    function handleContextMenu(event: MouseEvent<HTMLDivElement>) {
        event.preventDefault();
        onContextMenu(document.id, event.clientX, event.clientY);
    }

    return (
        <div
            className={`file-item ${selected ? "file-item--selected" : ""}`}
            onContextMenu={handleContextMenu}
        >
            <input
                className="file-checkbox"
                type="checkbox"
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(document.id)}
                aria-label={`Select ${document.filename}`}
            />

            <span className="file-type-icon" aria-hidden="true">
                {isPdf ? "📕" : "📘"}
            </span>

            <div className="file-info">
                <span className="file-name" title={document.filename}>
                    {document.filename}
                </span>

                <span className="file-meta">
                    {formatFileSize(document.file_size)}
                    {" · "}
                    {document.page_count ?? "—"}p
                </span>

                {document.status !== "processed" && (
                    <span className="file-status">
                        {document.status}
                    </span>
                )}
            </div>
        </div>
    );
}
