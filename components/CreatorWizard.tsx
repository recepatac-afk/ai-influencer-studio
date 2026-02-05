
import React, { useState } from 'react';
import { NicheType, PersonalityType, InfluencerPersona } from '../types';
import { generatePersona } from '../services/geminiService';

interface CreatorWizardProps {
  onGenerated: (persona: InfluencerPersona) => void;
}

const CreatorWizard: React.FC<CreatorWizardProps> = ({ onGenerated }) => {
  const [niche, setNiche] = useState<NicheType>(NicheType.FASHION);
  const [personality, setPersonality] = useState<PersonalityType>(PersonalityType.FRIENDLY);
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const persona = await generatePersona(niche, personality, notes);
      onGenerated(persona);
    } catch (error) {
      console.error("Persona oluşturulamadı:", error);
      alert("Bir şeyler ters gitti. Lütfen tekrar deneyin.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-black italic text-white mb-4 tracking-tighter uppercase">AI Avatarınızı Tasarlayın</h2>
        <p className="text-gray-400 text-lg italic">Sıradaki viral dijital kişiliği oluşturmak için özellikleri belirleyin.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 glass p-10 rounded-[2.5rem]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-[0.2em]">Niş Alanı</label>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(NicheType).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNiche(n)}
                  className={`px-4 py-3 rounded-xl border transition-all text-left font-bold text-sm ${
                    niche === n 
                    ? 'border-pink-500 bg-pink-500/10 text-pink-400' 
                    : 'border-gray-800 bg-gray-900/30 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-[0.2em]">Kişilik Özü</label>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(PersonalityType).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPersonality(p)}
                  className={`px-4 py-3 rounded-xl border transition-all text-left font-bold text-sm ${
                    personality === p 
                    ? 'border-violet-500 bg-violet-500/10 text-violet-400' 
                    : 'border-gray-800 bg-gray-900/30 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-[0.2em]">Özel Geçmiş Hikayesi (Opsiyonel)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Örn: İstanbul'da doğdu, Berlin'de yaşıyor, sürdürülebilir moda tutkunu..."
            className="w-full h-32 bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 transition-colors font-medium text-sm italic"
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-5 bg-gradient-to-r from-pink-600 to-violet-700 hover:from-pink-500 hover:to-violet-600 text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg uppercase italic tracking-tighter flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Persona Hesaplanıyor...
            </>
          ) : (
            'Influencer Konseptini Oluştur'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreatorWizard;
