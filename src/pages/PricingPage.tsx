import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Check, Zap, Crown, Rocket, ArrowRight } from 'lucide-react';

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '€9',
      period: '/month',
      description: 'Perfect for small businesses getting started',
      features: [
        '100 conversations per month',
        'Basic AI responses',
        'Product catalog management',
        'WhatsApp integration',
        'Email support',
        'Basic analytics'
      ],
      cta: 'Current Plan',
      popular: false,
      current: true,
      icon: Zap
    },
    {
      name: 'Pro',
      price: '€19',
      period: '/month',
      description: 'Ideal for growing businesses',
      features: [
        '1,000 conversations per month',
        'Advanced AI features',
        'Custom AI training',
        'Analytics dashboard',
        'Priority support',
        'Multi-language support',
        'Custom responses',
        'Order processing'
      ],
      cta: 'Upgrade to Pro',
      popular: true,
      current: false,
      icon: Crown
    },
    {
      name: 'Business',
      price: '€29',
      period: '/month',
      description: 'For established businesses with high volume',
      features: [
        'Unlimited conversations',
        'Advanced AI customization',
        'Custom integrations',
        'Advanced analytics',
        '24/7 phone support',
        'Dedicated account manager',
        'API access',
        'White-label options'
      ],
      cta: 'Upgrade to Business',
      popular: false,
      current: false,
      icon: Rocket
    }
  ];

  const faqs = [
    {
      question: 'Can I change my plan at any time?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
    },
    {
      question: 'What happens if I exceed my conversation limit?',
      answer: 'If you exceed your monthly conversation limit, you can either upgrade your plan or purchase additional conversations at €0.05 per conversation.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes, we offer a 14-day free trial for all new users. No credit card required to get started.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Absolutely. You can cancel your subscription at any time from your billing settings. Your plan will remain active until the end of your current billing period.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all new subscriptions. If you\'re not satisfied, contact our support team for a full refund.'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scale your WhatsApp sales automation with plans designed for businesses of all sizes
          </p>
        </div>

        {/* Current Usage */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Current Usage - Starter Plan</h2>
              <p className="text-purple-100">You've used 487 out of 1,000 conversations this month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">48.7%</p>
              <p className="text-purple-100">of monthly limit</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-purple-400 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: '48.7%' }}></div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`relative bg-white rounded-xl shadow-lg border-2 p-8 ${
                  plan.popular 
                    ? 'border-purple-500 transform scale-105' 
                    : plan.current
                    ? 'border-green-500'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {plan.current && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-8 h-8 ${plan.popular ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                    plan.current
                      ? 'bg-green-100 text-green-800 cursor-default'
                      : plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  disabled={plan.current}
                >
                  {plan.cta}
                  {!plan.current && <ArrowRight className="ml-2 w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600">Features</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-600">Starter</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-600">Pro</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-600">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-800">Monthly Conversations</td>
                  <td className="py-4 px-6 text-center text-gray-600">100</td>
                  <td className="py-4 px-6 text-center text-gray-600">1,000</td>
                  <td className="py-4 px-6 text-center text-gray-600">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-800">AI Response Quality</td>
                  <td className="py-4 px-6 text-center text-gray-600">Basic</td>
                  <td className="py-4 px-6 text-center text-gray-600">Advanced</td>
                  <td className="py-4 px-6 text-center text-gray-600">Premium</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-800">Custom AI Training</td>
                  <td className="py-4 px-6 text-center">❌</td>
                  <td className="py-4 px-6 text-center">✅</td>
                  <td className="py-4 px-6 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-800">Analytics Dashboard</td>
                  <td className="py-4 px-6 text-center">Basic</td>
                  <td className="py-4 px-6 text-center">Advanced</td>
                  <td className="py-4 px-6 text-center">Premium</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-800">API Access</td>
                  <td className="py-4 px-6 text-center">❌</td>
                  <td className="py-4 px-6 text-center">❌</td>
                  <td className="py-4 px-6 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-800">Support</td>
                  <td className="py-4 px-6 text-center text-gray-600">Email</td>
                  <td className="py-4 px-6 text-center text-gray-600">Priority</td>
                  <td className="py-4 px-6 text-center text-gray-600">24/7 Phone</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className="font-medium text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Upgrade?</h2>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Join thousands of businesses that have transformed their WhatsApp sales with our AI assistant.
          </p>
          <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-200 inline-flex items-center">
            Upgrade Now <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PricingPage;