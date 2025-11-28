export const emailTemplates = {
  welcome: {
    subject: '🎉 Welcome to ApexOS - Your AI Trading Journey Starts Now',
    html: (name: string) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #10b981;">Welcome to ApexOS, ${name}!</h1>
        <p>You've just unlocked access to AI-powered trading signals trusted by 1,000+ traders.</p>
        <h2>What's Next?</h2>
        <ul>
          <li>✅ Explore 247+ active AI signals</li>
          <li>✅ Set up your first trade alert</li>
          <li>✅ Join our community Discord</li>
        </ul>
        <a href="https://apex-os.vercel.app/dashboard" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
          Get Started →
        </a>
        <p style="color: #888; font-size: 14px;">Your 7-day free trial is active. No credit card required.</p>
      </div>
    `,
  },
  
  featureHighlight: {
    subject: '💡 You\'re Missing Out on These ApexOS Features',
    html: (name: string) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1>Hey ${name},</h1>
        <p>You've had ApexOS for 2 days. Here's what you might have missed:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #10b981;">🤖 AI Signal Accuracy: 68% Win Rate</h3>
          <p>Our AI models analyze 1,000+ data points per second to generate high-probability trades.</p>
        </div>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #3b82f6;">📊 Real-Time Portfolio Tracking</h3>
          <p>See your P&L update in real-time. Make data-driven decisions instantly.</p>
        </div>
        <a href="https://apex-os.vercel.app/signals" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px;">
          Explore Signals →
        </a>
      </div>
    `,
  },
  
  trialEnding: {
    subject: '⏰ Your ApexOS Trial Ends in 24 Hours',
    html: (name: string) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #f59e0b;">⏰ Don't Lose Access, ${name}!</h1>
        <p>Your 7-day free trial ends in <strong>24 hours</strong>.</p>
        <p>To keep your AI trading edge:</p>
        <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">⚡ Upgrade Now & Save 20%</h3>
          <p style="margin: 0;">Use code <strong>TRIAL20</strong> for 20% off your first month.</p>
        </div>
        <a href="https://apex-os.vercel.app/pricing" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; margin: 10px 0;">
          Upgrade Now →
        </a>
        <p style="font-size: 12px; color: #888;">What you'll lose: AI signals, portfolio tracking, premium support</p>
      </div>
    `,
  },
};
