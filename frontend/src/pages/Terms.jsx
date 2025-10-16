import React from 'react';
import Navbar from '../components/Navbar';
import { FileText } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 px-8 md:px-16 pb-16 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <FileText className="w-10 h-10 text-green-600" />
          Terms of Service
        </h1>
        <p className="text-gray-400 mb-8">Last updated: October 2025</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing ChyllApp, you agree to these Terms of Service. If you disagree, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
            <p className="mb-4">ChyllApp is a social media aggregator that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Aggregates viral content from multiple platforms</li>
              <li>Provides AI-powered recommendations</li>
              <li>Offers premium subscription features</li>
              <li>Enables developer API access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be 13+ to use ChyllApp</li>
              <li>Provide accurate information</li>
              <li>Keep your password secure</li>
              <li>One account per person</li>
              <li>You're responsible for all activity under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Premium Subscriptions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Monthly: $9.99/month, billed monthly</li>
              <li>Yearly: $99.99/year, billed annually</li>
              <li>Cancel anytime (no refunds for partial periods)</li>
              <li>Auto-renewal unless cancelled</li>
              <li>Prices subject to change with notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Prohibited Activities</h2>
            <p className="mb-4">You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Abuse or harass other users</li>
              <li>Scrape or data mine our platform</li>
              <li>Reverse engineer our service</li>
              <li>Share account credentials</li>
              <li>Use for commercial purposes without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Content Rights</h2>
            <p>All aggregated content remains property of original creators and platforms. ChyllApp does not claim ownership of user-generated or third-party content.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
            <p>ChyllApp is provided "as is" without warranties. We are not liable for indirect, incidental, or consequential damages.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms or for any reason with notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact</h2>
            <p>Questions? Contact: <a href="mailto:legal@chyllapp.com" className="text-blue-500 hover:underline">legal@chyllapp.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;