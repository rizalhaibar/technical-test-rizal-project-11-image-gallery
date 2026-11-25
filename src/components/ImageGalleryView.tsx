import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Pause,
  Play,
  Search,
  Star,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { INITIAL_GALLERY_ITEMS, type GalleryImageItem } from '../data/galleryItems';

interface ImageGalleryViewProps {
  resetSignal: number;
}

export function ImageGalleryView({ resetSignal }: ImageGalleryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['bionic-portrait', 'iron-sea-waves']);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<Record<string, boolean>>({});

  // Audio preview state for Detail View (Soal 11b)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const stopAudio = () => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore already stopped oscillators
      }
    });
    oscillatorsRef.current = [];
  };

  useEffect(() => {
    setSearchQuery('');
    setFilterMode('all');
    setSelectedId(null);
    setIsPlaying(false);
    setElapsedSeconds(0);
    stopAudio();
  }, [resetSignal]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return INITIAL_GALLERY_ITEMS.filter((item) => {
      if (filterMode === 'favorites' && !favoriteIds.includes(item.id)) {
        return false;
      }
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.edition.toLowerCase().includes(query) ||
        item.genre.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, filterMode, favoriteIds]);

  const selectedItem: GalleryImageItem | null = useMemo(
    () => INITIAL_GALLERY_ITEMS.find((item) => item.id === selectedId) ?? null,
    [selectedId]
  );

  const selectedIndex = useMemo(
    () => INITIAL_GALLERY_ITEMS.findIndex((item) => item.id === selectedId),
    [selectedId]
  );

  // Manage Web Audio chord playback & progress timer when playing in Detail View
  useEffect(() => {
    if (!selectedItem || !isPlaying) {
      stopAudio();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : 0.035, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        stopAudio();
        oscillatorsRef.current = selectedItem.chordFrequencies.map((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.connect(masterGain);
          osc.start();
          return osc;
        });
      }
    } catch {
      // Audio playback is optional if blocked by browser policy
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev + 1 >= selectedItem.durationSeconds) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
      stopAudio();
    };
  }, [selectedItem, isPlaying]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        isMuted ? 0 : 0.035,
        audioCtxRef.current.currentTime,
        0.04
      );
    }
  }, [isMuted]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openDetail = (id: string) => {
    setSelectedId(id);
    setIsPlaying(false);
    setElapsedSeconds(0);
    stopAudio();
  };

  const closeDetail = () => {
    setIsPlaying(false);
    setElapsedSeconds(0);
    stopAudio();
    setSelectedId(null);
  };

  const stepDetail = (direction: -1 | 1) => {
    if (selectedIndex === -1) return;
    const nextIndex =
      (selectedIndex + direction + INITIAL_GALLERY_ITEMS.length) % INITIAL_GALLERY_ITEMS.length;
    openDetail(INITIAL_GALLERY_ITEMS[nextIndex].id);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (selectedItem) {
    const isFav = favoriteIds.includes(selectedItem.id);
    const progressPercent = Math.min(
      100,
      Math.round((elapsedSeconds / selectedItem.durationSeconds) * 100)
    );

    return (
      <section aria-label="Detail Gambar" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={closeDetail}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Gambar
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 mr-2">
              {selectedIndex + 1} / {INITIAL_GALLERY_ITEMS.length}
            </span>
            <button
              type="button"
              onClick={() => stepDetail(-1)}
              aria-label="Gambar sebelumnya"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => stepDetail(1)}
              aria-label="Gambar berikutnya"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Hero Image Pane matching 11b */}
            <div className="lg:col-span-6 relative bg-stone-100 aspect-square lg:aspect-auto lg:min-h-[480px]">
              {brokenImageIds[selectedItem.id] ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600">
                  <ImageOff className="w-10 h-10 mb-3 text-slate-400" />
                  <p className="text-sm font-medium">{selectedItem.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedItem.edition}</p>
                </div>
              ) : (
                <img
                  src={selectedItem.imageUrl}
                  alt={`${selectedItem.title} — ${selectedItem.edition}`}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setBrokenImageIds((prev) => ({ ...prev, [selectedItem.id]: true }))
                  }
                  className="w-full h-full object-cover"
                />
              )}

              {/* Floating circular Play/Pause control anchored at bottom-right of image like PDF 11b */}
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                aria-label={isPlaying ? 'Jeda audio' : 'Putar audio'}
                className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-500 active:scale-95 text-white shadow-lg flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
            </div>

            {/* Detail Info Panel */}
            <div className="lg:col-span-6 flex flex-col justify-between bg-slate-900 text-white">
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-teal-400 font-medium tracking-wide">
                      {selectedItem.edition}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-balance">
                      {selectedItem.title}
                    </h2>
                    <p className="text-base text-slate-300 mt-1">{selectedItem.subtitle}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(selectedItem.id)}
                    aria-label={isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 shrink-0"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{selectedItem.genre}</span>
                  <span aria-hidden="true">·</span>
                  <span>Rilis {selectedItem.year}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{selectedItem.duration}</span>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                  {selectedItem.description}
                </p>

                {/* Interactive progress bar */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{formatTime(elapsedSeconds)}</span>
                    <span>{selectedItem.duration}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-200"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Control Bar matching 11b */}
              <div className="bg-stone-100 text-slate-800 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-6">
                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  aria-label={isMuted ? 'Nyalakan suara' : 'Bisukan suara'}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-stone-200 text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-rose-600" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <div className="flex-1 grid grid-cols-2 gap-4 text-left sm:text-right">
                  <div>
                    <div className="text-xs text-slate-500">Katalog</div>
                    <div className="text-sm font-medium font-mono text-slate-900">
                      {selectedItem.catalogCode}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Status Audio</div>
                    <div className="text-sm font-medium text-slate-900">
                      {isMuted ? 'Bisu' : isPlaying ? 'Sedang Diputar' : 'Siap Diputar'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section aria-label="Daftar Data Gambar" className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Galeri Data Gambar
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Pilih salah satu gambar untuk membuka tampilan detail, kontrol pemutaran, dan metadata.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau edisi..."
              aria-label="Cari gambar"
              className="w-full min-h-[44px] pl-9 pr-9 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({INITIAL_GALLERY_ITEMS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('favorites')}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filterMode === 'favorites'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Favorit ({favoriteIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Image Grid matching 11a */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <p className="text-base font-semibold text-slate-900">Tidak ada gambar yang cocok</p>
          <p className="text-sm text-slate-500">
            Coba ubah kata kunci pencarian atau tampilkan semua koleksi gambar.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterMode('all');
            }}
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Tampilkan Semua Gambar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const isFav = favoriteIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="group bg-slate-900 border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => openDetail(item.id)}
                  className="relative aspect-square w-full overflow-hidden bg-stone-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500"
                >
                  {brokenImageIds[item.id] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600">
                      <ImageOff className="w-8 h-8 mb-2 text-slate-400" />
                      <span className="text-xs font-medium">{item.title}</span>
                    </div>
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={`${item.title} — ${item.subtitle}`}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setBrokenImageIds((prev) => ({ ...prev, [item.id]: true }))
                      }
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                    />
                  )}
                </button>

                {/* Dark card footer strip matching 11a */}
                <div className="px-3.5 py-3 bg-slate-900 text-white flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openDetail(item.id)}
                    className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:underline"
                  >
                    <h2 className="text-sm sm:text-base font-semibold text-white truncate">
                      {item.title}
                    </h2>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    aria-label={isFav ? `Hapus ${item.title} dari favorit` : `Tandai ${item.title} sebagai favorit`}
                    className="min-h-[44px] min-w-[44px] -mr-2 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 shrink-0"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
