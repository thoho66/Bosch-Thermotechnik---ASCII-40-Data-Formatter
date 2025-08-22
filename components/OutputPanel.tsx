
import React, { useState, useEffect } from 'react';
import { ErrorIcon } from './icons/ErrorIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface OutputPanelProps {
    error: string | null;
    isLoading: boolean;
    outputText: string | null;
    onDownload: () => void;
    onCancel: () => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ error, isLoading, outputText, onDownload, onCancel }) => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (outputText !== null) {
            setIsCopied(false);
        }
    }, [outputText]);

    const handleCopy = () => {
        if (!outputText) return;
        navigator.clipboard.writeText(outputText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                 <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center rounded-lg z-10">
                    <SpinnerIcon />
                    <span className="mt-4 text-slate-300">Ergebnis wird generiert...</span>
                    <button
                        onClick={onCancel}
                        className="mt-4 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-md transition-all duration-200"
                    >
                        Abbrechen
                    </button>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-red-400 text-center">
                    <ErrorIcon />
                    <span className="mt-2 font-semibold">Ein Fehler ist aufgetreten</span>
                    <p className="text-sm text-red-500 max-w-md">{error}</p>
                </div>
            );
        }

        if (outputText !== null) {
            return (
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-4 bg-green-900/50 border border-green-700 rounded-full">
                         <CheckIcon />
                    </div>
                    <h3 className="mt-4 font-bold text-lg text-green-300">Konvertierung erfolgreich!</h3>
                    <p className="text-sm text-slate-400">Ihr Ergebnis steht zum Download bereit.</p>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center h-full text-slate-500 text-center">
               Das konvertierte Ergebnis wird hier erscheinen.
           </div>
        );
    };

    const hasContent = !isLoading && !error && outputText !== null;

    return (
        <div className="flex flex-col bg-slate-800/50 rounded-lg min-h-[30vh] border border-slate-700">
            <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-wrap gap-2">
                <h2 className="font-bold text-lg text-slate-300">Ergebnis</h2>
                {hasContent && (
                     <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-md transition-all duration-200"
                            title="In die Zwischenablage kopieren"
                        >
                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                            <span>{isCopied ? 'Kopiert!' : 'Kopieren'}</span>
                        </button>
                        <button
                            onClick={onDownload}
                            className="flex items-center gap-1.5 text-sm bg-sky-600 hover:bg-sky-500 text-white font-semibold py-1 px-3 rounded-md transition-colors duration-200"
                            title="Download als .txt"
                        >
                            <DownloadIcon />
                            <span>Download .txt</span>
                        </button>
                    </div>
                )}
            </div>
            
            <div className="relative w-full flex-grow bg-slate-900 rounded-b-lg p-6 overflow-auto">
                {renderContent()}
            </div>
        </div>
    );
};
