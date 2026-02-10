
import React, { useState, useEffect } from 'react';
import { AppStep, InfluencerData } from './types';
import StepIndicator from './components/StepIndicator';
import { generateInfluencerPhotos, generateInfluencerVideo, generateReferenceImage } from './services/geminiService';

const UI_STRINGS = {
  tr: {
    siteTitle: "XRECEP Studio AI İnfluencer",
    welcome: "XRECEP STUDIO'YA HOŞ GELDİNİZ",
    subtitle: "Kendi AI Influencer'ını oluştur",
    selectLang: "Lütfen bir dil seçin",
    photoMode: "AI Influencer Fotoğraf",
    videoMode: "AI Influencer Video",
    back: "Geri",
    exitConfirm: "Çıkmak istediğinize emin misiniz? Tüm ilerleme kaybolacak.",
    stepPrefix: "Adım",
    next: "Devam Et",
    generate: "Oluşturmayı Başlat",
    identityTitle: "Yüz ve Kimlik Kilidi",
    identityDesc: "Yüz kimliğini sabitlemek için 1-3 adet fotoğraf yükleyin. Aynı kişi her karede korunacaktır.",
    uploadPhotos: "Fotoğrafları Yükleyin",
    companionTitle: "Eşlikçi Modu (Opsiyonel)",
    companionDesc: "Influencer'ın yanında başka birinin olmasını ister misiniz?",
    uploadCompanion: "Eşlikçi Yükle",
    locationTitle: "Konum Stüdyosu",
    locationDesc: "Mekan seçin veya özel bir mekan tarif edin.",
    customLocation: "Özel Mekan Açıklaması",
    outfitTitle: "Moda Stüdyosu",
    outfitDesc: "Influencer için bir kıyafet tarzı belirleyin.",
    customOutfit: "Detaylı Kıyafet Özellikleri",
    brandTitle: "Marka Modu (Opsiyonel)",
    brandDesc: "Ürün yerleştirme çekimi için ürün görseli ekleyin.",
    uploadProduct: "Ürün Görseli Yükle",
    poseTitle: "Poz Kilidi (Opsiyonel)",
    poseDesc: "Belirli bir duruş veya hareket referansı yükleyin.",
    poseGuide: "Poz Kılavuzu (Opsiyonel)",
    posePlaceholder: "Örn: ayakta, bir eli belinde, kameraya doğru gülümsüyor",
    uploadPose: "Poz Referansı Yükle",
    scenarioTitle: "Final Prodüksiyon Kontrolleri",
    scenarioDesc: "Son dokunuşlar. Atmosfer ve kamera ayarlarını yapın.",
    roleLabel: "Rol / Kimlik",
    moodLabel: "Işık / Ruh Hali",
    angleLabel: "Kamera Açısı",
    processing: "İşleniyor...",
    processingLong: "Kimlik doğrulanıyor ve sahneler optimize ediliyor...",
    processingVideo: "Video üretiliyor... Bu işlem 1-3 dakika sürebilir. Lütfen bekleyin.",
    resultsTitle: "Üretim Sonuçları",
    download: "İndir",
    newProduction: "Yeni Prodüksiyon",
    videoSizeTitle: "Video Boyutu",
    videoSizeDesc: "Paylaşım yapacağınız platforma uygun formatı seçin.",
    videoPreviewTitle: "Başlangıç Karesi",
    videoPreviewDesc: "Video için referans kare oluşturuldu. Şimdi hareketi belirleyelim.",
    convertToVideo: "Videoyu Üret",
    motionPromptLabel: "Video Hareketi",
    motionPromptDesc: "Videoda ne olmalı? Mimik, hareket ve kamera aksiyonunu yazın.",
    motionPlaceholder: "Örn: Kameraya bakıp gülümsüyor, rüzgarda saçları hafifçe dalgalanıyor, el sallıyor.",
    musicTitle: "Arka Plan Müziği",
    musicDesc: "Videonun atmosferine uygun bir müzik tarzı seçin. Bu görsel ritmi etkileyecektir.",
    steps: {
      identity: "Kimlik",
      companion: "Eşlikçi",
      location: "Konum",
      outfit: "Moda",
      brand: "Marka",
      pose: "Poz",
      scenario: "Senaryo",
      result: "Sonuç",
      vSize: "Boyut",
      vPreview: "Önizleme",
      vMotion: "Hareket",
      vMusic: "Müzik"
    }
  },
  en: {
    siteTitle: "XRECEP Studio AI Influencer",
    welcome: "WELCOME TO XRECEP STUDIO",
    subtitle: "Create your own AI Influencer",
    selectLang: "Please select a language",
    photoMode: "AI Influencer Photo",
    videoMode: "AI Influencer Video",
    back: "Back",
    exitConfirm: "Are you sure you want to exit? All progress will be lost.",
    stepPrefix: "Step",
    next: "Next",
    generate: "Start Generation",
    identityTitle: "Face & Identity Lock",
    identityDesc: "Upload 1-3 photos to lock face identity. The same person will be preserved.",
    uploadPhotos: "Upload Photos",
    companionTitle: "Companion Mode (Optional)",
    companionDesc: "Would you like to add another person next to the influencer?",
    uploadCompanion: "Upload Companion",
    locationTitle: "Location Studio",
    locationDesc: "Select a place or describe a custom location.",
    customLocation: "Custom Location Description",
    outfitTitle: "Fashion Studio",
    outfitDesc: "Define a clothing style for the influencer.",
    customOutfit: "Detailed Outfit Features",
    brandTitle: "Brand Mode (Optional)",
    brandDesc: "Add a product image for a product placement shoot.",
    uploadProduct: "Upload Product Image",
    poseTitle: "Pose Lock (Optional)",
    poseDesc: "Upload a specific stance or motion reference.",
    poseGuide: "Pose Guide (Optional)",
    posePlaceholder: "E.g.: standing, one hand on hip, smiling at camera",
    uploadPose: "Upload Pose Reference",
    scenarioTitle: "Final Production Controls",
    scenarioDesc: "Final touches. Adjust atmosphere and camera settings.",
    roleLabel: "Role / Persona",
    moodLabel: "Lighting / Mood",
    angleLabel: "Camera Angle",
    processing: "Processing...",
    processingLong: "Validating identity and optimizing scenes...",
    processingVideo: "Generating video... This may take 1-3 minutes. Please wait.",
    resultsTitle: "Production Results",
    download: "Download",
    newProduction: "New Production",
    videoSizeTitle: "Video Size",
    videoSizeDesc: "Select the format suitable for the platform you will share on.",
    videoPreviewTitle: "Starting Frame",
    videoPreviewDesc: "A reference frame for the video has been created. Now define the motion.",
    convertToVideo: "Generate Video",
    motionPromptLabel: "Video Motion",
    motionPromptDesc: "What should happen? Describe expressions, movement, and camera action.",
    motionPlaceholder: "E.g.: Looking at camera and smiling, hair waving in wind, waving hand.",
    musicTitle: "Background Music",
    musicDesc: "Select a music style that fits the video's atmosphere. This influences the visual rhythm.",
    steps: {
      identity: "Identity",
      companion: "Companion",
      location: "Location",
      outfit: "Fashion",
      brand: "Brand",
      pose: "Pose",
      scenario: "Scenario",
      result: "Result",
      vSize: "Size",
      vPreview: "Preview",
      vMotion: "Motion",
      vMusic: "Music"
    }
  }
};

const LOCATIONS = {
  tr: [
    "Ormanlık Rekreasyon Alanı, Göletli",
    "Venedik Kanalları ve Gondollar",
    "Santorini, Mavi Kubbeli Kiliseler",
    "Maldivler, Su Üstü Bungalovlar",
    "Norveç, Fiyortlar ve Kuzey Işıkları",
    "Rio, İsa Heykeli ve Plaj",
    "Mısır Piramitleri ve Çöl",
    "Machu Picchu, Dağ Tapınakları",
    "Tropik Şelale ve Bambu Ormanı",
    "Provence, Lavanta Tarlaları",
    "Çölde Yıldızlı Gökyüzü ve Kamp",
    "Paris, Eyfel Kulesi",
    "Tokyo, Akihabara Gecesi",
    "New York Şehir Hattı",
    "Kapadokya, Balonlar",
    "Lüks Yat, Monako",
    "Dubai Çölleri",
    "İsviçre Alpleri",
    "Bali, Sonsuzluk Havuzu"
  ],
  en: [
    "Wooded Recreation Area, Pond",
    "Venice Canals and Gondolas",
    "Santorini, Blue Domed Churches",
    "Maldives, Overwater Bungalows",
    "Norway, Fjords and Northern Lights",
    "Rio, Christ the Redeemer & Beach",
    "Egypt Pyramids and Desert",
    "Machu Picchu, Mountain Temples",
    "Tropical Waterfall & Bamboo",
    "Provence, Lavender Fields",
    "Desert Starry Sky & Camping",
    "Paris, Eiffel Tower",
    "Tokyo, Akihabara Night",
    "New York Skyline",
    "Cappadocia, Balloons",
    "Luxury Yacht, Monaco",
    "Dubai Deserts",
    "Swiss Alps",
    "Bali, Infinity Pool"
  ]
};

const OUTFITS = {
  tr: [
    "Boho / Festival Stili",
    "Academia (Dark/Light)",
    "Business Chic / Power Dressing",
    "Athleisure / Günlük Spor-Lüks",
    "Resort / Beachwear",
    "Grunge / Punk Sokak",
    "Vintage / Retro Zarafet",
    "Özel Dikim Gece Elbisesi",
    "Sokak Stili",
    "Minimalist Sessiz Lüks",
    "Spor Salonu Takımı",
    "İpek Yazlık Elbise",
    "Tasarım Sokak Modası",
    "İş Gücü Takımı",
    "Cyberpunk Neon Kıyafet"
  ],
  en: [
    "Boho / Festival Style",
    "Academia (Dark/Light)",
    "Business Chic / Power Dressing",
    "Athleisure / Sport-Luxe",
    "Resort / Beachwear",
    "Grunge / Punk Street",
    "Vintage / Retro Elegance",
    "Custom Evening Gown",
    "Street Style",
    "Minimalist Quiet Luxury",
    "Gym Set",
    "Silk Summer Dress",
    "Designer Streetwear",
    "Business Power Suit",
    "Cyberpunk Neon Outfit"
  ]
};

const MUSIC_GENRES = {
  tr: ["Lofi & Chill", "Enerjik Pop", "Sinematik Epik", "Techno & Rave", "Caz & Klasik", "Hip Hop & Trap", "Tropikal House", "Hiçbiri"],
  en: ["Lofi & Chill", "Energetic Pop", "Cinematic Epic", "Techno & Rave", "Jazz & Classical", "Hip Hop & Trap", "Tropical House", "None"]
};

type Mode = 'photo' | 'video' | null;
type Lang = 'tr' | 'en' | null;

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>(localStorage.getItem('xpatla_lang') as Lang);
  const [mode, setMode] = useState<Mode>(null);
  const [step, setStep] = useState<AppStep>(AppStep.IDENTITY);
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState(true);
  
  const [influencerData, setInfluencerData] = useState<InfluencerData>({
    images: [],
    companionImage: null,
    productImage: null,
    poseImage: null,
    location: '',
    outfit: '',
    timeAndSeason: { timeOfDay: 'Golden Hour', season: 'Summer', weather: 'Clear Sky' },
    scenario: { pose: '', emotion: 'Smile', action: 'Holding phone', angle: 'Eye level', mood: 'Cinematic', role: 'Influencer' },
    videoAspectRatio: "9:16",
    videoMotionPrompt: "",
    videoMusic: "Lofi & Chill"
  });
  
  const [results, setResults] = useState<string[]>([]);
  const [referenceFrame, setReferenceFrame] = useState<string | null>(null);

  const t = lang ? UI_STRINGS[lang] : UI_STRINGS.en;
  const currentLocations = lang ? LOCATIONS[lang] : LOCATIONS.en;
  const currentOutfits = lang ? OUTFITS[lang] : OUTFITS.en;
  const currentMusic = lang ? MUSIC_GENRES[lang] : MUSIC_GENRES.en;

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const changeLang = (l: Lang) => {
    setLang(l);
    if (l) localStorage.setItem('xpatla_lang', l);
  };

  const handleBack = () => {
    if (step === AppStep.IDENTITY) {
      setMode(null);
    } else {
      if (window.confirm(t.exitConfirm)) {
        resetStudio();
      }
    }
  };

  const resetStudio = () => {
    // Sayfayı komple yeniler (En temiz sıfırlama yöntemi)
    window.location.reload();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'images' | 'companionImage' | 'productImage' | 'poseImage') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const readers = (Array.from(files) as File[]).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then((urls) => {
      if (field === 'images') setInfluencerData(p => ({ ...p, images: urls.slice(0, 3) }));
      else setInfluencerData(p => ({ ...p, [field]: urls[0] }));
    });
    e.target.value = '';
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `xrecep-influencer-${Date.now()}.${mode === 'video' ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startGeneration = async () => {
    setLoading(true);
    try {
      if (mode === 'photo') {
        const images = await generateInfluencerPhotos(influencerData);
        setResults(images);
        setStep(AppStep.GENERATION);
      } else {
        const refImg = await generateReferenceImage(influencerData);
        setReferenceFrame(refImg);
        setStep(AppStep.VIDEO_PREVIEW);
      }
    } catch (error: any) {
      alert(error.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const finalizeVideo = async () => {
    const hasSelectedKey = await (window as any).aistudio?.hasSelectedApiKey();
    if (!hasSelectedKey) {
        await (window as any).aistudio?.openSelectKey();
    }
    setLoading(true);
    try {
      const videoUrl = await generateInfluencerVideo(influencerData, referenceFrame!);
      setResults([videoUrl]);
      setStep(AppStep.GENERATION);
    } catch (error: any) {
      alert(error.message || "Video generation error");
    } finally {
      setLoading(false);
    }
  };

  const getStepsForMode = () => {
    const baseSteps = [
      { id: AppStep.IDENTITY, name: t.steps.identity },
      { id: AppStep.LOCATION, name: t.steps.location },
      { id: AppStep.OUTFIT, name: t.steps.outfit },
      { id: AppStep.BRAND, name: t.steps.brand },
      { id: AppStep.POSE_LOCK, name: t.steps.pose },
      { id: AppStep.SCENARIO, name: t.steps.scenario },
    ];

    if (mode === 'video') {
      return [
        { id: AppStep.IDENTITY, name: t.steps.identity },
        { id: AppStep.VIDEO_SIZE, name: t.steps.vSize },
        ...baseSteps.slice(1),
        { id: AppStep.VIDEO_PREVIEW, name: t.steps.vPreview },
        { id: AppStep.VIDEO_MOTION, name: t.steps.vMotion },
        { id: AppStep.VIDEO_MUSIC, name: t.steps.vMusic },
        { id: AppStep.GENERATION, name: t.steps.result },
      ];
    } else {
      return [
        { id: AppStep.IDENTITY, name: t.steps.identity },
        { id: AppStep.COMPANION, name: t.steps.companion },
        ...baseSteps.slice(1),
        { id: AppStep.GENERATION, name: t.steps.result },
      ];
    }
  };

  if (!lang) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#03040b] text-center">
        <h1 className="font-orbitron italic text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-400 via-pink-500 to-violet-600 bg-clip-text text-transparent text-glow leading-tight tracking-tighter uppercase mb-12">XRECEP STUDIO</h1>
        <p className="text-gray-400 mb-12 font-bold uppercase tracking-[0.3em]">{t.selectLang}</p>
        <div className="grid gap-4 w-full max-w-xs">
          <button onClick={() => changeLang('tr')} className="glass-btn py-4 rounded-2xl font-black text-lg uppercase tracking-widest text-white shadow-xl active:scale-95 transition-transform border border-white/10">🇹🇷 Türkçe</button>
          <button onClick={() => changeLang('en')} className="glass-btn py-4 rounded-2xl font-black text-lg uppercase tracking-widest text-white shadow-xl active:scale-95 transition-transform border border-white/10">🇬🇧 English</button>
        </div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#03040b]">
        <div className="glass p-10 rounded-[2.5rem] text-center w-full max-w-sm border-pink-500/50">
          <h2 className="text-2xl font-black italic uppercase text-white mb-6">API Key Needed</h2>
          <button onClick={() => (window as any).aistudio.openSelectKey().then(() => setHasKey(true))} className="w-full bg-pink-600 text-white py-4 rounded-xl font-black uppercase italic shadow-lg">Select Key</button>
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#03040b]">
        <header className="text-center mb-16">
          <h1 className="font-orbitron italic text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-400 via-pink-500 to-violet-600 bg-clip-text text-transparent text-glow leading-tight tracking-tighter uppercase mb-4">{t.siteTitle}</h1>
          <p className="text-gray-500 uppercase text-xs tracking-[0.3em] font-black">{t.subtitle}</p>
        </header>
        <div className="grid gap-6 w-full max-w-md">
          <button onClick={() => setMode('photo')} className="glass-btn p-10 rounded-[2.5rem] border-white/10 hover:border-pink-500/50 transition-all text-center group active:scale-95">
            <h2 className="text-3xl font-black mb-1 uppercase italic tracking-tighter text-white group-hover:text-pink-400 transition-colors">{t.photoMode}</h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Nano Banana Pro Engine</p>
          </button>
          <button onClick={() => setMode('video')} className="glass-btn p-10 rounded-[2.5rem] border-white/10 hover:border-violet-500/50 transition-all text-center group active:scale-95">
            <h2 className="text-3xl font-black mb-1 uppercase italic tracking-tighter text-white group-hover:text-violet-400 transition-colors">{t.videoMode}</h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Veo 3.1 Pro Video Engine</p>
          </button>
          <button onClick={() => setLang(null)} className="text-gray-500 text-[10px] mt-8 uppercase tracking-widest font-black border-b border-gray-800 pb-1">Dili Değiştir / Change Language</button>
        </div>
      </div>
    );
  }

  const stepsForIndicator = getStepsForMode();

  return (
    <div className="min-h-screen bg-[#03040b] pb-20 overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-[#03040b]/80 backdrop-blur-md border-b border-white/5 p-6 flex justify-between items-center px-4 md:px-12">
        <button onClick={handleBack} className="text-gray-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3"/></svg>
          {t.back}
        </button>
        <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent italic uppercase tracking-tighter text-glow">XRECEP PRO</h1>
        <button onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')} className="text-[10px] font-black uppercase text-gray-500 border border-gray-800 px-3 py-1 rounded-full hover:border-gray-600 transition-colors">
          {lang === 'tr' ? 'EN' : 'TR'}
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-4 md:p-12 mt-4">
        <StepIndicator currentStep={step} steps={stepsForIndicator} />

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {step === AppStep.IDENTITY && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t.identityTitle}</h2>
              <p className="text-gray-500 text-sm leading-relaxed font-bold italic">"{t.identityDesc}"</p>
              <label className="border-2 border-dashed border-gray-800 rounded-[2.5rem] p-16 block text-center cursor-pointer bg-gray-900/20 relative group hover:border-pink-500/50 transition-all">
                <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'images')} />
                <div className="text-pink-500 font-black uppercase tracking-widest text-sm group-hover:scale-105 transition-transform">{t.uploadPhotos}</div>
              </label>
              <div className="flex gap-4 flex-wrap justify-center">
                {influencerData.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} className="w-24 h-32 object-cover rounded-2xl border-2 border-pink-500/30 shadow-2xl" />
                    <div className="absolute -top-2 -right-2 bg-pink-600 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">{i+1}</div>
                  </div>
                ))}
              </div>
              <button disabled={influencerData.images.length === 0} onClick={() => setStep(mode === 'photo' ? AppStep.COMPANION : AppStep.VIDEO_SIZE)} className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase tracking-widest shadow-2xl disabled:opacity-20 active:scale-95 transition-all text-sm italic">
                {t.next} &rarr;
              </button>
            </div>
          )}

          {step === AppStep.VIDEO_SIZE && (
             <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t.videoSizeTitle}</h2>
              <p className="text-gray-500 font-bold italic">{t.videoSizeDesc}</p>
              <div className="grid grid-cols-2 gap-6">
                <button onClick={() => setInfluencerData(p => ({ ...p, videoAspectRatio: "9:16" }))} className={`p-10 rounded-[2.5rem] border-2 flex flex-col items-center gap-6 transition-all ${influencerData.videoAspectRatio === '9:16' ? 'border-pink-500 bg-pink-500/10' : 'border-gray-800 bg-gray-900/30'}`}>
                  <div className="w-10 h-16 border-4 border-current rounded-lg opacity-40"></div>
                  <span className="font-black italic uppercase text-xs tracking-widest">9:16 (TikTok/Reel)</span>
                </button>
                <button onClick={() => setInfluencerData(p => ({ ...p, videoAspectRatio: "16:9" }))} className={`p-10 rounded-[2.5rem] border-2 flex flex-col items-center gap-6 transition-all ${influencerData.videoAspectRatio === '16:9' ? 'border-violet-500 bg-violet-500/10' : 'border-gray-800 bg-gray-900/30'}`}>
                  <div className="w-20 h-12 border-4 border-current rounded-lg opacity-40"></div>
                  <span className="font-black italic uppercase text-xs tracking-widest">16:9 (YouTube)</span>
                </button>
              </div>
              <button onClick={() => setStep(AppStep.LOCATION)} className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-sm italic">
                {t.next} &rarr;
              </button>
            </div>
          )}

          {step === AppStep.COMPANION && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t.companionTitle}</h2>
              <p className="text-gray-500 font-bold italic">{t.companionDesc}</p>
              <label className="border-2 border-dashed border-gray-800 rounded-[2.5rem] p-16 block text-center cursor-pointer bg-gray-900/20 relative group hover:border-violet-500/50 transition-all">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'companionImage')} />
                <div className="text-violet-500 font-black uppercase tracking-widest text-sm group-hover:scale-105 transition-transform">{t.uploadCompanion}</div>
              </label>
              {influencerData.companionImage && <img src={influencerData.companionImage} className="w-40 mx-auto rounded-3xl border-2 border-violet-500/30 shadow-2xl" />}
              <button onClick={() => setStep(AppStep.LOCATION)} className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-sm italic">
                {t.next} &rarr;
              </button>
            </div>
          )}

          {step === AppStep.LOCATION && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t.locationTitle}</h2>
              <div className="grid grid-cols-2 gap-3">
                {currentLocations.map(loc => (
                  <button 
                    key={loc} 
                    onClick={() => setInfluencerData(p => ({ ...p, location: loc }))} 
                    className={`p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${influencerData.location === loc ? 'border-pink-500 bg-pink-500/10 text-pink-400' : 'border-gray-800 bg-gray-900/30 text-gray-500'}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              <div className="pt-4">
                <label className="text-[10px] text-gray-600 uppercase font-black mb-3 block tracking-[0.2em]">{t.customLocation}</label>
                <textarea 
                  placeholder="..." 
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-6 text-sm h-32 outline-none focus:border-pink-500 text-white italic font-medium" 
                  value={influencerData.location} 
                  onChange={(e) => setInfluencerData(p => ({ ...p, location: e.target.value }))} 
                />
              </div>
              <button disabled={!influencerData.location} onClick={() => setStep(AppStep.OUTFIT)} className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase tracking-widest disabled:opacity-20 shadow-2xl active:scale-95 transition-all text-sm italic">
                {t.next} &rarr;
              </button>
            </div>
          )}

          {step === AppStep.OUTFIT && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t.outfitTitle}</h2>
              <div className="grid grid-cols-2 gap-3">
                {currentOutfits.map(out => (
                  <button 
                    key={out} 
                    onClick={() => setInfluencerData(p => ({ ...p, outfit: out }))} 
                    className={`p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${influencerData.outfit === out ? 'border-violet-500 bg-violet-500/10 text-violet-400' : 'border-gray-800 bg-gray-900/30 text-gray-500'}`}
                  >
                    {out}
                  </button>
                ))}
              </div>
              <div className="pt-4">
                <label className="text-[10px] text-gray-600 uppercase font-black mb-3 block tracking-[0.2em]">{t.customOutfit}</label>
                <textarea 
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-6 text-sm h-32 outline-none focus:border-violet-500 text-white italic font-medium" 
                  value={influencerData.outfit} 
                  onChange={(e) => setInfluencerData(p => ({ ...p, outfit: e.target.value }))} 
                />
              </div>
              <button disabled={!influencerData.outfit} onClick={() => setStep(AppStep.BRAND)} className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase tracking-widest disabled:opacity-20 shadow-2xl active:scale-95 transition-all text-sm italic">
                {t.next} &rarr;
              </button>
            </div>
          )}

          {step === AppStep.BRAND && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t.brandTitle}</h2>
              <p className="text-gray-500 font-bold italic">"{t.brandDesc}"</p>
              <label className="border-2 border-dashed border-gray-800 rounded-[2.5rem] p-16 block text-center cursor-pointer bg-gray-900/20 relative group hover:border-blue-500/50 transition-all">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'productImage')} />
                <div className="text-blue-500 font-black uppercase tracking-widest text-sm group-hover:scale-105 transition-transform">{t.uploadProduct}</div>
              </label>
              {influencerData.productImage && <img src={influencerData.productImage} className="h-40 mx-auto rounded-3xl border-2 border-blue-500/30 shadow-2xl" />}
              <button onClick={() => setStep(AppStep.POSE_LOCK)} className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-sm italic">
                {t.next} &rarr;
              </button>
            </div>
          )}

          {step === AppStep.POSE_LOCK && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t.poseTitle}</h2>
              <p className="text-gray-500 font-bold italic">"{t.poseDesc}"</p>
              <div className="pt-2">
                <span className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em]">{t.poseGuide}</span>
                <input 
                  type="text"
                  placeholder={t.posePlaceholder}
                  className="w-full mt-3 bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-white italic font-bold outline-none focus:border-yellow-500 transition-all"
                  value={influencerData.scenario.pose}
                  onChange={(e) => setInfluencerData(p => ({ ...p, scenario: { ...p.scenario, pose: e.target.value } }))}
                />
              </div>
              <label className="border-2 border-dashed border-gray-800 rounded-[2.5rem] p-16 block text-center cursor-pointer bg-gray-900/20 relative group hover:border-yellow-500/50 transition-all">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'poseImage')} />
                <div className="text-yellow-500 font-black uppercase tracking-widest text-sm group-hover:scale-105 transition-transform">{t.uploadPose}</div>
              </label>
              {influencerData.poseImage && <img src={influencerData.poseImage} className="w-40 mx-auto rounded-3xl grayscale opacity-40 border-2 border-yellow-500/30 shadow-2xl" />}
              <button onClick={() => setStep(AppStep.SCENARIO)} className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-sm italic">
                {t.next} &rarr;
              </button>
            </div>
          )}

          {step === AppStep.SCENARIO && (
            <div className="space-y-10">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t.scenarioTitle}</h2>
              <div className="grid gap-6 bg-gray-900/30 p-8 rounded-[2.5rem] border border-white/5">
                <div>
                  <label className="text-[10px] text-gray-600 uppercase font-black mb-3 block tracking-[0.2em]">{t.roleLabel}</label>
                  <input className="w-full bg-gray-950 p-4 rounded-xl border border-gray-800 text-sm text-white italic font-bold" value={influencerData.scenario.role} onChange={e => setInfluencerData(p => ({ ...p, scenario: { ...p.scenario, role: e.target.value } }))} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] text-gray-600 uppercase font-black mb-3 block tracking-[0.2em]">{t.moodLabel}</label>
                    <input className="w-full bg-gray-950 p-4 rounded-xl border border-gray-800 text-sm text-white italic font-bold" value={influencerData.scenario.mood} onChange={e => setInfluencerData(p => ({ ...p, scenario: { ...p.scenario, mood: e.target.value } }))} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 uppercase font-black mb-3 block tracking-[0.2em]">{t.angleLabel}</label>
                    <select className="w-full bg-gray-950 p-4 rounded-xl border border-gray-800 text-sm text-white italic font-bold appearance-none" value={influencerData.scenario.angle} onChange={e => setInfluencerData(p => ({ ...p, scenario: { ...p.scenario, angle: e.target.value } }))}>
                      <option>Eye Level</option><option>Low Angle</option><option>Wide Shot</option><option>Portrait</option>
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={startGeneration} className="w-full bg-gradient-to-r from-blue-500 via-pink-600 to-violet-700 text-white font-black py-6 rounded-[2.5rem] uppercase tracking-tighter text-xl shadow-2xl active:scale-95 transition-all italic">
                {t.generate} &rarr;
              </button>
            </div>
          )}

          {step === AppStep.VIDEO_PREVIEW && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t.videoPreviewTitle}</h2>
              <p className="text-gray-500 font-bold italic">"{t.videoPreviewDesc}"</p>
              {referenceFrame && <img src={referenceFrame} className="w-full rounded-[2.5rem] shadow-2xl border-4 border-gray-950" />}
              <button onClick={() => setStep(AppStep.VIDEO_MOTION)} className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-sm italic">
                {t.next} &rarr;
              </button>
            </div>
          )}

          {step === AppStep.VIDEO_MOTION && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t.motionPromptLabel}</h2>
              <p className="text-gray-500 font-bold italic">{t.motionPromptDesc}</p>
              <textarea 
                placeholder={t.motionPlaceholder} 
                className="w-full bg-gray-950 border border-gray-800 rounded-[2rem] p-8 text-sm h-48 outline-none focus:border-violet-500 text-white italic font-medium" 
                value={influencerData.videoMotionPrompt} 
                onChange={(e) => setInfluencerData(p => ({ ...p, videoMotionPrompt: e.target.value }))} 
              />
              <button 
                disabled={!influencerData.videoMotionPrompt} 
                onClick={() => setStep(AppStep.VIDEO_MUSIC)} 
                className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all text-sm italic"
              >
                {t.next} &rarr;
              </button>
            </div>
          )}

          {step === AppStep.VIDEO_MUSIC && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{t.musicTitle}</h2>
              <p className="text-gray-500 font-bold italic">{t.musicDesc}</p>
              <div className="grid grid-cols-2 gap-3">
                {currentMusic.map(genre => (
                  <button 
                    key={genre} 
                    onClick={() => setInfluencerData(p => ({ ...p, videoMusic: genre }))} 
                    className={`p-6 rounded-[2rem] border-2 font-black text-xs uppercase tracking-widest transition-all ${influencerData.videoMusic === genre ? 'border-pink-500 bg-pink-500/10 text-pink-400' : 'border-gray-800 bg-gray-900/30 text-gray-500 hover:border-gray-700'}`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              <button 
                onClick={finalizeVideo} 
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-black py-6 rounded-[2.5rem] uppercase tracking-widest text-lg shadow-2xl active:scale-95 transition-all italic"
              >
                {t.convertToVideo} &rarr;
              </button>
            </div>
          )}

          {step === AppStep.GENERATION && (
            <div className="space-y-12">
              <h2 className="text-4xl font-black text-center uppercase italic tracking-tighter text-white">{t.resultsTitle}</h2>
              <div className="grid gap-8">
                {results.map((url, i) => (
                  <div key={i} className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-gray-900 bg-black flex items-center justify-center group">
                    {mode === 'video' ? (
                      <video src={url} controls className="w-full h-auto" autoPlay loop playsInline />
                    ) : (
                      <img src={url} className="w-full h-auto" />
                    )}
                    <button onClick={() => handleDownload(url)} className="absolute bottom-8 right-8 bg-white text-black p-5 rounded-full shadow-2xl active:scale-90 transition-transform z-10 opacity-0 group-hover:opacity-100 duration-300 border-2 border-pink-500/50">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5 5-5M12 15V3"/></svg>
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={resetStudio} className="w-full glass-btn text-white font-black py-5 rounded-[2.5rem] uppercase tracking-widest shadow-xl active:scale-95 transition-all text-sm italic">
                {t.newProduction}
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 border-t-4 border-pink-500 border-solid rounded-full animate-spin mb-8 shadow-[0_0_20px_rgba(236,72,153,0.5)]"></div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">{t.processing}</h3>
          <p className="text-gray-500 font-bold italic text-sm max-w-xs animate-pulse">
            {mode === 'video' && (step === AppStep.VIDEO_MOTION || step === AppStep.VIDEO_MUSIC) ? t.processingVideo : t.processingLong}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
