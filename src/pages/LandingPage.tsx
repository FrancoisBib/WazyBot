import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, MessageSquare, TrendingUp, Shield, Zap, Users, ArrowRight, CheckCircle, Star, Phone } from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Assistant',
      description: 'GPT-4 powered chatbot that understands customer intent and provides relevant product recommendations.'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Integration',
      description: 'Seamless integration with WhatsApp Business API for direct customer communication.'
    },
    {
      icon: TrendingUp,
      title: 'Sales Analytics',
      description: 'Comprehensive analytics to track sales performance, customer behavior, and AI effectiveness.'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'GDPR compliant with enterprise-grade security for customer data protection.'
    },
    {
      icon: Zap,
      title: 'Instant Setup',
      description: 'Get your AI assistant running in minutes with our simple setup process.'
    },
    {
      icon: Users,
      title: '24/7 Customer Support',
      description: 'Never miss a customer inquiry with round-the-clock automated responses.'
    }
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      business: "Santos Beauty Store",
      content: "WazyBot increased our sales by 40% in just 2 months. Our customers love the instant responses!",
      rating: 5
    },
    {
      name: "Ahmed Hassan",
      business: "Hassan Electronics",
      content: "The AI understands our products perfectly. It's like having a skilled salesperson available 24/7.",
      rating: 5
    },
    {
      name: "Chen Wei",
      business: "Wei's Fashion Boutique",
      content: "Setup was incredibly easy. Within an hour, we had our AI assistant handling customer inquiries.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "€9",
      period: "/month",
      features: ["100 conversations/month", "Basic AI responses", "Product catalog", "Email support"],
      cta: "Start Free Trial"
    },
    {
      name: "Pro",
      price: "€19",
      period: "/month",
      features: ["1,000 conversations/month", "Advanced AI features", "Analytics dashboard", "Priority support"],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Business",
      price: "€29",
      period: "/month",
      features: ["Unlimited conversations", "Custom AI training", "Advanced analytics", "24/7 phone support"],
      cta: "Contact Sales"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">WazyBot</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-800 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-800 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-800 transition-colors">Testimonials</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/auth" className="text-gray-600 hover:text-gray-800 transition-colors">Sign In</Link>
              <Link 
                to="/auth" 
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Height */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left column - Text content */}
            <div className="text-center lg:text-left">
              {/* WhatsApp integration badge */}
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg">
                <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center">
                  <Phone className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Powered by WhatsApp Business API</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  WhatsApp Business
                </span>
                Into an AI Sales Machine
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Automate customer inquiries, recommend products, and process orders with our AI-powered WhatsApp assistant. 
                Perfect for businesses in Africa, Latin America, and Asia.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link 
                  to="/auth" 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                >
                  Start Free Trial 
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors">
                  Watch Demo
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Setup in 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Right column - Visual elements */}
            <div className="relative flex justify-center lg:justify-end">
              {/* WhatsApp mockup container - Reduced size */}
              <div className="relative w-64 sm:w-72">
                {/* Phone mockup */}
                <div className="relative bg-black rounded-[1.5rem] p-1.5 shadow-2xl">
                  <div className="bg-white rounded-[1.25rem] overflow-hidden">
                    {/* WhatsApp header */}
                    <div className="bg-[#25D366] px-3 py-2 flex items-center space-x-2">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-[#25D366]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-xs">WazyBot Assistant</p>
                        <p className="text-green-100 text-[10px]">Online</p>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-4 h-4 bg-white/20 rounded-full"></div>
                        <div className="w-4 h-4 bg-white/20 rounded-full"></div>
                      </div>
                    </div>

                    {/* Chat messages */}
                    <div className="p-3 space-y-2 bg-gray-50 h-80">
                      {/* Customer message */}
                      <div className="flex justify-end">
                        <div className="bg-[#DCF8C6] rounded-lg px-2 py-1.5 max-w-[75%]">
                          <p className="text-xs text-gray-800">Hi! Do you have any wireless headphones?</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">14:32</p>
                        </div>
                      </div>

                      {/* AI response */}
                      <div className="flex justify-start">
                        <div className="bg-white rounded-lg px-2 py-1.5 max-w-[75%] shadow-sm">
                          <p className="text-xs text-gray-800 mb-1">Hello! Yes, we have several great wireless headphones available. Here are my top recommendations:</p>
                          <div className="bg-gray-50 rounded-md p-1.5 mb-1">
                            <p className="text-[10px] font-medium text-gray-700">🎧 Premium Wireless Headphones</p>
                            <p className="text-[10px] text-gray-600">€49.99 • In Stock</p>
                          </div>
                          <p className="text-xs text-gray-800">Would you like to see more details or place an order?</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">14:33</p>
                        </div>
                      </div>

                      {/* Customer response */}
                      <div className="flex justify-end">
                        <div className="bg-[#DCF8C6] rounded-lg px-2 py-1.5 max-w-[75%]">
                          <p className="text-xs text-gray-800">Perfect! I'll take one</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">14:34</p>
                        </div>
                      </div>

                      {/* AI order confirmation */}
                      <div className="flex justify-start">
                        <div className="bg-white rounded-lg px-2 py-1.5 max-w-[75%] shadow-sm">
                          <p className="text-xs text-gray-800">Excellent choice! I'll process your order right away. 🛒</p>
                          <div className="bg-blue-50 rounded-md p-1.5 mt-1 border border-blue-200">
                            <p className="text-[10px] font-medium text-blue-800">Order Summary</p>
                            <p className="text-[10px] text-blue-700">1x Premium Wireless Headphones</p>
                            <p className="text-[10px] font-bold text-blue-800">Total: €49.99</p>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">14:34</p>
                        </div>
                      </div>
                    </div>

                    {/* Input area */}
                    <div className="bg-white border-t border-gray-200 px-3 py-1.5 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-100 rounded-full px-2 py-1">
                        <p className="text-xs text-gray-500">Type a message...</p>
                      </div>
                      <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements - Adjusted for smaller phone */}
                <div className="absolute -top-3 -left-3 bg-white rounded-lg shadow-lg p-2 animate-bounce">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-[10px] font-medium text-gray-700">AI Active</span>
                  </div>
                </div>

                <div className="absolute -bottom-3 -right-3 bg-white rounded-lg shadow-lg p-2">
                  <div className="text-center">
                    <p className="text-sm font-bold text-green-600">94%</p>
                    <p className="text-[10px] text-gray-600">Success Rate</p>
                  </div>
                </div>

                <div className="absolute top-1/2 -left-6 bg-white rounded-lg shadow-lg p-2">
                  <div className="text-center">
                    <p className="text-sm font-bold text-purple-600">24/7</p>
                    <p className="text-[10px] text-gray-600">Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Powerful Features for Modern Businesses</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to automate your WhatsApp sales and provide exceptional customer service.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Trusted by Businesses Worldwide</h2>
            <p className="text-xl text-gray-600">See how WazyBot is transforming businesses across the globe.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-bold text-gray-800">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your business needs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white p-8 rounded-xl shadow-lg border-2 ${plan.popular ? 'border-purple-500 relative' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/auth" 
                  className={`w-full py-3 px-6 rounded-lg font-medium text-center block transition-all duration-200 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-500 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using WazyBot to automate their WhatsApp sales.
          </p>
          <Link 
            to="/auth" 
            className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-bold hover:shadow-xl transition-all duration-200 inline-flex items-center"
          >
            Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">WazyBot</span>
              </div>
              <p className="text-gray-400">Empowering businesses with AI-powered WhatsApp sales automation.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 WazyBot. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;