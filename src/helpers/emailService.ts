import nodemailer from 'nodemailer';
import UserModel from '../models/userModel';
import { IEvent } from '../models/eventModel';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendEventNotification = async (event: IEvent) => {
  try {
    // Get all active users
    const users = await UserModel.find({ isDeleted: false });

    // Format the date
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    for (const user of users) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `New Event: ${event.title}`,
        html: `
          <h2>New Event Announcement</h2>
          <h3>${event.title}</h3>
          <p><strong>Description:</strong> ${event.description}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Category:</strong> ${event.category}</p>
          ${event.poster?.optimized ? 
            `<img src="${process.env.BASE_URL}/${event.poster.optimized}" alt="Event Poster" style="max-width: 300px;">` 
            : ''}
          <p>We hope to see you there!</p>
        `
      };

      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Email notification error:', error);
  }
};