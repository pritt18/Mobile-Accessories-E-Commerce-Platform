const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Helper for encryption
const encryptSecret = (text) => {
  const keyHex = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const key = Buffer.from(keyHex.padEnd(64, '0').slice(0, 64), 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

async function main() {
  console.log('?? Seeding database...');

  // 1. Roles
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

  // 2. Permissions
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

  // 3. Assign Role Permissions
  // Admin permissions (everything except settings, payment, and staff management)
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

  // Manager permissions (products, orders, inventory full; customers and reports view only)
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

  // 4. Default Users
  const defaultPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@12345', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@vortique.test' },
    update: {},
    create: {
      name: 'Super Administrator',
      email: 'superadmin@vortique.test',
      mobile: '+91 99999 00001',
      password_hash: defaultPasswordHash,
      role_id: superAdminRole.id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vortique.test' },
    update: {},
    create: {
      name: 'Operations Admin',
      email: 'admin@vortique.test',
      mobile: '+91 99999 00002',
      password_hash: defaultPasswordHash,
      role_id: adminRole.id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@vortique.test' },
    update: {},
    create: {
      name: 'Inventory Manager',
      email: 'manager@vortique.test',
      mobile: '+91 99999 00003',
      password_hash: defaultPasswordHash,
      role_id: managerRole.id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Also seed Mobixia-branded emails for seamless back-office access
  await prisma.user.upsert({
    where: { email: 'superadmin@mobixia.in' },
    update: {},
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

  await prisma.user.upsert({
    where: { email: 'admin@mobixia.in' },
    update: {},
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

  await prisma.user.upsert({
    where: { email: 'manager@mobixia.in' },
    update: {},
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

  const easyAdminHash = await bcrypt.hash('admin123password', 10);
  const easyUserHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@mobixia.com' },
    update: { password_hash: easyAdminHash },
    create: {
      name: 'Mobixia Admin',
      email: 'admin@mobixia.com',
      mobile: '+91 98888 00009',
      password_hash: easyAdminHash,
      role_id: adminRole.id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  await prisma.user.upsert({
    where: { email: 'john@mobixia.com' },
    update: { password_hash: easyUserHash },
    create: {
      name: 'John Doe',
      email: 'john@mobixia.com',
      mobile: '+91 98765 00000',
      password_hash: easyUserHash,
      role_id: customerRole.id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      mobile: '+91 98765 43210',
      password_hash: customerPasswordHash,
      role_id: customerRole.id,
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Saved addresses for customer
  await prisma.address.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      user_id: customer.id,
      name: 'John Doe',
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
    { name: 'Spigen', slug: 'spigen' },
    { name: 'Anker', slug: 'anker' },
    { name: 'Belkin', slug: 'belkin' },
    { name: 'ESR Tech', slug: 'esr-tech' },
  ];

  const brandMap = {};
  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: { name: b.name, slug: b.slug, logo: b.logo || null },
    });
    brandMap[b.slug] = brand.id;
  }

  // 7. Products & Variants
  const productsCatalog = [
    {
      name: 'AeroShield Frosted MagSafe Case for iPhone',
      slug: 'aeroshield-frosted-magsafe-iphone-case',
      categorySlug: 'phone-cases',
      brandSlug: 'mobixia-signature',
      description: 'Ultra-refined matte frosted back plate with military-grade shock dispersion corners, N52 neodymium magnetic ring array, and anti-fingerprint oleophobic coating.',
      specs: { 'Material': 'Aviation-Grade Polycarbonate & Soft TPU', 'Magnet Strength': '1500g Holding Force (N52)', 'Drop Protection': 'MIL-STD-810H Certified (12ft)', 'Warranty': '1 Year Replacement' },
      is_featured: true,
      is_best_seller: true,
      images: [
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'AS-IP15P-BLK', color: 'Titanium Black', colorCode: '#1e2022', size: 'iPhone 15 Pro', price: 1299, mrp: 2499, stock: 45 },
        { sku: 'AS-IP15P-BLU', color: 'Deep Ocean Blue', colorCode: '#1b3b6f', size: 'iPhone 15 Pro', price: 1299, mrp: 2499, stock: 30 },
        { sku: 'AS-IP15PM-BLK', color: 'Titanium Black', colorCode: '#1e2022', size: 'iPhone 15 Pro Max', price: 1399, mrp: 2699, stock: 60 },
        { sku: 'AS-IP16P-BLK', color: 'Natural Titanium', colorCode: '#8d8c87', size: 'iPhone 16 Pro', price: 1499, mrp: 2799, stock: 50 },
      ],
    },
    {
      name: 'Apex 65W GaN Dual USB-C Fast Wall Charger',
      slug: 'apex-65w-gan-dual-usbc-fast-charger',
      categorySlug: 'chargers',
      brandSlug: 'anker',
      description: 'Powered by Gallium Nitride (GaN III) architecture for 65W ultra-compact rapid charging. Charges your MacBook Air to 50% in 30 minutes while simultaneously fast-charging your smartphone.',
      specs: { 'Input': '100-240V ~ 50/60Hz 1.5A', 'Output Ports': '2x USB-C PD 3.0 + 1x USB-A QC 4+', 'Protocols': 'PPS, PD3.0, QC4+, SCP, FCP', 'Dimensions': '48 x 42 x 30 mm', 'Weight': '112g' },
      is_featured: true,
      is_best_seller: true,
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'APEX-65W-BLK', color: 'Matte Obsidian', colorCode: '#11141c', size: '65W GaN', price: 2199, mrp: 3999, stock: 85 },
        { sku: 'APEX-65W-WHT', color: 'Arctic White', colorCode: '#f8fafc', size: '65W GaN', price: 2199, mrp: 3999, stock: 40 },
      ],
    },
    {
      name: 'ArmorWeave 100W Braided Type-C to Type-C Cable (2M)',
      slug: 'armorweave-100w-braided-usbc-cable-2m',
      categorySlug: 'cables',
      brandSlug: 'mobixia-signature',
      description: 'Kevlar-reinforced ballistic braided nylon cord with E-Marker smart chipset supporting up to 100W (20V/5A) Power Delivery and 480Mbps data sync. Tested to withstand 30,000+ bends.',
      specs: { 'Power Rating': '100W Max (20V/5A E-Marker)', 'Length': '2 Meters / 6.6 Feet', 'Connector Finish': 'Zinc Alloy with Gold-Plated Pins', 'Bend Lifespan': '30,000+ cycles' },
      is_featured: true,
      is_best_seller: false,
      images: [
        'https://images.unsplash.com/photo-1608248597359-001275997230?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'AW-100W-2M-GRY', color: 'Space Grey', colorCode: '#4a5568', size: '2 Meters', price: 699, mrp: 1299, stock: 120 },
        { sku: 'AW-100W-2M-RED', color: 'Crimson Red', colorCode: '#e53e3e', size: '2 Meters', price: 699, mrp: 1299, stock: 80 },
      ],
    },
    {
      name: 'MagPower 10,000mAh Magnetic Wireless Power Bank',
      slug: 'magpower-10000mah-magnetic-power-bank',
      categorySlug: 'power-banks',
      brandSlug: 'esr-tech',
      description: 'Snap on and charge wirelessly at up to 15W with integrated zinc alloy kickstand. Also features 20W PD two-way fast USB-C wired charging port and smart LED digital power percentage readout.',
      specs: { 'Capacity': '10,000mAh (38.5Wh)', 'Wireless Output': '15W Max (Qi/MagSafe)', 'Wired PD Output': '20W USB-C', 'Display': 'Digital LED % Display', 'Weight': '210g' },
      is_featured: true,
      is_best_seller: true,
      images: [
        'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'MP-10K-MET', color: 'Midnight Grey', colorCode: '#2d3748', size: '10000mAh', price: 2799, mrp: 4999, stock: 55 },
        { sku: 'MP-10K-WHT', color: 'Pearl White', colorCode: '#edf2f7', size: '10000mAh', price: 2799, mrp: 4999, stock: 35 },
      ],
    },
    {
      name: 'Pulse ANC Pro Hybrid Noise Cancelling Wireless Earbuds',
      slug: 'pulse-anc-pro-wireless-earbuds',
      categorySlug: 'audio',
      brandSlug: 'mobixia-signature',
      description: 'Equipped with 42dB active noise cancellation, custom graphene dynamic drivers, transparency ambient mode, 6-mic beamforming ENC for crystal-clear calls, and 36 hours total battery life.',
      specs: { 'Noise Cancellation': '42dB Hybrid ANC + Transparency', 'Driver': '11mm Graphene Dynamic Drivers', 'Battery Life': '8h Earbuds + 28h Wireless Case', 'Water Resistance': 'IPX5' },
      is_featured: true,
      is_best_seller: true,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'PULSE-ANC-BLK', color: 'Matte Stealth Black', colorCode: '#171923', size: 'Standard', price: 3499, mrp: 6999, stock: 40 },
        { sku: 'PULSE-ANC-WHT', color: 'Glossy Pure White', colorCode: '#f7fafc', size: 'Standard', price: 3499, mrp: 6999, stock: 25 },
      ],
    },
    {
      name: 'MagVent 15W Fast Wireless Car Charger & Mount',
      slug: 'magvent-15w-fast-wireless-car-mount',
      categorySlug: 'mounts-and-stands',
      brandSlug: 'spigen',
      description: 'Engineered for tough Indian roads with ultra-secure steel air-vent clamping mechanism and 360-degree ball joint swivel. Automatically aligns and fast-charges MagSafe smartphones.',
      specs: { 'Wireless Speed': '15W Max Qi Fast Charge', 'Mounting Method': 'Steel Air-Vent Clamp & 3M Dash Pad', 'Rotation': '360° Free Ball Joint', 'Compatibility': 'iPhone 12-16 & Qi Magnetic Devices' },
      is_featured: false,
      is_best_seller: true,
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'MV-15W-CAR', color: 'Carbon Finish', colorCode: '#1a202c', size: 'Universal Vent', price: 1899, mrp: 3499, stock: 70 },
      ],
    },
    {
      name: 'Titanium Link Bracelet Band for Apple Watch (49mm / 45mm)',
      slug: 'titanium-link-bracelet-apple-watch-band',
      categorySlug: 'watch-accessories',
      brandSlug: 'mobixia-signature',
      description: 'Crafted from aerospace-grade Grade 2 Titanium with diamond-like carbon (DLC) scratch-resistant coating and custom butterfly deployment clasp. Includes precision link-removal tool.',
      specs: { 'Material': 'Grade 2 Titanium + DLC Scratch Shield', 'Compatibility': 'Apple Watch Ultra (49mm), 45mm, 44mm', 'Clasp': 'Double Butterfly Fold-Over Clasp', 'Wrist Size': '140mm - 220mm' },
      is_featured: true,
      is_best_seller: false,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      ],
      variants: [
        { sku: 'AW-TI-49-NAT', color: 'Natural Raw Titanium', colorCode: '#a0aec0', size: '49mm / 45mm', price: 2999, mrp: 5999, stock: 35 },
        { sku: 'AW-TI-49-BLK', color: 'Space Black Titanium', colorCode: '#2d3748', size: '49mm / 45mm', price: 2999, mrp: 5999, stock: 20 },
      ],
    },
    {
      name: 'DiamondShield 9H Edge-to-Edge Tempered Glass (2-Pack)',
      slug: 'diamondshield-9h-tempered-glass-pack',
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

    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        category_id: catId,
        brand_id: brandId,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        specs_json: JSON.stringify(prod.specs),
        is_featured: prod.is_featured,
        is_best_seller: prod.is_best_seller,
        views_count: Math.floor(Math.random() * 200) + 50,
        status: 'ACTIVE',
      },
    });

    // Add Images
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

    // Add Variants
    for (const v of prod.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: {
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

    // Add sample reviews
    await prisma.review.create({
      data: {
        product_id: createdProduct.id,
        user_id: customer.id,
        rating: 5,
        title: 'Outstanding quality and premium finish!',
        comment: 'Exceeded my expectations. Build quality is top tier, fits perfectly, and arrived in just 2 days in Mumbai. Highly recommended!',
        status: 'APPROVED',
      },
    });
  }

  // 8. Coupons
  await prisma.coupon.upsert({
    where: { code: 'FIRST10' },
    update: {},
    create: {
      code: 'FIRST10',
      type: 'PERCENTAGE',
      value: 10,
      min_order_value: 499,
      max_discount: 500,
      usage_limit: 500,
      status: 'ACTIVE',
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FLAT200' },
    update: {},
    create: {
      code: 'FLAT200',
      type: 'FLAT',
      value: 200,
      min_order_value: 1499,
      usage_limit: 200,
      status: 'ACTIVE',
    },
  });

  // 9. Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'Next-Gen Mobile Gear, Engineered to Elevate',
        subtitle: 'Aviation-Grade MagSafe Cases, 65W GaN Chargers & Precision Accessories',
        image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=1600&auto=format&fit=crop&q=80',
        link: '/products?category=phone-cases',
        position: 'HERO',
        sort_order: 1,
        status: 'ACTIVE',
      },
      {
        title: 'Uncompromised 65W GaN Fast Charging',
        subtitle: 'Power your laptop, tablet, and phone with one pocket-sized adapter',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1600&auto=format&fit=crop&q=80',
        link: '/products?category=chargers',
        position: 'HERO',
        sort_order: 2,
        status: 'ACTIVE',
      },
      {
        title: 'Limited Flash Sale: 20% Off Audio & Power Banks',
        subtitle: 'Use promo code FLASH20 at checkout today',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200&auto=format&fit=crop&q=80',
        link: '/products?category=audio',
        position: 'PROMO_TOP',
        sort_order: 1,
        status: 'ACTIVE',
      },
    ],
  });

  // 10. CMS Pages
  const cmsPagesData = [
    {
      slug: 'about-us',
      title: 'About Mobixia',
      content_html: `<h2>Engineered for Modern Devices</h2><p>At Mobixia, we craft premium smartphone and tech accessories that combine minimalist industrial aesthetics with unyielding durability. From military-spec drop protection to high-efficiency GaN power delivery, every product in our catalog undergoes rigorous quality testing.</p><p>Headquartered in Mumbai, India, we ship nationwide with express door-to-door courier delivery and hassle-free warranty backing.</p>`,
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content_html: `<h2>Your Privacy Matters</h2><p>We collect and utilize your personal information strictly for order processing, customer support, and tailored shopping experiences. We never sell or lease your personal data to third parties. All online payments are processed through RBI-authorized payment gateways under 256-bit SSL encryption.</p>`,
    },
    {
      slug: 'terms-and-conditions',
      title: 'Terms & Conditions',
      content_html: `<h2>Terms of Service</h2><p>By browsing or purchasing from Mobixia, you agree to our standard terms of service. Products are subject to stock availability and prices may be updated without prior notice. Dispatched orders can be tracked in real-time through our order tracking portal.</p>`,
    },
    {
      slug: 'shipping-policy',
      title: 'Shipping & Delivery Policy',
      content_html: `<h2>Fast & Reliable Express Shipping</h2><p>We offer <strong>Free Standard Shipping</strong> on all orders exceeding ₹499. Orders are typically processed and dispatched within 24 business hours. Estimated delivery timelines: Metro cities (1-3 business days), rest of India (3-5 business days).</p>`,
    },
    {
      slug: 'refund-policy',
      title: 'Refund & Return Policy',
      content_html: `<h2>7-Day Hassle-Free Returns</h2><p>If you receive a defective or incompatible product, you can initiate a return or replacement request within 7 days of delivery directly through your account dashboard or order tracking page. Refunds are processed to original payment methods within 3-5 business days of return verification.</p>`,
    },
  ];

  for (const p of cmsPagesData) {
    await prisma.cmsPage.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // 11. Settings
  const settingsData = [
    { key: 'site_name', value: 'Mobixia' },
    { key: 'site_tagline', value: 'Mobile Accessories Online' },
    { key: 'support_email', value: 'support@mobixia.in' },
    { key: 'support_phone', value: '+91 98765 43210' },
    { key: 'company_address', value: 'Tech Hub, Bandra West, Mumbai, Maharashtra 400050' },
    { key: 'company_gstin', value: '27AABCU9603R1ZM' },
    { key: 'shipping_free_threshold', value: '499' },
    { key: 'shipping_standard_fee', value: '50' },
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
  const testSecret = 'rzp_sec_vortique_demo_live_secret_9876';
  const encryptedSecret = encryptSecret(testSecret);
  const encryptedWebhook = encryptSecret('whsec_vortique_webhook_token_1234');

  await prisma.paymentCredential.upsert({
    where: { provider_mode: { provider: 'RAZORPAY', mode: 'TEST' } },
    update: {},
    create: {
      provider: 'RAZORPAY',
      mode: 'TEST',
      key_id: 'rzp_test_VortiqueDemo2026',
      key_secret_encrypted: encryptedSecret,
      webhook_secret_encrypted: encryptedWebhook,
      is_active: true,
      updated_by: 'Super Administrator',
    },
  });

  // 13. Create a Demo Placed Order for Customer
  const sampleVariant = await prisma.productVariant.findFirst({
    include: { product: true },
  });

  if (sampleVariant) {
    await prisma.order.upsert({
      where: { order_no: 'NXG-2609-8821' },
      update: {},
      create: {
        order_no: 'NXG-2609-8821',
        user_id: customer.id,
        address_id: 1,
        status: 'SHIPPED',
        payment_method: 'RAZORPAY',
        payment_status: 'PAID',
        payment_id: 'pay_mock_123456789',
        subtotal: sampleVariant.price,
        discount: 0,
        shipping_fee: 0,
        tax: +(sampleVariant.price * 0.18).toFixed(2),
        total: sampleVariant.price,
        courier_name: 'BlueDart Express',
        tracking_id: 'BD-9821473210',
        tracking_url: 'https://www.bluedart.com',
        items: {
          create: [
            {
              variant_id: sampleVariant.id,
              qty: 1,
              price: sampleVariant.price,
              mrp: sampleVariant.mrp,
              product_name_snapshot: sampleVariant.product.name,
              variant_snapshot: sampleVariant.color,
              image_snapshot: sampleVariant.image,
            },
          ],
        },
        status_history: {
          createMany: {
            data: [
              { status: 'PLACED', notes: 'Order placed by customer', changed_by: 'Customer' },
              { status: 'CONFIRMED', notes: 'Payment verified via Razorpay', changed_by: 'SYSTEM' },
              { status: 'PACKED', notes: 'Package inspected and barcoded at Mumbai hub', changed_by: 'Inventory Manager' },
              { status: 'SHIPPED', notes: 'Dispatched via BlueDart AWB: BD-9821473210', changed_by: 'Operations Admin' },
            ],
          },
        },
      },
    });
  }

  console.log('? Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
