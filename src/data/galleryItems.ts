import bionicPortraitImg from '../assets/images/gallery_bionic_portrait_1795578834821.jpg';
import halcyonCrystalImg from '../assets/images/gallery_halcyon_crystal_1795578834914.jpg';
import supermodelSurrealImg from '../assets/images/gallery_supermodel_surreal_1795578835663.jpg';
import ironSeaWavesImg from '../assets/images/gallery_iron_sea_waves_1795578835436.jpg';
import kosalinePastelImg from '../assets/images/gallery_kosaline_pastel_1795578834806.jpg';
import flamingHorizonImg from '../assets/images/gallery_flaming_horizon_1795578836245.jpg';

export interface GalleryImageItem {
  id: string;
  title: string;
  subtitle: string;
  edition: string;
  year: number;
  duration: string;
  durationSeconds: number;
  genre: string;
  catalogCode: string;
  imageUrl: string;
  description: string;
  chordFrequencies: number[];
}

export const INITIAL_GALLERY_ITEMS: GalleryImageItem[] = [
  {
    id: 'bionic-portrait',
    title: 'Albert Einstein',
    subtitle: 'Leon Trotsky',
    edition: 'Bionic Mechanism',
    year: 2010,
    duration: '04:18',
    durationSeconds: 258,
    genre: 'Electronic Art',
    catalogCode: 'CAT-01 / MONO',
    imageUrl: bionicPortraitImg,
    description:
      'Kontras monokrom antara potret studio klasik dan struktur mekanik jam presisi yang melambangkan pertemuan nalar manusia dengan sistem otomatis.',
    chordFrequencies: [261.63, 329.63, 392.0],
  },
  {
    id: 'halcyon-crystal',
    title: 'Bill Gates',
    subtitle: 'Amelia Earhart',
    edition: 'Halcyon Prism',
    year: 2013,
    duration: '03:46',
    durationSeconds: 226,
    genre: 'Synth Pop',
    catalogCode: 'CAT-02 / PRISM',
    imageUrl: halcyonCrystalImg,
    description:
      'Refraksi cahaya prisma berwarna magenta dan plum yang menangkap spektrum lembut serta ketajaman fokus di balik permukaan kaca.',
    chordFrequencies: [293.66, 369.99, 440.0],
  },
  {
    id: 'supermodel-surreal',
    title: 'George Orwell',
    subtitle: 'Mao Zedong',
    edition: 'Supermodel Mirage',
    year: 2014,
    duration: '04:05',
    durationSeconds: 245,
    genre: 'Indie Pop',
    catalogCode: 'CAT-03 / TEAL',
    imageUrl: supermodelSurrealImg,
    description:
      'Ilustrasi surealis berwarna pirus cerah dengan tangga arsitektural melayang dan flora botani yang mengeksplorasi ruang perspektif.',
    chordFrequencies: [329.63, 415.3, 493.88],
  },
  {
    id: 'iron-sea-waves',
    title: 'Roger Federer',
    subtitle: 'Leo Tolstoy',
    edition: 'Under The Iron Sea',
    year: 2006,
    duration: '04:52',
    durationSeconds: 292,
    genre: 'Alternative',
    catalogCode: 'CAT-04 / INK',
    imageUrl: ironSeaWavesImg,
    description:
      'Cukilan kayu tinta biru malam dan gading yang menggambarkan pusaran ombak samudra dalam komposisi garis ritmis klasik.',
    chordFrequencies: [220.0, 261.63, 329.63],
  },
  {
    id: 'kosaline-pastel',
    title: 'Rosalind Franklin',
    subtitle: 'Kosaline',
    edition: 'Paper Geometry',
    year: 2018,
    duration: '03:29',
    durationSeconds: 209,
    genre: 'Minimalist',
    catalogCode: 'CAT-05 / ROSE',
    imageUrl: kosalinePastelImg,
    description:
      'Studi bidang arsitektural merah muda lembut dan abu-abu batu tulis dengan permainan bayangan pagi yang bersih dan terukur.',
    chordFrequencies: [349.23, 440.0, 523.25],
  },
  {
    id: 'flaming-horizon',
    title: 'Nikola Tesla',
    subtitle: 'The Flaming Lips',
    edition: 'Terracotta Horizon',
    year: 2016,
    duration: '05:12',
    durationSeconds: 312,
    genre: 'Psychedelic',
    catalogCode: 'CAT-06 / TERRA',
    imageUrl: flamingHorizonImg,
    description:
      'Cetakan grafis modernis cakrawala terakota hangat dan lengkung matahari gading dengan kontras gelap yang tegas.',
    chordFrequencies: [246.94, 311.13, 369.99],
  },
];
