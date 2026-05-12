import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "ExecutiveEdu <onboarding@resend.dev>"

export async function sendWelcomeEmail(to: string, name: string) {
    if (!process.env.RESEND_API_KEY) return
    await resend.emails.send({
        from: FROM,
        to,
        subject: "Welcome to ExecutiveEdu 🎓",
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#1d4ed8,#7c3aed);padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">ExecutiveEdu</h1>
          <p style="color:#bfdbfe;margin:8px 0 0;font-size:14px;">AI & Business Automation Training</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#f1f5f9;font-size:22px;margin:0 0 16px;">Welcome, ${name}! 👋</h2>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 24px;">
            You've joined thousands of business leaders mastering AI and automation.
            Your journey to the future of business starts now.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr>
              <td style="background:#0f172a;border-radius:10px;padding:16px 20px;margin-bottom:12px;">
                <p style="color:#60a5fa;font-size:13px;font-weight:700;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">What's next</p>
                <p style="color:#e2e8f0;font-size:14px;margin:0;">Explore our courses and start learning at your own pace</p>
              </td>
            </tr>
          </table>
          <a href="${process.env.NEXTAUTH_URL}/courses/1"
             style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">
            Browse Courses →
          </a>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #334155;text-align:center;">
          <p style="color:#475569;font-size:12px;margin:0;">© 2025 ExecutiveEdu. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })
}

export async function sendEnrollmentEmail(to: string, name: string, courseTitle: string, courseId: string) {
    if (!process.env.RESEND_API_KEY) return
    await resend.emails.send({
        from: FROM,
        to,
        subject: `You're enrolled in ${courseTitle} ✅`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#1d4ed8,#7c3aed);padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">ExecutiveEdu</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="display:inline-block;background:#16a34a;border-radius:50%;width:60px;height:60px;line-height:60px;text-align:center;font-size:28px;">✓</div>
          </div>
          <h2 style="color:#f1f5f9;font-size:22px;margin:0 0 8px;text-align:center;">Enrollment Confirmed!</h2>
          <p style="color:#94a3b8;font-size:15px;text-align:center;margin:0 0 32px;">You now have full access to:</p>
          <div style="background:#0f172a;border-radius:12px;padding:24px;margin-bottom:32px;border-left:4px solid #3b82f6;">
            <p style="color:#60a5fa;font-size:12px;font-weight:700;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Course</p>
            <p style="color:#f1f5f9;font-size:18px;font-weight:700;margin:0;">${courseTitle}</p>
          </div>
          <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
            Hi ${name}, your enrollment is confirmed. You can start watching immediately —
            our AI assistant is ready to answer your questions throughout every module.
          </p>
          <a href="${process.env.NEXTAUTH_URL}/courses/${courseId}/video"
             style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">
            Start Learning Now →
          </a>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #334155;text-align:center;">
          <p style="color:#475569;font-size:12px;margin:0;">© 2025 ExecutiveEdu. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })
}

export async function sendCompletionEmail(to: string, name: string, courseTitle: string) {
    if (!process.env.RESEND_API_KEY) return
    await resend.emails.send({
        from: FROM,
        to,
        subject: `Congratulations! You completed ${courseTitle} 🏆`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#b45309,#d97706);padding:40px;text-align:center;">
          <p style="font-size:48px;margin:0;">🏆</p>
          <h1 style="color:#fff;margin:8px 0 0;font-size:28px;font-weight:800;">Congratulations!</h1>
        </td></tr>
        <tr><td style="padding:40px;text-align:center;">
          <h2 style="color:#f1f5f9;font-size:20px;margin:0 0 8px;">You did it, ${name}!</h2>
          <p style="color:#94a3b8;font-size:15px;margin:0 0 32px;">You've successfully completed</p>
          <div style="background:#0f172a;border-radius:12px;padding:24px;margin-bottom:32px;border:1px solid #d97706;">
            <p style="color:#fbbf24;font-size:18px;font-weight:700;margin:0;">${courseTitle}</p>
          </div>
          <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 32px;">
            You've joined an exclusive group of business leaders who have mastered
            AI and automation. Share your achievement and inspire others.
          </p>
          <a href="${process.env.NEXTAUTH_URL}/dashboard"
             style="display:inline-block;background:linear-gradient(135deg,#b45309,#d97706);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">
            View Your Dashboard →
          </a>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #334155;text-align:center;">
          <p style="color:#475569;font-size:12px;margin:0;">© 2025 ExecutiveEdu. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })
}
