document.addEventListener('DOMContentLoaded', function() {
    const fileUpload = document.getElementById('file-upload');
    const imagePreview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('preview-container');
    const saveButton = document.getElementById('save-button');
    const uploadSection = document.getElementById('upload-section');
    const thankYouSection = document.getElementById('thank-you-section');
    const loadingSection = document.getElementById('loading-section');
    
    // Hardcoded recipient email
    const RECIPIENT_EMAIL = "josephdodge8141@gmail.com";
    
    // Lambda API endpoint
    const API_ENDPOINT = 'https://xre8g02p6k.execute-api.us-west-2.amazonaws.com/photo/send-photos';
    
    let uploadedFiles = [];
    
    fileUpload.addEventListener('change', function(e) {
        const files = e.target.files;
        
        if (files.length > 0) {
            previewContainer.classList.remove('hidden');
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type.match('image.*')) {
                    uploadedFiles.push(file);
                    displayImage(file, uploadedFiles.length - 1);
                }
            }
        }
    });
    
    function displayImage(file, index) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
            imageContainer.dataset.index = index;
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '×';
            deleteButton.addEventListener('click', function() {
                imageContainer.remove();
                uploadedFiles[index] = null;
                
                // Check if all images are deleted
                const hasImages = uploadedFiles.some(file => file !== null);
                if (!hasImages) {
                    previewContainer.classList.add('hidden');
                }
            });
            
            imageContainer.appendChild(img);
            imageContainer.appendChild(deleteButton);
            imagePreview.appendChild(imageContainer);
        };
        
        reader.readAsDataURL(file);
    }
    
    saveButton.addEventListener('click', async function() {
        // Filter out deleted files
        const filesToSend = uploadedFiles.filter(file => file !== null);
        
        if (filesToSend.length > 0) {
            // Show loading screen
            uploadSection.classList.add('hidden');
            loadingSection.classList.remove('hidden');
            
            try {
                // Convert images to base64 for sending to Lambda
                const imagePromises = filesToSend.map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            // Get just the base64 data without the prefix
                            const base64Data = reader.result.split(',')[1];
                            resolve({
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                data: base64Data
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                });
                
                const imageData = await Promise.all(imagePromises);
                
                // Prepare data for Lambda
                const today = new Date();
                const formattedDate = today.toISOString().split('T')[0];
                
                const requestData = {
                    recipientEmail: RECIPIENT_EMAIL,
                    subject: `Wedding Photo Memories - ${formattedDate}`,
                    date: formattedDate,
                    images: imageData
                };
                
                // Send data to Lambda
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to send photos');
                }
                
                // Show thank you message
                loadingSection.classList.add('hidden');
                thankYouSection.classList.remove('hidden');
            } catch (error) {
                console.error('Error sending photos:', error);
                alert('There was an error sending your photos. Please try again.');
                loadingSection.classList.add('hidden');
                uploadSection.classList.remove('hidden');
            }
        }
    });
}); 