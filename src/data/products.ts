/* ═══════════════════════════════════════════════════════
   MANNERS — Product Data
   Season: SS26 | Prices: Caps €32, Tees €64, Jeans €128, Hoodies €256
   ═══════════════════════════════════════════════════════ */

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'caps' | 'tees' | 'jeans' | 'hoodies' | 'accessories';
  price: number;
  currency: string;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  description: string;
  season: string;
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isRestocked?: boolean;
  features?: string[];
}

export interface CartItem {
  product: Product;
  size: string;
  color: ProductColor;
  quantity: number;
}

export type Category = 'caps' | 'tees' | 'jeans' | 'hoodies' | 'accessories';

/* ─── Category Features ─── */
export const categoryFeatures: Record<string, string[]> = {
  caps: ['100% Cotton Canvas', 'Garment Dyed', 'Adjustable Strap', 'Tonal Embroidered Logo', 'One Size Fits All'],
  tees: ['100% Organic Cotton', 'Heavyweight 280gsm', 'Boxy Relaxed Fit', 'Pre-Shrunk', 'Screen Printed Graphics'],
  jeans: ['100% Cotton Selvedge Denim', 'Chain-Stitched Hem', 'Copper Hardware', 'Raw Indigo Dye', 'Made in Portugal'],
  hoodies: ['100% Brushed-Back Fleece', 'Heavyweight 450gsm', 'Double-Layered Hood', 'Oversized Fit', 'YKK Zippers'],
  accessories: ['Premium Materials', 'Handcrafted Details', 'Tarnish Resistant', 'Made to Last'],
};

/* ─── Size Guide Measurements (cm) ─── */
export interface MeasurementRow {
  size: string;
  chest?: string;
  length?: string;
  sleeve?: string;
  waist?: string;
  inseam?: string;
  brim?: string;
  circumference?: string;
}

export const categoryMeasurements: Record<string, { headers: string[]; rows: MeasurementRow[] }> = {
  caps: {
    headers: ['Size', 'Circumference', 'Brim'],
    rows: [
      { size: 'S/M', circumference: '54–57', brim: '7' },
      { size: 'L/XL', circumference: '58–61', brim: '7' },
      { size: 'One Size', circumference: '55–60', brim: '7' },
    ],
  },
  tees: {
    headers: ['Size', 'Chest', 'Length', 'Sleeve'],
    rows: [
      { size: 'XS', chest: '49', length: '67', sleeve: '21' },
      { size: 'S', chest: '52', length: '69', sleeve: '22' },
      { size: 'M', chest: '55', length: '71', sleeve: '23' },
      { size: 'L', chest: '58', length: '73', sleeve: '24' },
      { size: 'XL', chest: '62', length: '75', sleeve: '25' },
    ],
  },
  jeans: {
    headers: ['Size', 'Waist', 'Inseam', 'Length'],
    rows: [
      { size: '28', waist: '72', inseam: '81', length: '105' },
      { size: '30', waist: '76', inseam: '81', length: '106' },
      { size: '32', waist: '81', inseam: '82', length: '107' },
      { size: '34', waist: '86', inseam: '82', length: '108' },
      { size: '36', waist: '91', inseam: '83', length: '109' },
    ],
  },
  hoodies: {
    headers: ['Size', 'Chest', 'Length', 'Sleeve'],
    rows: [
      { size: 'S', chest: '58', length: '68', sleeve: '62' },
      { size: 'M', chest: '62', length: '70', sleeve: '64' },
      { size: 'L', chest: '66', length: '72', sleeve: '66' },
      { size: 'XL', chest: '70', length: '74', sleeve: '68' },
    ],
  },
  accessories: {
    headers: ['Size'],
    rows: [{ size: 'One Size' }],
  },
};

export const formatPrice = (price: number): string => {
  return `€${price}`;
};



export const imageColors: Record<string, {hue: number, sat: number}> = {
  '/images/caps/cap1[UP].png': { hue: 16, sat: 15 },
  '/images/caps/cap2[UP].png': { hue: 47, sat: 15 },
  '/images/tees/tee2[UP].png': { hue: 5, sat: 15 },
  '/images/tees/tee[UP].png': { hue: 26, sat: 25 },
  '/images/jeans/jeans1[UP].png': { hue: 216, sat: 15 },
  '/images/jeans/jeans2[UP].png': { hue: 45, sat: 15 },
  '/images/jeans/jeans3[UP].png': { hue: 234, sat: 15 },
};

export const getPlaceholderGradient = (category: Category, index: number, imagePath?: string): React.CSSProperties => {
  let hue = 0;
  let sat = 0;
  
  if (imagePath && imageColors[imagePath]) {
    hue = imageColors[imagePath].hue;
    sat = imageColors[imagePath].sat;
  } else {
    // Generate a deterministic hash from the category string + index
    const hash = Array.from(category).reduce((acc, char) => acc + char.charCodeAt(0), 0) + index * 31;
    hue = hash % 360;
    sat = 15 + (hash % 20); // 15-35%
  }
  
  return {
    '--prod-hue': hue,
    '--prod-sat': `${sat}%`
  } as React.CSSProperties;
};

/* ─── Product Catalog: SS26 ─── */
export const products: Product[] = [
  // ═══ CAPS — €32 ═══
  {
    id: 'cap-001',
    name: 'Washed Canvas Cap',
    category: 'caps',
    price: 32,
    currency: 'EUR',
    images: ['/images/caps/cap1[UP].png'],
    sizes: ['One Size'],
    colors: [
      { name: 'Stone', hex: '#b8a99a' },
      { name: 'Washed Black', hex: '#2c2c2c' },
    ],
    description: 'Unstructured 6-panel cap in garment-dyed cotton canvas. Tonal embroidered logo. Adjustable leather strap.',
    season: 'SS26',
    inStock: true,
    isNew: false,
    isBestseller: true,
  },
  {
    id: 'cap-002',
    name: 'Corduroy Dad Cap',
    category: 'caps',
    price: 32,
    currency: 'EUR',
    images: ['/images/caps/cap2[UP].png'],
    sizes: ['One Size'],
    colors: [
      { name: 'Forest', hex: '#3d5a3e' },
      { name: 'Cream', hex: '#f0ead6' },
    ],
    description: 'Relaxed-fit corduroy cap with pre-curved brim. Debossed leather patch logo. Brass buckle closure.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'cap-003',
    name: 'Mesh Trucker',
    category: 'caps',
    price: 32,
    currency: 'EUR',
    images: ['/images/caps/cap-03.jpg'],
    sizes: ['One Size'],
    colors: [
      { name: 'Navy', hex: '#1a2744' },
      { name: 'Black', hex: '#111111' },
    ],
    description: 'Classic trucker silhouette with structured front panel. Woven label logo. Snapback closure.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'cap-004',
    name: 'Ripstop Camp Cap',
    category: 'caps',
    price: 32,
    currency: 'EUR',
    images: ['/images/caps/cap-04.jpg'],
    sizes: ['One Size'],
    colors: [
      { name: 'Olive', hex: '#6b7c4e' },
      { name: 'Sand', hex: '#d4c5a9' },
    ],
    description: 'Five-panel camp cap in ripstop nylon. Reflective logo tab. Nylon webbing strap with D-ring.',
    season: 'SS26',
    inStock: true,
    isNew: false,
  },
  {
    id: 'cap-005',
    name: 'Knit Beanie',
    category: 'caps',
    price: 32,
    currency: 'EUR',
    images: ['/images/caps/cap-05.jpg'],
    sizes: ['One Size'],
    colors: [
      { name: 'Charcoal', hex: '#3a3a3a' },
      { name: 'Oatmeal', hex: '#d9cfc0' },
    ],
    description: 'Ribbed merino wool beanie with rolled cuff. Embroidered wordmark. Made in Portugal.',
    season: 'SS26',
    inStock: true,
  },

  // ═══ TEES — €64 ═══
  {
    id: 'tee-001',
    name: 'Essential Heavyweight Tee',
    category: 'tees',
    price: 64,
    currency: 'EUR',
    images: ['/images/tees/tee[UP].png'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Off-White', hex: '#f5f0e8' },
      { name: 'Washed Black', hex: '#1a1a1a' },
      { name: 'Sage', hex: '#9caa8e' },
    ],
    description: '280gsm heavyweight cotton jersey. Boxy relaxed fit. Screen-printed logo on chest.',
    season: 'SS26',
    inStock: true,
    isRestocked: true,
  },
  {
    id: 'tee-002',
    name: 'Graphic Print Tee',
    category: 'tees',
    price: 64,
    currency: 'EUR',
    images: ['/images/tees/tee2[UP].png'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Vintage White', hex: '#ede6da' },
      { name: 'Faded Black', hex: '#2a2a2a' },
    ],
    description: 'Oversized fit with full back graphic. DTG printed on 260gsm organic cotton.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'tee-003',
    name: 'Pocket Logo Tee',
    category: 'tees',
    price: 64,
    currency: 'EUR',
    images: ['/images/tees/tee-03.jpg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Sky', hex: '#a3c4d9' },
      { name: 'Bone', hex: '#e8dfd0' },
    ],
    description: 'Regular fit tee with embroidered chest pocket. 220gsm combed cotton.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'tee-004',
    name: 'Washed Long Sleeve',
    category: 'tees',
    price: 64,
    currency: 'EUR',
    images: ['/images/tees/tee-04.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Dusty Rose', hex: '#c4a4a0' },
      { name: 'Navy', hex: '#3a4a5c' },
    ],
    description: 'Garment-dyed long sleeve with dropped shoulders. Puff print logo on sleeve.',
    season: 'SS26',
    inStock: true,
    isNew: false,
  },
  {
    id: 'tee-005',
    name: 'Ribbed Tank',
    category: 'tees',
    price: 64,
    currency: 'EUR',
    images: ['/images/tees/tee-05.jpg'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'White', hex: '#fafafa' },
      { name: 'Black', hex: '#111111' },
    ],
    description: 'Fitted ribbed tank in 200gsm cotton blend. Subtle woven label at hem.',
    season: 'SS26',
    inStock: true,
  },

  // ═══ JEANS — €128 ═══
  {
    id: 'jeans-001',
    name: 'Straight Selvedge',
    category: 'jeans',
    price: 128,
    currency: 'EUR',
    images: ['/images/jeans/jeans1[UP].png'],
    sizes: ['28', '30', '32', '34', '36'],
    colors: [
      { name: 'Raw Indigo', hex: '#2c3e6b' },
      { name: 'One Wash', hex: '#1e2a45' },
    ],
    description: '14oz Japanese selvedge denim. Straight leg fit. Copper rivets. Chain-stitched hem.',
    season: 'SS26',
    inStock: true,
    isNew: true,
  },
  {
    id: 'jeans-002',
    name: 'Relaxed Wide Leg',
    category: 'jeans',
    price: 128,
    currency: 'EUR',
    images: ['/images/jeans/jeans2[UP].png'],
    sizes: ['28', '30', '32', '34', '36'],
    colors: [
      { name: 'Light Wash', hex: '#8ea4bf' },
      { name: 'Mid Blue', hex: '#5c7a9c' },
    ],
    description: 'Relaxed fit with wide leg opening. 12oz organic cotton denim. Vintage wash.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'jeans-003',
    name: 'Carpenter Pant',
    category: 'jeans',
    price: 128,
    currency: 'EUR',
    images: ['/images/jeans/jeans3[UP].png'],
    sizes: ['28', '30', '32', '34', '36'],
    colors: [
      { name: 'Washed Black', hex: '#222222' },
      { name: 'Stone', hex: '#a89888' },
    ],
    description: 'Utility-inspired carpenter pant. Hammer loop and tool pockets. 13oz bull denim.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'jeans-004',
    name: 'Slim Tapered',
    category: 'jeans',
    price: 128,
    currency: 'EUR',
    images: ['/images/jeans/jeans-04.jpg'],
    sizes: ['28', '30', '32', '34', '36'],
    colors: [
      { name: 'Dark Rinse', hex: '#1a2540' },
      { name: 'Grey Cast', hex: '#5c5c5c' },
    ],
    description: 'Slim fit with tapered leg. 11oz stretch selvedge denim. Hidden rivets.',
    season: 'SS26',
    inStock: true,
    isNew: false,
  },
  {
    id: 'jeans-005',
    name: 'Painted Denim',
    category: 'jeans',
    price: 128,
    currency: 'EUR',
    images: ['/images/jeans/jeans-05.jpg'],
    sizes: ['28', '30', '32', '34', '36'],
    colors: [
      { name: 'Splatter', hex: '#4a6c8c' },
    ],
    description: 'Hand-painted wide leg denim. Each pair unique. 14oz rigid denim. Button fly.',
    season: 'SS26',
    inStock: true,
  },

  // ═══ HOODIES — €256 ═══
  {
    id: 'hoodie-001',
    name: 'Heavyweight Hoodie',
    category: 'hoodies',
    price: 256,
    currency: 'EUR',
    images: ['/images/hoodies/hoodie-01.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Heather Grey', hex: '#7a7a7a' },
    ],
    description: '450gsm brushed-back fleece. Oversized fit. Embroidered logo. Double-layered hood.',
    season: 'SS26',
    inStock: true,
    isNew: false,
  },
  {
    id: 'hoodie-002',
    name: 'Washed Zip-Up',
    category: 'hoodies',
    price: 256,
    currency: 'EUR',
    images: ['/images/hoodies/hoodie-02.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Washed Navy', hex: '#3a4a5c' },
      { name: 'Faded Olive', hex: '#5a6a4e' },
    ],
    description: 'Garment-dyed full-zip hoodie. YKK metal zipper. Kangaroo pocket. Raw edges.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'hoodie-003',
    name: 'Cropped Pullover',
    category: 'hoodies',
    price: 256,
    currency: 'EUR',
    images: ['/images/hoodies/hoodie-03.jpg'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Mocha', hex: '#5a4a3a' },
      { name: 'Cream', hex: '#f0ead6' },
    ],
    description: 'Cropped boxy hoodie. 380gsm French terry. Puff print logo. Ribbed cuffs.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'hoodie-004',
    name: 'Graphic Hoodie',
    category: 'hoodies',
    price: 256,
    currency: 'EUR',
    images: ['/images/hoodies/hoodie-04.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Plum', hex: '#4a3d5c' },
      { name: 'Black', hex: '#111111' },
    ],
    description: 'Back print graphic hoodie. Vintage wash finish. 400gsm cotton. Relaxed fit.',
    season: 'SS26',
    inStock: true,
    isNew: false,
  },
  {
    id: 'hoodie-005',
    name: 'Quarter-Zip Fleece',
    category: 'hoodies',
    price: 256,
    currency: 'EUR',
    images: ['/images/hoodies/hoodie-05.jpg'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Forest', hex: '#3d5a4a' },
      { name: 'Charcoal', hex: '#3a3a3a' },
    ],
    description: 'Polartec® quarter-zip fleece. Stand collar. Chest pocket with zip. Regular fit.',
    season: 'SS26',
    inStock: false,
  },

  // ═══ ACCESSORIES ═══
  {
    id: 'acc-001',
    name: 'Chain Necklace',
    category: 'accessories',
    price: 85,
    currency: 'EUR',
    images: ['/images/accessories/acc-01.jpg'],
    sizes: ['One Size'],
    colors: [
      { name: 'Silver', hex: '#c0c0c0' },
      { name: 'Gold', hex: '#d4a933' },
    ],
    description: 'Stainless steel curb chain. Lobster clasp. Engraved logo tag. Tarnish-resistant.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'acc-002',
    name: 'Canvas Tote',
    category: 'accessories',
    price: 62,
    currency: 'EUR',
    images: ['/images/accessories/acc-02.jpg'],
    sizes: ['One Size'],
    colors: [
      { name: 'Natural', hex: '#e8dcc8' },
      { name: 'Black', hex: '#111111' },
    ],
    description: '16oz washed canvas tote. Leather bottom panel. Interior zip pocket.',
    season: 'SS26',
    inStock: true,
    isNew: false,
  },
  {
    id: 'acc-003',
    name: 'Wool Scarf',
    category: 'accessories',
    price: 75,
    currency: 'EUR',
    images: ['/images/accessories/acc-03.jpg'],
    sizes: ['One Size'],
    colors: [
      { name: 'Camel', hex: '#c4a76c' },
      { name: 'Charcoal', hex: '#3a3a3a' },
    ],
    description: 'Lambswool scarf with fringed edges. Woven logo patch. Made in Scotland.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'acc-004',
    name: 'Socks 3-Pack',
    category: 'accessories',
    price: 35,
    currency: 'EUR',
    images: ['/images/accessories/acc-04.jpg'],
    sizes: ['S/M', 'L/XL'],
    colors: [
      { name: 'Mixed', hex: '#888888' },
    ],
    description: 'Ribbed crew socks in combed cotton blend. Jacquard-knit logo.',
    season: 'SS26',
    inStock: true,
  },

  // ═══ EXTRA CAPS ═══
  {
    id: 'cap-006',
    name: 'Mesh Trucker Cap',
    category: 'caps',
    price: 32,
    currency: 'EUR',
    images: [],
    sizes: ['One Size'],
    colors: [{ name: 'Black', hex: '#111' }],
    description: 'Classic trucker silhouette with mesh back panels. Embroidered patch logo.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'cap-007',
    name: 'Waxed Cotton Cap',
    category: 'caps',
    price: 32,
    currency: 'EUR',
    images: [],
    sizes: ['S/M', 'L/XL'],
    colors: [{ name: 'Olive', hex: '#4a5a3a' }],
    description: 'Weather-resistant waxed cotton cap. Brass eyelets and leather strap.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'cap-008',
    name: 'Linen Bucket Hat',
    category: 'caps',
    price: 32,
    currency: 'EUR',
    images: [],
    sizes: ['S/M', 'L/XL'],
    colors: [{ name: 'Natural', hex: '#e8dcc8' }],
    description: 'Lightweight linen bucket hat with raw edge brim. Tonal logo.',
    season: 'SS26',
    inStock: true,
  },

  // ═══ EXTRA TEES ═══
  {
    id: 'tee-006',
    name: 'Boxy Crop Tee',
    category: 'tees',
    price: 64,
    currency: 'EUR',
    images: [],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Chalk', hex: '#f0ead6' }],
    description: 'Cropped boxy fit in heavyweight cotton. Raw hem finish.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'tee-007',
    name: 'Vintage Wash Tee',
    category: 'tees',
    price: 64,
    currency: 'EUR',
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Faded Indigo', hex: '#5a6a8a' }],
    description: 'Sun-faded wash effect on 240gsm organic cotton. Relaxed fit.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'tee-008',
    name: 'Mesh Panel Tee',
    category: 'tees',
    price: 64,
    currency: 'EUR',
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', hex: '#111' }],
    description: 'Performance mesh side panels on heavyweight cotton body.',
    season: 'SS26',
    inStock: true,
  },

  // ═══ EXTRA JEANS ═══
  {
    id: 'jeans-006',
    name: 'Carpenter Jean',
    category: 'jeans',
    price: 128,
    currency: 'EUR',
    images: [],
    sizes: ['28', '30', '32', '34', '36'],
    colors: [{ name: 'Washed Brown', hex: '#8a7060' }],
    description: 'Workwear-inspired carpenter jean with hammer loop and tool pockets.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'jeans-007',
    name: 'Slim Tapered',
    category: 'jeans',
    price: 128,
    currency: 'EUR',
    images: [],
    sizes: ['28', '30', '32', '34'],
    colors: [{ name: 'Rinse', hex: '#1a2030' }],
    description: 'Modern slim taper in rigid 13oz denim. Clean back pockets.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'jeans-008',
    name: 'Double Knee Work',
    category: 'jeans',
    price: 128,
    currency: 'EUR',
    images: [],
    sizes: ['30', '32', '34', '36'],
    colors: [{ name: 'Duck Canvas', hex: '#c4b8a0' }],
    description: 'Reinforced double-knee construction in 12oz duck canvas.',
    season: 'SS26',
    inStock: true,
  },

  // ═══ EXTRA HOODIES ═══
  {
    id: 'hoodie-006',
    name: 'Quarter Zip Fleece',
    category: 'hoodies',
    price: 256,
    currency: 'EUR',
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Slate', hex: '#5a6a7a' }],
    description: 'Recycled polyester fleece with quarter-zip collar. Raglan sleeves.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'hoodie-007',
    name: 'Thermal Waffle Hood',
    category: 'hoodies',
    price: 256,
    currency: 'EUR',
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Oatmeal', hex: '#d4c8b0' }],
    description: 'Waffle-knit thermal hoodie in cotton-linen blend.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'hoodie-008',
    name: 'Coaches Jacket',
    category: 'hoodies',
    price: 256,
    currency: 'EUR',
    images: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Navy', hex: '#1a2a40' }],
    description: 'Snap-front coaches jacket in water-resistant nylon. Mesh lined.',
    season: 'SS26',
    inStock: true,
  },

  // ═══ EXTRA ACCESSORIES ═══
  {
    id: 'acc-005',
    name: 'Leather Card Holder',
    category: 'accessories',
    price: 45,
    currency: 'EUR',
    images: [],
    sizes: ['One Size'],
    colors: [{ name: 'Tan', hex: '#c4a070' }],
    description: 'Vegetable-tanned leather card holder with 4 slots.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'acc-006',
    name: 'Canvas Tote',
    category: 'accessories',
    price: 55,
    currency: 'EUR',
    images: [],
    sizes: ['One Size'],
    colors: [{ name: 'Natural', hex: '#e8dcc8' }],
    description: '16oz organic canvas tote with reinforced handles.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'acc-007',
    name: 'Knit Beanie',
    category: 'accessories',
    price: 28,
    currency: 'EUR',
    images: [],
    sizes: ['One Size'],
    colors: [{ name: 'Charcoal', hex: '#3a3a3a' }],
    description: 'Ribbed merino wool beanie with rolled cuff.',
    season: 'SS26',
    inStock: true,
  },
  {
    id: 'acc-008',
    name: 'Woven Belt',
    category: 'accessories',
    price: 38,
    currency: 'EUR',
    images: [],
    sizes: ['S/M', 'L/XL'],
    colors: [{ name: 'Black', hex: '#111' }],
    description: 'Braided cotton belt with brushed nickel buckle.',
    season: 'SS26',
    inStock: true,
  },
];

/* ─── Helpers ─── */
export const getProductsByCategory = (category: Category): Product[] =>
  products.filter((p) => p.category === category);

export const getProductById = (id: string): Product | undefined =>
  products.find((p) => p.id === id);

export const categoryLabels: Record<string, string> = {
  all: 'All Products',
  caps: 'Caps',
  tees: 'Tees',
  jeans: 'Jeans',
  hoodies: 'Hoodies',
  accessories: 'Accessories',
};

export const categoryPrices: Record<string, number> = {
  caps: 32,
  tees: 64,
  jeans: 128,
  hoodies: 256,
};

/* ─── Search ─── */
export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
};
