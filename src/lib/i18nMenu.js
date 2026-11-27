const AR_TO_EN = {
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
  'افوكادو': 'Avocado',
  'برتقال': 'Orange',
  'بسكويت اوريو': 'Oreo Biscuits',
  'بطيخ': 'Watermelon',
  'بن اسبريسو': 'Espresso Beans',
  'بن تركي': 'Turkish Coffee',
  'بن مختصة': 'Specialty Coffee',
  'بندق': 'Hazelnut',
  'بودرة هوت شوكليت': 'Hot Chocolate Powder',
  'تشيز كيك جاهز': 'Ready Cheesecake',
  'تصفية كريم شانتي': 'Whipped Cream',
  'توبينج اناناس': 'Pineapple Topping',
  'حليب': 'Milk',
  'سكر خشن': 'Granulated Sugar',
  'صوص شوكليت': 'Chocolate Sauce',
  'صوص نوتيلا': 'Nutella Sauce',
  'عسل النحل': 'Honey',
  'فستق': 'Pistachio',
  'لوز': 'Almonds',
  'مانجو': 'Mango',
  'فراولة': 'Strawberry',
  'فانيليا': 'Vanilla',
  'ليمون': 'Lemon',
  'نعناع': 'Mint',
  'فيمتو': 'Vimto',
  'كنافة': 'Kunafa',
  'قشطة': 'Cream (Qishta)',
  'مكسرات': 'Nuts',
  'شاي احمر': 'Red Tea',
  'كجم': 'kg',
  'جم': 'g',
  'لتر': 'L',
  'مل': 'ml',
  'حبة': 'pcs',
  'أضف +': 'Add +',
  'تحويل خامات من فرع إلى فرع': 'Transfer Stock Between Branches',
  'سجل التحويل': 'Record Transfer',
  'الجرد الفعلي وحساب العجز / الفائض': '1. Physical Stocktake & Variance',
  'تسجيل تلف / هالك / ضيافة': '2. Record Waste / Spoilage',
  'سجل تسويات الجرد والهالك': 'Stocktake & Waste Log',
  'اختر الخامة لجردها': 'Select Ingredient to Count',
  'الخامة التالفة': 'Damaged Ingredient',
  'الكمية التالفة': 'Damaged Quantity',
  'السبب': 'Reason',
  'تالف / انتهاء صلاحية': 'Damaged / Expired',
  'اعتماد الجرد وتسوية الرصيد': 'Confirm Stocktake & Adjust',
  'خصم التالف من المخزون': 'Deduct Waste from Stock',
  'مسح الورقة بالكاميرا (OCR)': 'Scan Sheet with Camera (OCR)',
  '-- اختر الخامة --': '-- Select Ingredient --',
  'الفرع الرئيسي - صلالة': 'Main Branch - Salalah',
}

const SORTED_KEYS = Object.keys(AR_TO_EN).sort((a, b) => b.length - a.length)

export function tCat(cat, lang) {
  if (lang !== 'en') return cat
  return AR_TO_EN[cat] || cat
}

export function tItem(item, lang) {
  if (!item) return ''
  const name = typeof item === 'string' ? item : item.name
  if (lang !== 'en') return name
  if (typeof item === 'object' && item.name_en) return item.name_en
  return AR_TO_EN[name] || name
}

function detectCurrentLang() {
  const btns = document.querySelectorAll('button')
  for (const b of btns) {
    const txt = (b.textContent || '').trim()
    if (txt === 'عربي') return 'en'
    if (txt === 'EN') return 'ar'
  }
  return document.documentElement.lang === 'en' ? 'en' : 'ar'
}

export function installAutoTranslator() {
  if (typeof window === 'undefined' || window.__neomAutoTranslatorInstalled) return
  window.__neomAutoTranslatorInstalled = true

  const translateNode = (node, lang) => {
    if (!node) return
    if (node.nodeType === 3) {
      const raw = node.nodeValue
      if (!raw || !raw.trim()) return
      if (!node.__origText) node.__origText = raw
      const orig = node.__origText
      const trimmed = orig.trim()
      if (trimmed === 'عربي' || trimmed === 'EN') return

      if (lang === 'en') {
        let translated = orig
        if (AR_TO_EN[trimmed]) {
          translated = orig.replace(trimmed, AR_TO_EN[trimmed])
        } else if (/[\u0600-\u06FF]/.test(orig)) {
          for (const k of SORTED_KEYS) {
            if (translated.includes(k)) {
              translated = translated.split(k).join(AR_TO_EN[k])
            }
          }
        }
        if (node.nodeValue !== translated) node.nodeValue = translated
      } else {
        if (node.nodeValue !== orig) node.nodeValue = orig
      }
      return
    }
    if (node.nodeType === 1 && !['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'].includes(node.tagName)) {
      node.childNodes.forEach((child) => translateNode(child, lang))
    }
  }

  const run = () => {
    if (!document.body) return
    const lang = detectCurrentLang()
    translateNode(document.body, lang)
  }

  setInterval(run, 300)
}
