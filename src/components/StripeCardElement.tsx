import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51SIdKfHzbA6hZtQghlH9aivNQpRNOnnYRyk5TvpsapHXkvF8tW2bVlnuP02FaWgF9jBNEVz4NykC35KOMgx9IDIq00EvTPwU4F');

interface StripeCardElementProps {
  onSubmit: (paymentMethod: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const CheckoutForm: React.FC<StripeCardElementProps> = ({ onSubmit, onCancel, loading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardholderName,
      },
    });

    if (error) {
      console.error('Error creating payment method:', error);
      alert('Error creating payment method: ' + error.message);
    } else {
      onSubmit(paymentMethod);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-credion-charcoal mb-2">
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-credion-red focus:border-credion-red focus:outline-none text-sm sm:text-base"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-credion-charcoal mb-2">
          Card Details
        </label>
        <div className="p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-credion-red focus-within:border-credion-red">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-credion-red text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm sm:text-base"
        >
          {loading ? 'Adding...' : 'Add Payment Method'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white text-credion-charcoal py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const StripeCardElement: React.FC<StripeCardElementProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCardElement;
