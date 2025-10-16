import React from 'react';
import Navbar from '../components/Navbar';
import { Shield } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 px-8 md:px-16 pb-16 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Shield className="w-10 h-10 text-blue-600" />
          Privacy Policy
        </h1>
        <p className="text-gray-400 mb-8">Last updated: October 2025</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <p className="mb-4">When you use ChyllApp, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email, profile picture (via Google OAuth)</li>
              <li><strong>Usage Data:</strong> Posts you view, like, save, and share</li>
              <li><strong>Platform Connections:</strong> OAuth tokens when you connect social media accounts</li>
              <li><strong>Payment Information:</strong> Processed securely by Stripe (we don't store card details)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide personalized AI recommendations</li>
              <li>Fetch content from connected social media platforms</li>
              <li>Process premium subscriptions</li>
              <li>Improve our services and user experience</li>
              <li>Send notifications (if you enable them)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p>We use industry-standard security measures including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Encrypted connections (HTTPS)</li>
              <li>Secure session management with httpOnly cookies</li>
              <li>OAuth 2.0 for authentication</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
            <p className="mb-4">ChyllApp integrates with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google:</strong> Authentication</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Social Media Platforms:</strong> Content aggregation (with your permission)</li>
              <li><strong>OpenAI:</strong> AI recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Delete your account and data</li>
              <li>Disconnect social media platforms</li>
              <li>Opt-out of notifications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p>Questions about privacy? Contact us at: <a href="mailto:privacy@chyllapp.com" className="text-blue-500 hover:underline">privacy@chyllapp.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;