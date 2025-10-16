import React from 'react';
import Navbar from '../components/Navbar';
import { Cookie } from 'lucide-react';

const Cookies = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 px-8 md:px-16 pb-16 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Cookie className="w-10 h-10 text-yellow-600" />
          Cookie Policy
        </h1>
        <p className="text-gray-400 mb-8">Last updated: October 2025</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device. ChyllApp uses cookies to provide authentication and improve your experience.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Essential Cookies</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>session_token:</strong> Keeps you logged in (7-day expiry, httpOnly, secure)</li>
                  <li>Required for authentication - cannot be disabled</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Preference Cookies</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Language preference:</strong> Remembers your chosen language</li>
                  <li><strong>Recent searches:</strong> Stores your search history locally</li>
                  <li>Can be cleared from browser settings</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Cookies</h2>
            <p className="mb-4">We may use cookies from:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Google:</strong> Authentication services</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Social Media Platforms:</strong> OAuth authentication</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Managing Cookies</h2>
            <p className="mb-4">You can control cookies through:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browser settings (clear cookies, block third-party cookies)</li>
              <li>Logging out (clears session cookie)</li>
              <li>Private/Incognito browsing mode</li>
            </ul>
            <p className="mt-4 text-yellow-500">Note: Disabling essential cookies will prevent you from logging in.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Updates</h2>
            <p>We may update this Cookie Policy. Changes will be posted on this page with a new "Last updated" date.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cookies;