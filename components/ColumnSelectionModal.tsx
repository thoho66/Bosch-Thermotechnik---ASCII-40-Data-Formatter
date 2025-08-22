
import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ColumnSelectionModalProps {
    isOpen: boolean;
    headers: string[];
    selectedColumns: boolean[];
    onToggleColumn: (index: number) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ColumnSelectionModal: React.FC<ColumnSelectionModalProps> = ({
    isOpen,
    headers,
    selectedColumns,
    onToggleColumn,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) {
        return null;
    }
    
    const handleSelectAll = () => {
        const allSelected = selectedColumns.every(Boolean);
        const newSelection = new Array(headers.length).fill(!allSelected);
        newSelection.forEach((_, i) => {
            if (selectedColumns[i] !== newSelection[i]) {
                onToggleColumn(i);
            }
        });
    };

    const allSelected = selectedColumns.every(Boolean);
    const noneSelected = !selectedColumns.some(Boolean);

    return (
        <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 id="modal-title" className="text-lg font-bold text-slate-200">Einzuschließende Spalten auswählen</h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="flex justify-end mb-4">
                         <button
                            onClick={handleSelectAll}
                            className="text-sm text-sky-400 hover:text-sky-300 font-semibold"
                        >
                            {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
                        </button>
                    </div>
                    <ul className="space-y-3">
                        {headers.map((header, index) => (
                            <li key={index}>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedColumns[index]}
                                        onChange={() => onToggleColumn(index)}
                                        className="h-5 w-5 rounded bg-slate-700 border-slate-500 text-sky-500 focus:ring-sky-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800"
                                    />
                                    <span className="text-slate-300 group-hover:text-slate-100">{header || `(Spalte ${index + 1})`}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex justify-end items-center p-4 border-t border-slate-700 space-x-4">
                    <button
                        onClick={onCancel}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                        Abbrechen
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={noneSelected}
                    >
                        Auswahl bestätigen
                    </button>
                </div>
            </div>
        </div>
    );
};
