const destinations = [
  ['Ubud', 'Indonesia', 'Villa', 'Tropical gardens and open-air living make this sample retreat a calm base for exploring Ubud.'],
  ['Manali', 'India', 'Mountain', 'A bright mountain hideaway with crisp air, forest trails, and wide Himalayan views.'],
  ['Goa', 'India', 'Beach', 'A relaxed coastal sample stay near sandy shores, local cafés, and warm Arabian Sea sunsets.'],
  ['Paris', 'France', 'City', 'A welcoming city apartment for slow mornings, neighborhood bakeries, and classic Paris walks.'],
  ['Kyoto', 'Japan', 'Historic', 'A peaceful traditional-style guesthouse near temple lanes, gardens, and seasonal blossoms.'],
  ['Queenstown', 'New Zealand', 'Cabin', 'A wood-lined alpine cabin made for lake views, fresh air, and mountain adventures.'],
  ['Marrakech', 'Morocco', 'Luxury', 'A colorful riad-inspired courtyard stay with tiled details and a quiet garden atmosphere.'],
  ['Amalfi', 'Italy', 'Island', 'A sunlit coastal escape overlooking pastel villages and the sparkling Mediterranean.'],
  ['Tulum', 'Mexico', 'Beach', 'A breezy tropical bungalow surrounded by palms and a short ride from turquoise water.'],
  ['Banff', 'Canada', 'Mountain', 'A cozy lodge-style retreat close to alpine lakes, pine forests, and scenic trails.']
];
const photos = [
  'photo-1542314831-068cd1dbfeeb', 'photo-1571896349842-33c89424de2d', 'photo-1519046904884-53103b34b206', 'photo-1502602898657-3e91760cbb34',
  'photo-1493976040374-85c8e12f0c0e', 'photo-1449158743715-0a90ebb6d2d8', 'photo-1539020140153-e479b8c22e70', 'photo-1498307833015-e7b400441eb8',
  'photo-1516483638261-f4dbaf036963', 'photo-1501785888041-af3ef285b470', 'photo-1571003123894-1f0594d2b5d9', 'photo-1520250497591-112f2f40a3f4',
  'photo-1566073771259-6a8506099945', 'photo-1582719478250-c89cae4dc85b', 'photo-1602343168117-bb8ffe3e2e9f', 'photo-1518684079-3c830dcef090',
  'photo-1470165301023-58dab8118cc9', 'photo-1602391833977-358a52198938', 'photo-1602088113235-229c19758e9f', 'photo-1533619239233-6280475a633a'
];
const adjectives = ['Sunlit', 'Quiet', 'Hidden', 'Modern', 'Garden', 'Seaside', 'Alpine', 'Charming', 'Open-Air', 'Little'];
const homes = ['Retreat', 'Hideaway', 'Guesthouse', 'Cottage', 'Residence', 'Lodge', 'Escape', 'Villa', 'Apartment', 'Bungalow'];
const prices = [2800, 4200, 3500, 6100, 3900, 5200, 4600, 7200, 3100, 5700];

module.exports = Array.from({ length: 100 }, (_, index) => {
  const [location, country, category, description] = destinations[index % destinations.length];
  const title = `${adjectives[Math.floor(index / 10)]} ${location} ${homes[index % homes.length]}`;
  const photo = photos[index % photos.length];
  return {
    demoKey: `wanderlust-demo-${String(index + 1).padStart(3, '0')}`,
    title,
    description: `DEMO LISTING — Fictional sample accommodation. ${description} This illustrative listing is not a real property; details and pricing are for interface demonstration only.`,
    price: prices[index % prices.length],
    location,
    country,
    category,
    image: { url: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1400&q=80`, filename: `unsplash-${photo}` },
    isDemo: true
  };
});
