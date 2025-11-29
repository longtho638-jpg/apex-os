export const emailTemplates = {
  base: (content: string, title: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { margin: 0; padding: 0; background-color: #000000; font-family: 'Inter', sans-serif; color: #e5e7eb; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .logo { color: #00FF94; font-size: 24px; font-weight: bold; letter-spacing: -0.5px; text-decoration: none; }
          .card { background-color: #111111; border: 1px solid #333; border-radius: 16px; padding: 40px; margin-top: 24px; box-shadow: 0 4px 24px rgba(0, 255, 148, 0.05); }
          .btn { display: inline-block; background: #00FF94; color: #000000; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 24px; transition: all 0.2s; }
          .btn:hover { background: #00cc76; transform: translateY(-1px); }
          .footer { margin-top: 32px; text-align: center; color: #666; font-size: 12px; }
          h1 { color: #ffffff; font-size: 24px; margin-bottom: 16px; letter-spacing: -0.5px; }
          p { line-height: 1.6; color: #d1d5db; margin-bottom: 16px; }
          .highlight { color: #00FF94; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <a href="https://apexrebate.com" class="logo">APEX<span style="color: #ffffff;">OS</span></a>
          <div class="card">
            <h1>${title}</h1>
            ${content}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Apex Financial OS. All rights reserved.</p>
            <p>123 Wall Street, New York, NY 10005</p>
          </div>
        </div>
      </body>
    </html>
  `,

  welcome: {
    subject: 'Welcome to the Elite • ApexOS',
    html: (name: string, actionUrl: string) => emailTemplates.base(`
      <p>Welcome, ${name}.</p>
      <p>You have successfully secured your access to <span class="highlight">ApexOS</span>, the institutional-grade financial operating system.</p>
      <p>Your journey to financial dominance begins now. Access your dashboard to configure your strategy.</p>
      <a href="${actionUrl}" class="btn">Access Dashboard</a>
    `, 'Protocol Initiated'),
  },

  verification: {
    subject: 'Verify Your Identity • ApexOS',
    html: (name: string, actionUrl: string) => emailTemplates.base(`
      <p>Security protocol initiated.</p>
      <p>To ensure the integrity of your account, please verify your email address. This link is valid for 24 hours.</p>
      <a href="${actionUrl}" class="btn">Verify Identity</a>
      <p style="margin-top: 24px; font-size: 12px; color: #666;">If you did not request this, please ignore this transmission.</p>
    `, 'Verify Identity'),
  },

  resetPassword: {
    subject: 'Reset Your Password • ApexOS',
    html: (name: string, actionUrl: string) => emailTemplates.base(`
      <p>We received a request to reset your password.</p>
      <p>Click the button below to set a new password:</p>
      <a href="${actionUrl}" class="btn">Reset Password</a>
      <p style="margin-top: 24px; font-size: 12px; color: #666;">If you did not request this, you can safely ignore this email.</p>
      <p style="margin-top: 12px; font-size: 12px; color: #444;">Link not working? Copy this URL into your browser:<br/>${actionUrl}</p>
    `, 'Reset Password'),
  },

  featureHighlight: {
    subject: 'Intelligence Update • ApexOS',
    html: (name: string) => emailTemplates.base(`
      <p>System analysis indicates you have not fully utilized the <span class="highlight">AI Signal Engine</span>.</p>
      <p>Current Performance Metrics:</p>
      <ul style="list-style: none; padding: 0; margin: 24px 0;">
        <li style="margin-bottom: 12px; display: flex; align-items: center;">
          <span style="color: #00FF94; margin-right: 12px;">✓</span> 68% Win Rate on H4 Timeframe
        </li>
        <li style="margin-bottom: 12px; display: flex; align-items: center;">
          <span style="color: #00FF94; margin-right: 12px;">✓</span> Real-time Sentiment Analysis
        </li>
      </ul>
      <a href="https://apexrebate.com/signals" class="btn">Activate Signals</a>
    `, 'Intelligence Update'),
  },

  trialEnding: {
    subject: 'Access Expiring • ApexOS',
    html: (name: string) => emailTemplates.base(`
      <p>Your trial access expires in <span class="highlight">24 hours</span>.</p>
      <p>Do not lose your edge. Upgrade now to maintain uninterrupted access to institutional tools.</p>
      <a href="https://apexrebate.com/pricing" class="btn">Secure Access</a>
    `, 'Critical Alert'),
  },

  winBack: {
    subject: 'We Miss Your Edge • ApexOS',
    html: (name: string, days: number, profitMissed: number, actionUrl: string) => emailTemplates.base(`
      <p>It's been ${days} days.</p>
      <p>The market hasn't stopped. In your absence, opportunities worth approximately <strong>$${profitMissed.toFixed(2)}</strong> were identified by our algorithms.</p>
      <p>Return to the arena.</p>
      <a href="${actionUrl}" class="btn">Reactivate Account</a>
    `, 'Return to Apex'),
  },

  winningStreak: {
    subject: '🔥 You Are On Fire • ApexOS',
    html: (name: string, actionUrl: string) => emailTemplates.base(`
      <p>System analysis detects a <strong>Winning Streak</strong>.</p>
      <p>You have executed 3 profitable trades in a row. Your market synchronization is peaking.</p>
      <p>Do not cap your potential. Upgrade to <strong>Apex Pro</strong> to unlock unlimited signals and leverage this momentum.</p>
      <a href="${actionUrl}" class="btn">Scale Up Now</a>
    `, 'Momentum Detected'),
  },

  stopLossGuide: {
    subject: '🛡️ Tactical Pause Recommended • ApexOS',
    html: (name: string, actionUrl: string) => emailTemplates.base(`
      <p>Market turbulence detected in your recent performance.</p>
      <p>Even the best traders take tactical pauses. We have unlocked a premium guide on <strong>Risk Management & Stop Loss Strategy</strong> for you.</p>
      <p>Regroup. Re-arm. Re-enter.</p>
      <a href="${actionUrl}" class="btn">Read Strategy Guide</a>
    `, 'Risk Alert'),
  },
};

