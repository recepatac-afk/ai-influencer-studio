
import React, { useState } from 'react';
import { InfluencerProfile, InfluencerAsset } from '../types';
import { generateInfluencerImage, generateInfluencerVideo } from '../services/geminiService';

interface ProfileViewProps {
  profile: InfluencerProfile;
  onUpdate: (updated: InfluencerProfile) => void;
  onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdate, onBack }) => {
  const [isGenerating, setIsGenerating] = useState<'image' | 'video' | null>(null);
  const [mediaPrompt, setMediaPrompt] = useState('Yüksek moda galasında şık bir poz');

  const handleGenerateImage = async () => {
    setIsGenerating('image');
    try {
      const url = await generateInfluencerImage(profile, mediaPrompt);
      const newAsset: InfluencerAsset = { type: 'image', url, prompt: mediaPrompt, timestamp: Date.now() };
      const updatedProfile = { 
        ...profile, 
        assets: [newAsset, ...profile.assets],
        profileImage: profile.profileImage || url
      };
      onUpdate(updatedProfile);
    } catch (err) {
      alert("Fotoğraf oluşturma başarısız oldu. Farklı bir açıklama deneyin.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGenerateVideo = async () => {
    const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio?.openSelectKey();
    }
    
    setIsGenerating('video');
    try {
      const url = await generateInfluencerVideo(profile, mediaPrompt);
      const newAsset: InfluencerAsset = { type: 'video', url, prompt: mediaPrompt, timestamp: Date.now() };
      onUpdate({ ...profile, assets: [newAsset, ...profile.assets] });
    } catch (err) {
      console.error(err);
      alert("Video oluşturma başarısız oldu. API anahtarınızı kontrol edin.");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        STÜDYOYA DÖN
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-[2rem] text-center border-gray-800">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-pink-500 mb-6 bg-gray-900 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.3)]">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-black text-gray-700 italic">{profile.name[0]}</span>
              )}
            </div>
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">{profile.name}</h3>
            <p className="text-pink-400 font-bold text-sm mb-4 uppercase tracking-widest">{profile.niche}</p>
            <div className="inline-block bg-gray-900 px-4 py-1.5 rounded-full text-gray-400 text-[10px] font-black uppercase border border-gray-800">
              {profile.personality}
            </div>
          </div>

          <div className="glass p-6 rounded-[2rem] border-gray-800">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">BİO</h4>
            <p className="text-gray-300 italic text-sm leading-relaxed">"{profile.bio}"</p>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">SLOGAN</h4>
              <p className="text-pink-400 font-black italic text-sm">"{profile.catchphrase}"</p>
            </div>
          </div>

          <div className="glass p-6 rounded-[2rem] border-gray-800">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">HİKAYE</h4>
            <p className="text-gray-400 text-xs leading-relaxed italic">{profile.backstory}</p>
          </div>
        </div>

        {/* Right Column: Feed & Creation */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-[2.5rem] border-gray-800">
            <h4 className="text-xl font-black italic text-white mb-6 uppercase tracking-tighter">Yeni İçerik Üret</h4>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={mediaPrompt}
                onChange={(e) => setMediaPrompt(e.target.value)}
                placeholder="Sahneyi açıklayın (Örn: Paris sokaklarında sabah kahvesi)"
                className="bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-pink-500 font-medium text-sm italic"
              />
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleGenerateImage}
                  disabled={!!isGenerating}
                  className="py-4 bg-gray-900 hover:bg-gray-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-gray-800 disabled:opacity-50"
                >
                  {isGenerating === 'image' ? 'Çekiliyor...' : 'FOTOĞRAF OLUŞTUR'}
                </button>
                <button
                  onClick={handleGenerateVideo}
                  disabled={!!isGenerating}
                  className="py-4 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-violet-900/20 disabled:opacity-50"
                >
                  {isGenerating === 'video' ? 'FİLMLENİYOR...' : 'VİDEO OLUŞTUR (VEO)'}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 italic font-medium">Not: Video oluşturma işlemi yaklaşık 1-2 dakika sürebilir.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {profile.assets.length === 0 && (
              <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border-dashed border-2 border-gray-800">
                <p className="text-gray-500 italic font-bold">Henüz içerik yok. Yukarıdan oluşturmaya başlayın!</p>
              </div>
            )}
            {profile.assets.map((asset, i) => (
              <div key={i} className="group relative aspect-[9/16] bg-gray-950 rounded-3xl overflow-hidden border border-gray-800 hover:border-pink-500/50 transition-all">
                {asset.type === 'image' ? (
                  <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover" />
                ) : (
                  <video src={asset.url} controls className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                  <p className="text-[10px] text-white font-bold italic line-clamp-2 leading-tight uppercase">{asset.prompt}</p>
                  <p className="text-[8px] text-gray-400 mt-2 font-black tracking-widest">{new Date(asset.timestamp).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
