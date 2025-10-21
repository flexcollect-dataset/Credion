import { Link } from 'react-router-dom';
import { ArrowRight, Check, Zap, TrendingUp, Building } from 'lucide-react';
import { useState, useEffect } from 'react';

const Pricing = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const plans = [
    {
      name: 'Starter',
      icon: <Zap className="text-credion-red" size={32} />,
      price: '$79',
      period: '/month',
      description: 'Perfect for small businesses getting started with credit monitoring',
      features: [
        '5 lookups/month',
        'Both scores (Credion + Credit)',
        'Real-time updates',
        'Free preview report'
      ],
      cta: 'Signup',
      popular: false
    },
    {
      name: 'Growth',
      icon: <TrendingUp className="text-credion-red" size={32} />,
      price: '$199',
      period: '/month',
      description: 'Ideal for growing businesses with expanding client portfolios',
      features: [
        '10 lookups/month',
        'PDF full reports',
        'Email alerts',
        'Basic monitoring dashboard'
      ],
      cta: 'Signup',
      popular: false
    },
    {
      name: 'Premium',
      icon: <Building className="text-credion-red" size={32} />,
      price: '$399',
      period: '/month',
      description: 'Advanced features for established businesses',
      features: [
        '25 lookups/month',
        'API access',
        'Reason codes',
        'Monitoring dashboard',
        'Dedicated support'
      ],
      cta: 'Signup',
      popular: false
    },
    {
      name: 'Enterprise',
      icon: <Building className="text-credion-red" size={32} />,
      price: 'Let\'s talk',
      period: '',
      description: 'Comprehensive solution for large organizations with complex needs',
      features: [
        'Custom lookups',
        'Integration',
        'Onboarding',
        'Premium service'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-white via-credion-grey to-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-credion-charcoal mb-6 leading-tight">
            Bigger insights. Better outcomes. {' '}
            <span className="text-gradient">Lower price.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Choose a plan that fits your business. All plans include both Credion and traditional credit scores.
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl flex flex-col h-full ${
                plan.popular ? 'border-credion-red scale-105' : 'border-gray-200 hover:border-credion-red'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-credion-red text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="p-8 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    {plan.icon}
                    <h3 className="text-2xl font-bold text-credion-charcoal ml-3">{plan.name}</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-credion-charcoal">{plan.price}</span>
                      <span className="text-gray-500 ml-2">{plan.period}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed">{plan.description}</p>
                  
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="text-credion-red mr-3 mt-1 flex-shrink-0" size={16} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/contact"
                    className={`w-full inline-flex items-center justify-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 mt-auto ${
                      plan.popular
                        ? 'bg-credion-red hover:bg-credion-red-dark text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                        : 'border-2 border-credion-charcoal text-credion-charcoal hover:bg-credion-charcoal hover:text-white'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2" size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad-hoc Pricing */}
      <section className="section-padding bg-credion-grey">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-credion-charcoal mb-6">
              Optional: Pay-per-report
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A$19 for ad-hoc full reports—great for occasional users.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-4xl font-bold text-credion-red mb-4">A$19</div>
              <div className="text-xl text-credion-charcoal font-semibold mb-2">Per Report</div>
              <div className="text-gray-600">Perfect for occasional credit checks and one-off assessments</div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link to="/contact" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center">
              Get Started
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-credion-charcoal mb-6">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-credion-grey p-6 rounded-xl">
              <h3 className="text-xl font-bold text-credion-charcoal mb-3">What's included in the free trial?</h3>
              <p className="text-gray-600">Your 30-day free trial includes full access to all features in your chosen plan, including ProbR Scores, monitoring, alerts, and API access. No credit card required to start.</p>
            </div>
            
            <div className="bg-credion-grey p-6 rounded-xl">
              <h3 className="text-xl font-bold text-credion-charcoal mb-3">Can I change plans anytime?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments.</p>
            </div>
            
            <div className="bg-credion-grey p-6 rounded-xl">
              <h3 className="text-xl font-bold text-credion-charcoal mb-3">How does monitoring work?</h3>
              <p className="text-gray-600">Once you add entities to monitor, we continuously track their ProbR Score and send instant alerts when significant changes occur. You can customize alert thresholds and delivery methods.</p>
            </div>
            
            <div className="bg-credion-grey p-6 rounded-xl">
              <h3 className="text-xl font-bold text-credion-charcoal mb-3">Is there a setup fee?</h3>
              <p className="text-gray-600">No setup fees for Starter and Growth plans. Enterprise customers receive complimentary onboarding and integration support as part of their custom pricing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-credion-charcoal text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see how Credion can protect your cashflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <Link to="/signup" className="bg-credion-red hover:bg-credion-red-dark text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center">
                Signup
                <ArrowRight className="ml-2" size={20} />
              </Link>
            )}
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-credion-charcoal font-semibold py-4 px-8 rounded-lg transition-all duration-200 inline-flex items-center justify-center">
              Request Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;