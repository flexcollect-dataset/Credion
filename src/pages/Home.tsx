import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Shield, Bell } from 'lucide-react';
import ScoreDial from '../components/ScoreDial';
import NetworkVisualization from '../components/NetworkVisualization';

const Home = () => {
  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-credion-grey to-white">
        <NetworkVisualization />
        
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-credion-charcoal leading-tight">
                A credit score means{' '}
                <span className="text-gradient">nothing</span>{' '}
                if they can't pay you.
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                Know who will actually pay you, before they don't. Credion's dynamic 0 to 1000 Risk Score™ predicts (re)payment likelihood. Foresight that a credit score alone can't.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center">
                  Check a Client
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <Link to="/contact" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center">
                  Signup
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center gap-8 animate-slide-up">
              <div className="text-center">
                <ScoreDial score={750} size="lg" animated={true} />
                <p className="mt-4 text-lg font-semibold text-credion-charcoal">Dynamic ProbR™ Score</p>
                <p className="text-gray-600">Updates in real-time</p>
              </div>
              <div className="text-center">
                <ScoreDial score={550} size="lg" animated={false} label="Credit Score" />
                <p className="mt-4 text-lg font-semibold text-credion-charcoal">Traditional Credit Score</p>
                <p className="text-gray-600">Static until refreshed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-credion-charcoal mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Know who will actually pay you, before they don't. Credion's dynamic 0 to 1000 score predicts (re)payment likelihood. Foresight that a credit score alone can't.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-credion-red rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-credion-charcoal mb-4">Analyse</h3>
              <p className="text-gray-600 leading-relaxed">
                We combine over 100 variables from ASIC, PPSR, ATO, courts, trade data, sentiment analysis, and more.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-credion-red rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-credion-charcoal mb-4">Predict</h3>
              <p className="text-gray-600 leading-relaxed">
                Our proprietary model delivers a ProbR™ Score tailored to repayment likelihood.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-credion-red rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Bell className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-credion-charcoal mb-4">Monitor</h3>
              <p className="text-gray-600 leading-relaxed">
                Get alerts the moment a client's score changes, before it becomes a payment problem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credion Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Features list */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-credion-charcoal leading-tight">
                  Make better credit decisions and expand access to credit with data and analytics only{' '}
                  <span className="text-gradient">Credion</span> can deliver.
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="group cursor-pointer">
                  <h3 className="text-xl font-bold text-credion-red group-hover:text-credion-red-dark transition-colors duration-200 mb-2">
                    Monitor and Manage Client Risk Score™
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Track your clients' ProbR™ Score in real-time and receive instant alerts when risk levels change.
                  </p>
                </div>
                
                <div className="group cursor-pointer">
                  <h3 className="text-xl font-bold text-credion-red group-hover:text-credion-red-dark transition-colors duration-200 mb-2">
                    Identify New Customer Credit Risk
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Assess potential clients before extending credit using our predictive ProbR™ Score technology.
                  </p>
                </div>
                
                <div className="group cursor-pointer">
                  <h3 className="text-xl font-bold text-credion-red group-hover:text-credion-red-dark transition-colors duration-200 mb-2">
                    Optimize Portfolio Performance
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Maximize returns while minimizing risk across your entire client portfolio with dynamic Risk Score™ insights.
                  </p>
                </div>
                
                <div className="group cursor-pointer">
                  <h3 className="text-xl font-bold text-credion-red group-hover:text-credion-red-dark transition-colors duration-200 mb-2">
                    Analyze Multi-Data Assets for Credit Risk
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Leverage 100+ data sources including ASIC, PPSR, ATO, and sentiment analysis for comprehensive risk assessment.
                  </p>
                </div>
                
                <div className="group cursor-pointer">
                  <h3 className="text-xl font-bold text-credion-red group-hover:text-credion-red-dark transition-colors duration-200 mb-2">
                    Improve Collections & Recovery Strategies
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Use ProbR™ Score insights to prioritize collection efforts and develop targeted recovery approaches.
                  </p>
                </div>
                
                <div className="group cursor-pointer">
                  <h3 className="text-xl font-bold text-credion-red group-hover:text-credion-red-dark transition-colors duration-200 mb-2">
                    Access Market & Business Intelligence
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Gain competitive insights and market intelligence to inform strategic business decisions.
                  </p>
                </div>
              </div>
              
              <div className="pt-4">
                <Link 
                  to="/product" 
                  className="text-credion-red hover:text-credion-red-dark font-bold text-lg inline-flex items-center group"
                >
                  View All Risk Score™ Features
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" size={20} />
                </Link>
              </div>
            </div>
            
            {/* Right side - Industries We Serve */}
            <div className="relative">
              <div className="bg-gradient-to-br from-credion-grey to-white p-8 rounded-2xl shadow-xl">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-credion-charcoal mb-2">Industries We Serve</h3>
                  <p className="text-gray-600">Trusted across diverse sectors for credit risk intelligence</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    'Automotive',
                    'Capital Markets',
                    'Commercial',
                    'Communications & Utilities',
                    'Credit Unions',
                    'Financial Services',
                    'Fintech',
                    'Gaming',
                    'Government',
                    'Healthcare',
                    'Higher Education',
                    'Insurance',
                    'Logistics',
                    'Manufacturing',
                    'Mortgage & Housing',
                    'Payments',
                    'Pre-employment Screening',
                    'Professional Services',
                    'Retail & E-commerce'
                  ].map((industry, index) => (
                    <div 
                      key={index}
                      className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 hover:border-credion-red/20 group"
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-credion-red rounded-full mr-3 group-hover:scale-125 transition-transform duration-200"></div>
                        <span className="text-credion-charcoal font-medium group-hover:text-credion-red transition-colors duration-200">
                          {industry}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-credion-red text-white p-4 rounded-xl shadow-lg">
                  <div className="text-lg font-bold">19+</div>
                  <div className="text-xs">Industries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-padding bg-credion-grey">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-credion-charcoal mb-6">
              Trusted by businesses nationwide to reduce bad debt and protect cashflow
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-credion-red mb-2">45</div>
              <div className="text-lg font-semibold text-credion-charcoal mb-2">Days Earlier</div>
              <div className="text-gray-600">Average early warning vs traditional scores</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-credion-red mb-2">92%</div>
              <div className="text-lg font-semibold text-credion-charcoal mb-2">Accuracy</div>
              <div className="text-gray-600">Repayment prediction accuracy rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-credion-red mb-2">$2.3M</div>
              <div className="text-lg font-semibold text-credion-charcoal mb-2">Bad Debt Prevented</div>
              <div className="text-gray-600">Demonstrated savings across institutional clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-credion-charcoal text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to predict payment problems before they happen?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses using Credion to make smarter credit decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-credion-red hover:bg-credion-red-dark text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center">
              Signup
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-credion-charcoal font-semibold py-4 px-8 rounded-lg transition-all duration-200 inline-flex items-center justify-center">
              Request Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;