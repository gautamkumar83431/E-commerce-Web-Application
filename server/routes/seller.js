import express from 'express';
import nodemailer from 'nodemailer';
import SellerRequest from '../models/SellerRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({ from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`, to, subject, html });
};

// Submit seller request — optionally attach logged-in user
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, businessName, businessType, gst, address, description } = req.body;
    if (!name || !email || !phone || !businessName || !businessType || !address)
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });

    const existing = await SellerRequest.findOne({ email, status: 'pending' });
    if (existing)
      return res.status(400).json({ success: false, message: 'A request with this email is already pending' });

    // Try to find user by email to link account
    const user = await User.findOne({ email });

    const request = await SellerRequest.create({
      name, email, phone, businessName, businessType, gst, address, description,
      user: user?._id || null,
    });
    res.status(201).json({ success: true, message: 'Seller request submitted successfully!', request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin - get all seller requests
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await SellerRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin - approve or reject
router.patch('/:id', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const request = await SellerRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const isApproved = status === 'approved';
    const title = isApproved ? '🎉 Seller Request Approved!' : '❌ Seller Request Rejected';
    const message = isApproved
      ? `Congratulations ${request.name}! Your seller application for "${request.businessName}" has been approved.`
      : `We're sorry, your seller application for "${request.businessName}" has been rejected. Contact support for more info.`;

    // In-app notification if user account linked
    if (request.user) {
      await Notification.create({ user: request.user, title, message, type: 'system' });
    }

    // Email notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const emailHtml = isApproved
        ? `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
            <h2 style="color:#16a34a;">🎉 Seller Request Approved!</h2>
            <p>Hi <strong>${request.name}</strong>,</p>
            <p>Great news! Your seller application for <strong>${request.businessName}</strong> has been <strong style="color:#16a34a;">approved</strong>.</p>
            <p>You can now start listing your products on our platform. Login to your account to get started.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background:#2874f0;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">Go to Store</a>
            </div>
            <p style="color:#6b7280;font-size:13px;">Welcome to the seller community!</p>
          </div>`
        : `<div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
            <h2 style="color:#dc2626;">Seller Request Update</h2>
            <p>Hi <strong>${request.name}</strong>,</p>
            <p>We regret to inform you that your seller application for <strong>${request.businessName}</strong> has been <strong style="color:#dc2626;">rejected</strong>.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p style="color:#6b7280;font-size:13px;">Thank you for your interest in selling with us.</p>
          </div>`;

      sendEmail({ to: request.email, subject: title, html: emailHtml }).catch(err =>
        console.error('Seller email error:', err.message)
      );
    }

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
