package com.library.lms.librario.service.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.library.lms.librario.exception.MailSendException;

import java.io.File;
import java.io.UnsupportedEncodingException;

@Service
public class MailService {

    private final JavaMailSender mailSender;
    private static final String FROM_EMAIL = "noreply@librario.com";   // ✅ your sender email
    private static final String FROM_NAME = "Librario Team";          // ✅ branding

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a styled HTML email
     */
    @Async   // ✅ optional async (enable with @EnableAsync in a config class)
    public void send(String to, String subject, String bodyContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // ✅ From (with brand name)
            helper.setFrom(FROM_EMAIL, FROM_NAME);

            helper.setTo(to);
            helper.setSubject(subject);

            // ✅ HTML template wrapper
            String htmlTemplate =
                    "<!DOCTYPE html>" +
                            "<html>" +
                            "<head>" +
                            "  <meta charset='UTF-8'>" +
                            "  <style>" +
                            "    body { font-family: Arial, sans-serif; background:#f9f9f9; color:#333; }" +
                            "    .container { max-width:600px; margin:20px auto; background:#fff; padding:20px;" +
                            "                 border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1); }" +
                            "    .header { text-align:center; padding-bottom:15px; border-bottom:2px solid #eee; }" +
                            "    .footer { margin-top:20px; font-size:12px; text-align:center; color:#888;" +
                            "               border-top:1px solid #eee; padding-top:10px; }" +
                            "    .btn { display:inline-block; margin-top:10px; padding:10px 15px;" +
                            "            background:#2E86C1; color:#fff; text-decoration:none;" +
                            "            border-radius:5px; font-weight:bold; }" +
                            "    .btn:hover { background:#1B4F72; }" +
                            "  </style>" +
                            "</head>" +
                            "<body>" +
                            "  <div class='container'>" +
                            "    <div class='header'>" +
                            "      <img src='https://img.icons8.com/fluency/96/books.png' alt='Library Logo'/>" +
                            "      <h2 style='color:#2E86C1;'>📚 Librario</h2>" +
                            "    </div>" +
                            "    <div class='content'>" +
                            bodyContent +  // user-provided content (already HTML)
                            "    </div>" +
                            "    <div class='footer'>" +
                            "      <p>&copy; 2025 Librario. All rights reserved.</p>" +
                            "      <p><a href='http://your-frontend-url' style='color:#2E86C1;'>Visit Librario</a></p>" +
                            "    </div>" +
                            "  </div>" +
                            "</body>" +
                            "</html>";

            helper.setText(htmlTemplate, true); // ✅ true = enable HTML

            mailSender.send(message);

        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new MailSendException("❌ Failed to send email to " + to, e);
        }
    }

    /**
     * Example: send an email with attachment
     */
    public void sendWithAttachment(String to, String subject, String bodyContent, String filePath) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(FROM_EMAIL, FROM_NAME);
            helper.setTo(to);
            helper.setSubject(subject);

            helper.setText(bodyContent, true);

            FileSystemResource file = new FileSystemResource(new File(filePath));
            helper.addAttachment(file.getFilename(), file);

            mailSender.send(message);

        } catch (Exception e) {
            throw new MailSendException("❌ Failed to send email with attachment to " + to, e);
        }
    }
}
