const express    = require('express');
const nodemailer = require('nodemailer');
const path       = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.static(path.join(__dirname)));  // kept as your original

// ── EMAIL CONFIG ──────────────────────────────────────────────

const GMAIL_USER = 'uma932244@gmail.com';
const GMAIL_PASS = 'sagd dlkr uucw ixdf'.replace(/\s/g, ''); // ✅ FIXED spaces

// ✅ FIXED SMTP CONFIG (IMPORTANT)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false   // ✅ FIX THIS LINE
  }
});

// ✅ Debug (added, not removing anything)
transporter.verify((err, success) => {
  if (err) {
    console.log("❌ SMTP ERROR:", err.message);
  } else {
    console.log("✅ SMTP READY");
  }
});

// ── CONTACT ROUTE ─────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields.' });
  }

  try {
    // ── MAIL 1: Notify Uma ──────────────────────────────────
    await transporter.sendMail({
      from: `"Portfolio Contact" <${GMAIL_USER}>`,
      to:   GMAIL_USER,
      subject: `📬 New Message: ${subject || 'General Inquiry'} — from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0a0a0f;color:#f0f0f8;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(45deg,#FEDA77,#F58529,#DD2A7B,#8134AF,#515BD4);padding:4px;"></div>
          <div style="padding:32px;">
            <h2 style="margin:0 0 8px;font-size:1.4rem;">New Contact Form Submission</h2>
            <p style="color:rgba(240,240,248,0.55);margin:0 0 24px;font-size:.9rem;">Someone reached out via your portfolio.</p>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(240,240,248,0.55);width:100px;font-size:.85rem;">Name</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);font-weight:600;">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(240,240,248,0.55);font-size:.85rem;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);"><a href="mailto:${email}" style="color:#DD2A7B;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(240,240,248,0.55);font-size:.85rem;">Subject</td>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);">${subject || '—'}</td>
              </tr>
            </table>
            <div style="margin-top:24px;">
              <p style="color:rgba(240,240,248,0.55);font-size:.85rem;margin-bottom:8px;">Message</p>
              <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;line-height:1.7;font-size:.95rem;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <div style="margin-top:24px;text-align:right;">
              <a href="mailto:${email}" style="background:linear-gradient(45deg,#DD2A7B,#8134AF);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:.9rem;">Reply to ${name} →</a>
            </div>
          </div>
        </div>
      `,
    });

    // ── MAIL 2: Auto-reply to sender ──────────────────────
    await transporter.sendMail({
      from: `"Umamaheshwara Reddy" <${GMAIL_USER}>`,
      to:   email,
      subject: `Thanks for reaching out, ${name}! 👋`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0a0a0f;color:#f0f0f8;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(45deg,#FEDA77,#F58529,#DD2A7B,#8134AF,#515BD4);padding:4px;"></div>
          <div style="padding:32px;">
            <h2 style="margin:0 0 8px;font-size:1.4rem;">Hey ${name}, thanks for reaching out! 🙌</h2>
            <p style="color:rgba(240,240,248,0.65);line-height:1.75;margin:16px 0;">
              I've received your message and will get back to you as soon as possible.
            </p>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;margin-bottom:24px;">
              <p style="margin:0;color:rgba(240,240,248,0.65);font-size:.9rem;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
            <p>Best regards,<br><b>Umamaheshwara Reddy</b></p>
          </div>
        </div>
      `,
    });

    return res.json({ success: true, message: 'Message sent! I will get back to you soon.' });

  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to send email. Please try again.' });
  }
});

// ✅ Route
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📬 Emails will be sent to: ${GMAIL_USER}`);
});