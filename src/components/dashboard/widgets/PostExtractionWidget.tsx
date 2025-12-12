import { motion } from 'framer-motion';
import { MapPin, Mail, ExternalLink, Copy } from 'lucide-react';

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
}

export const PostExtractionWidget = ({ wonGift, giftRecipient, myGift, myCity }: PostExtractionWidgetProps) => {
  const handleCopyLink = () => {
    // In real app, copy the actual gift URL
    navigator.clipboard.writeText('Gift URL here');
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
    </motion.div>
  );
};
