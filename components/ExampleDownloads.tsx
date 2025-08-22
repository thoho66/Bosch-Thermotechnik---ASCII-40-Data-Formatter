import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

const exampleTxt = `Gerätebeschreibung:
- Hybridsystem Compress Hybrid 5800i G
- All-In-One-Heizung, vorbereitet für
  den Anschluss einer Luft-Wasser-Wärme-
  pumpe Außeneinheit
- OptiEnergy-Hybridsysteme ohne Puffer-
  speicher möglich

Ausstattung:
- Heizkreispumpe und Pumpe für
  Wärmepumpenkreis integriert
- Neue XCU Steuereinheit mit integrier-
  ten Hybridfunktionen

Hinweis:
- Einfach online: K 40 RF im Lieferum-
  fang enthalten.`;

const exampleCsv = `"GERAETEBESCHREIBUNG_BULLETS","AUSSTATTUNG","HINWEIS"
"- Hybridsystem Compress Hybrid 5800i G","- Heizkreispumpe und Pumpe für Wärmepumpenkreis integriert","- Einfach online: K 40 RF im Lieferumfang enthalten."
"- All-In-One-Heizung, vorbereitet für den Anschluss einer Luft-Wasser-Wärmepumpe Außeneinheit","- Neue XCU Steuereinheit mit integrierten Hybridfunktionen",""
"- OptiEnergy-Hybridsysteme ohne Pufferspeicher möglich","",""
`;

const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const ExampleDownloads: React.FC = () => {
    return (
        <div className="bg-slate-800/50 rounded-lg p-4 sm:p-5 border border-slate-700 mb-8">
            <h2 className="text-lg font-bold text-slate-300 mb-2">View Example Output</h2>
            <p className="text-sm text-slate-400 mb-4">
                Download these sample files to see how the converter formats product descriptions into TXT and CSV files.
            </p>
            <div className="flex flex-wrap gap-4">
                <button 
                    onClick={() => triggerDownload(exampleTxt, 'example-output.txt', 'text/plain;charset=utf-8')}
                    className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                >
                    <DownloadIcon />
                    <span>Download Example .txt</span>
                </button>
                <button 
                    onClick={() => triggerDownload(exampleCsv, 'example-output.csv', 'text/csv;charset=utf-8')}
                    className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                >
                    <DownloadIcon />
                    <span>Download Example .csv</span>
                </button>
            </div>
        </div>
    );
};
