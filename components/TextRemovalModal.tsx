import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface TextRemovalModalProps {
    isOpen: boolean;
    onConfirm: (textToRemove: string) => void;
    onCancel: () => void;
    initialText?: string;
}

export const TextRemovalModal: React.FC<TextRemovalModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    initialText,
}) => {
    const [textToRemove, setTextToRemove] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTextToRemove(initialText || '');
        }
    }, [isOpen, initialText]);

    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        onConfirm(textToRemove);
    };
    
    const handleSkip = () => {
        onConfirm(''); // Pass empty string to signify skipping removal
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-md flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 id="modal-title" className="text-lg font-bold text-slate-200">Remove Text Before Conversion</h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <label htmlFor="text-to-remove" className="block text-sm font-medium text-slate-300">
                        Enter text to remove from all cells (optional):
                    </label>
                    <input
                        id="text-to-remove"
                        type="text"
                        value={textToRemove}
                        onChange={(e) => setTextToRemove(e.target.value)}
                        placeholder="e.g., 'Note:' or a specific phrase"
                        className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none font-sans text-sm"
                    />
                    <p className="text-xs text-slate-400">This action is case-insensitive and will remove all occurrences of the entered text.</p>
                </div>

                <div className="flex justify-end items-center p-4 border-t border-slate-700 space-x-4">
                    <button
                        onClick={onCancel}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSkip}
                        className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                        Skip &amp; Convert
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!textToRemove}
                        title={!textToRemove ? "Enter text to enable removal" : ""}
                    >
                        Remove &amp; Convert
                    </button>
                </div>
            </div>
        </div>
    );
};