import express from 'express';
import verifyToken from '../controllers/auth.js';
import { transporter } from '../config/email.js';
import markdown from 'markdown-it';
import hljs from 'highlight.js';

const router = express.Router();
const md = new markdown({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code class="language-${lang}">${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`;
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

router.post('/send-email', verifyToken, async (req, res) => {
  const { to, subject, content } = req.body;
  const userId = req.user.id;

  if (!to || !content) {
    return res.status(400).json({ message: 'Recipient and content are required' });
  }

  try {
    // Convert markdown to HTML
    const htmlContent = md.render(content);

    // Generate a topic from the first line of content if subject is empty
    const autoSubject = !subject ? generateTopicFromContent(content) : subject;

    // Create email options with inline styling for better email client compatibility
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: autoSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="padding: 15px; background-color: #f7f9fc; border-radius: 8px;">
            <style>
              pre.hljs { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 20px 0; }
              code { font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 14px; }
              h1 { font-size: 24px; margin-top: 24px; margin-bottom: 16px; font-weight: 600; color: #333; }
              h2 { font-size: 20px; margin-top: 24px; margin-bottom: 16px; font-weight: 600; color: #333; }
              h3 { font-size: 18px; margin-top: 24px; margin-bottom: 16px; font-weight: 600; color: #333; }
              p { margin-bottom: 16px; line-height: 1.5; }
              ul, ol { margin-bottom: 16px; padding-left: 24px; }
              li { margin-bottom: 8px; }
              a { color: #3a5bc7; text-decoration: underline; }
              blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin-left: 0; color: #666; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f3f4f6; }
              img { max-width: 100%; height: auto; }
              .hljs-keyword { color: #8959a8; }
              .hljs-string { color: #718c00; }
              .hljs-comment { color: #8e908c; }
              .hljs-number { color: #f5871f; }
              .hljs-literal { color: #f5871f; }
              .hljs-tag { color: #c82829; }
              .hljs-attr { color: #eab700; }
              .hljs-selector-id { color: #c82829; }
              .hljs-selector-class { color: #eab700; }
              .hljs-attribute { color: #eab700; }
              .hljs-symbol { color: #3e999f; }
              .hljs-built_in { color: #4271ae; }
              .hljs-title { color: #4271ae; }
              .hljs-section { color: #4271ae; }
              .hljs-name { color: #c82829; }
            </style>
            ${htmlContent}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Sent via AI Assistant
          </p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Log this action
    console.log(`Email sent by user ${userId} to ${to}`);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

// Helper function to generate a topic from the content
function generateTopicFromContent(content) {
  // Extract the first line and use it as the subject
  const firstLine = content.split('\n')[0];

  // Remove markdown formatting from the first line
  let topic = firstLine
    .replace(/^#+\s+/, '') // Remove heading markers
    .replace(/\*\*/g, '') // Remove bold formatting
    .replace(/\*/g, '') // Remove italic formatting
    .replace(/`/g, '') // Remove code formatting
    .trim();

  // Limit the topic length to reasonable size for an email subject
  if (topic.length > 100) {
    topic = topic.substring(0, 97) + '...';
  }

  // If the first line is empty or doesn't provide a good topic
  if (!topic || topic.length < 3) {
    return 'Information from AI Assistant';
  }

  return topic;
}

export default router;
