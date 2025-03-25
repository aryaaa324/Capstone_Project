const { PDFDocument } = require('pdf-lib');
const { Bank, MasterDatabase, Observations } = require('./server'); // Adjusted path to server.js for model imports

async function generateReport(bankId, format) {
    const bankData = await Bank.findById(bankId);
    if (!bankData) {
        throw new Error('Bank not found');
    }
    
    const masterData = await MasterDatabase.find({ bank: bankId });
    const observationData = await Observations.find({ accountNo: { $in: masterData.map(entry => entry.accountNo) }});

    let reportBuffer;

    if (format === 'pdf') {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        let reportContent = `Report for Bank ID: ${bankId}\n\n`;

        reportContent += 'Bank Details:\n';
        reportContent += `Bank Name: ${bankData.bankName}\n`;
        reportContent += 'Branches:\n';
        reportContent += ` - ${bankData.branchName}, Location: ${bankData.branchLocation}\n`;

        reportContent += '\nMaster Database Entries:\n';
        masterData.forEach(entry => {
            reportContent += ` - Account No: ${entry.accountNo}, Name: ${entry.nameOfBorrower}, Amount: ${entry.sanctionedAmount}\n`;
        });

        reportContent += '\nObservations:\n';
        observationData.forEach(obs => {
            reportContent += ` - Query: ${obs.query}, Details: ${obs.details}\n`;
        });

        page.drawText(reportContent, { x: 50, y: page.getHeight() - 50 });
        reportBuffer = await pdfDoc.save();
    } else if (format === 'word') {
        let reportContent = `Report for Bank ID: ${bankId}\n\n`;
        reportContent += `Bank Name: ${bankData.bankName}\n`;
        reportContent += 'Branches:\n';
        reportContent += ` - ${bankData.branchName}, Location: ${bankData.branchLocation}\n`;

        reportContent += '\nMaster Database Entries:\n';
        masterData.forEach(entry => {
            reportContent += ` - Account No: ${entry.accountNo}, Name: ${entry.nameOfBorrower}, Amount: ${entry.sanctionedAmount}\n`;
        });

        reportContent += '\nObservations:\n';
        observationData.forEach(obs => {
            reportContent += ` - Query: ${obs.query}, Details: ${obs.details}\n`;
        });

        reportBuffer = Buffer.from(reportContent, 'utf-8');
    }

    return reportBuffer;
}

module.exports = { generateReport };
