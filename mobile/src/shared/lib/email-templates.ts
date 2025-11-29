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

  winBack: (userName: string, daysSinceCancellation: number, profitMissed?: number) => ({
    subject: '🎁 We Miss You! Come Back with 50% Off',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">We miss you, ${userName}! 💚</h1>
        
        <p>It's been ${daysSinceCancellation} days since you left ApexOS.</p>
        
        ${profitMissed ? `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>Did you know?</strong> Our signals would have generated <strong>$${profitMissed.toFixed(2)}</strong> 
              in profit since you left. 📈
            </p>
          </div>
        ` : ''}
        
        <h2>🎁 Special Offer Just for You</h2>
        <p>Use code <strong style="font-size: 24px; color: #10b981;">WINBACK50</strong> for <strong>50% off</strong> your first month back!</p>
        
        <a href="https://apexrebate.com/pricing?code=WINBACK50" 
           style="display: inline-block; background: #10b981; color: white; padding: 16px 32px; 
                  text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
          Reactivate My Account
        </a>
        
        <p style="color: #6b7280; font-size: 14px;">This offer expires in 7 days.</p>
      </div>
    `,
  }),

  launch: (userName: string) => ({
    subject: '🚀 ApexOS is LIVE: 50% Off for Early Adopters',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">The Wait is Over, ${userName}!</h1>
        
        <p>ApexOS is officially live. The institutional-grade AI trading platform you've been waiting for is here.</p>
        
        <div style="background: #18181b; color: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <h2 style="margin: 0 0 10px 0;">First 100 Users Only</h2>
          <p style="font-size: 24px; font-weight: bold; color: #34d399; margin: 0;">50% OFF LIFETIME</p>
          <p style="margin: 10px 0 0 0; color: #a1a1aa;">Use code: <strong>LAUNCH50</strong></p>
        </div>
        
        <a href="https://apexrebate.com/pricing?code=LAUNCH50" 
           style="display: inline-block; background: #10b981; color: black; padding: 16px 32px; 
                  text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; width: 100%; text-align: center;">
          Claim Your Spot Now
        </a>
        
        <p>See you on the moon, 🚀<br/>The ApexOS Team</p>
      </div>
    `,
  }),
};
