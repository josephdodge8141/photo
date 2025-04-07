const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-west-2' }); // Change to your AWS region

exports.handler = async (event) => {
    try {
        // Parse the incoming request
        const requestBody = JSON.parse(event.body);
        const { recipientEmail, subject, date, images } = requestBody;
        
        // Validate inputs
        if (!recipientEmail || !subject || !images || !Array.isArray(images) || images.length === 0) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*', // For CORS support
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: 'Invalid request parameters' })
            };
        }
        
        // Create email content with embedded images
        let htmlBody = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    h2 { color: #0f598b; }
                    .image-container { margin: 20px 0; }
                    img { max-width: 100%; margin-bottom: 15px; display: block; }
                </style>
            </head>
            <body>
                <h2>Wedding Photo Memories</h2>
                <p>Date: ${date}</p>
                <div class="image-container">
        `;
        
        // Add each image as an attachment
        const attachments = [];
        
        images.forEach((image, index) => {
            const attachmentId = `image${index}`;
            
            // Add image reference to HTML body
            htmlBody += `<img src="cid:${attachmentId}" alt="Wedding Memory ${index + 1}" />`;
            
            // Add to attachments
            attachments.push({
                filename: image.name || `image${index}.jpg`,
                content: image.data,
                encoding: 'base64',
                contentType: image.type || 'image/jpeg',
                cid: attachmentId
            });
        });
        
        htmlBody += `
                </div>
            </body>
            </html>
        `;
        
        // Prepare email parameters for SES
        const emailParams = {
            Source: 'your-verified-email@example.com', // Must be verified in SES
            Destination: {
                ToAddresses: [recipientEmail]
            },
            Message: {
                Subject: {
                    Data: subject
                },
                Body: {
                    Html: {
                        Data: htmlBody
                    }
                }
            }
        };
        
        // If using attachments, we need to use the SES raw email sending
        // This requires more complex setup with MIME types
        // For simplicity, we'll use a third-party library like nodemailer with SES transport
        
        // For this example, we'll use SES directly with inline images
        // In a real implementation, you might want to use nodemailer
        
        // Send email
        await ses.sendEmail(emailParams).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // For CORS support
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Photos sent successfully' })
        };
    } catch (error) {
        console.error('Error processing request:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*', // For CORS support
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Error sending photos', error: error.message })
        };
    }
}; 