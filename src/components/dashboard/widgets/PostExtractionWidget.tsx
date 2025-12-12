import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Mail, ExternalLink, Copy, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase/client';

interface PostExtractionWidgetProps {
  wonGift: {
    id: string;
    title: string;
    type: 'digital' | 'physical';
    message: string | null;
    photo_url: string | null;
    keyword: string;
  };
  giftRecipient: {
    full_name: string;
    email: string;
    contact_email: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    province: string | null;
    notes: string | null;
    is_complete: boolean;
  } | null;
  myGift: {
    id: string;
    type: 'digital' | 'physical';
    title: string;
  } | null;
  myCity: string | null;
  currentUser: {
    id: string;
    full_name: string;
    email: string;
    is_shipping_address_complete: boolean;
  } | null;
}

export const PostExtractionWidget = ({ wonGift, giftRecipient, myGift, myCity, currentUser }: PostExtractionWidgetProps) => {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    contactEmail: '',
    street: '',
    city: '',
    zip: '',
    province: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCopyLink = () => {
    // In real app, copy the actual gift URL
    navigator.clipboard.writeText('Gift URL here');
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    // Validation
    if (!addressForm.contactEmail.trim()) {
      setError('L\'email personale è obbligatoria');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addressForm.contactEmail)) {
      setError('Inserisci un\'email valida');
      return;
    }

    if (!addressForm.street.trim() || !addressForm.city.trim() || !addressForm.zip.trim()) {
      setError('Compila tutti i campi obbligatori dell\'indirizzo');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          contact_email: addressForm.contactEmail,
          shipping_address_street: addressForm.street,
          shipping_address_city: addressForm.city,
          shipping_address_zip: addressForm.zip,
          shipping_address_province: addressForm.province || null,
          shipping_address_notes: addressForm.notes || null,
          is_shipping_address_complete: true
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      // Close modal and refresh page
      setIsAddressModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Errore durante il salvataggio');
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* 1. RECEIVED GIFT CARD */}
      <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header Image */}
        <div className="h-48 bg-slate-200 relative">
          {wonGift.photo_url ? (
            <img
              src={wonGift.photo_url}
              alt={wonGift.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <span className="text-6xl">{wonGift.keyword}</span>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${wonGift.type === 'digital' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
              {wonGift.type === 'digital' ? 'Regalo Digitale' : 'Regalo Fisico'}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hai ricevuto</h3>
            <h2 className="text-2xl font-black text-slate-900 leading-tight mb-2">
              {wonGift.title}
            </h2>

            {/* Warning if address not complete */}
            {currentUser && !currentUser.is_shipping_address_complete && (
              <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-orange-600 shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-orange-900 font-semibold mb-2">
                      ⚠️ Compila i tuoi dati per ricevere il regalo
                    </p>
                    <p className="text-xs text-orange-800 mb-3">
                      Chi ti ha fatto il regalo ha bisogno del tuo indirizzo per spedirtelo!
                    </p>
                    <button
                      onClick={() => setIsAddressModalOpen(true)}
                      className="w-full py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-500 transition-colors text-sm"
                    >
                      Compila i dati ora
                    </button>
                  </div>
                </div>
              </div>
            )}

            {wonGift.message && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 relative mt-4">
                <span className="absolute -top-3 left-4 text-2xl">❝</span>
                <p className="text-slate-700 italic font-[Spectral] text-lg relative z-10 px-2">
                  {wonGift.message}
                </p>
              </div>
            )}
          </div>

          {wonGift.type === 'digital' && (
            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Link di riscatto</span>
                <ExternalLink size={14} className="text-slate-400" />
              </div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value="Il link verrà fornito dal mittente"
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Copia"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. MY GIFTEE CARD */}
      {giftRecipient ? (
        <div className="bg-slate-800/80 backdrop-blur border border-white/10 rounded-3xl p-6 shadow-xl text-white">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-2xl border border-indigo-500/30">
              🎁
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hai regalato a</h3>
              <div className="text-xl font-bold">{giftRecipient.full_name}</div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Show different content based on gift type */}
            {myGift?.type === 'digital' ? (
              <>
                <div className="p-4 bg-blue-50/10 border border-blue-400/20 rounded-xl">
                  <p className="text-sm text-blue-200 font-semibold mb-2">
                    💻 Regalo Digitale
                  </p>
                  <p className="text-xs text-slate-400">
                    Potrebbe tornarti utile spedire il regalo a:
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-yellow-400 shrink-0 mt-1" size={20} />
                  <div>
                    <span className="block text-xs text-slate-500 font-bold uppercase mb-1">
                      {giftRecipient.contact_email ? 'Email Personale' : 'Email'}
                    </span>
                    <p className="text-slate-200 font-mono text-sm">
                      {giftRecipient.contact_email || giftRecipient.email}
                    </p>
                    {giftRecipient.contact_email && (
                      <p className="text-xs text-slate-500 mt-1">Usa questa email per spedire il regalo digitale</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Contact Email */}
                {giftRecipient.contact_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="text-yellow-400 shrink-0 mt-1" size={20} />
                    <div>
                      <span className="block text-xs text-slate-500 font-bold uppercase mb-1">Email Personale</span>
                      <p className="text-slate-200 font-mono text-sm">
                        {giftRecipient.contact_email}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Contatta questa email per coordinare la spedizione</p>
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {(giftRecipient.address || giftRecipient.city || giftRecipient.postal_code) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="text-red-400 shrink-0 mt-1" size={20} />
                    <div>
                      <span className="block text-xs text-slate-500 font-bold uppercase mb-1">Indirizzo di spedizione</span>
                      <p className="text-slate-200 leading-relaxed font-mono text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                        {giftRecipient.address && <span>{giftRecipient.address}<br/></span>}
                        {(giftRecipient.postal_code || giftRecipient.city) && (
                          <span>
                            {giftRecipient.postal_code && `${giftRecipient.postal_code} `}
                            {giftRecipient.city}
                            {giftRecipient.province && ` (${giftRecipient.province})`}
                          </span>
                        )}
                      </p>
                      {giftRecipient.notes && (
                        <p className="text-sm text-slate-400 italic mt-2">
                          Note: {giftRecipient.notes}
                        </p>
                      )}
                      {!giftRecipient.is_complete && (
                        <div className="mt-2 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                          ⚠️ Indirizzo potrebbe essere incompleto
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Warning if address incomplete */}
                {!giftRecipient.is_complete && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-sm text-yellow-200 font-semibold">
                      ⚠️ Il destinatario non ha completato l'indirizzo di spedizione
                    </p>
                    <p className="text-xs text-yellow-300/70 mt-1">
                      Contattalo per completare il suo indirizzo
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/80 backdrop-blur border border-white/10 rounded-3xl p-8 shadow-xl text-center text-slate-400">
          <p className="text-lg">In attesa che qualcuno scelga il tuo regalo...</p>
        </div>
      )}

      <div className="text-center pt-8 pb-4">
        <p className="text-slate-500 text-sm italic">
          Grazie per aver partecipato al Secret Santa! 🎅<br/>
          Ci vediamo l'anno prossimo!
        </p>
      </div>

      {/* Address Completion Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddressModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Completa i tuoi dati</h2>
                  <p className="text-sm text-slate-600 mt-1">Necessari per ricevere il tuo regalo</p>
                </div>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email Personale *
                  </label>
                  <input
                    type="email"
                    required
                    value={addressForm.contactEmail}
                    onChange={(e) => setAddressForm({ ...addressForm, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="tua.email@esempio.com"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Email per essere contattato (diversa dall'email di accesso)
                  </p>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Indirizzo *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Via/Piazza, numero civico"
                  />
                </div>

                {/* City and ZIP */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      CAP *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.zip}
                      onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="00100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Città *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Roma"
                    />
                  </div>
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={addressForm.province}
                    onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="RM"
                    maxLength={2}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Note aggiuntive
                  </label>
                  <textarea
                    value={addressForm.notes}
                    onChange={(e) => setAddressForm({ ...addressForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Citofono, piano, ecc."
                    rows={2}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Salvataggio...' : 'Salva'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
