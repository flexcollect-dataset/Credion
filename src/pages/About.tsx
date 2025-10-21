import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, Award, Target, Heart, Lightbulb } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Target className="text-credion-red" size={32} />,
      title: 'Accuracy First',
      description: 'We obsess over prediction accuracy because your business decisions depend on it. Every model improvement directly impacts your bottom line.'
    },
    {
      icon: <Heart className="text-credion-red" size={32} />,
      title: 'Customer Success',
      description: 'Your success is our success. We measure ourselves by the bad debt you avoid and the opportunities you confidently pursue.'
    },
    {
      icon: <Lightbulb className="text-credion-red" size={32} />,
      title: 'Innovation',
      description: 'We continuously push the boundaries of what\'s possible in credit risk assessment, always staying ahead of the curve.'
    },
    {
      icon: <Shield className="text-credion-red" size={32} />,
      title: 'Trust & Transparency',
      description: 'We handle your data with the highest security standards and always explain how our models reach their conclusions.'
    }
  ];

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-white via-credion-grey to-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-credion-charcoal mb-6 leading-tight">
            We're redefining{' '}
            <span className="text-gradient">commercial credit reporting.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Credion is a registered Credit Reporting Bureau built to solve a simple problem, credit scores don't always predict who will actually pay you.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-credion-red mb-2">2024</div>
              <div className="text-gray-600">Founded</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-credion-red mb-2">2,500+</div>
              <div className="text-gray-600">Business Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-credion-red mb-2">$47M</div>
              <div className="text-gray-600">Bad Debt Prevented</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-credion-charcoal">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Our proprietary ProbR™ Score uses over 100 variables, from legal filings to payment behaviour and sentiment trends, to deliver a real-world view of client risk.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We help Australian businesses make smarter, faster credit decisions, and we're just getting started.
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-credion-red rounded-full flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <div className="font-semibold text-credion-charcoal">Credit Reporting Bureau</div>
                  <div className="text-gray-600">Regulated under ASIC and ATO</div>
                </div>
              </div>
            </div>
            
            <div className="bg-credion-charcoal text-white p-8 rounded-2xl">
              <blockquote className="text-2xl font-medium mb-6">
                "Traditional credit bureaus tell you about the past. We predict the future. That's the difference between knowing someone's credit history and knowing if they'll actually pay you."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-credion-red rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">SC</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah</div>
                  <div className="text-gray-300">CEO & Co-Founder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-credion-grey">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-credion-charcoal mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  {value.icon}
                  <h3 className="text-2xl font-bold text-credion-charcoal ml-4">{value.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Compliance Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-credion-charcoal mb-6">
              Regulatory Compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              We operate under the highest regulatory standards to protect your data and ensure compliance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-credion-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-credion-charcoal mb-2">Credit Reporting Bureau</h3>
              <p className="text-gray-600">Regulated under ASIC and ATO compliance frameworks.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-credion-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-credion-charcoal mb-2">Privacy Act Compliant</h3>
              <p className="text-gray-600">Strict adherence to Australian Privacy Principles and data protection requirements.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-credion-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold text-credion-charcoal mb-2">Cyber Secure</h3>
              <p className="text-gray-600">Advanced cybersecurity measures to protect your data and privacy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-credion-charcoal text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to join the future of credit reporting?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the difference that predictive credit intelligence can make for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-credion-red hover:bg-credion-red-dark text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center">
              Signup
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link to="/product" className="border-2 border-white text-white hover:bg-white hover:text-credion-charcoal font-semibold py-4 px-8 rounded-lg transition-all duration-200 inline-flex items-center justify-center">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;