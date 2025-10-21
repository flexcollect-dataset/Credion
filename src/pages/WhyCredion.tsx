import { Link } from 'react-router-dom';
import { ArrowRight, Check, Database, Zap } from 'lucide-react';

const WhyCredion = () => {
  const advantages = [
    {
      icon: <Database className="text-credion-red" size={32} />,
      title: 'Better Data',
      description: 'We analyse 100+ data sources including ASIC, PPSR, ATO, courts, trade payments, and sentiment analysis, far beyond traditional credit files. We use 1000\'s of real world variables.'
    },
    {
      icon: <Zap className="text-credion-red" size={32} />,
      title: 'Better Prediction',
      description: 'Our AI models predict repayment likelihood, not just creditworthiness. This forward-looking approach catches risks others miss.'
    },
    {
      icon: <Database className="text-credion-red" size={32} />,
      title: 'Better Decisions',
      description: 'Real-time updates and instant alerts mean you can act on changing risk before it becomes a payment problem.'
    }
  ];

  const comparisonData = [
    {
      feature: 'Core metric',
      credion: 'ProbR™ Score, predicts repayment likelihood',
      creditorwatch: 'Credit score, historic focus',
      illion: 'Credit score, historic focus',
      equifax: 'Credit score, historic focus'
    },
    {
      feature: 'Data sources',
      credion: '100+ sources incl. ASIC, PPSR, ATO, courts, trade payments, sentiment analysis, licensed datasets',
      creditorwatch: 'Primarily ASIC, PPSR, court data',
      illion: 'Similar to Competitors',
      equifax: 'Primarily credit file data & payment history'
    },
    {
      feature: 'Score type',
      credion: '0 to 1000, dynamic, real-time updates',
      creditorwatch: 'Static until rechecked',
      illion: 'Static until rechecked',
      equifax: 'Static until rechecked'
    },
    {
      feature: 'Monitoring',
      credion: 'Continuous with instant alerts',
      creditorwatch: 'Yes, limited event triggers',
      illion: 'Yes, limited',
      equifax: 'Yes'
    },
    {
      feature: 'Integration',
      credion: 'API into CRM, ERP, accounting',
      creditorwatch: 'Limited API',
      illion: 'Limited API',
      equifax: 'API (premium)'
    },
    {
      feature: 'Reason codes',
      credion: 'Always provided',
      creditorwatch: 'Limited detail',
      illion: 'Limited detail',
      equifax: 'Limited detail'
    },
    {
      feature: 'Pricing',
      credion: 'Undercuts major CRBs',
      creditorwatch: 'Higher',
      illion: 'Higher',
      equifax: 'Higher'
    },
    {
      feature: 'Support',
      credion: 'Premium onboarding & local support',
      creditorwatch: 'Standard',
      illion: 'Standard',
      equifax: 'Standard'
    }
  ];

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-white via-credion-grey to-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-credion-charcoal mb-6 leading-tight">
            Better data. Better prediction.{' '}
            <span className="text-gradient">Better decisions.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Credion outperforms legacy credit bureaus by using broader data, more context, and real-time analysis.
          </p>
          
          <div className="bg-credion-red text-white p-8 rounded-2xl max-w-4xl mx-auto">
            <blockquote className="text-2xl md:text-3xl font-medium mb-4">
              "Our clients spot payment issues an average of 45 days earlier than with traditional scores."
            </blockquote>
            <div className="text-credion-grey text-lg italic">Institutional Client</div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {advantages.map((advantage, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-credion-grey rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-credion-red group-hover:text-white transition-all duration-300">
                  {advantage.icon}
                </div>
                <h3 className="text-2xl font-bold text-credion-charcoal mb-4">{advantage.title}</h3>
                <p className="text-gray-600 leading-relaxed">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section-padding bg-credion-grey">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-credion-charcoal mb-6">
              How We Compare
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See why leading businesses are switching to Credion
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-credion-charcoal text-white">
                  <tr>
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-left p-4 font-semibold bg-credion-red">Credion</th>
                    <th className="text-left p-4 font-semibold" style={{filter: 'blur(3px)'}}>Competitor A</th>
                    <th className="text-left p-4 font-semibold" style={{filter: 'blur(3px)'}}>Competitor B</th>
                    <th className="text-left p-4 font-semibold" style={{filter: 'blur(3px)'}}>Competitor C</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-4 font-semibold text-credion-charcoal border-r border-gray-200">
                        {row.feature}
                      </td>
                      <td className="p-4 bg-credion-red/5 border-r border-credion-red/20 font-medium text-credion-charcoal">
                        <div className="flex items-start">
                          <Check className="text-credion-red mr-2 mt-1 flex-shrink-0" size={16} />
                          {row.credion}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 border-r border-gray-200">
                        {row.creditorwatch}
                      </td>
                      <td className="p-4 text-gray-600 border-r border-gray-200">
                        {row.illion}
                      </td>
                      <td className="p-4 text-gray-600">
                        {row.equifax}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Why Switch Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-credion-charcoal">
                Why businesses are switching to Credion
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-credion-red rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-credion-charcoal mb-2">Earlier Warning</h3>
                    <p className="text-gray-600">Spot payment problems 45 days earlier on average than traditional credit scores.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-credion-red rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-credion-charcoal mb-2">Better Accuracy</h3>
                    <p className="text-gray-600">92% accuracy in predicting payment behavior vs 67% for traditional scores.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-credion-red rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-credion-charcoal mb-2">Cost Savings</h3>
                    <p className="text-gray-600">Reduce bad debt by up to 40% while paying less than legacy bureau fees.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-credion-red rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-credion-charcoal mb-2">Easy Integration</h3>
                    <p className="text-gray-600">Simple API integration with your existing CRM, ERP, or accounting systems.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-credion-charcoal text-white p-8 rounded-2xl">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-credion-red mb-2">2,500+</div>
                  <div className="text-gray-300">Businesses trust Credion</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-credion-red mb-2">$47M</div>
                  <div className="text-gray-300">Bad debt prevented in 2024</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-credion-red mb-2">98%</div>
                  <div className="text-gray-300">Client satisfaction rate</div>
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
            Ready to make the switch?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Credion to make smarter credit decisions.
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

export default WhyCredion;