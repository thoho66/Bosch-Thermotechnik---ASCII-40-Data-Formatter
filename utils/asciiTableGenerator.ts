
/**
 * Converts a 2D string array (grid) into a Tab-Separated Values (TSV) string.
 * This is useful for creating a simple text representation of spreadsheet data.
 * @param grid The 2D array of strings, where each inner array is a row.
 * @returns A string in TSV format.
 */
export function gridToTsv(grid: string[][]): string {
    if (!grid || grid.length === 0) return '';
    return grid.map(row => 
        row.join('\t')
    ).join('\n');
}

/**
 * Wraps text to a specified maximum line length by breaking long lines.
 * It prioritizes breaking at the last space within the line length limit
 * but will perform a hard break if no suitable space is found.
 * @param text The input text block.
 * @param maxLength The maximum number of characters per line (e.g., 40).
 * @returns The wrapped text as a single string.
 */
export function wrapText(text: string, maxLength: number): string {
    if (!text) return '';
    const lines = text.split('\n');
    const wrappedLines: string[] = [];

    lines.forEach(line => {
        let currentLine = line;
        while (currentLine.length > maxLength) {
            // Find the last space within the limit
            let breakPoint = currentLine.lastIndexOf(' ', maxLength);
            // If no space is found, or it's at the beginning, hard break
            if (breakPoint <= 0) {
                breakPoint = maxLength;
            }
            wrappedLines.push(currentLine.substring(0, breakPoint));
            currentLine = currentLine.substring(breakPoint).trim();
        }
        wrappedLines.push(currentLine);
    });

    return wrappedLines.join('\n');
}
