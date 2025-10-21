import { useState } from 'react';
import { Mail } from 'lucide-react';

const Resources = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link for newsletter signup
    const subject = encodeURIComponent('Newsletter Subscription - Credion');
    const body = encodeURIComponent(`
Email: ${email}

Please add this email address to the Credion newsletter subscription list.
    `);
    
    const mailtoLink = `mailto:andrew@flexcollect.co,james@flexcollect.co?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    setEmail('');
    alert('Thank you for subscribing! We\'ll add you to our newsletter list.');
  };

  return (
    <div className="pt-16 md:pt-20">
      {/* Hero Section with Newsletter Signup */}
      <section className="section-padding bg-gradient-to-br from-white via-credion-grey to-white min-h-screen flex items-center">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-credion-charcoal mb-6 leading-tight">
            Insights on credit risk {' '}
            <span className="text-gradient">and repayments.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Stay ahead of payment risks with expert insights, industry trends, and practical guidance from our team of credit risk specialists.
          </p>
          
          {/* Newsletter Signup */}
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-credion-charcoal mb-4">Stay Informed</h3>
            <p className="text-gray-600 mb-6">Get weekly insights on credit risk and payment trends delivered to your inbox.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-credion-red focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="btn-primary px-6 py-3 inline-flex items-center justify-center"
              >
                Subscribe
                <Mail className="ml-2" size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;