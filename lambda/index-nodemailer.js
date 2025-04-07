const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const ses = new AWS.SES({ region: 'us-west-2' });

// Create a transporter using SES
const transporter = nodemailer.createTransport({
    SES: { ses, aws: AWS }
});

exports.handler = async (event) => {
    console.log('Event received');
    
    try {
        // Parse the incoming request
        const requestBody = JSON.parse(event.body);
        const { recipientEmail, subject, date, images } = requestBody;
        
        console.log(`Processing request for ${recipientEmail} with ${images?.length || 0} images`);
        
        // Validate inputs
        if (!subject || !images || !Array.isArray(images) || images.length === 0) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: 'Invalid request parameters' })
            };
        }
        
        // Create email content
        let htmlBody = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    h2 { color: #0f598b; }
                    p { margin-bottom: 15px; }
                </style>
            </head>
            <body>
                <h2>Wedding Photo Memories</h2>
                <p>Date: ${date}</p>
                <p>Thank you for sharing your wedding memories! The photos are attached to this email.</p>
                <p>Please check the attachments to view your photos.</p>
            </body>
            </html>
        `;
        
        // Prepare attachments (as regular attachments, not inline)
        const attachments = [];
        
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const filename = image.name || `wedding-photo-${i+1}.jpg`;
            
            console.log(`Processing attachment: ${filename}`);
            
            attachments.push({
                filename: filename,
                content: image.data,
                encoding: 'base64'
            });
        }
        
        console.log(`Prepared ${attachments.length} attachments`);
        
        // Send email using nodemailer
        const mailOptions = {
            from: 'josephdodge8141@gmail.com', // Must be verified in SES
            to: recipientEmail,
            subject: subject,
            html: htmlBody,
            attachments: attachments
        };
        
        console.log('Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: 'Photos sent successfully',
                messageId: info.messageId
            })
        };
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: 'Error sending photos', 
                error: error.message
            })
        };
    }
}; 