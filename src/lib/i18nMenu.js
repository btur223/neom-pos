const CAT_EN = {
  'الكل': 'All',
  'القهوة الباردة': 'Iced Coffee',
  'القهوة الساخنة': 'Hot Coffee',
  'الإضافات': 'Add-ons',
  'المشروبات الساخنة': 'Hot Drinks',
  'المشروبات الغازية': 'Soft Drinks',
  'موهيتو': 'Mojito',
  'الحلويات': 'Desserts',
  'الايس كريم': 'Ice Cream',
  'عصائر فريش': 'Fresh Juices',
  'الضيافة': 'Hospitality',
  'البوكسات': 'Boxes',
}

const ITEM_EN = {
  'بارد V60': 'Iced V60',
  'حار V60': 'Hot V60',
  'إضافة باكيت شاي احمر': 'Add Red Tea Bag',
  'إضافة توبينج اناناس': 'Add Pineapple Topping',
  'إضافة توبينج باشن': 'Add Passion Topping',
  'إضافة صوص شوكليت': 'Add Chocolate Sauce',
  'إضافة صوص نوتيلا': 'Add Nutella Sauce',
  'إضافة عسل النحل': 'Add Honey',
  'ابريق حليب فريش كبير': 'Large Fresh Milk Pot',
  'ابريق حليب فريش وسط': 'Medium Fresh Milk Pot',
  'ابريق شاي كبير': 'Large Tea Pot',
  'ابريق شاي وسط': 'Medium Tea Pot',
  'اسبريسو': 'Espresso',
  'اسبريسو افوجاتو': 'Espresso Affogato',
  'السي كولا': 'Alsi Cola',
  'السي كولا زيرو': 'Alsi Cola Zero',
  'ام علي': 'Om Ali',
  'امريكانو': 'Americano',
  'ايس امريكانو': 'Iced Americano',
  'ايس تي باشن': 'Passion Iced Tea',
  'ايس تي خوخ': 'Peach Iced Tea',
  'ايس سبانش لاتيه': 'Iced Spanish Latte',
  'ايس كريم شوكولاته': 'Chocolate Ice Cream',
  'ايس كريم فانيليا': 'Vanilla Ice Cream',
  'ايس كريم فراولة': 'Strawberry Ice Cream',
  'ايس كريم مانجو': 'Mango Ice Cream',
  'ايس كريم مكس': 'Mixed Ice Cream',
  'ايس لاتيه': 'Iced Latte',
  'باور ليان بارك': 'Power Lian Park',
  'بيبسي': 'Pepsi',
  'تشيز كيك': 'Cheesecake',
  'توب فروت': 'Top Fruit',
  'دبل اسبريسو': 'Double Espresso',
  'دبل مكياتو': 'Double Macchiato',
  'ديو': 'Mountain Dew',
  'سان سيبيستيان': 'San Sebastian',
  'سبانش لاتيه': 'Spanish Latte',
  'ستريم': 'Stream',
  'سفن اب': '7Up',
  'سفنديش ام علي كبير': 'Large Om Ali Sandwich',
  'سفنديش ام علي وسط': 'Medium Om Ali Sandwich',
}

export function tCat(cat, lang) {
  if (lang !== 'en') return cat
  return CAT_EN[cat] || cat
}

export function tItem(item, lang) {
  if (!item) return ''
  const name = typeof item === 'string' ? item : item.name
  if (lang !== 'en') return name
  if (typeof item === 'object' && item.name_en) return item.name_en
  return ITEM_EN[name] || name
}
