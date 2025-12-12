import { motion } from 'framer-motion';
import { Gift, Package, MapPin, Mail, User } from 'lucide-react';

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
  // Determine if cities are different (for physical gifts)
  const isDifferentCity = myCity && giftRecipient?.city && myCity.toLowerCase() !== giftRecipient.city.toLowerCase();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card 1: Il Regalo Vinto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-xl border-4 border-yellow-400"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Gift className="w-6 h-6 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Il Tuo Regalo</h2>
        </div>

        {wonGift.photo_url && (
          <div className="mb-4 rounded-xl overflow-hidden border-4 border-gray-200">
            <img
              src={wonGift.photo_url}
              alt={wonGift.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
              Keyword
            </p>
            <p className="text-lg font-semibold text-green-700">{wonGift.keyword}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
              Titolo
            </p>
            <p className="text-2xl font-black text-red-600">{wonGift.title}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
              Tipo
            </p>
            <p className="text-md text-gray-700">
              {wonGift.type === 'digital' ? '💻 Digitale' : '📦 Fisico'}
            </p>
          </div>

          {wonGift.message && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 uppercase tracking-wider font-bold mb-1">
                Messaggio
              </p>
              <p className="text-gray-800 text-sm italic">"{wonGift.message}"</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Card 2: Destinatario del Tuo Regalo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-xl border-4 border-green-400"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Package className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Spedisci il Tuo Regalo a</h2>
        </div>

        {giftRecipient ? (
          <div className="space-y-4">
            {/* Nome destinatario */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                  Nome
                </p>
                <p className="text-xl font-bold text-gray-800">{giftRecipient.full_name}</p>
              </div>
            </div>

            {/* DIGITAL GIFT: Show only email with message */}
            {myGift?.type === 'digital' ? (
              <>
                <div className="p-4 bg-blue-50 border-2 border-blue-400 rounded-xl">
                  <p className="text-sm text-blue-800 font-semibold mb-2">
                    💻 Regalo Digitale
                  </p>
                  <p className="text-xs text-blue-700">
                    Potrebbe tornarti utile spedire il regalo a:
                  </p>
                </div>

                {giftRecipient.contact_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-green-600 uppercase tracking-wider font-bold mb-1">
                        Email Personale
                      </p>
                      <p className="text-lg font-semibold text-gray-800">{giftRecipient.contact_email}</p>
                      <p className="text-xs text-gray-500 mt-1">Usa questa email per spedire il regalo digitale</p>
                    </div>
                  </div>
                )}

                {/* Fallback to login email if no contact email */}
                {!giftRecipient.contact_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                        Email (accesso)
                      </p>
                      <p className="text-md text-gray-700">{giftRecipient.email}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* PHYSICAL GIFT: Show full address + email */
              <>
                {/* Show warning if cities are different */}
                {isDifferentCity && (
                  <div className="p-4 bg-orange-50 border-2 border-orange-400 rounded-xl">
                    <p className="text-sm text-orange-800 font-semibold">
                      📦 Regalo Fisico - Città Diversa
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Il destinatario si trova in una città diversa dalla tua. Ecco i suoi dati per la spedizione.
                    </p>
                  </div>
                )}

                {/* Contact email (important for physical gifts) */}
                {giftRecipient.contact_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-green-600 uppercase tracking-wider font-bold mb-1">
                        Email Personale
                      </p>
                      <p className="text-md font-semibold text-gray-800">{giftRecipient.contact_email}</p>
                      <p className="text-xs text-gray-500 mt-1">Contatta questa email per coordinare la spedizione</p>
                    </div>
                  </div>
                )}

                {/* Shipping address */}
                {(giftRecipient.address || giftRecipient.city || giftRecipient.postal_code) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                        Indirizzo di Spedizione
                      </p>
                      <div className="text-md text-gray-700 space-y-1">
                        {giftRecipient.address && <p>{giftRecipient.address}</p>}
                        {(giftRecipient.postal_code || giftRecipient.city) && (
                          <p>
                            {giftRecipient.postal_code && `${giftRecipient.postal_code} `}
                            {giftRecipient.city}
                            {giftRecipient.province && ` (${giftRecipient.province})`}
                          </p>
                        )}
                        {giftRecipient.notes && (
                          <p className="text-sm text-gray-500 italic mt-2">
                            Note: {giftRecipient.notes}
                          </p>
                        )}
                      </div>

                      {!giftRecipient.is_complete && (
                        <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          ⚠️ Indirizzo potrebbe essere incompleto
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Warning if address incomplete */}
                {!giftRecipient.is_complete && (
                  <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
                    <p className="text-sm text-yellow-800 font-semibold">
                      ⚠️ Il destinatario non ha completato l'indirizzo di spedizione
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Contattalo per completare il suo indirizzo
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">In attesa che qualcuno scelga il tuo regalo...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
