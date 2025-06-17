
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';

// Function to generate a random OTP
export const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};



// Function to send OTP via email
export const sendOTPEmail = async (toEmail, otp) => {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kssayooj35@gmail.com', // Replace with your email
            pass: 'yeoa lcdl caof mmys', // Replace with your email password
        },
    });

    // Email options
    const mailOptions = {
        from: 'kssayooj35@gmail.com', // Replace with your email
        to: toEmail,
        subject: 'Your OTP for Verification',
        text: `Your OTP is: ${otp}. `,
    };

    try {
        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error; // You might want to handle the error appropriately in your application
    }
};