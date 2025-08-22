
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { TemplatePanel } from './components/TemplatePanel';
import { OutputPanel } from './components/OutputPanel';
import { Footer } from './components/Footer';
import { ColumnSelectionModal } from './components/ColumnSelectionModal';
import { ConvertIcon } from './components/icons/ConvertIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { gridToTsv, wrapText } from './utils/asciiTableGenerator';

// Let TypeScript know that XLSX is available on the window object
declare const XLSX: any;

// Storage key for remembering templates
const TEMPLATE_MEMORY_KEY = 'aiDataFormatterTemplateMemory';

const App: React.FC = () => {
    // Input/Output State
    const [sourceText, setSourceText] = useState<string>('');
    const [exampleText, setExampleText] = useState<string>('');
    const [outputText, setOutputText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // File Handling State
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [exampleFile, setExampleFile] = useState<File | null>(null);

    // Loading/Process State
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isParsing, setIsParsing] = useState<boolean>(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    
    // Multi-step conversion flow state
    const [originalGrid, setOriginalGrid] = useState<string[][]>([]);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState<boolean[]>([]);

    // Template Memory State
    const [templateSignature, setTemplateSignature] = useState<string | null>(null);
    const [templateWasAutoLoaded, setTemplateWasAutoLoaded] = useState<boolean>(false);

    // =================================================================
    // Step 1: Process Source File
    // =================================================================
    useEffect(() => {
        if (!sourceFile) return;

        setIsParsing(true);
        setError(null);
        setOutputText(null);
        setSourceText('');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (!data) throw new Error("Failed to read file data.");
                
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                if (!sheetName) throw new Error("No sheets found in the workbook.");
                
                const worksheet = workbook.Sheets[sheetName];
                const grid: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" })
                    .map((row: any[]) => row.map(cell => String(cell)));
                
                if (grid.length > 0 && grid[0].length > 0) {
                    setOriginalGrid(grid);
                    
                    const headers = grid[0] || [];
                    const signature = headers.join('|');
                    const memory = JSON.parse(localStorage.getItem(TEMPLATE_MEMORY_KEY) || '{}');

                    // Check if we already know this file structure
                    if (memory[signature] && memory[signature].selectedColumns) {
                        // We've seen this structure before, skip the modal
                        const savedSelection = memory[signature].selectedColumns;
                        setSelectedColumns(savedSelection);

                        const processedGrid = grid.map(row => row.filter((_, i) => savedSelection[i]));
                        const tsvText = gridToTsv(processedGrid);
                        setSourceText(tsvText);
                        
                        const selectedHeaders = headers.filter((_, i) => savedSelection[i]);
                        const finalSignature = selectedHeaders.join('|');
                        setTemplateSignature(finalSignature);

                        if (memory[finalSignature]?.template) {
                             setExampleText(memory[finalSignature].template);
                             setTemplateWasAutoLoaded(true);
                        } else {
                            setTemplateWasAutoLoaded(false);
                        }

                    } else {
                        // New file structure, open the column chooser
                        setSelectedColumns(new Array(grid[0].length).fill(true));
                        setIsColumnModalOpen(true); // Trigger column selection
                    }
                } else {
                    throw new Error("Sheet appears to be empty.");
                }

            } catch (parseError) {
                const errorMessage = parseError instanceof Error ? parseError.message : `Could not parse the source file.`;
                setError(`File Error: ${errorMessage}`);
                setSourceText('');
            } finally {
                setIsParsing(false);
                setSourceFile(null); // Reset file input
            }
        };
        reader.onerror = () => {
            setError('An error occurred while reading the file.');
            setIsParsing(false);
            setSourceFile(null);
        }
        reader.readAsArrayBuffer(sourceFile);
    }, [sourceFile]);

    // =================================================================
    // Step 2: Handle Column Selection & Finalize Source Text
    // =================================================================
    const handleColumnSelectionConfirm = () => {
        // Filter the grid based on the user's column selection
        const processedGrid = originalGrid.map(row => row.filter((_, i) => selectedColumns[i]));

        // Convert the filtered grid to TSV and set it as the source text
        const tsvText = gridToTsv(processedGrid);
        setSourceText(tsvText);
        
        // Create a signature from the selected headers to use for template memory
        const headers = (originalGrid[0] || []);
        const signature = headers.join('|');
        const selectedHeaders = headers.filter((_, i) => selectedColumns[i]);
        const finalSignature = selectedHeaders.join('|');
        setTemplateSignature(finalSignature);

        // Save the column selection for this file structure
        try {
            const memory = JSON.parse(localStorage.getItem(TEMPLATE_MEMORY_KEY) || '{}');
            memory[signature] = { ...memory[signature], selectedColumns };
            localStorage.setItem(TEMPLATE_MEMORY_KEY, JSON.stringify(memory));

            // Check if a template for the final selection exists
             if (memory[finalSignature]?.template) {
                setExampleText(memory[finalSignature].template);
                setTemplateWasAutoLoaded(true);
            } else {
                setTemplateWasAutoLoaded(false);
            }
        } catch (e) {
            console.error("Failed to save to template memory:", e);
        }

        // Close the column selection modal
        setIsColumnModalOpen(false);
    };

    // =================================================================
    // Process Example File
    // =================================================================
    useEffect(() => {
        if (!exampleFile) return;
        setIsParsing(true);
        setError(null);
        setTemplateWasAutoLoaded(false); // Manual upload overrides auto-load
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                if (typeof data === 'string') {
                    setExampleText(data);
                } else {
                    throw new Error("Failed to read file as text.");
                }
            } catch (parseError) {
                const errorMessage = parseError instanceof Error ? parseError.message : `Could not parse the example file.`;
                setError(`File Error: ${errorMessage}`);
                setExampleText('');
            } finally {
                setIsParsing(false);
                setExampleFile(null);
            }
        };
        reader.onerror = () => {
            setError('An error occurred while reading the file.');
            setIsParsing(false);
            setExampleFile(null);
        }
        reader.readAsText(exampleFile);
    }, [exampleFile]);

    // =================================================================
    // Step 3: Convert using AI
    // =================================================================
    const handleConvert = useCallback(async () => {
        if (!sourceText.trim()) {
            setError('Quelldaten dürfen nicht leer sein.');
            return;
        }
        if (!exampleText.trim()) {
            setError('Beispielformat darf nicht leer sein.');
            return;
        }
        
        setError(null);
        setOutputText(null);
        setIsLoading(true);

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `You are an expert data formatter. Your task is to reformat the entire 'Source Data' by applying the structure and style demonstrated in the 'Example Output Format'. The example shows *how* to format the data, but you must process and convert all data from the source file. Do not omit any data from the source.

**Example Output Format (This demonstrates the desired structure):**
${exampleText}

**Source Data (Apply the formatting logic to this entire dataset):**
${sourceText}

**Formatting Rules:**
1. Each output line MUST NOT exceed 40 characters.
2. Your response must contain ONLY the formatted text.
3. Do NOT include any explanations, markdown formatting (like \`\`\`), code snippets, or separators like '---'. The output must be pure, clean text.

**Formatted Output (Containing all converted data from the source):**`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 0 }
                }
            });

            if (controller.signal.aborted) return;
            
            const resultText = response.text;
            const wrappedText = wrapText(resultText, 40); // Enforce 40-character limit
            setOutputText(wrappedText);

            // Save template to memory on success
            if (templateSignature) {
                try {
                    const memory = JSON.parse(localStorage.getItem(TEMPLATE_MEMORY_KEY) || '{}');
                    memory[templateSignature] = { ...memory[templateSignature], template: exampleText };
                    localStorage.setItem(TEMPLATE_MEMORY_KEY, JSON.stringify(memory));
                } catch (e) {
                    console.error("Failed to save to template memory:", e);
                }
            }

        } catch (e) {
            if (controller.signal.aborted) return;
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during conversion.';
            setError(`Konvertierung fehlgeschlagen: ${errorMessage}`);
            setOutputText(null);
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
                setAbortController(null);
            }
        }
    }, [sourceText, exampleText, templateSignature]);

    // =================================================================
    // Step 4: Download
    // =================================================================
    const handleDownload = () => {
        if (!outputText) return;
        triggerDownload(outputText, 'output.txt');
    };
    
    // =================================================================
    // Utilities & Cancellation
    // =================================================================
    const triggerDownload = (content: string, filename: string) => {
        const bom = "\uFEFF"; // BOM for UTF-8 Excel compatibility
        const blob = new Blob([bom + content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCancel = () => {
        if (abortController) {
            abortController.abort();
        }
        setIsLoading(false);
        setAbortController(null);
        setError(null);
    };

    // =================================================================
    // Render Method
    // =================================================================
    return (
        <div className="flex flex-col min-h-screen font-sans text-slate-200 bg-slate-900">
            <Header />
            <main className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <InputPanel 
                        sourceText={sourceText}
                        setSourceText={setSourceText}
                        setSourceFile={setSourceFile}
                        isParsing={isParsing || isColumnModalOpen}
                    />
                    <TemplatePanel
                        exampleText={exampleText}
                        setExampleText={setExampleText}
                        setExampleFile={setExampleFile}
                        isParsing={isParsing}
                        wasAutoLoaded={templateWasAutoLoaded}
                    />
                 </div>

                 <div className="flex justify-center my-8">
                    {isLoading ? (
                         <button
                            onClick={handleCancel}
                            className="w-full max-w-xs flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
                        >
                            <SpinnerIcon />
                            <span>Konvertierung abbrechen</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleConvert}
                            className="w-full max-w-xs flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!sourceText.trim() || !exampleText.trim() || isParsing}
                        >
                            <ConvertIcon />
                            <span>Konvertieren</span>
                        </button>
                    )}
                 </div>

                <OutputPanel 
                    error={error}
                    isLoading={isLoading}
                    outputText={outputText}
                    onDownload={handleDownload}
                    onCancel={handleCancel}
                />
            </main>
            <Footer />

            <ColumnSelectionModal
                isOpen={isColumnModalOpen}
                headers={originalGrid[0] || []}
                selectedColumns={selectedColumns}
                onToggleColumn={(index) => {
                    const newSelection = [...selectedColumns];
                    newSelection[index] = !newSelection[index];
                    setSelectedColumns(newSelection);
                }}
                onConfirm={handleColumnSelectionConfirm}
                onCancel={() => {
                    setIsColumnModalOpen(false);
                    setOriginalGrid([]);
                }}
            />

        </div>
    );
};

export default App;
