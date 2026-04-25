// filepath: sebo-pwa/sebo-pwa/src/pdfUtils.js
const pdfUtils = {
    uploadPDF: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const pdfData = event.target.result;
                // Here you would typically save the PDF data to your database or storage
                resolve(pdfData);
            };
            reader.onerror = function(error) {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    },

    displayPDF: function(pdfData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found');
            return;
        }
        const iframe = document.createElement('iframe');
        iframe.src = pdfData;
        iframe.style.width = '100%';
        iframe.style.height = '600px'; // Adjust height as needed
        container.innerHTML = ''; // Clear previous content
        container.appendChild(iframe);
    },

    removePDF: function(pdfPath) {
        // Logic to remove the PDF from storage/database
        console.log(`Removing PDF at path: ${pdfPath}`);
        // Implement removal logic here
    }
};

export default pdfUtils;