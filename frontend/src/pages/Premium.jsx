import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, Crown, Sparkles, Zap, Download, Shield, Loader2 } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Premium = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchPackages();
    checkPaymentReturn();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/subscriptions/packages`);
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentReturn = async () => {
    const sessionId = searchParams.get('session_id');
    const cancelled = searchParams.get('cancelled');

    if (cancelled) {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. No charges were made.",
        duration: 5000,
      });
      window.history.replaceState({}, '', '/premium');
      return;
    }

    if (sessionId) {
      setProcessingPayment(true);
      toast({
        title: "Processing Payment...",
        description: "Verifying your payment with Stripe",
        duration: 3000,
      });

      // Poll for payment status
      pollPaymentStatus(sessionId, 0);
    }
  };

  const pollPaymentStatus = async (sessionId, attempts) => {
    const maxAttempts = 5;

    if (attempts >= maxAttempts) {
      toast({
        title: "Payment Verification Timeout",
        description: "Please refresh the page or contact support",
        variant: "destructive",
      });
      setProcessingPayment(false);
      return;
    }

    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/payments/status/${sessionId}`,
        { withCredentials: true }
      );

      if (response.data.payment_status === 'paid') {
        toast({
          title: "🎉 Welcome to Premium!",
          description: "Your subscription is now active. Enjoy all premium features!",
          duration: 5000,
        });
        setProcessingPayment(false);
        window.history.replaceState({}, '', '/premium');
        // Reload user data to get updated subscription status
        window.location.reload();
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setProcessingPayment(false);
    }
  };

  const handleSubscribe = async (packageId) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to subscribe to premium",
        duration: 3000,
      });
      navigate('/');
      return;
    }

    try {
      const originUrl = window.location.origin;
      const response = await axios.post(
        `${BACKEND_URL}/api/payments/checkout?package_id=${packageId}&origin_url=${encodeURIComponent(originUrl)}`,
        {},
        { withCredentials: true }
      );

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-8 md:px-16 pb-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <Crown className="w-12 h-12 text-yellow-500" />
            ChyllApp Premium
          </h1>
          <p className="text-gray-400 text-xl">
            Unlock the ultimate social media experience
          </p>
        </div>

        {/* Processing Payment Overlay */}
        {processingPayment && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-lg text-center">
              <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-white text-xl font-bold">Verifying Payment...</p>
              <p className="text-gray-400 mt-2">Please wait</p>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`bg-gray-900 border-2 ${
                pkg.interval === 'yearly' ? 'border-yellow-500' : 'border-gray-800'
              } relative overflow-hidden`}
            >
              {pkg.interval === 'yearly' && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                  SAVE 17%
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-white text-2xl">
                  {pkg.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-white">
                    ${pkg.interval === 'monthly' ? pkg.price_monthly : pkg.price_yearly}
                  </span>
                  <span className="text-gray-400 ml-2">
                    /{pkg.interval === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>🚫 Ad-free experience</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>⚡ Early access to viral content</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>🎯 Advanced filters & sorting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>💾 Download content feature</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>🎧 Priority customer support</span>
                  </li>
                  {pkg.interval === 'yearly' && (
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>💰 Save $20/year</span>
                    </li>
                  )}
                </ul>
                <Button
                  onClick={() => handleSubscribe(pkg.id)}
                  className={`w-full ${
                    pkg.interval === 'yearly'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white font-bold py-3`}
                >
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Details */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Ad-Free</h3>
              <p className="text-gray-400 text-sm">Enjoy uninterrupted browsing without any advertisements</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Early Access</h3>
              <p className="text-gray-400 text-sm">Be the first to see trending content before it goes viral</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <Download className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Downloads</h3>
              <p className="text-gray-400 text-sm">Save your favorite videos and images for offline viewing</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Premium;
