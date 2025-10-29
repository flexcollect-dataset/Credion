const nodemailer = require('nodemailer');
const pdfGenerator = require('./pdfGenerator');

class EmailService {
  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: process.env.SMTP_PORT || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'support@nutanvij.com',
        pass: process.env.SMTP_PASS || 'Nik@2511'
      }
    });
  }

  async sendReports(email, reports, matterName = 'Matter') {
    try {
      console.log(`📧 Sending ${reports.length} reports to ${email}`);
      
      // Generate PDFs for all reports
      const attachments = [];
      
      for (const report of reports) {
        try {
          // Get the report ID from either field
          const reportId = report.reportId || report.id;
          console.log(`📄 Generating PDF for report ID: ${reportId}, Type: ${report.type}`);
          console.log('Report object:', report);
          
          // Generate report data
          const reportData = await pdfGenerator.generateReportData(
            { id: reportId }, 
            report.type
          );
          
          // Generate PDF
          const templateName = report.type === 'ASIC' ? 'asic-report' : 
                              report.type === 'COURT' ? 'court-report' : 
                              'ppsr-report-dynamic';
          
          const pdfBuffer = await pdfGenerator.generatePDF(templateName, reportData);
          
          // Generate filename
          const companyName = reportData.companyName || 'Unknown';
          const abn = reportData.abn || 'Unknown';
          let filename;
          if (report.type === 'ASIC') {
            const reportTypeFormatted = 'Current'; // Default
            filename = `${abn}_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_ASIC_${reportTypeFormatted}.pdf`;
          } else if (report.type === 'COURT') {
            filename = `${abn}_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_COURT.pdf`;
          } else if (report.type === 'PPSR') {
            filename = `${abn}_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_PPSR.pdf`;
          }
          
          attachments.push({
            filename: filename,
            content: pdfBuffer,
            contentType: 'application/pdf'
          });
          
          console.log(`✅ Generated PDF: ${filename}`);
          
        } catch (error) {
          console.error(`❌ Error generating PDF for report ${report.reportId}:`, error);
          // Continue with other reports even if one fails
        }
      }

      if (attachments.length === 0) {
        throw new Error('No PDFs could be generated for the reports');
      }

      // Email content
      const mailOptions = {
        from: process.env.SMTP_FROM || 'support@nutanvij.com',
        to: email,
        replyTo: process.env.SMTP_FROM || 'support@nutanvij.com',
        subject: `Your Business Report - ${matterName}`,
        text: `Credion Reports\n\nDear Valued Client,\n\nPlease find attached your requested reports for ${matterName}.\n\nReport Summary:\n- Total Reports: ${attachments.length}\n- Matter: ${matterName}\n- Generated: ${new Date().toLocaleDateString()}\n\nAll reports are attached as PDF files and ready for download.\n\nThis is an automated message from Credion. If you have any questions, please contact our support team.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Business Report Delivery</h2>
            
            <p>Hello,</p>
            
            <p>Your requested business report for <strong>${matterName}</strong> is ready and attached to this email.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Report Details:</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #555;">
                <li>Number of Reports: ${attachments.length}</li>
                <li>Matter: ${matterName}</li>
                <li>Generated: ${new Date().toLocaleDateString()}</li>
              </ul>
            </div>
            
            <p>The report files are attached as PDF documents and ready for download.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">
                This is an automated message. Please do not reply to this email.
              </p>
              <p style="color: #666; font-size: 14px;">
                For questions, contact our support team.
              </p>
            </div>
          </div>
        `,
        attachments: attachments
      };

      // Send email
      console.log(`📧 Email details:`, {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        attachmentsCount: attachments.length,
        attachmentSizes: attachments.map(a => `${a.filename} (${a.content.length} bytes)`)
      });
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully: ${info.messageId}`);
      console.log(`✅ SMTP Response:`, info.response);
      console.log(`✅ Accepted Recipients:`, info.accepted);
      console.log(`✅ Rejected Recipients:`, info.rejected);
      
      return {
        success: true,
        messageId: info.messageId,
        reportsSent: attachments.length,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      };

    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
