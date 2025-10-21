import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Search, Users, TrendingUp, Eye, Lock, CheckCircle, Phone, Mail, Target, Network, Activity } from 'lucide-react';

const Government = () => {
  const capabilities = [
    {
      icon: <Search className="text-credion-red" size={32} />,
      title: 'Identity & Location Resolution',
      description: 'Unmask hard-to-find individuals through skip tracing powered by multi-source fusion — telecommunications, utilities, property holdings, business records, court filings, and more.'
    },
    {
      icon: <Network className="text-credion-red" size={32} />,
      title: 'Network & Association Mapping',
      description: 'Visualise the entities, companies, and relationships surrounding a person of interest. Detect hidden connections that evade conventional checks.'
    },
    {
      icon: <Activity className="text-credion-red" size={32} />,
      title: 'Pattern & Behaviour Analysis',
      description: 'Monitor payment patterns, sentiment shifts, and public-facing activity to identify pre-incident indicators of fraud, non-compliance, or hostile intent.'
    },
    {
      icon: <Eye className="text-credion-red" size={32} />,
      title: 'Event & Threat Monitoring',
      description: 'Continuous tracking of online chatter, media, and structured datasets to detect emerging threats and high-value opportunities for operational action.'
    },
    {
      icon: <TrendingUp className="text-credion-red" size={32} />,
      title: 'Financial & Asset Tracing',
      description: 'Identify concealed assets, encumbrances, and funding flows, including through complex ownership structures and layered entities.'
    }
  ];

  const advantages = [
    {
      title: 'Integrated Intelligence Platform',
      description: 'Combines CRB data, OSINT, licensed datasets, and behavioural analytics.'
    },
    {
      title: 'Real-Time Monitoring',
      description: 'Push alerts when subjects change address, alter corporate interests, or trigger new data events.'
    },
    {
      title: 'Covert-Safe',
      description: 'Discreet, no-contact intelligence gathering, minimising attribution risk.'
    },
    {
      title: 'Sovereign Data Control',
      description: 'All data processed and stored within Australia.'
    },
    {
      title: 'Custom API Feeds',
      description: 'Drop intelligence directly into your investigative or case-management systems.'
    }
  ];

  const useCases = [
    'Skip tracing debtors, suspects, and persons of interest',
    'Counter-fraud and corruption investigations',
    'Foreign influence monitoring across commercial and social networks',
    'Event intelligence to inform deployments or protective operations',
    'Background vetting of contractors, suppliers, and grant recipients',
    'Target package development for operational planning'
  ];

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-white via-credion-grey to-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-credion-charcoal mb-6 leading-tight">
            Credion Government
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-bold text-credion-red mb-8">
            Locate. Monitor. Understand.
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Credion Government is the precision intelligence arm of Credion, built for agencies that need to find people, track activity, and uncover the networks behind them. Our technology fuses real-time financial, behavioural, and open-source intelligence into a single operational picture — empowering government teams to act faster, with greater accuracy, and at scale.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center">
              Request Intelligence Access
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <a 
              href="mailto:govt@credion.com.au" 
              className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center"
            >
              Contact Intelligence Team
            </a>
          </div>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-credion-charcoal mb-6">
              Core Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Precision intelligence tools for operational excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="flex items-center mb-4">
                  {capability.icon}
                  <h3 className="text-xl font-bold text-credion-charcoal ml-3">{capability.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="section-padding bg-credion-grey">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-credion-charcoal">
                Use Cases
              </h2>
              
              <div className="space-y-4">
                {useCases.map((useCase, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-credion-red rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Target className="text-white" size={12} />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{useCase}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-credion-charcoal text-white p-8 rounded-2xl">
              <div className="flex items-center mb-6">
                <Shield className="text-credion-red mr-4" size={48} />
                <div>
                  <h3 className="text-2xl font-bold">Operational Intelligence</h3>
                  <p className="text-gray-300">Built for mission-critical operations</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                From counter-fraud investigations to foreign influence monitoring, Credion Government delivers the intelligence depth and operational security that government agencies require.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Lock className="text-credion-red mr-2" size={16} />
                  <span>Covert-Safe Operations</span>
                </div>
                <div className="flex items-center">
                  <Lock className="text-credion-red mr-2" size={16} />
                  <span>Real-Time Intelligence</span>
                </div>
                <div className="flex items-center">
                  <Lock className="text-credion-red mr-2" size={16} />
                  <span>Sovereign Data Control</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Credion Government */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-credion-charcoal mb-6">
              Why Credion Government
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-credion-red rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-credion-charcoal mb-2">{advantage.title}</h3>
                    <p className="text-gray-600">{advantage.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Background Section */}
      <section className="section-padding bg-credion-grey">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-credion-charcoal mb-6">
              Built by Intelligence Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team brings decades of experience from the world's leading defense, intelligence, and law enforcement agencies
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Shield className="text-credion-red" size={32} />
              </div>
              <h3 className="text-sm font-bold text-credion-charcoal mb-1">Australian</h3>
              <h3 className="text-sm font-bold text-credion-charcoal mb-2">Government</h3>
              <p className="text-xs text-gray-600">Policy & Operations</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Shield className="text-credion-red" size={32} />
              </div>
              <h3 className="text-sm font-bold text-credion-charcoal mb-1">UK</h3>
              <h3 className="text-sm font-bold text-credion-charcoal mb-2">Government</h3>
              <p className="text-xs text-gray-600">Intelligence & Security</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Shield className="text-credion-red" size={32} />
              </div>
              <h3 className="text-sm font-bold text-credion-charcoal mb-1">Australian</h3>
              <h3 className="text-sm font-bold text-credion-charcoal mb-2">Department of Defence</h3>
              <p className="text-xs text-gray-600">Strategic Intelligence</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Target className="text-credion-red" size={32} />
              </div>
              <h3 className="text-sm font-bold text-credion-charcoal mb-1">Australian Strategic</h3>
              <h3 className="text-sm font-bold text-credion-charcoal mb-2">Policy Institute</h3>
              <p className="text-xs text-gray-600">Policy & Analysis</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Users className="text-credion-red" size={32} />
              </div>
              <h3 className="text-sm font-bold text-credion-charcoal mb-1">UK Metropolitan</h3>
              <h3 className="text-sm font-bold text-credion-charcoal mb-2">Police</h3>
              <p className="text-xs text-gray-600">Criminal Intelligence</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Eye className="text-credion-red" size={32} />
              </div>
              <h3 className="text-sm font-bold text-credion-charcoal mb-1">Cyber Security</h3>
              <h3 className="text-sm font-bold text-credion-charcoal mb-2">Government Vendors</h3>
              <p className="text-xs text-gray-600">Security & Compliance</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Network className="text-credion-red" size={32} />
              </div>
              <h3 className="text-sm font-bold text-credion-charcoal mb-1">General Counsel</h3>
              <h3 className="text-sm font-bold text-credion-charcoal mb-2">Fortune 500 Company</h3>
              <p className="text-xs text-gray-600">Legal & Compliance</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Activity className="text-credion-red" size={32} />
              </div>
              <h3 className="text-sm font-bold text-credion-charcoal mb-1">Financial</h3>
              <h3 className="text-sm font-bold text-credion-charcoal mb-2">Intelligence Units</h3>
              <p className="text-xs text-gray-600">AML & Counter-Terrorism</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-credion-charcoal text-white p-8 rounded-2xl max-w-4xl mx-auto">
              <blockquote className="text-xl md:text-2xl font-medium mb-6">
                "Our team understands the operational requirements of government agencies because we've been there. We've built Credion Government with the precision, security, and reliability that mission-critical operations demand."
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-credion-red rounded-full flex items-center justify-center mr-4">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-semibold">Intelligence Team</div>
                  <div className="text-gray-300">Credion Government</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section className="section-padding bg-credion-charcoal text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Contact Credion Government
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Precision intelligence for government operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-8">
            <div className="flex items-center space-x-3">
              <Mail className="text-credion-red" size={24} />
              <a href="mailto:govt@credion.com.au" className="text-xl hover:text-credion-red transition-colors">
                govt@credion.com.au
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="text-credion-red" size={24} />
              <a href="tel:1300000000" className="text-xl hover:text-credion-red transition-colors">
                1300 000 000
              </a>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-credion-red hover:bg-credion-red-dark text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center">
              Request Intelligence Demo
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <a 
              href="mailto:govt@credion.com.au" 
              className="border-2 border-white text-white hover:bg-white hover:text-credion-charcoal font-semibold py-4 px-8 rounded-lg transition-all duration-200 inline-flex items-center justify-center"
            >
              Email Intelligence Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Government;