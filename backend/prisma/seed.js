const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Helper for encryption
const encryptSecret = (text) => {
  const keyHex = process.env.ENCRYPTION_KEY || 'e83a7c6412f9b1d034876b51e60f2798e83a7c6412f9b1d034876b51e60f2798';
  const key = Buffer.from(keyHex.padEnd(64, '0').slice(0, 64), 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

async function main() {
  console.log('🌱 Seeding clean database with authentic catalog & configuration...');

  // 1. Clean old mock clutter
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlist.deleteMany({});

  // 2. Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN', description: 'Complete system control and ownership', is_system: true },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Operational administrator with catalog, orders, and marketing access', is_system: true },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: { name: 'MANAGER', description: 'Staff manager handling products, inventory, and order fulfillment', is_system: true },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: { name: 'CUSTOMER', description: 'Registered store customer', is_system: true },
  });

  // 3. Permissions
  const modules = ['products', 'orders', 'inventory', 'customers', 'marketing', 'reviews', 'cms', 'reports', 'settings', 'staff', 'audit'];
  const actions = ['view', 'create', 'edit', 'delete'];

  const permissionMap = {};
  for (const mod of modules) {
    for (const act of actions) {
      const perm = await prisma.permission.upsert({
        where: { module_action: { module: mod, action: act } },
        update: {},
        create: { module: mod, action: act },
      });
      permissionMap[`${mod}.${act}`] = perm.id;
    }
  }

  // Assign Admin & Manager permissions
  const adminModules = ['products', 'orders', 'inventory', 'customers', 'marketing', 'reviews', 'cms', 'reports', 'audit'];
  for (const mod of adminModules) {
    for (const act of actions) {
      const pId = permissionMap[`${mod}.${act}`];
      if (pId) {
        await prisma.rolePermission.upsert({
          where: { role_id_permission_id: { role_id: adminRole.id, permission_id: pId } },
          update: {},
          create: { role_id: adminRole.id, permission_id: pId },
        });
      }
    }
  }

  const managerPerms = [
    'products.view', 'products.create', 'products.edit',
    'orders.view', 'orders.edit',
    'inventory.view', 'inventory.edit',
    'customers.view',
    'reports.view',
    'reviews.view', 'reviews.edit',
  ];
  for (const permKey of managerPerms) {
    const pId = permissionMap[permKey];
    if (pId) {
      await prisma.rolePermission.upsert({
        where: { role_id_permission_id: { role_id: managerRole.id, permission_id: pId } },
        update: {},
        create: { role_id: managerRole.id, permission_id: pId },
      });
    }
  }

  // 4. Default Clean Users (Password: Password@123)
  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  // Remove any legacy users with old domains
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@mobixia.com', 'john@mobixia.com', 'john@example.com']
      }
    }
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@mobixia.in' },
    update: { password_hash: defaultPasswordHash },
    create: {
      name: 'Mobixia Super Admin',
      email: 'superadmin@mobixia.in',
      mobile: '+91 98888 00001',
      password_hash: defaultPasswordHash,
      role_id: superAdminRole.id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mobixia.in' },
    update: { password_hash: defaultPasswordHash },
    create: {
      name: 'Mobixia Operations Admin',
      email: 'admin@mobixia.in',
      mobile: '+91 98888 00002',
      password_hash: defaultPasswordHash,
      role_id: adminRole.id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@mobixia.in' },
    update: { password_hash: defaultPasswordHash },
    create: {
      name: 'Mobixia Inventory Staff',
      email: 'manager@mobixia.in',
      mobile: '+91 98888 00003',
      password_hash: defaultPasswordHash,
      role_id: managerRole.id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@mobixia.in' },
    update: { password_hash: defaultPasswordHash },
    create: {
      name: 'Pritam Gangurde',
      email: 'customer@mobixia.in',
      mobile: '+91 98765 43210',
      password_hash: defaultPasswordHash,
      role_id: customerRole.id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  await prisma.user.upsert({
    where: { email: 'pritamgangurde17@gmail.com' },
    update: { password_hash: defaultPasswordHash },
    create: {
      name: 'Pritam Gangurde',
      email: 'pritamgangurde17@gmail.com',
      mobile: '+91 95798 88176',
      password_hash: defaultPasswordHash,
      role_id: customerRole.id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Saved addresses for customer
  await prisma.address.deleteMany({ where: { user_id: customer.id } });
  await prisma.address.create({
    data: {
      user_id: customer.id,
      name: 'Pritam Gangurde',
      phone: '+91 98765 43210',
      line1: 'Flat 402, Sea Breeze Residency, Carter Road',
      line2: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      is_default: true,
      type: 'HOME',
    },
  });

  // 5. Categories
  const categoriesData = [
    {
      name: 'Phone Cases',
      slug: 'phone-cases',
      image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
      is_featured: true,
      sort_order: 1,
      children: ['MagSafe Cases', 'Aramid Fiber Cases', 'Heavy-Duty Armor Cases'],
    },
    {
      name: 'Chargers & Adapters',
      slug: 'chargers',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      is_featured: true,
      sort_order: 2,
      children: ['GaN Fast Chargers', '3-in-1 Wireless Stands', 'Car Fast Chargers'],
    },
    {
      name: 'High-Speed Cables',
      slug: 'cables',
      image: 'https://images.unsplash.com/photo-1608248597359-001275997230?w=600&auto=format&fit=crop&q=80',
      is_featured: true,
      sort_order: 3,
      children: ['100W Braided Type-C', 'Thunderbolt 4 Cables', 'MFi Lightning Cables'],
    },
    {
      name: 'Audio & Wireless',
      slug: 'audio',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      is_featured: true,
      sort_order: 4,
      children: ['ANC True Wireless Earbuds', 'IPX7 Bluetooth Speakers'],
    },
    {
      name: 'Power Banks',
      slug: 'power-banks',
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80',
      is_featured: true,
      sort_order: 5,
      children: ['Magnetic Wireless Banks', '65W Laptop Power Banks'],
    },
    {
      name: 'Mounts & Stands',
      slug: 'mounts-and-stands',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&auto=format&fit=crop&q=80',
      is_featured: true,
      sort_order: 6,
      children: ['MagSafe Car Mounts', 'Aluminum Desktop Stands'],
    },
    {
      name: 'Watch Accessories',
      slug: 'watch-accessories',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      is_featured: true,
      sort_order: 7,
      children: ['Titanium Straps', 'Alpine Trail Straps'],
    },
    {
      name: 'Screen & Lens Protectors',
      slug: 'screen-protectors',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80',
      is_featured: true,
      sort_order: 8,
      children: ['Curved 9H Tempered Glass', 'Privacy Screen Guards'],
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        is_featured: cat.is_featured,
        sort_order: cat.sort_order,
      },
    });
    categoryMap[cat.slug] = parent.id;

    if (cat.children) {
      for (let i = 0; i < cat.children.length; i++) {
        const subName = cat.children[i];
        const subSlug = `${cat.slug}-${subName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        await prisma.category.upsert({
          where: { slug: subSlug },
          update: {},
          create: {
            parent_id: parent.id,
            name: subName,
            slug: subSlug,
            sort_order: i + 1,
          },
        });
      }
    }
  }

  // 6. Brands
  const brandsData = [
    { name: 'Mobixia Signature', slug: 'mobixia-signature', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80' },
    { name: 'Apple', slug: 'apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format&fit=crop&q=80' },
    { name: 'Samsung', slug: 'samsung', logo: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=100&auto=format&fit=crop&q=80' },
    { name: 'Anker', slug: 'anker', logo: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100&auto=format&fit=crop&q=80' },
    { name: 'Spigen', slug: 'spigen', logo: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=100&auto=format&fit=crop&q=80' },
    { name: 'OnePlus', slug: 'oneplus', logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=100&auto=format&fit=crop&q=80' },
  ];

  const brandMap = {};
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brandMap[b.slug] = brand.id;
  }

  // 7. Authentic Catalog
  const productsCatalog = [
    {
      name: 'AeroShield MagSafe Matte Frost Case',
      slug: 'aeroshield-magsafe-matte-frost-case',
      categorySlug: 'phone-cases',
      brandSlug: 'mobixia-signature',
      description: 'Ultra-thin translucent matte case featuring embedded N52 neodymium magnetic ring with 15W high-speed wireless charging support. Military-grade MIL-STD-810H corner drop protection with anti-yellowing German TPU.',
      specs: { 'Material': 'Aviation Bayer Polycarbonate + Bayer TPU', 'Drop Protection': '3.2M / 10Ft Drop Tested', 'Magnet Strength': '2400gf N52 Neodymium Ring', 'Warranty': '1 Year Manufacturer Warranty' },
      is_featured: true,
      is_best_seller: true,
      images: [
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'MBX-CASE-IP15P-BLK', color: 'Titanium Black', colorCode: '#1e2022', size: 'iPhone 15 Pro', price: 899, mrp: 1999, stock: 45 },
        { sku: 'MBX-CASE-IP15PM-BLK', color: 'Titanium Black', colorCode: '#1e2022', size: 'iPhone 15 Pro Max', price: 949, mrp: 2199, stock: 60 },
        { sku: 'MBX-CASE-IP15P-BLU', color: 'Deep Ocean Blue', colorCode: '#172554', size: 'iPhone 15 Pro', price: 899, mrp: 1999, stock: 30 },
        { sku: 'MBX-CASE-S24U-BLK', color: 'Onyx Black', colorCode: '#111827', size: 'Samsung S24 Ultra', price: 899, mrp: 1999, stock: 40 },
      ],
    },
    {
      name: 'HyperVolt 65W Dual Port GaN III Charger',
      slug: 'hypervolt-65w-dual-port-gan-iii-charger',
      categorySlug: 'chargers',
      brandSlug: 'anker',
      description: 'Next-generation Gallium Nitride (GaN III) power adapter delivering 65W Power Delivery 3.0 & PPS fast charging. Charges a MacBook Pro and iPhone simultaneously with dynamic power allocation and ActiveShield 2.0 temperature monitoring.',
      specs: { 'Max Output': '65W Power Delivery 3.0 / PPS / QC 4.0', 'Ports': '2x USB-C + 1x USB-A Fast Port', 'Technology': 'Navitas GaNFast Power IC', 'Safety': 'Thermal Guard 2.0 over-voltage & surge protection' },
      is_featured: true,
      is_best_seller: true,
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'MBX-CHG-65W-BLK', color: 'Matte Black', colorCode: '#111827', size: '65W Dual Port', price: 1799, mrp: 3499, stock: 80 },
        { sku: 'MBX-CHG-65W-WHT', color: 'Arctic White', colorCode: '#f9fafb', size: '65W Dual Port', price: 1799, mrp: 3499, stock: 55 },
      ],
    },
    {
      name: 'TitanCore 100W Kevlar Braided Type-C Cable (2M)',
      slug: 'titancore-100w-kevlar-braided-type-c-cable',
      categorySlug: 'cables',
      brandSlug: 'mobixia-signature',
      description: 'Ultra-durable DuPont Kevlar fiber reinforced 100W PD charging cable with built-in E-Marker smart chip. Supports 480Mbps high-speed data sync, 20,000+ bend lifespan, and zinc alloy housing with LED wattage display.',
      specs: { 'Max Power': '100W (20V/5A) Power Delivery Support', 'Length': '2 Meters / 6.6 Feet', 'Core Material': '24AWG Tinned Copper with DuPont Kevlar Braid', 'Display': 'Real-time Digital Wattage LED screen' },
      is_featured: true,
      is_best_seller: false,
      images: [
        'https://images.unsplash.com/photo-1608248597359-001275997230?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'MBX-CBL-100W-2M-GRY', color: 'Space Gray', colorCode: '#4b5563', size: '2M / 100W', price: 699, mrp: 1499, stock: 120 },
        { sku: 'MBX-CBL-100W-2M-BLK', color: 'Obsidian Black', colorCode: '#111827', size: '2M / 100W', price: 699, mrp: 1499, stock: 100 },
      ],
    },
    {
      name: 'SonicPod Pro Active Noise Cancelling Wireless Earbuds',
      slug: 'sonicpod-pro-anc-wireless-earbuds',
      categorySlug: 'audio',
      brandSlug: 'mobixia-signature',
      description: 'Audiophile-grade 11mm bio-cellulose drivers featuring 42dB Hybrid Active Noise Cancellation and Transparency Mode. 38 hours combined battery life, Bluetooth 5.4 with Low Latency Gaming Mode (40ms), and IPX5 water resistance.',
      specs: { 'Drivers': '11mm Dynamic Titanium-Coated Diaphragms', 'Noise Cancellation': '42dB Hybrid ANC + 6-Mic ENC Clear Call', 'Battery Life': '8H Playtime + 30H Wireless Charging Case', 'Codecs': 'AAC, SBC, LDAC Hi-Res Audio' },
      is_featured: true,
      is_best_seller: true,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'MBX-AUD-SP-BLK', color: 'Midnight Black', colorCode: '#0f172a', size: 'Universal Fit', price: 2499, mrp: 5999, stock: 35 },
        { sku: 'MBX-AUD-SP-WHT', color: 'Glossy White', colorCode: '#f8fafc', size: 'Universal Fit', price: 2499, mrp: 5999, stock: 50 },
      ],
    },
    {
      name: 'MagPower 10,000mAh Magnetic Wireless Power Bank',
      slug: 'magpower-10000mah-magnetic-wireless-power-bank',
      categorySlug: 'power-banks',
      brandSlug: 'mobixia-signature',
      description: 'Slimline magnetic wireless power bank with 15W MagSafe alignment and 22.5W PD USB-C bidirectional fast charging. Built-in zinc alloy kickstand for horizontal video viewing while charging.',
      specs: { 'Capacity': '10,000mAh / 38.5Wh Li-Polymer', 'Wireless Output': '15W / 10W / 7.5W Qi Certified', 'Wired PD Output': '22.5W USB-C Power Delivery Port', 'Weight': '210g Ultra-Portable Pocket Design' },
      is_featured: true,
      is_best_seller: true,
      images: [
        'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'MBX-PB-10K-GRY', color: 'Titanium Gray', colorCode: '#374151', size: '10,000mAh', price: 1999, mrp: 3999, stock: 40 },
        { sku: 'MBX-PB-10K-BLK', color: 'Matte Black', colorCode: '#111827', size: '10,000mAh', price: 1999, mrp: 3999, stock: 65 },
      ],
    },
    {
      name: 'MagVent 360 Heavy-Duty Magnetic Car Mount',
      slug: 'magvent-360-magnetic-car-mount',
      categorySlug: 'mounts-and-stands',
      brandSlug: 'spigen',
      description: 'Aerospace aluminum ball joint magnetic phone mount with steel vent hook clamp. Supports 360-degree rotation, bumpy road vibration resistance, and seamless one-handed snap-on convenience.',
      specs: { 'Mount Type': 'Steel Hook Air Vent Lock + Dashboard Pad', 'Rotation': '360° Omnidirectional Swivel Ball Head', 'Compatibility': 'All MagSafe iPhones & Magnetic Case Accessories' },
      is_featured: false,
      is_best_seller: false,
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'SPG-MNT-MV360-BLK', color: 'Anodized Black', colorCode: '#1f2937', size: 'Universal Air Vent', price: 799, mrp: 1799, stock: 50 },
      ],
    },
    {
      name: 'DiamondShield 9H Tempered Glass Screen Guard (2-Pack)',
      slug: 'diamondshield-9h-tempered-glass-screen-guard',
      categorySlug: 'screen-protectors',
      brandSlug: 'spigen',
      description: 'Full coverage Japanese Asahi 9H hardness tempered glass with auto-alignment installation frame for 10-second zero-bubble application. Features electroplated oleophobic coating for silky glide.',
      specs: { 'Hardness': '9H Scratch Resistance Rating', 'Thickness': '0.33mm Ultra-Thin High Transmittance', 'Package': '2x Glass Protectors + Alignment Frame + Cleaning Kit' },
      is_featured: false,
      is_best_seller: true,
      images: [
        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'DS-IP15P-2PK', color: 'HD Clear', colorCode: '#ffffff', size: 'iPhone 15 Pro', price: 599, mrp: 1299, stock: 150 },
        { sku: 'DS-IP15PM-2PK', color: 'HD Clear', colorCode: '#ffffff', size: 'iPhone 15 Pro Max', price: 599, mrp: 1299, stock: 180 },
        { sku: 'DS-S24U-2PK', color: 'HD Clear', colorCode: '#ffffff', size: 'Samsung S24 Ultra', price: 699, mrp: 1499, stock: 110 },
      ],
    },
  ];

  for (const prod of productsCatalog) {
    const catId = categoryMap[prod.categorySlug];
    const brandId = brandMap[prod.brandSlug];

    const createdProduct = await prisma.product.create({
      data: {
        category_id: catId,
        brand_id: brandId,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        specs_json: JSON.stringify(prod.specs),
        is_featured: prod.is_featured,
        is_best_seller: prod.is_best_seller,
        views_count: 120,
        status: 'ACTIVE',
      },
    });

    for (let i = 0; i < prod.images.length; i++) {
      await prisma.productImage.create({
        data: {
          product_id: createdProduct.id,
          url: prod.images[i],
          is_primary: i === 0,
          sort_order: i,
        },
      });
    }

    for (const v of prod.variants) {
      await prisma.productVariant.create({
        data: {
          product_id: createdProduct.id,
          sku: v.sku,
          color: v.color,
          color_code: v.colorCode,
          size_or_model: v.size,
          price: v.price,
          mrp: v.mrp,
          stock: v.stock,
          image: prod.images[0],
        },
      });
    }
  }

  // 8. Coupons, Banners & CMS Pages are served statically/in-memory for zero database storage and cloud billing

  // 9. Operational Settings (with dynamic Delivery Fees)
  const settingsData = [
    { key: 'site_name', value: 'Mobixia' },
    { key: 'site_tagline', value: 'Mobile Accessories Online' },
    { key: 'support_email', value: 'support@mobixia.in' },
    { key: 'support_phone', value: '+91 98765 43210' },
    { key: 'company_address', value: 'Tech Hub, Bandra West, Mumbai, Maharashtra 400050' },
    { key: 'company_gstin', value: '27AABCU9603R1ZM' },
    { key: 'shipping_free_threshold', value: '499' },
    { key: 'shipping_standard_fee', value: '50' },
    { key: 'shipping_express_fee', value: '49' },
    { key: 'shipping_cod_fee', value: '0' },
    { key: 'payment_razorpay_mode', value: 'TEST' },
    { key: 'payment_cod_enabled', value: 'true' },
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  // 12. Payment Credentials (Encrypted)
  const testSecret = 'SR1SPVz7yMiNPmaFx8v1COuk';
  const encryptedSecret = encryptSecret(testSecret);
  const encryptedWebhook = encryptSecret('whsec_mobixia_webhook_token_2026');

  await prisma.paymentCredential.upsert({
    where: { provider_mode: { provider: 'RAZORPAY', mode: 'TEST' } },
    update: {
      key_id: 'rzp_test_Tb6xiThrPT7xSc',
      key_secret_encrypted: encryptedSecret,
      webhook_secret_encrypted: encryptedWebhook,
      is_active: true,
      updated_by: 'Super Administrator',
    },
    create: {
      provider: 'RAZORPAY',
      mode: 'TEST',
      key_id: 'rzp_test_Tb6xiThrPT7xSc',
      key_secret_encrypted: encryptedSecret,
      webhook_secret_encrypted: encryptedWebhook,
      is_active: true,
      updated_by: 'Super Administrator',
    },
  });

  console.log('✅ Clean seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
