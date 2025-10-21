import { createWorker } from 'tesseract.js';
import { getDocument } from 'pdfjs-dist';

// Core OCR service for detecting text and field positions in PDF forms
export class PdfOcrDetector {
    constructor() {
        this.worker = createWorker();
    }

    async init() {
        await this.worker.load();
        await this.worker.loadLanguage('eng+pol');
        await this.worker.initialize('eng+pol');
    }

    async detectFields(pdfUrl) {
        const pdf = await getDocument(pdfUrl).promise;
        const fieldMappings = [];

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            const { data: { text, words } } = await this.worker.recognize(imageData);

            // Example field detection logic
            words.forEach(word => {
                if (/Nazwisko:|PESEL:|Adres:/.test(word.text)) {
                    fieldMappings.push({
                        label: word.text,
                        coordinates: word.bbox
                    });
                }
            });
        }

        return fieldMappings;
    }

    async terminate() {
        await this.worker.terminate();
    }
}
