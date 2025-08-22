import React, { useRef, useState, DragEvent } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface InputPanelProps {
    sourceText: string;
    setSourceText: (text: string) => void;
    setSourceFile: (file: File | null) => void;
    isParsing: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ sourceText, setSourceText, setSourceFile, isParsing }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSourceFile(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSourceFile(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative flex flex-col bg-slate-800/50 rounded-lg p-4 gap-4 h-full border border-slate-700">
            {isParsing && (
                <div className="absolute inset-0 bg-slate-800/80 flex flex-col items-center justify-center rounded-lg z-10">
                    <SpinnerIcon />
                    <span className="mt-2 text-slate-300">Datei wird verarbeitet...</span>
                </div>
            )}
            <label htmlFor="input-textarea" className="font-bold text-lg text-slate-300">
                1. Quelldatei
            </label>

            <div
                onClick={openFileDialog}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors duration-200 ${isDragging ? 'border-sky-500 bg-sky-900/20' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800'}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".xlsx, .xls, .csv"
                />
                <UploadIcon />
                <p className="mt-2 text-sm text-center text-slate-400">
                    <span className="font-semibold text-sky-400">Quelldatei hochladen</span> oder per Drag & Drop
                </p>
                <p className="text-xs text-slate-500">XLSX, XLS, oder CSV</p>
            </div>

            <div className="flex items-center gap-4">
                <hr className="flex-grow border-t border-slate-700" />
                <span className="text-slate-500 text-xs font-semibold">ODER</span>
                <hr className="flex-grow border-t border-slate-700" />
            </div>

            <textarea
                id="input-textarea"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Rohdaten hier einfügen (z.B. aus Excel kopiert)"
                className="w-full flex-grow bg-slate-900 border border-slate-600 rounded-md p-4 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none font-mono text-sm"
                rows={10}
            />
        </div>
    );
};