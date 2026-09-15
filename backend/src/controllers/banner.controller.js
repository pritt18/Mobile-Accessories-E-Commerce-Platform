const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const staticBanners = [
  {
    id: 1,
    title: 'Authentic Mobixia Mobile Accessories',
    subtitle: 'High-speed 65W GaN Chargers, Braided Cables & ANC Audio',
    image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=1600&auto=format&fit=crop&q=80',
    link: '/products',
    position: 'HERO',
    sort_order: 1,
    status: 'ACTIVE',
  },
  {
    id: 2,
    title: 'Next-Gen Wireless & MagSafe Power',
    subtitle: 'Ultra-slim 10000mAh Magnetic Power Banks on Sale',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1600&auto=format&fit=crop&q=80',
    link: '/products',
    position: 'HERO',
    sort_order: 2,
    status: 'ACTIVE',
  },
];

const getBanners = async (req, res) => {
  try {
    const { position } = req.query;
    let filtered = staticBanners;
    if (position) {
      filtered = filtered.filter((b) => b.position === position);
    }
    return successResponse(res, filtered);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getBanners,
  staticBanners,
};
