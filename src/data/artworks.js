// All artwork images are imported from the local assets folder
import art1 from '../assets/art1.webp';
import art2 from '../assets/art2.webp';
import art3 from '../assets/art3.webp';
import art4 from '../assets/art4.webp';
import art5 from '../assets/art5.webp';
import art6 from '../assets/art6.webp';
import art7 from '../assets/art7.webp';
import art8 from '../assets/art8.webp';
import art9 from '../assets/art9.webp';
import art10 from '../assets/art10.webp';
import heroPng from '../assets/hero.png';

export const heroImage = heroPng;

export const artworks = [
  {
    id: 1,
    title: "Study in Graphite — I",
    category: "Graphite",
    medium: "Graphite on Paper",
    year: "2026",
    description: "A delicate study of feminine form — soft gradients dissolve into the paper, capturing presence through restraint.",
    coverImage: art1,
    images: [
      { src: art1, label: "Full Artwork" },
      { src: art4, label: "Detail Study" },
    ]
  },
  {
    id: 2,
    title: "Peaky Shadow",
    category: "Graphite",
    medium: "Graphite on Archival Paper",
    year: "2025",
    description: "A commanding character portrait rendered in deep graphite — mood emanating from texture and shadow alone.",
    coverImage: art2,
    images: [
      { src: art2, label: "Full Artwork" },
      { src: art5, label: "Alternate Study" },
    ]
  },
  {
    id: 3,
    title: "Adiyogi",
    category: "Acrylic",
    medium: "Acrylic on Canvas Board",
    year: "2026",
    description: "Adiyogi — the first yogi — painted in monochromatic acrylics with accents of sacred red. A meditation in stillness.",
    coverImage: art3,
    images: [
      { src: art3, label: "Full Artwork" },
    ]
  },
  {
    id: 4,
    title: "Study in Graphite — II",
    category: "Realistic",
    medium: "Graphite on Cartridge Paper",
    year: "2025",
    description: "A realistic portrait capturing youth and observation — rendered with careful tonal transitions and fine line work.",
    coverImage: art4,
    images: [
      { src: art4, label: "Full Artwork" },
      { src: art1, label: "Comparison Study" },
    ]
  },
  {
    id: 5,
    title: "King's Man",
    category: "Hyper-Realistic",
    medium: "Graphite on Bristol Board",
    year: "2024",
    description: "Hyper-realistic character study with meticulous attention to hair texture, fabric and skin — pushing graphite to its limit.",
    coverImage: art5,
    images: [
      { src: art5, label: "Full Artwork" },
      { src: art2, label: "Process Detail" },
    ]
  },
  {
    id: 6,
    title: "Ink Study — Virat",
    category: "Charcoal",
    medium: "Ballpoint Pen on Paper",
    year: "2026",
    description: "An expressive close-up rendered entirely in ballpoint pen — dramatic perspective and raw intensity.",
    coverImage: art6,
    images: [
      { src: art6, label: "Full Artwork" },
      { src: art10, label: "Detail — Eyes" },
    ]
  },
  {
    id: 7,
    title: "Four Faces",
    category: "Graphite",
    medium: "Graphite on Paper",
    year: "2025",
    description: "Four simultaneous portraits of the same subject — a study in angle, light and fragmented identity.",
    coverImage: art7,
    images: [
      { src: art7, label: "Full Artwork" },
      { src: art5, label: "Panel Detail" },
    ]
  },
  {
    id: 8,
    title: "Thalaivar",
    category: "Realistic",
    medium: "Graphite on Paper",
    year: "2024",
    description: "A portrait of quiet authority — Rajinikanth rendered in fine graphite lines with characteristic calm intensity.",
    coverImage: art8,
    images: [
      { src: art8, label: "Full Artwork" },
      { src: art2, label: "Expression Study" },
    ]
  },
  {
    id: 9,
    title: "Gaze",
    category: "Hyper-Realistic",
    medium: "Graphite on Cartridge Paper",
    year: "2026",
    description: "A close-crop hyper-realistic portrait — the eyes carry everything. Rendered with extreme precision in graphite.",
    coverImage: art9,
    images: [
      { src: art9, label: "Full Artwork" },
      { src: art1, label: "Eye Detail" },
    ]
  },
  {
    id: 10,
    title: "Walter White",
    category: "Hyper-Realistic",
    medium: "Graphite on Bristol Board",
    year: "2026",
    description: "A hyper-realistic close-up — the weathered detail of skin, glasses and beard rendered at near-photographic fidelity.",
    coverImage: art10,
    images: [
      { src: art10, label: "Full Artwork" },
      { src: art9, label: "Detail Crop" },
    ]
  }
];

export const categories = [
  "ALL",
  "GRAPHITE",
  "CHARCOAL",
  "REALISTIC",
  "HYPER-REALISTIC",
  "ACRYLIC"
];
