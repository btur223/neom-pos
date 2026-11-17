import { useState, useMemo } from 'react'
import { Plus, Trash2, Send, AlertTriangle, Edit3, Sparkles, CheckCircle2, Receipt, BookOpen, Database } from 'lucide-react'
import { db } from './lib/db'
import { useLiveShared } from './lib/useLive'
import { share } from './lib/share'
import { getStaffList, saveStaffList } from './components/TeamLogin'

const todayStr = () => new Date().toISOString().slice(0, 10)
const fmt = (n) => Number(n || 0).toFixed(3)

const SEED_ITEMS = [
  // المشروبات الغازية
  { name: 'السي كولا', price: 0.300, category: 'المشروبات الغازية' },
  { name: 'السي كولا زيرو', price: 0.300, category: 'المشروبات الغازية' },
  { name: 'فيفا برتقال', price: 0.300, category: 'المشروبات الغازية' },
  { name: 'فيفا ليمون', price: 0.300, category: 'المشروبات الغازية' },
  { name: 'ستريم', price: 0.300, category: 'المشروبات الغازية' },
  { name: 'ليمون اخضر', price: 0.300, category: 'المشروبات الغازية' },
  { name: 'بيبسي', price: 0.400, category: 'المشروبات الغازية' },
  { name: 'سفن اب', price: 0.400, category: 'المشروبات الغازية' },
  { name: 'ديو', price: 0.400, category: 'المشروبات الغازية' },
  { name: 'توب فروت', price: 0.250, category: 'المشروبات الغازية' },
  { name: 'ماء', price: 0.200, category: 'المشروبات الغازية' },
  { name: 'ماء ليمون ونعناع', price: 0.100, category: 'المشروبات الغازية' },
  // موهيتو
  { name: 'موهيتو بلوبيري', price: 1.600, category: 'موهيتو' },
  { name: 'موهيتو بلو كارساو', price: 1.700, category: 'موهيتو' },
  { name: 'موهيتو نعناع', price: 1.600, category: 'موهيتو' },
  { name: 'موهيتو فراولة', price: 1.600, category: 'موهيتو' },
  { name: 'موهيتو كلاسيك', price: 1.400, category: 'موهيتو' },
  { name: 'موهيتو باشن', price: 1.700, category: 'موهيتو' },
  { name: 'كركديه ( عناب )', price: 1.000, category: 'موهيتو' },
  { name: 'ايس تي خوخ', price: 1.500, category: 'موهيتو' },
  { name: 'ايس تي باشن', price: 1.500, category: 'موهيتو' },
  // سموثي
  { name: 'سموثي مانجو', price: 1.600, category: 'سموثي' },
  { name: 'سموثي ليمون', price: 1.100, category: 'سموثي' },
  { name: 'سموثي ليمون ونعناع', price: 1.200, category: 'سموثي' },
  { name: 'سموثي بطيخ', price: 1.500, category: 'سموثي' },
  { name: 'سموثي بلو بيري', price: 1.500, category: 'سموثي' },
  { name: 'سموثي كوكتيل', price: 1.600, category: 'سموثي' },
  // عصائر فريش
  { name: 'عصير مانجو', price: 1.600, category: 'عصائر فريش' },
  { name: 'عصير بطيخ', price: 1.500, category: 'عصائر فريش' },
  { name: 'عصير كيوي', price: 1.500, category: 'عصائر فريش' },
  { name: 'عصير رمان', price: 1.800, category: 'عصائر فريش' },
  { name: 'عصير شمام', price: 1.500, category: 'عصائر فريش' },
  { name: 'عصير موز بالحليب', price: 1.400, category: 'عصائر فريش' },
  { name: 'عصير ليمون', price: 1.000, category: 'عصائر فريش' },
  { name: 'عصير ليمون بالنعناع', price: 1.200, category: 'عصائر فريش' },
  { name: 'عصير برتقال', price: 1.500, category: 'عصائر فريش' },
  { name: 'عصير افكادو بالعسل', price: 1.700, category: 'عصائر فريش' },
  { name: 'عصير افكادو بالمكسرات', price: 2.000, category: 'عصائر فريش' },
  { name: 'عصير اناناس', price: 1.500, category: 'عصائر فريش' },
  { name: 'كوكتيل', price: 1.800, category: 'عصائر فريش' },
  { name: 'عصير عوار القلب', price: 1.800, category: 'عصائر فريش' },
  { name: 'باور لبان بارك', price: 2.000, category: 'عصائر فريش' },
  // ميلك شيك
  { name: 'ميلك شيك مانجو', price: 1.800, category: 'ميلك شيك' },
  { name: 'ميلك شيك فانيليا', price: 1.600, category: 'ميلك شيك' },
  { name: 'ميلك شيك شوكولاته', price: 1.600, category: 'ميلك شيك' },
  { name: 'ميلك شيك اوريو', price: 1.700, category: 'ميلك شيك' },
  { name: 'ميلك شيك لوتس', price: 2.200, category: 'ميلك شيك' },
  { name: 'ميلك شيك نوتيلا', price: 1.800, category: 'ميلك شيك' },
  { name: 'ميلك شيك فراولة', price: 1.700, category: 'ميلك شيك' },
  { name: 'ميلك شيك كراميل', price: 1.800, category: 'ميلك شيك' },
  // القهوة الساخنة
  { name: 'اسبريسو', price: 1.000, category: 'القهوة الساخنة' },
  { name: 'دبل اسبريسو', price: 1.200, category: 'القهوة الساخنة' },
  { name: 'اسبريسو افوجاتو', price: 1.800, category: 'القهوة الساخنة' },
  { name: 'امريكانو', price: 1.500, category: 'القهوة الساخنة' },
  { name: 'مكياتو', price: 1.100, category: 'القهوة الساخنة' },
  { name: 'دبل مكياتو', price: 1.300, category: 'القهوة الساخنة' },
  { name: 'كابتشينو', price: 1.400, category: 'القهوة الساخنة' },
  { name: 'لاتيه', price: 1.400, category: 'القهوة الساخنة' },
  { name: 'سبانش لاتيه', price: 1.500, category: 'القهوة الساخنة' },
  { name: 'نسكافيه', price: 1.200, category: 'القهوة الساخنة' },
  { name: 'قهوة تركية', price: 0.800, category: 'القهوة الساخنة' },
  { name: 'V60 حار', price: 1.800, category: 'القهوة الساخنة' },
  // القهوة الباردة
  { name: 'ايس امريكانو', price: 1.500, category: 'القهوة الباردة' },
  { name: 'ايس لاتيه', price: 1.600, category: 'القهوة الباردة' },
  { name: 'ايس سبانش لاتيه', price: 1.700, category: 'القهوة الباردة' },
  { name: 'V60 بارد', price: 1.800, category: 'القهوة الباردة' },
  // المشروبات الساخنة
  { name: 'شاي احمر ورق', price: 0.300, category: 'المشروبات الساخنة' },
  { name: 'شاي احمر ورق مع كوب زجاج', price: 0.500, category: 'المشروبات الساخنة' },
  { name: 'شاي احمر باكيت', price: 0.300, category: 'المشروبات الساخنة' },
  { name: 'شاي اخضر صيني', price: 0.300, category: 'المشروبات الساخنة' },
  { name: 'شاي اخضر باكيت', price: 0.300, category: 'المشروبات الساخنة' },
  { name: 'شاي كرك', price: 0.300, category: 'المشروبات الساخنة' },
  { name: 'شاي حليب فريش', price: 0.600, category: 'المشروبات الساخنة' },
  { name: 'شاي بالعسل والليمون', price: 0.600, category: 'المشروبات الساخنة' },
  { name: 'شاي حليب زنجبيل وعسل', price: 0.800, category: 'المشروبات الساخنة' },
  { name: 'يانسون باكيت', price: 0.300, category: 'المشروبات الساخنة' },
  { name: 'كركديه باكيت', price: 0.300, category: 'المشروبات الساخنة' },
  { name: 'نعناع باكيت', price: 0.300, category: 'المشروبات الساخنة' },
  { name: 'هوت شوكليت', price: 1.500, category: 'المشروبات الساخنة' },
  { name: 'هوت كوكتيل', price: 1.200, category: 'المشروبات الساخنة' },
  { name: 'ابريق شاي وسط', price: 2.000, category: 'المشروبات الساخنة' },
  { name: 'ابريق شاي كبير', price: 2.500, category: 'المشروبات الساخنة' },
  { name: 'ابريق حليب فريش وسط', price: 2.500, category: 'المشروبات الساخنة' },
  { name: 'ابريق حليب فريش كبير', price: 3.000, category: 'المشروبات الساخنة' },
  // الايس كريم
  { name: 'ايس كريم مانجو', price: 1.400, category: 'الايس كريم' },
  { name: 'ايس كريم فانيليا', price: 1.400, category: 'الايس كريم' },
  { name: 'ايس كريم شوكولاته', price: 1.400, category: 'الايس كريم' },
  { name: 'ايس كريم فراولة', price: 1.400, category: 'الايس كريم' },
  { name: 'ايس كريم مكس', price: 1.800, category: 'الايس كريم' },
  // الحلويات
  { name: 'تشيز كيك', price: 2.200, category: 'الحلويات' },
  { name: 'كنافة قشطة', price: 2.200, category: 'الحلويات' },
  { name: 'كنافة جبنة', price: 2.500, category: 'الحلويات' },
  { name: 'ام علي', price: 2.000, category: 'الحلويات' },
  { name: 'سان سبيستيان', price: 2.200, category: 'الحلويات' },
  { name: 'كريم كراميل', price: 0.500, category: 'الحلويات' },
  { name: 'مهلبية', price: 0.800, category: 'الحلويات' },
  // الإضافات
  { name: 'إضافة صوص شوكليت', price: 0.300, category: 'الإضافات' },
  { name: 'إضافة صوص نوتيلا', price: 0.300, category: 'الإضافات' },
  { name: 'إضافة توبينج اناناس', price: 0.200, category: 'الإضافات' },
  { name: 'إضافة توبينج باشن', price: 0.200, category: 'الإضافات' },
  { name: 'إضافة باكيت شاي احمر', price: 0.100, category: 'الإضافات' },
  { name: 'إضافة عسل النحل', price: 0.100, category: 'الإضافات' },
  // البوفيهات والضيافة
  { name: 'سفنديش ام علي كبير', price: 15.000, category: 'البوفيهات والضيافة' },
  { name: 'سفنديش ام علي وسط', price: 12.000, category: 'البوفيهات والضيافة' },
  { name: 'صحن شمام كبير', price: 6.000, category: 'البوفيهات والضيافة' },
  { name: 'صحن شمام وسط', price: 5.000, category: 'البوفيهات والضيافة' },
  { name: 'صحن بطيخ كبير', price: 7.000, category: 'البوفيهات والضيافة' },
  { name: 'صحن بطيخ وسط', price: 5.000, category: 'البوفيهات والضيافة' },
  { name: 'عصير تانك برتقال', price: 5.000, category: 'البوفيهات والضيافة' },
  { name: 'عصير تانك مانجو', price: 5.000, category: 'البوفيهات والضيافة' },
  { name: 'عصير فيمتو', price: 5.000, category: 'البوفيهات والضيافة' },
]
const SEED_INGREDIENTS = [
  // المشروبات الغازية والمياه
  { name: 'السي كولا', stock: 100, unit: 'حبة', cost: 0.150, minStock: 20 },
  { name: 'السي كولا زيرو', stock: 50, unit: 'حبة', cost: 0.150, minStock: 15 },
  { name: 'فيفا برتقال', stock: 50, unit: 'حبة', cost: 0.150, minStock: 15 },
  { name: 'فيفا ليمون', stock: 50, unit: 'حبة', cost: 0.150, minStock: 15 },
  { name: 'ستريم', stock: 50, unit: 'حبة', cost: 0.150, minStock: 15 },
  { name: 'ليمون اخضر غازي', stock: 50, unit: 'حبة', cost: 0.150, minStock: 15 },
  { name: 'بيبسي', stock: 100, unit: 'حبة', cost: 0.200, minStock: 20 },
  { name: 'سفن اب', stock: 80, unit: 'حبة', cost: 0.200, minStock: 20 },
  { name: 'ديو', stock: 80, unit: 'حبة', cost: 0.200, minStock: 20 },
  { name: 'توب فروت', stock: 60, unit: 'حبة', cost: 0.120, minStock: 15 },
  { name: 'ماء صغير', stock: 200, unit: 'حبة', cost: 0.060, minStock: 40 },
  { name: 'ماء ليمون ونعناع', stock: 50, unit: 'حبة', cost: 0.050, minStock: 15 },
  // الألبان والعصائر المعلبة
  { name: 'حليب', stock: 20000, unit: 'مل', cost: 0.0006, minStock: 3000 },
  { name: 'حليب مكثف', stock: 5000, unit: 'جم', cost: 0.002, minStock: 1000 },
  { name: 'حليب مبخر', stock: 5000, unit: 'مل', cost: 0.0015, minStock: 1000 },
  { name: 'فيمتو', stock: 3000, unit: 'مل', cost: 0.002, minStock: 500 },
  { name: 'عصير تانك برتقال', stock: 3000, unit: 'جم', cost: 0.003, minStock: 500 },
  { name: 'عصير تانك مانجو', stock: 3000, unit: 'جم', cost: 0.003, minStock: 500 },
  { name: 'عصير مانجو معلب', stock: 5000, unit: 'مل', cost: 0.001, minStock: 1000 },
  { name: 'عصير اناناس معلب', stock: 5000, unit: 'مل', cost: 0.001, minStock: 1000 },
  // الحلويات والمكسرات والآيس كريم
  { name: 'جبن عكاوي', stock: 3000, unit: 'جم', cost: 0.004, minStock: 500 },
  { name: 'جبن موزاريلا', stock: 3000, unit: 'جم', cost: 0.0035, minStock: 500 },
  { name: 'قشطة', stock: 4000, unit: 'جم', cost: 0.003, minStock: 800 },
  { name: 'عجينة كنافة', stock: 5000, unit: 'جم', cost: 0.002, minStock: 1000 },
  { name: 'ملفيه', stock: 3000, unit: 'جم', cost: 0.003, minStock: 500 },
  { name: 'سمنة', stock: 2000, unit: 'جم', cost: 0.003, minStock: 400 },
  { name: 'زبدة', stock: 2000, unit: 'جم', cost: 0.003, minStock: 400 },
  { name: 'فستق', stock: 2000, unit: 'جم', cost: 0.008, minStock: 300 },
  { name: 'لوز', stock: 2000, unit: 'جم', cost: 0.006, minStock: 300 },
  { name: 'بندق', stock: 2000, unit: 'جم', cost: 0.006, minStock: 300 },
  { name: 'جوز هند', stock: 2000, unit: 'جم', cost: 0.002, minStock: 300 },
  { name: 'عسل نحل', stock: 3000, unit: 'جم', cost: 0.005, minStock: 500 },
  { name: 'تصنيعية كريم شانتي', stock: 4000, unit: 'جم', cost: 0.003, minStock: 800 },
  { name: 'تشيز كيك جاهز', stock: 20, unit: 'حبة', cost: 0.900, minStock: 5 },
  { name: 'سان سبيستيان جاهز', stock: 20, unit: 'حبة', cost: 0.900, minStock: 5 },
  { name: 'كريم كراميل جاهز', stock: 30, unit: 'حبة', cost: 0.200, minStock: 8 },
  { name: 'مهلبية جاهزة', stock: 30, unit: 'حبة', cost: 0.250, minStock: 8 },
  { name: 'بسكويت اوريو', stock: 2000, unit: 'جم', cost: 0.004, minStock: 300 },
  { name: 'ايس كريم مانجو', stock: 5000, unit: 'جم', cost: 0.003, minStock: 1000 },
  { name: 'ايس كريم فانيليا', stock: 5000, unit: 'جم', cost: 0.003, minStock: 1000 },
  { name: 'ايس كريم شوكولاته', stock: 5000, unit: 'جم', cost: 0.003, minStock: 1000 },
  { name: 'ايس كريم فراولة', stock: 5000, unit: 'جم', cost: 0.003, minStock: 1000 },
  // الصوصات والسيرب والتوبينج
  { name: 'صوص شوكليت', stock: 3000, unit: 'جم', cost: 0.004, minStock: 500 },
  { name: 'صوص كراميل', stock: 3000, unit: 'جم', cost: 0.004, minStock: 500 },
  { name: 'نوتيلا', stock: 3000, unit: 'جم', cost: 0.005, minStock: 500 },
  { name: 'لوتس', stock: 3000, unit: 'جم', cost: 0.005, minStock: 500 },
  { name: 'صوص بستاشيو', stock: 2000, unit: 'جم', cost: 0.008, minStock: 300 },
  { name: 'توبينج بلوبيري', stock: 2000, unit: 'جم', cost: 0.004, minStock: 300 },
  { name: 'توبينج خوخ', stock: 2000, unit: 'جم', cost: 0.004, minStock: 300 },
  { name: 'توبينج اناناس', stock: 2000, unit: 'جم', cost: 0.004, minStock: 300 },
  { name: 'توبينج باشن', stock: 2000, unit: 'جم', cost: 0.004, minStock: 300 },
  { name: 'سيرب بلو كارساو', stock: 2000, unit: 'مل', cost: 0.004, minStock: 300 },
  { name: 'سيرب موهيتو', stock: 2000, unit: 'مل', cost: 0.004, minStock: 300 },
  { name: 'سيرب نعناع', stock: 2000, unit: 'مل', cost: 0.004, minStock: 300 },
  { name: 'سيرب فراولة', stock: 2000, unit: 'مل', cost: 0.004, minStock: 300 },
  { name: 'سيرب بلوبيري', stock: 2000, unit: 'مل', cost: 0.004, minStock: 300 },
  { name: 'سيرب باشن', stock: 2000, unit: 'مل', cost: 0.004, minStock: 300 },
  // القهوة والشاي والأعشاب والسكر
  { name: 'بن اسبريسو', stock: 5000, unit: 'جم', cost: 0.012, minStock: 1000 },
  { name: 'بن تركي', stock: 3000, unit: 'جم', cost: 0.008, minStock: 500 },
  { name: 'بن مختصة', stock: 3000, unit: 'جم', cost: 0.018, minStock: 500 },
  { name: 'نسكافيه', stock: 2000, unit: 'جم', cost: 0.010, minStock: 300 },
  { name: 'شاي احمر ورق', stock: 3000, unit: 'جم', cost: 0.003, minStock: 500 },
  { name: 'شاي احمر باكيت', stock: 300, unit: 'حبة', cost: 0.020, minStock: 50 },
  { name: 'شاي اخضر صيني', stock: 2000, unit: 'جم', cost: 0.004, minStock: 300 },
  { name: 'شاي اخضر باكيت', stock: 200, unit: 'حبة', cost: 0.020, minStock: 50 },
  { name: 'كركديه ورق', stock: 2000, unit: 'جم', cost: 0.004, minStock: 300 },
  { name: 'كركديه باكيت', stock: 200, unit: 'حبة', cost: 0.020, minStock: 50 },
  { name: 'نعناع باكيت', stock: 200, unit: 'حبة', cost: 0.020, minStock: 50 },
  { name: 'يانسون باكيت', stock: 200, unit: 'حبة', cost: 0.020, minStock: 50 },
  { name: 'بودرة هوت شوكليت', stock: 3000, unit: 'جم', cost: 0.005, minStock: 500 },
  { name: 'هيل', stock: 1000, unit: 'جم', cost: 0.012, minStock: 200 },
  { name: 'قرفة', stock: 1000, unit: 'جم', cost: 0.004, minStock: 200 },
  { name: 'قرنفل', stock: 1000, unit: 'جم', cost: 0.006, minStock: 200 },
  { name: 'زنجبيل', stock: 1500, unit: 'جم', cost: 0.003, minStock: 300 },
  { name: 'سكر خشن', stock: 10000, unit: 'جم', cost: 0.0005, minStock: 2000 },
  { name: 'فلتر V60', stock: 300, unit: 'حبة', cost: 0.020, minStock: 50 },
  // الفواكه الطازجة
  { name: 'رمان', stock: 5000, unit: 'جم', cost: 0.0015, minStock: 1000 },
  { name: 'برتقال', stock: 10000, unit: 'جم', cost: 0.0008, minStock: 2000 },
  { name: 'مانجو', stock: 8000, unit: 'جم', cost: 0.0015, minStock: 1500 },
  { name: 'موز', stock: 5000, unit: 'جم', cost: 0.0007, minStock: 1000 },
  { name: 'افوكادو', stock: 4000, unit: 'جم', cost: 0.0025, minStock: 800 },
  { name: 'كيوي', stock: 4000, unit: 'جم', cost: 0.002, minStock: 800 },
  { name: 'كنتالوب', stock: 8000, unit: 'جم', cost: 0.0008, minStock: 1500 },
  { name: 'بطيخ', stock: 15000, unit: 'جم', cost: 0.0005, minStock: 3000 },
  { name: 'نعناع فريش', stock: 1500, unit: 'جم', cost: 0.002, minStock: 300 },
  { name: 'ليمون طازج', stock: 5000, unit: 'جم', cost: 0.001, minStock: 1000 },
  { name: 'فراولة طازجة', stock: 3000, unit: 'جم', cost: 0.0025, minStock: 500 },
  ]
const SEED_RECIPES = [
  // المشروبات الغازية
  { itemName: 'السي كولا', lines: [{ name: 'السي كولا', qty: 1 }] },
  { itemName: 'السي كولا زيرو', lines: [{ name: 'السي كولا زيرو', qty: 1 }] },
  { itemName: 'فيفا برتقال', lines: [{ name: 'فيفا برتقال', qty: 1 }] },
  { itemName: 'فيفا ليمون', lines: [{ name: 'فيفا ليمون', qty: 1 }] },
  { itemName: 'ستريم', lines: [{ name: 'ستريم', qty: 1 }] },
  { itemName: 'ليمون اخضر', lines: [{ name: 'ليمون اخضر غازي', qty: 1 }] },
  { itemName: 'بيبسي', lines: [{ name: 'بيبسي', qty: 1 }] },
  { itemName: 'سفن اب', lines: [{ name: 'سفن اب', qty: 1 }] },
  { itemName: 'ديو', lines: [{ name: 'ديو', qty: 1 }] },
  { itemName: 'توب فروت', lines: [{ name: 'توب فروت', qty: 1 }] },
  { itemName: 'ماء', lines: [{ name: 'ماء صغير', qty: 1 }] },
  { itemName: 'ماء ليمون ونعناع', lines: [{ name: 'ماء ليمون ونعناع', qty: 1 }] },
  // موهيتو
  { itemName: 'موهيتو بلوبيري', lines: [{ name: 'سفن اب', qty: 1 }, { name: 'سيرب بلوبيري', qty: 30 }, { name: 'ليمون طازج', qty: 20 }, { name: 'نعناع فريش', qty: 5 }] },
  { itemName: 'موهيتو بلو كارساو', lines: [{ name: 'سفن اب', qty: 1 }, { name: 'سيرب بلو كارساو', qty: 30 }, { name: 'ليمون طازج', qty: 20 }, { name: 'نعناع فريش', qty: 5 }] },
  { itemName: 'موهيتو نعناع', lines: [{ name: 'سفن اب', qty: 1 }, { name: 'سيرب نعناع', qty: 30 }, { name: 'ليمون طازج', qty: 20 }, { name: 'نعناع فريش', qty: 5 }] },
  { itemName: 'موهيتو فراولة', lines: [{ name: 'سفن اب', qty: 1 }, { name: 'سيرب فراولة', qty: 30 }, { name: 'ليمون طازج', qty: 20 }, { name: 'نعناع فريش', qty: 5 }] },
  { itemName: 'موهيتو كلاسيك', lines: [{ name: 'سفن اب', qty: 1 }, { name: 'سيرب موهيتو', qty: 30 }, { name: 'ليمون طازج', qty: 20 }, { name: 'نعناع فريش', qty: 5 }] },
  { itemName: 'موهيتو باشن', lines: [{ name: 'سفن اب', qty: 1 }, { name: 'سيرب باشن', qty: 30 }, { name: 'ليمون طازج', qty: 20 }, { name: 'نعناع فريش', qty: 5 }] },
  { itemName: 'كركديه ( عناب )', lines: [{ name: 'كركديه ورق', qty: 15 }, { name: 'سكر خشن', qty: 25 }] },
  { itemName: 'ايس تي خوخ', lines: [{ name: 'توبينج خوخ', qty: 30 }, { name: 'شاي احمر ورق', qty: 5 }, { name: 'سكر خشن', qty: 20 }] },
  { itemName: 'ايس تي باشن', lines: [{ name: 'توبينج باشن', qty: 30 }, { name: 'شاي احمر ورق', qty: 5 }, { name: 'سكر خشن', qty: 20 }] },
  // سموثي
  { itemName: 'سموثي مانجو', lines: [{ name: 'مانجو', qty: 150 }, { name: 'سكر خشن', qty: 25 }] },
  { itemName: 'سموثي ليمون', lines: [{ name: 'ليمون طازج', qty: 80 }, { name: 'سكر خشن', qty: 30 }] },
  { itemName: 'سموثي ليمون ونعناع', lines: [{ name: 'ليمون طازج', qty: 80 }, { name: 'نعناع فريش', qty: 8 }, { name: 'سكر خشن', qty: 30 }] },
  { itemName: 'سموثي بطيخ', lines: [{ name: 'بطيخ', qty: 250 }, { name: 'سكر خشن', qty: 20 }] },
  { itemName: 'سموثي بلو بيري', lines: [{ name: 'توبينج بلوبيري', qty: 50 }, { name: 'سكر خشن', qty: 20 }] },
  { itemName: 'سموثي كوكتيل', lines: [{ name: 'مانجو', qty: 80 }, { name: 'فراولة طازجة', qty: 60 }, { name: 'موز', qty: 60 }, { name: 'سكر خشن', qty: 20 }] },
  // عصائر فريش
  { itemName: 'عصير مانجو', lines: [{ name: 'مانجو', qty: 200 }, { name: 'سكر خشن', qty: 25 }] },
  { itemName: 'عصير بطيخ', lines: [{ name: 'بطيخ', qty: 300 }, { name: 'سكر خشن', qty: 20 }] },
  { itemName: 'عصير كيوي', lines: [{ name: 'كيوي', qty: 160 }, { name: 'سكر خشن', qty: 30 }] },
  { itemName: 'عصير رمان', lines: [{ name: 'رمان', qty: 250 }, { name: 'سكر خشن', qty: 20 }] },
  { itemName: 'عصير شمام', lines: [{ name: 'كنتالوب', qty: 250 }, { name: 'سكر خشن', qty: 20 }] },
  { itemName: 'عصير موز بالحليب', lines: [{ name: 'موز', qty: 140 }, { name: 'حليب', qty: 200 }, { name: 'سكر خشن', qty: 20 }] },
  { itemName: 'عصير ليمون', lines: [{ name: 'ليمون طازج', qty: 90 }, { name: 'سكر خشن', qty: 35 }] },
  { itemName: 'عصير ليمون بالنعناع', lines: [{ name: 'ليمون طازج', qty: 90 }, { name: 'نعناع فريش', qty: 8 }, { name: 'سكر خشن', qty: 35 }] },
  { itemName: 'عصير برتقال', lines: [{ name: 'برتقال', qty: 300 }] },
  { itemName: 'عصير افكادو بالعسل', lines: [{ name: 'افوكادو', qty: 150 }, { name: 'حليب', qty: 180 }, { name: 'عسل نحل', qty: 25 }] },
  { itemName: 'عصير افكادو بالمكسرات', lines: [{ name: 'افوكادو', qty: 150 }, { name: 'حليب', qty: 180 }, { name: 'عسل نحل', qty: 25 }, { name: 'فستق', qty: 10 }, { name: 'لوز', qty: 10 }] },
  { itemName: 'عصير اناناس', lines: [{ name: 'عصير اناناس معلب', qty: 250 }] },
  { itemName: 'كوكتيل', lines: [{ name: 'مانجو', qty: 100 }, { name: 'موز', qty: 80 }, { name: 'فراولة طازجة', qty: 60 }, { name: 'حليب', qty: 100 }, { name: 'سكر خشن', qty: 20 }] },
  { itemName: 'عصير عوار القلب', lines: [{ name: 'مانجو', qty: 100 }, { name: 'فراولة طازجة', qty: 80 }, { name: 'ايس كريم فانيليا', qty: 60 }, { name: 'حليب', qty: 100 }] },
  { itemName: 'باور لبان بارك', lines: [{ name: 'افوكادو', qty: 120 }, { name: 'مانجو', qty: 100 }, { name: 'عسل نحل', qty: 25 }, { name: 'فستق', qty: 15 }, { name: 'حليب', qty: 150 }] },
  // ميلك شيك
  { itemName: 'ميلك شيك مانجو', lines: [{ name: 'ايس كريم مانجو', qty: 120 }, { name: 'حليب', qty: 180 }] },
  { itemName: 'ميلك شيك فانيليا', lines: [{ name: 'ايس كريم فانيليا', qty: 120 }, { name: 'حليب', qty: 180 }] },
  { itemName: 'ميلك شيك شوكولاته', lines: [{ name: 'ايس كريم شوكولاته', qty: 120 }, { name: 'حليب', qty: 180 }, { name: 'صوص شوكليت', qty: 20 }] },
  { itemName: 'ميلك شيك اوريو', lines: [{ name: 'ايس كريم فانيليا', qty: 120 }, { name: 'حليب', qty: 180 }, { name: 'بسكويت اوريو', qty: 40 }] },
  { itemName: 'ميلك شيك لوتس', lines: [{ name: 'ايس كريم فانيليا', qty: 120 }, { name: 'حليب', qty: 180 }, { name: 'لوتس', qty: 35 }] },
  { itemName: 'ميلك شيك نوتيلا', lines: [{ name: 'ايس كريم فانيليا', qty: 120 }, { name: 'حليب', qty: 180 }, { name: 'نوتيلا', qty: 35 }] },
  { itemName: 'ميلك شيك فراولة', lines: [{ name: 'ايس كريم فراولة', qty: 120 }, { name: 'حليب', qty: 180 }] },
  { itemName: 'ميلك شيك كراميل', lines: [{ name: 'ايس كريم فانيليا', qty: 120 }, { name: 'حليب', qty: 180 }, { name: 'صوص كراميل', qty: 30 }] },
  // القهوة الساخنة
  { itemName: 'اسبريسو', lines: [{ name: 'بن اسبريسو', qty: 10 }] },
  { itemName: 'دبل اسبريسو', lines: [{ name: 'بن اسبريسو', qty: 18 }] },
  { itemName: 'اسبريسو افوجاتو', lines: [{ name: 'بن اسبريسو', qty: 18 }, { name: 'ايس كريم فانيليا', qty: 60 }] },
  { itemName: 'امريكانو', lines: [{ name: 'بن اسبريسو', qty: 18 }] },
  { itemName: 'مكياتو', lines: [{ name: 'بن اسبريسو', qty: 10 }, { name: 'حليب', qty: 40 }] },
  { itemName: 'دبل مكياتو', lines: [{ name: 'بن اسبريسو', qty: 18 }, { name: 'حليب', qty: 50 }] },
  { itemName: 'كابتشينو', lines: [{ name: 'بن اسبريسو', qty: 18 }, { name: 'حليب', qty: 180 }] },
  { itemName: 'لاتيه', lines: [{ name: 'بن اسبريسو', qty: 18 }, { name: 'حليب', qty: 220 }] },
  { itemName: 'سبانش لاتيه', lines: [{ name: 'بن اسبريسو', qty: 18 }, { name: 'حليب', qty: 200 }, { name: 'حليب مكثف', qty: 35 }] },
  { itemName: 'نسكافيه', lines: [{ name: 'نسكافيه', qty: 10 }, { name: 'حليب', qty: 200 }, { name: 'سكر خشن', qty: 15 }] },
  { itemName: 'قهوة تركية', lines: [{ name: 'بن تركي', qty: 12 }, { name: 'سكر خشن', qty: 10 }] },
  { itemName: 'V60 حار', lines: [{ name: 'بن مختصة', qty: 20 }, { name: 'فلتر V60', qty: 1 }] },
  // القهوة الباردة
  { itemName: 'ايس امريكانو', lines: [{ name: 'بن اسبريسو', qty: 14 }] },
  { itemName: 'ايس لاتيه', lines: [{ name: 'حليب', qty: 250 }, { name: 'بن اسبريسو', qty: 20 }, { name: 'سكر خشن', qty: 20 }] },
  { itemName: 'ايس سبانش لاتيه', lines: [{ name: 'حليب', qty: 250 }, { name: 'حليب مكثف', qty: 40 }, { name: 'بن اسبريسو', qty: 14 }] },
  { itemName: 'V60 بارد', lines: [{ name: 'سكر خشن', qty: 20 }, { name: 'بن مختصة', qty: 20 }, { name: 'فلتر V60', qty: 1 }] },
  // المشروبات الساخنة
  { itemName: 'شاي احمر ورق', lines: [{ name: 'شاي احمر ورق', qty: 5 }, { name: 'سكر خشن', qty: 15 }] },
  { itemName: 'شاي احمر ورق مع كوب زجاج', lines: [{ name: 'شاي احمر ورق', qty: 5 }, { name: 'سكر خشن', qty: 15 }] },
  { itemName: 'شاي احمر باكيت', lines: [{ name: 'شاي احمر باكيت', qty: 1 }, { name: 'سكر خشن', qty: 15 }] },
  { itemName: 'شاي اخضر صيني', lines: [{ name: 'شاي اخضر صيني', qty: 5 }, { name: 'سكر خشن', qty: 10 }] },
  { itemName: 'شاي اخضر باكيت', lines: [{ name: 'شاي اخضر باكيت', qty: 1 }, { name: 'سكر خشن', qty: 10 }] },
  { itemName: 'شاي كرك', lines: [{ name: 'شاي احمر ورق', qty: 6 }, { name: 'حليب مبخر', qty: 60 }, { name: 'سكر خشن', qty: 15 }, { name: 'هيل', qty: 1 }] },
  { itemName: 'شاي حليب فريش', lines: [{ name: 'شاي احمر ورق', qty: 6 }, { name: 'حليب', qty: 200 }, { name: 'سكر خشن', qty: 15 }] },
  { itemName: 'شاي بالعسل والليمون', lines: [{ name: 'شاي احمر باكيت', qty: 1 }, { name: 'عسل نحل', qty: 20 }, { name: 'ليمون طازج', qty: 20 }] },
  { itemName: 'شاي حليب زنجبيل وعسل', lines: [{ name: 'شاي احمر ورق', qty: 5 }, { name: 'حليب', qty: 200 }, { name: 'زنجبيل', qty: 10 }, { name: 'عسل نحل', qty: 20 }] },
  { itemName: 'يانسون باكيت', lines: [{ name: 'يانسون باكيت', qty: 1 }, { name: 'سكر خشن', qty: 15 }] },
  { itemName: 'كركديه باكيت', lines: [{ name: 'كركديه باكيت', qty: 1 }, { name: 'سكر خشن', qty: 15 }] },
  { itemName: 'نعناع باكيت', lines: [{ name: 'نعناع باكيت', qty: 1 }, { name: 'سكر خشن', qty: 15 }] },
  { itemName: 'هوت شوكليت', lines: [{ name: 'بودرة هوت شوكليت', qty: 30 }, { name: 'حليب', qty: 220 }] },
  { itemName: 'هوت كوكتيل', lines: [{ name: 'حليب', qty: 200 }, { name: 'زنجبيل', qty: 10 }, { name: 'عسل نحل', qty: 20 }] },
  { itemName: 'ابريق شاي وسط', lines: [{ name: 'شاي احمر ورق', qty: 20 }, { name: 'سكر خشن', qty: 60 }] },
  { itemName: 'ابريق شاي كبير', lines: [{ name: 'شاي احمر ورق', qty: 30 }, { name: 'سكر خشن', qty: 90 }] },
  { itemName: 'ابريق حليب فريش وسط', lines: [{ name: 'حليب', qty: 750 }, { name: 'شاي احمر ورق', qty: 20 }, { name: 'سكر خشن', qty: 60 }] },
  { itemName: 'ابريق حليب فريش كبير', lines: [{ name: 'حليب', qty: 1000 }, { name: 'شاي احمر ورق', qty: 30 }, { name: 'سكر خشن', qty: 90 }] },
  // الايس كريم
  { itemName: 'ايس كريم مانجو', lines: [{ name: 'ايس كريم مانجو', qty: 150 }] },
  ]
  export function DashboardScreen({ invoices, ingredients, recipes, settings }) {
  const { data: expenses } = useLiveShared('expenses', { order: '-createdAt', limit: 100 })
  const [expTitle, setExpTitle] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const currency = settings?.currency || 'ر.ع'

  const today = todayStr()
  const todayInvoices = invoices.filter((i) => i.date === today)
  const todaySales = todayInvoices.reduce((s, i) => s + Number(i.total || 0), 0)
  const todayExpenses = expenses.filter((e) => e.date === today).reduce((s, e) => s + Number(e.amount || 0), 0)
  const lowStock = ingredients.filter((ing) => Number(ing.stock || 0) <= Number(ing.minStock || 0))

  async function addExpense(e) {
    e.preventDefault()
    if (!expTitle || !expAmount) return
    await db.insertShared('expenses', { title: expTitle, amount: Number(expAmount), date: today })
    setExpTitle('')
    setExpAmount('')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#123B36]/10">
          <div className="text-xs text-[#123B36]/60 font-bold">مبيعات اليوم ({todayInvoices.length} فاتورة)</div>
          <div className="text-2xl font-extrabold text-[#123B36] mt-1">{fmt(todaySales)} {currency}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#123B36]/10">
          <div className="text-xs text-[#123B36]/60 font-bold">مصروفات اليوم</div>
          <div className="text-2xl font-extrabold text-red-600 mt-1">{fmt(todayExpenses)} {currency}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#123B36]/10">
          <div className="text-xs text-[#123B36]/60 font-bold">صافي اليوم</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{fmt(todaySales - todayExpenses)} {currency}</div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
          <div className="flex items-center gap-2 font-extrabold text-amber-900 text-sm mb-2">
            <AlertTriangle size={18} />
            <span>تنبيهات انخفاض المخزون ({lowStock.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((i) => (
              <span key={i.id} className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-amber-800 border border-amber-200">
                {i.name}: {i.stock} {i.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#123B36]/10">
          <h3 className="font-extrabold text-sm mb-3 flex items-center gap-2"><Receipt size={16} /> تسجيل مصروف جديد</h3>
          <form onSubmit={addExpense} className="flex gap-2">
            <input value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="البيان (مثلاً: ثلج، صيانة...)" className="flex-1 bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none" />
            <input type="number" step="0.001" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="المبلغ" className="w-28 bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none" />
            <button className="bg-[#123B36] text-white px-4 py-2 rounded-xl text-xs font-bold">حفظ</button>
          </form>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#123B36]/10 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm">مشاركة ملخص اليوم</h3>
            <p className="text-xs text-[#123B36]/60 mt-1">إرسال تقرير المبيعات والمصروفات عبر واتساب</p>
          </div>
          <button
            onClick={() => share?.(`تقرير ${settings?.shopName || 'نيوم'} (${today})\nالمبيعات: ${fmt(todaySales)} ${currency}\nالمصروفات: ${fmt(todayExpenses)} ${currency}\nالصافي: ${fmt(todaySales - todayExpenses)} ${currency}`)}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Send size={15} /> إرسال التقرير
          </button>
        </div>
      </div>
    </div>
  )
}

export function InventoryScreen({ items, ingredients, currency }) {
  const { data: recipes } = useLiveShared('recipes')
  const [subTab, setSubTab] = useState('ingredients')
  const [name, setName] = useState('')
  const [val1, setVal1] = useState('')
  const [val2, setVal2] = useState('جم')
  const [selectedItem, setSelectedItem] = useState('')
  const [recIng, setRecIng] = useState('')
  const [recQty, setRecQty] = useState('')

  async function addIngredient(e) {
    e.preventDefault()
    if (!name) return
    await db.insertShared('ingredients', { name, stock: Number(val1 || 0), unit: val2, cost: 0, minStock: 10 })
    setName(''); setVal1('')
  }

  async function addItem(e) {
    e.preventDefault()
    if (!name) return
    await db.insertShared('items', { name, price: Number(val1 || 0), category: val2 || 'عام' })
    setName(''); setVal1('')
  }

  async function addRecipeLine(e) {
    e.preventDefault()
    if (!selectedItem || !recIng || !recQty) return
    const existing = recipes.find((r) => r.itemName === selectedItem)
    const newLine = { name: recIng, qty: Number(recQty) }
    if (existing) {
      const updated = [...(existing.lines || []).filter((l) => l.name !== recIng), newLine]
      await db.updateShared('recipes', existing.id, { lines: updated })
    } else {
      await db.insertShared('recipes', { itemName: selectedItem, lines: [newLine] })
    }
    setRecQty('')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm w-fit">
        <button onClick={() => setSubTab('ingredients')} className={`px-4 py-2 rounded-xl text-xs font-bold ${subTab === 'ingredients' ? 'bg-[#123B36] text-white' : ''}`}>الجرد والخامات ({ingredients.length})</button>
        <button onClick={() => setSubTab('items')} className={`px-4 py-2 rounded-xl text-xs font-bold ${subTab === 'items' ? 'bg-[#123B36] text-white' : ''}`}>أصناف المنيو ({items.length})</button>
        <button onClick={() => setSubTab('recipes')} className={`px-4 py-2 rounded-xl text-xs font-bold ${subTab === 'recipes' ? 'bg-[#123B36] text-white' : ''}`}>الرسبي والوصفات ({recipes.length})</button>
      </div>

      {subTab === 'ingredients' && (
        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
          <form onSubmit={addIngredient} className="flex flex-wrap gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الخامة الجديدة..." className="flex-1 min-w-[160px] bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none" />
            <input type="number" step="0.01" value={val1} onChange={(e) => setVal1(e.target.value)} placeholder="الرصيد" className="w-24 bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none" />
            <select value={val2} onChange={(e) => setVal2(e.target.value)} className="bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none">
              <option value="جم">جم</option>
              <option value="مل">مل</option>
              <option value="حبة">حبة</option>
            </select>
            <button className="bg-[#123B36] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"><Plus size={15} /> إضافة خامة</button>
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
            {ingredients.map((ing) => (
              <div key={ing.id} className="flex items-center justify-between bg-[#F4F1EA] p-3 rounded-xl text-xs">
                <div>
                  <div className="font-bold">{ing.name}</div>
                  <div className="text-[#123B36]/60">الرصيد: <span className="font-extrabold text-[#123B36]">{ing.stock} {ing.unit}</span></div>
                </div>
                <button onClick={() => db.deleteShared('ingredients', ing.id)} className="text-red-500 p-1"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'items' && (
        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
          <form onSubmit={addItem} className="flex flex-wrap gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الصنف في المنيو..." className="flex-1 min-w-[160px] bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none" />
            <input type="number" step="0.001" value={val1} onChange={(e) => setVal1(e.target.value)} placeholder="السعر" className="w-24 bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none" />
            <input value={val2} onChange={(e) => setVal2(e.target.value)} placeholder="الفئة (مثلاً: موهيتو)" className="w-36 bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none" />
            <button className="bg-[#123B36] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"><Plus size={15} /> إضافة صنف</button>
          </form>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between bg-[#F4F1EA] p-3 rounded-xl text-xs">
                <div>
                  <div className="font-bold">{it.name}</div>
                  <div className="text-[#123B36]/60">{it.category} • {fmt(it.price)} {currency}</div>
                </div>
                <button onClick={() => db.deleteShared('items', it.id)} className="text-red-500 p-1"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'recipes' && (
