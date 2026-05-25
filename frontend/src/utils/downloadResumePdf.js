import html2pdf from 'html2pdf.js';

const sanitizeFilename = (name) =>
    String(name || 'Candidate')
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_') || 'Candidate';

/**
 * Generate PDF from the resume preview DOM element.
 * @param {HTMLElement} element - root element to capture
 * @param {string} candidateName - used for filename
 */
export const downloadResumePdf = async (element, candidateName) => {
    if (!element) throw new Error('Resume preview element not found');

    const filename = `${sanitizeFilename(candidateName)}_Resume.pdf`;

    const options = {
        margin: [10, 10, 10, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    await html2pdf().set(options).from(element).save();
};

export default downloadResumePdf;
