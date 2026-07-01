import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { subscriptionService } from '../../src/services/subscription';
import toast from 'react-hot-toast';

export default function SubscriptionCheckout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cmi'); // Changé à 'cmi' par défaut
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
  });

  if (!plan) {
    navigate('/subscription/plans');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const paymentDetails = {
        card_number: cardDetails.number.replace(/\s/g, ''),
        card_expiry: cardDetails.expiry,
        card_cvv: cardDetails.cvc,
      };
      
      const response = await subscriptionService.checkout(plan, paymentMethod, paymentDetails);
      
      if (response?.success) {
        toast.success(t('subscription.checkout.success'));
        navigate('/subscription/plans');
      } else {
        toast.error(response?.message || t('subscription.checkout.paymentError'));
      }
    } catch (error) {
      const message = error.response?.data?.message || t('subscription.checkout.paymentError');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const planNames = { standard: t('subscription.plans.standard'), premium: t('subscription.plans.premium') };
  const planPrices = { standard: 99, premium: 199 };

  return (
    <div className="container mx-auto py-12 max-w-2xl px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('subscription.checkout.title')}</h1>
        <p className="text-gray-600 mb-6">
          {t('subscription.checkout.summary', { plan: planNames[plan], price: planPrices[plan] })}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('subscription.checkout.paymentMethod')}
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`flex-1 p-3 border rounded-xl text-center transition-all ${
                  paymentMethod === 'stripe'
                    ? 'border-[#009966] bg-[#e6f7f5] ring-2 ring-[#009966]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                💳 {t('subscription.checkout.creditCard')}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cmi')}
                className={`flex-1 p-3 border rounded-xl text-center transition-all ${
                  paymentMethod === 'cmi'
                    ? 'border-[#009966] bg-[#e6f7f5] ring-2 ring-[#009966]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                🏦 {t('subscription.checkout.cmi')}
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('subscription.checkout.cardNumber')}
              </label>
              <input
                type="text"
                required
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                placeholder="4242 4242 4242 4242"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('subscription.checkout.cardExpiry')}
                </label>
                <input
                  type="text"
                  required
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('subscription.checkout.cvc')}
                </label>
                <input
                  type="text"
                  required
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009966] focus:border-transparent"
                  placeholder="123"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">{t('subscription.checkout.total')}</span>
              <span className="text-xl font-bold text-gray-900">{planPrices[plan]} {t('subscription.currency')}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#009966] text-white py-3 rounded-xl font-semibold hover:bg-[#00734d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('subscription.checkout.processing') : t('subscription.checkout.pay', { price: planPrices[plan] })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}