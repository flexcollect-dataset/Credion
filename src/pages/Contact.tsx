import { useState } from 'react';
import { Mail, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const subject = encodeURIComponent('Demo Request - Credion');
    const body = encodeURIComponent(`
Name: ${formData.name}
Company: ${formData.company}
Email: ${formData.email}
Phone: ${formData.phone}

Message:
${formData.message}

Please schedule a demo of the Credion platform and ProbR Score.
    `);
    
    const mailtoLink = `mailto:andrew@flexcollect.co,james@flexcollect.co?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        message: ''
      });
    }, 3000);
  };

  const faqs = [
    {
      question: 'How quickly can I get started?',
      answer: 'You can start your free trial immediately after signing up. Our team will contact you within 24 hours to help with onboarding and integration.'
    },
    {
      question: 'What data sources do you use?',
      answer: 'We analyze 100+ data sources including ASIC, PPSR, ATO, court records, trade payment data, sentiment analysis, and licensed commercial datasets.'
    },
    {
      question: 'How accurate is the ProbR Score?',
      answer: 'Our ProbR™ Score achieves 92% accuracy in predicting payment behavior, significantly outperforming traditional credit scores at 67% accuracy.'
    },
    {
      question: 'Can I integrate with my existing systems?',
      answer: 'Yes, we offer comprehensive API integration with popular CRM, ERP, and accounting systems including Salesforce, SAP, Xero, and MYOB.'
    },
    {
      question: 'What support do you provide?',
      answer: 'All customers receive premium onboarding, dedicated account management, and local Australian support. Enterprise customers get 24/7 support with SLA guarantees.'
    }
  ];

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-white via-credion-grey to-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-credion-charcoal mb-6 leading-tight">
            Let's talk {' '}
            <span className="text-gradient">repayment probability.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            See how Credion can protect your cashflow and cut bad debt before it happens.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h2 className="text-3xl font-bold text-credion-charcoal mb-6">Request a Demo</h2>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
                  <h3 className="text-2xl font-bold text-credion-charcoal mb-2">Thank you!</h3>
                  <p className="text-gray-600">We'll be in touch within 24 hours to schedule your demo.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-credion-charcoal mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-credion-red focus:border-transparent transition-all duration-200"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block text-sm font-semibold text-credion-charcoal mb-2">
                        Company *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-credion-red focus:border-transparent transition-all duration-200"
                        placeholder="Your company name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-credion-charcoal mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-credion-red focus:border-transparent transition-all duration-200"
                        placeholder="your.email@company.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-credion-charcoal mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-credion-red focus:border-transparent transition-all duration-200"
                        placeholder="+61 4XX XXX XXX"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-credion-charcoal mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-credion-red focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Tell us about your credit risk challenges and what you'd like to see in a demo..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full btn-primary text-lg py-4 inline-flex items-center justify-center"
                  >
                    Request Demo
                    <ArrowRight className="ml-2" size={20} />
                  </button>
                </form>
              )}
            </div>
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-credion-charcoal mb-6">Get in Touch</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Ready to see how Credion can transform your credit risk management? Our team is here to help you get started.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-credion-red rounded-full flex items-center justify-center">
                    <Mail className="text-white" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-credion-charcoal">Email</div>
                    <div className="text-gray-600">info@credion.com.au</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-credion-red rounded-full flex items-center justify-center">
                    <MapPin className="text-white" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-credion-charcoal">Address</div>
                    <div className="text-gray-600">
                      526/368 Sussex St, Sydney NSW 2000<br />
                      95 Third Street, 2nd Floor, San Francisco, California 94103<br />
                      48 Warwick Street, London, Greater London W1B 5AW
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-credion-red rounded-full flex items-center justify-center">
                    <Clock className="text-white" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-credion-charcoal">Business Hours</div>
                    <div className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM AEST</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-credion-grey p-6 rounded-xl">
                <h3 className="text-xl font-bold text-credion-charcoal mb-3">What happens next?</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-credion-red mr-2">1.</span>
                    We'll contact you within 24 hours to understand your needs
                  </li>
                  <li className="flex items-start">
                    <span className="text-credion-red mr-2">2.</span>
                    Schedule a personalised demo of the ProbR™ Score
                  </li>
                  <li className="flex items-start">
                    <span className="text-credion-red mr-2">3.</span>
                    Set up your free trial with sample data from your industry
                  </li>
                  <li className="flex items-start">
                    <span className="text-credion-red mr-2">4.</span>
                    Provide onboarding support and integration assistance
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-credion-grey">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-credion-charcoal mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quick answers to common questions about Credion and the ProbR Score
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-credion-charcoal mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-credion-charcoal text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to predict payment problems before they happen?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see the difference predictive credit intelligence makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-credion-red hover:bg-credion-red-dark text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
            >
              Signup
              <ArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;