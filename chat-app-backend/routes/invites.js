const Invite = require('../models/Invite');
const { v4: uuidv4 } = require("uuid");

router.post('/invite-email', authenticateToken, async (req, res) => {
  const { toEmail } = req.body;
  const senderId = req.user.id;

  try {
    const sender = await User.findById(senderId);
    const token = uuidv4();

    await Invite.create({
      senderId,
      recipientEmail: toEmail,
      token,
    });

    const acceptUrl = `http://localhost:5001/api/friends/respond/${token}/accept`;
    const declineUrl = `http://localhost:5001/api/friends/respond/${token}/decline`;

    const mailOptions = {
      from: `"Chatme" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `${sender.username} invited you to Chatme!`,
      html: `
        <p><strong>${sender.username}</strong> (${sender.email}) has invited you to join Chatme!</p>
        <p>Respond:</p>
        <a href="${acceptUrl}">✅ Accept</a> | <a href="${declineUrl}">❌ Decline</a>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Invitation sent via email" });
  } catch (err) {
    res.status(500).json({ message: "Error sending invitation", error: err.message });
  }
});
