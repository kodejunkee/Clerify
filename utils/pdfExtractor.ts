import { Buffer } from 'buffer';
import { readAsStringAsync } from 'expo-file-system/legacy';

// Polyfill for pdfjs-dist which expects a browser environment
if (typeof navigator === 'undefined') {
    global.navigator = {
        userAgent: 'react-native',
        platform: 'ios',
    } as any;
}
if (typeof window === 'undefined') {
    global.window = global as any;
}

const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// @ts-ignore
global.Buffer = global.Buffer || Buffer;

// Disable worker (load synchronously) to avoid bundling issues in RN
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = false;

export const extractTextFromPdf = async (uri: string): Promise<string> => {
    try {
        const base64 = await readAsStringAsync(uri, {
            encoding: 'base64',
        });

        // Load the document
        // Pass the data as a binary string (using available buffer/atob capabilities)
        // or typed array. PDF.js supports base64 input in recent versions via typed array conversion.
        const binaryString = global.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;

        let fullText = '';
        const numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    } catch (error) {
        console.error('PDF Extraction Error:', error);
        throw new Error('Failed to extract text. Ensure the PDF is not password protected or image-only.');
    }
}
