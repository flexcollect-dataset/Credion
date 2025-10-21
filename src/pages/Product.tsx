import { Link } from 'react-router-dom';
import { ArrowRight, Zap, FileText, Eye, Cpu, AlertTriangle, BarChart } from 'lucide-react';
import ScoreDial from '../components/ScoreDial';

const Product = () => {
  const features = [
    {
      icon: <Zap className="text-credion-red" size={24} />,
      title: '0–1000 dynamic scoring',
      description: 'Updated as new data arrives, giving you the most current risk assessment.'
    },
    {
      icon: <FileText className="text-credion-red" size={24} />,
      title: 'Full credit intelligence reports',
      description: 'See the detail behind the number with comprehensive risk analysis.'
    },
    {
      icon: <Eye className="text-credion-red" size={24} />,
      title: 'Point-in-time or continuous monitoring',
      description: 'Choose what works for you, one-off checks or ongoing surveillance.'
    },
    {
      icon: <Cpu className="text-credion-red" size={24} />,
      title: 'API integration',
      description: 'Connect Credion directly to your CRM, ERP, or accounting software.'
    },
    {
      icon: <AlertTriangle className="text-credion-red" size={24} />,
      title: 'Reason codes',
      description: 'Understand exactly why a score changed with detailed explanations.'
    },
    {
      icon: <BarChart className="text-credion-red" size={24} />,
      title: 'Trend analysis',
      description: 'Track score changes over time to identify emerging risks.'
    }
  ];

  const scoreRanges = [
    { range: '900-1000', label: 'Excellent', color: 'bg-green-500', description: 'Very low risk of payment default' },
    { range: '800-899', label: 'Very Good', color: 'bg-green-400', description: 'Low risk of payment default' },
    { range: '700-799', label: 'Good', color: 'bg-yellow-400', description: 'Moderate risk of payment default' },
    { range: '600-699', label: 'Fair', color: 'bg-orange-400', description: 'Higher risk of payment default' },
    { range: '500-599', label: 'Poor', color: 'bg-red-400', description: 'High risk of payment default' },
    { range: '0-499', label: 'Very Poor', color: 'bg-red-600', description: 'Very high risk of payment default' }
  ];

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-white via-credion-grey to-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold text-credion-charcoal leading-tight">
                The ProbR™ Score, a new{' '}
                <span className="text-gradient">gold standard</span>{' '}
                for B2B credit risk.
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                A traditional credit score looks backward. We look forward. The ProbR™ Score measures how likely your client is to pay you, not just their credit history.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center">
                  Try ProbR™ Score
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <Link to="/why-credion" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center">
                  See Comparison
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center">
              <ScoreDial score={785} size="lg" animated={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-credion-charcoal mb-6">
              Key Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to make informed credit decisions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-bold text-credion-charcoal ml-3">{feature.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Score Interpretation */}
      <section className="section-padding bg-credion-grey">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-credion-charcoal mb-6">
              Understanding Your ProbR™ Score
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our 0-1000 scale gives you precise risk assessment at a glance
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scoreRanges.map((range, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className={`w-4 h-4 rounded-full ${range.color} mr-3`}></div>
                    <div className="font-bold text-credion-charcoal text-lg">{range.range}</div>
                  </div>
                  <div className="text-xl font-semibold text-credion-charcoal mb-2">{range.label}</div>
                  <div className="text-gray-600 text-sm">{range.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It's Different */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-credion-charcoal mb-6">
              How ProbR™ Score is Different
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="border-l-4 border-credion-red pl-6">
                <h3 className="text-2xl font-bold text-credion-charcoal mb-3">Traditional Credit Scores</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Based primarily on credit history</li>
                  <li>• Static until manually refreshed</li>
                  <li>• Limited data sources</li>
                  <li>• Backward-looking analysis</li>
                  <li>• Generic risk assessment</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-2xl font-bold text-credion-charcoal mb-3">ProbR™ Score</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Predicts actual repayment likelihood</li>
                  <li>• Updates in real-time as data changes</li>
                  <li>• 100+ comprehensive data sources</li>
                  <li>• Forward-looking predictive model</li>
                  <li>• Tailored to B2B payment behaviour</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-credion-charcoal text-white p-8 rounded-2xl">
              <blockquote className="text-2xl font-medium mb-6">
                "The ProbR™ Score helped us identify a payment risk 6 weeks before our client defaulted. Traditional credit scores showed them as 'good' right up until they stopped paying."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-credion-red rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">JM</span>
                </div>
                <div>
                  <div className="font-semibold">James Mitchell</div>
                  <div className="text-gray-300">CFO, BuildCorp Australia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-credion-charcoal text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to experience the ProbR™ Score?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            See how predictive credit scoring can transform your risk management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-credion-red hover:bg-credion-red-dark text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center">
              Signup
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link to="/pricing" className="border-2 border-white text-white hover:bg-white hover:text-credion-charcoal font-semibold py-4 px-8 rounded-lg transition-all duration-200 inline-flex items-center justify-center">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Product;