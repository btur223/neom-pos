import { useState, useMemo } from 'react'
import { Plus, Trash2, Send, AlertTriangle, Edit3, Sparkles, CheckCircle2, Receipt, BookOpen, Database, Calendar, TrendingUp, Users, RotateCcw, MessageCircle, Award, UserCheck, Star, Ticket, Store } from 'lucide-react'
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
  { itemName: 'ايس كريم فانيليا', lines: [{ name: 'ايس كريم فانيليا', qty: 150 }] },
  { itemName: 'ايس كريم شوكولاته', lines: [{ name: 'ايس كريم شوكولاته', qty: 150 }] },
  { itemName: 'ايس كريم فراولة', lines: [{ name: 'ايس كريم فراولة', qty: 150 }] },
  { itemName: 'ايس كريم مكس', lines: [{ name: 'ايس كريم مانجو', qty: 50 }, { name: 'ايس كريم فانيليا', qty: 50 }, { name: 'ايس كريم شوكولاته', qty: 50 }] },
  // الحلويات
  { itemName: 'تشيز كيك', lines: [{ name: 'تشيز كيك جاهز', qty: 1 }] },
  { itemName: 'كنافة قشطة', lines: [{ name: 'عجينة كنافة', qty: 150 }, { name: 'قشطة', qty: 80 }, { name: 'سمنة', qty: 30 }, { name: 'فستق', qty: 10 }] },
  { itemName: 'كنافة جبنة', lines: [{ name: 'عجينة كنافة', qty: 150 }, { name: 'جبن عكاوي', qty: 80 }, { name: 'سمنة', qty: 30 }, { name: 'فستق', qty: 10 }] },
  { itemName: 'ام علي', lines: [{ name: 'ملفيه', qty: 100 }, { name: 'حليب', qty: 180 }, { name: 'تصنيعية كريم شانتي', qty: 60 }, { name: 'فستق', qty: 10 }, { name: 'جوز هند', qty: 10 }] },
  { itemName: 'سان سبيستيان', lines: [{ name: 'سان سبيستيان جاهز', qty: 1 }, { name: 'صوص شوكليت', qty: 30 }] },
  { itemName: 'كريم كراميل', lines: [{ name: 'كريم كراميل جاهز', qty: 1 }] },
  { itemName: 'مهلبية', lines: [{ name: 'مهلبية جاهزة', qty: 1 }] },
  // الإضافات
  { itemName: 'إضافة صوص شوكليت', lines: [{ name: 'صوص شوكليت', qty: 25 }] },
  { itemName: 'إضافة صوص نوتيلا', lines: [{ name: 'نوتيلا', qty: 25 }] },
  { itemName: 'إضافة توبينج اناناس', lines: [{ name: 'توبينج اناناس', qty: 25 }] },
  { itemName: 'إضافة توبينج باشن', lines: [{ name: 'توبينج باشن', qty: 25 }] },
  { itemName: 'إضافة باكيت شاي احمر', lines: [{ name: 'شاي احمر باكيت', qty: 1 }] },
  { itemName: 'إضافة عسل النحل', lines: [{ name: 'عسل نحل', qty: 20 }] },
  // البوفيهات والضيافة
  { itemName: 'سفنديش ام علي كبير', lines: [{ name: 'حليب', qty: 1000 }, { name: 'بندق', qty: 15 }, { name: 'لوز', qty: 15 }, { name: 'فستق', qty: 20 }, { name: 'جوز هند', qty: 30 }, { name: 'ملفيه', qty: 650 }, { name: 'تصنيعية كريم شانتي', qty: 700 }] },
  { itemName: 'سفنديش ام علي وسط', lines: [{ name: 'حليب', qty: 500 }, { name: 'بندق', qty: 15 }, { name: 'لوز', qty: 15 }, { name: 'فستق', qty: 20 }, { name: 'جوز هند', qty: 30 }, { name: 'ملفيه', qty: 400 }, { name: 'تصنيعية كريم شانتي', qty: 400 }] },
  { itemName: 'صحن شمام كبير', lines: [{ name: 'كنتالوب', qty: 1750 }] },
  { itemName: 'صحن شمام وسط', lines: [{ name: 'كنتالوب', qty: 1300 }] },
  { itemName: 'صحن بطيخ كبير', lines: [{ name: 'بطيخ', qty: 3170 }] },
  { itemName: 'صحن بطيخ وسط', lines: [{ name: 'بطيخ', qty: 2440 }] },
  { itemName: 'عصير تانك برتقال', lines: [{ name: 'عصير تانك برتقال', qty: 370 }, { name: 'سكر خشن', qty: 440 }] },
  { itemName: 'عصير تانك مانجو', lines: [{ name: 'عصير تانك مانجو', qty: 370 }, { name: 'سكر خشن', qty: 440 }] },
  { itemName: 'عصير فيمتو', lines: [{ name: 'فيمتو', qty: 500 }, { name: 'سكر خشن', qty: 440 }] },
  ]
export function DashboardScreen({ invoices = [], ingredients = [], recipes = [], shifts = [], settings, features = {}, currentBranch = 'الفرع الرئيسي - صلالة', lang = 'ar' }) {
  const { data: expenses } = useLiveShared('expenses', { order: '-createdAt', limit: 200 })
  const { data: wasteLogs } = useLiveShared('waste_logs', { order: '-createdAt', limit: 200 })
  const { data: items } = useLiveShared('items')
  const { data: customers } = useLiveShared('customers')
  const { data: feedbacks } = useLiveShared('feedbacks', { order: '-created_at', limit: 50 })
  const { data: auditLogs } = useLiveShared('audit_logs', { order: '-created_at', limit: 100 })
  const [expTitle, setExpTitle] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expImage, setExpImage] = useState('')
  const [period, setPeriod] = useState('today')
  const [branchFilter, setBranchFilter] = useState('all')
  const currency = settings?.currency || 'ر.ع'
  const branchesList = settings?.branches || ['الفرع الرئيسي - صلالة']

  const today = todayStr()

  const isInPeriod = (dateStr) => {
    if (!dateStr) return false
    if (period === 'today') return dateStr === today
    if (period === 'month') return dateStr.slice(0, 7) === today.slice(0, 7)
    if (period === 'week') {
      const diffDays = (new Date(today) - new Date(dateStr)) / (1000 * 60 * 60 * 24)
      return diffDays >= 0 && diffDays <= 7
    }
    return true
  }

  const matchBranch = (recBranch) => {
    if (!features.branches || branchFilter === 'all') return true
    return (recBranch || branchesList[0]) === branchFilter
  }

  const periodInvoices = useMemo(() => (invoices || []).filter((i) => isInPeriod(i.date) && matchBranch(i.branch)), [invoices, period, today, branchFilter, features.branches])
  const periodExpenses = useMemo(() => (expenses || []).filter((e) => isInPeriod(e.date) && matchBranch(e.branch)), [expenses, period, today, branchFilter, features.branches])
  const periodWasteLogs = useMemo(() => (wasteLogs || []).filter((w) => isInPeriod(w.date)), [wasteLogs, period, today])

  const totalSales = periodInvoices.reduce((s, i) => s + Number(i.total || 0), 0)
  const cashTotal = periodInvoices.filter((i) => i.paymentMethod === 'نقدي').reduce((s, i) => s + Number(i.total || 0), 0)
  const cardTotal = periodInvoices.filter((i) => i.paymentMethod === 'بطاقة').reduce((s, i) => s + Number(i.total || 0), 0)
  const transferTotal = periodInvoices.filter((i) => i.paymentMethod === 'تحويل').reduce((s, i) => s + Number(i.total || 0), 0)

  const totalExpenses = periodExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const totalWaste = periodWasteLogs.reduce((s, w) => s + Number(w.cost_loss || 0), 0)
  const lowStock = (ingredients || []).filter((ing) => Number(ing.stock || 0) <= Number(ing.minStock || 500))

  const ingCostMap = useMemo(() => {
    const m = {}
    ;(ingredients || []).forEach((ing) => { m[ing.name] = Number(ing.cost || 0) })
    return m
  }, [ingredients])

  const recipeCostMap = useMemo(() => {
    const m = {}
    ;(recipes || []).forEach((rec) => {
      const c = (rec.lines || []).reduce((sum, l) => sum + (Number(l.qty || 0) * (ingCostMap[l.name] || 0)), 0)
      m[rec.itemName] = c
    })
    return m
  }, [recipes, ingCostMap])

  const totalCogs = useMemo(() => {
    return periodInvoices.reduce((sum, inv) => {
      const invCost = (inv.lines || []).reduce((s, l) => s + ((recipeCostMap[l.name] || 0) * Number(l.qty || 1)), 0)
      return sum + invCost
    }, 0)
  }, [periodInvoices, recipeCostMap])

  const netProfit = totalSales - totalCogs - totalExpenses - totalWaste

  const fraudAlerts = useMemo(() => {
    const alerts = []
    const cashierDiscounts = {}
    periodInvoices.forEach((inv) => {
      if (Number(inv.discount || 0) > 0) {
        const cName = inv.cashierName || 'غير محدد'
        cashierDiscounts[cName] = (cashierDiscounts[cName] || 0) + 1
        if (!inv.customerPhone && Number(inv.discount) >= 0.5) {
          alerts.push(`خصم (${fmt(inv.discount)} ${currency}) في فاتورة ${inv.number} بواسطة ${cName} بدون رقم عميل مسجل.`)
        }
      }
    })
    Object.entries(cashierDiscounts).forEach(([cName, count]) => {
      if (count >= 3) alerts.push(`تكرار منح الخصومات اليدوية (${count} مرات) بواسطة ${cName} في الفترة المحددة.`)
    })
    ;(shifts || []).filter((s) => s.status === 'closed' && Number(s.closing_cash || 0) < Number(s.expected_cash || 0)).slice(0, 3).forEach((s) => {
      const diff = Number(s.closing_cash) - Number(s.expected_cash)
      alerts.push(`عجز في صندوق الوردية (${fmt(diff)} ${currency}) عند الإغلاق بواسطة ${s.cashier_name}.`)
    })
    ;(auditLogs || []).filter((a) => a.action?.includes('حذف') || a.action?.includes('إلغاء')).slice(0, 3).forEach((a) => {
      alerts.push(`تنبيه مراقبة: ${a.action} بواسطة ${a.user_name} (${a.details || ''})`)
    })
    return alerts
  }, [periodInvoices, shifts, auditLogs, currency])

  const branchComparison = useMemo(() => {
    return branchesList.map((bName) => {
      const bInvs = (invoices || []).filter((i) => isInPeriod(i.date) && (i.branch || branchesList[0]) === bName)
      const bSales = bInvs.reduce((s, i) => s + Number(i.total || 0), 0)
      const bCogs = bInvs.reduce((sum, inv) => sum + (inv.lines || []).reduce((s, l) => s + ((recipeCostMap[l.name] || 0) * Number(l.qty || 1)), 0), 0)
      const bExps = (expenses || []).filter((e) => isInPeriod(e.date) && (e.branch || branchesList[0]) === bName).reduce((s, e) => s + Number(e.amount || 0), 0)
      const cogsPct = bSales > 0 ? Math.round((bCogs / bSales) * 100) : 0
      return { name: bName, count: bInvs.length, sales: bSales, cogsPct, profit: bSales - bCogs - bExps }
    })
  }, [branchesList, invoices, expenses, period, today, recipeCostMap])

  const deadStockItems = useMemo(() => {
    const cutoff = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const soldNames = new Set()
    ;(invoices || []).filter((inv) => inv.date >= cutoff).forEach((inv) => {
      ;(inv.lines || []).forEach((l) => soldNames.add(l.name))
    })
    return (items || []).filter((it) => !soldNames.has(it.name)).slice(0, 10)
  }, [items, invoices])
  const peakHours = useMemo(() => {
    const hours = {}
    periodInvoices.forEach((inv) => {
      const ts = inv.createdAt || inv.created_at
      if (!ts) return
      const h = new Date(ts).getHours()
      hours[h] = (hours[h] || 0) + 1
    })
    return Object.entries(hours).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 4)
  }, [periodInvoices])

  const topSelling = useMemo(() => {
    const counts = {}
    periodInvoices.forEach((inv) => {
      ;(inv.lines || []).forEach((l) => {
        if (!counts[l.name]) counts[l.name] = { name: l.name, qty: 0, revenue: 0 }
        counts[l.name].qty += Number(l.qty || 1)
        counts[l.name].revenue += Number(l.price || 0) * Number(l.qty || 1)
      })
    })
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 5)
  }, [periodInvoices])

  const staffPerformance = useMemo(() => {
    const map = {}
    periodInvoices.forEach((inv) => {
      const name = inv.cashierName || (lang === 'en' ? 'Unassigned' : 'غير محدد')
      if (!map[name]) map[name] = { name, count: 0, total: 0 }
      map[name].count += 1
      map[name].total += Number(inv.total || 0)
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [periodInvoices, lang])

  const vipCustomers = useMemo(() => {
    return [...(customers || [])].sort((a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0))
  }, [customers])

  const itemProfitList = useMemo(() => {
    return (items || []).map((it) => {
      const cost = recipeCostMap[it.name] || 0
      const price = Number(it.price || 0)
      const profit = price - cost
      const margin = price > 0 ? Math.round((profit / price) * 100) : 0
      return { ...it, cost, profit, margin }
    }).sort((a, b) => a.margin - b.margin)
  }, [items, recipeCostMap])

  function handleSnapReceipt(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setExpImage(String(reader.result || ''))
      if (!expTitle) setExpTitle(lang === 'en' ? 'Receipt Expense' : 'فاتورة مشتريات/صيانة')
    }
    reader.readAsDataURL(file)
  }

  async function addExpense(e) {
    e.preventDefault()
    if (!expTitle || !expAmount) return
    await db.insertShared('expenses', {
      title: expTitle,
      amount: Number(expAmount),
      date: today,
      branch: branchFilter !== 'all' ? branchFilter : currentBranch,
      receipt_img: expImage || null,
    })
    setExpTitle('')
    setExpAmount('')
    setExpImage('')
  }

  async function cancelAndRestockInvoice(inv) {
    if (!confirm(lang === 'en' ? `Cancel invoice ${inv.number} and restock ingredients?` : `هل أنت متأكد من إلغاء الفاتورة ${inv.number} وإرجاع كميات الخامات للمخزون؟`)) return
    if (inv.stockDeducted && inv.lines) {
      for (const line of inv.lines) {
        const rec = (recipes || []).find((r) => r.itemId === line.id || r.itemName === line.name)
        if (rec && rec.lines) {
          for (const rl of rec.lines) {
            const ing = (ingredients || []).find((x) => x.id === rl.ingredientId || x.name === rl.name)
            if (ing) await db.incrementShared('ingredients', ing.id, 'stock', Number(rl.qty) * Number(line.qty || 1))
          }
        }
      }
    }
    await db.insertShared('audit_logs', {
      action: 'حذف وإلغاء فاتورة',
      user_name: 'المالك',
      details: `فاتورة ${inv.number} بقيمة ${fmt(inv.total)} ${currency}`,
      created_at: new Date().toISOString(),
    })
    await db.deleteShared('invoices', inv.id)
  }

  const periodLabels = lang === 'en'
    ? { today: 'Today', week: 'Last 7 Days', month: 'This Month', all: 'All Time' }
    : { today: 'اليوم', week: 'آخر 7 أيام', month: 'هذا الشهر', all: 'الإجمالي الكلي' }

  function sendOwnerWhatsAppReport() {
    const branchTitle = features.branches ? (branchFilter === 'all' ? 'جميع الفروع' : branchFilter) : ''
    const topTxt = topSelling.length > 0 ? topSelling.slice(0, 3).map((x, i) => `${i + 1}. ${x.name} (${x.qty})`).join('\n') : 'لا يوجد'
    const msg = `📊 *تقرير المالك - مقهى ${settings?.shopName || 'نيوم'}*\n${branchTitle ? `الفرع: *${branchTitle}*\n` : ''}الفترة: *${periodLabels[period]}* (${today})\n\n💰 *المبيعات (${periodInvoices.length} فاتورة):* ${fmt(totalSales)} ${currency}\n• نقدي: ${fmt(cashTotal)} ${currency}\n• بطاقة: ${fmt(cardTotal)} ${currency}\n• تحويل: ${fmt(transferTotal)} ${currency}\n\n📉 *التكاليف والمصروفات:*\n• تكلفة الخامات (الرسبي): ${fmt(totalCogs)} ${currency}\n• المصروفات: ${fmt(totalExpenses)} ${currency}\n• الهالك والعجز: ${fmt(totalWaste)} ${currency}\n\n✅ *صافي الربح الحقيقي: ${fmt(netProfit)} ${currency}*\n\n🔥 *الأكثر مبيعاً:*\n${topTxt}`
    window.open('https://wa.me' + encodeURIComponent(msg), '_blank')
  }

  function sendLowStockWhatsApp() {
    const listTxt = lowStock.map((ing, i) => `${i + 1}. ${ing.name} (المتبقي: ${ing.stock} ${ing.unit})`).join('\n')
    const msg = `📦 *طلب نواقص مخزون - مقهى ${settings?.shopName || 'نيوم'}*\nالتاريخ: ${today}\n\nالمواد المطلوبة:\n${listTxt}`
    window.open('https://wa.me' + encodeURIComponent(msg), '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-2xl shadow-sm border border-[#123B36]/10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 font-extrabold text-xs text-[#123B36]"><Calendar size={16} /> {lang === 'en' ? 'Period:' : 'الفترة:'}</span>
          {Object.entries(periodLabels).map(([key, label]) => (
            <button key={key} onClick={() => setPeriod(key)} className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${period === key ? 'bg-[#123B36] text-white' : 'bg-[#F4F1EA] text-[#123B36]/75'}`}>
              {label}
            </button>
          ))}
          {features.branches && (
            <div className="flex items-center gap-1.5 mr-2 border-r pr-2 border-[#123B36]/15">
              <Store size={15} className="text-[#123B36]" />
              <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="bg-[#F4F1EA] px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-[#123B36] outline-none">
                <option value="all">{lang === 'en' ? `All Branches (${branchesList.length})` : `جميع الفروع (${branchesList.length})`}</option>
                {branchesList.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}
        </div>
        <button onClick={sendOwnerWhatsAppReport} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
          <MessageCircle size={15} /> {lang === 'en' ? 'Send Owner WhatsApp' : 'إرسال تقرير المالك واتساب'}
        </button>
      </div>

      {features.fraudDetection && fraudAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-400 p-4 rounded-2xl space-y-2">
          <div className="font-extrabold text-red-900 text-sm flex items-center gap-2">
            <span>🚨 {lang === 'en' ? `Fraud & Anomaly Alerts (${fraudAlerts.length})` : `تنبيهات الرقابة وكشف الأنماط المشبوهة (${fraudAlerts.length})`}</span>
          </div>
          <ul className="space-y-1 text-xs font-bold text-red-800 list-disc pr-5">
            {fraudAlerts.map((al, i) => <li key={i}>{al}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#123B36]/10">
          <div className="text-xs text-[#123B36]/60 font-bold">{lang === 'en' ? 'Sales' : `مبيعات ${periodLabels[period]}`} ({periodInvoices.length})</div>
          <div className="text-xl font-extrabold text-[#123B36] mt-1">{fmt(totalSales)} {currency}</div>
          <div className="text-[10px] text-[#123B36]/60 mt-1 font-bold">{lang === 'en' ? 'Cash' : 'كاش'}: {fmt(cashTotal)} • {lang === 'en' ? 'Card' : 'بطاقة'}: {fmt(cardTotal)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#123B36]/10">
          <div className="text-xs text-[#123B36]/60 font-bold">{lang === 'en' ? 'COGS (Recipes)' : 'تكلفة الخامات (الرسبي)'}</div>
          <div className="text-xl font-extrabold text-amber-700 mt-1">{fmt(totalCogs)} {currency}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#123B36]/10">
          <div className="text-xs text-[#123B36]/60 font-bold">{lang === 'en' ? 'Expenses' : `مصروفات ${periodLabels[period]}`}</div>
          <div className="text-xl font-extrabold text-red-600 mt-1">{fmt(totalExpenses)} {currency}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#123B36]/10">
          <div className="text-xs text-[#123B36]/60 font-bold">{lang === 'en' ? 'Waste & Loss' : `هالك وعجز ${periodLabels[period]}`}</div>
          <div className="text-xl font-extrabold text-orange-600 mt-1">{fmt(totalWaste)} {currency}</div>
        </div>
        <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs text-emerald-200 font-bold">{lang === 'en' ? 'Net Profit' : 'صافي الربح الحقيقي'}</div>
          <div className="text-xl font-extrabold mt-1">{fmt(netProfit)} {currency}</div>
        </div>
      </div>
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-extrabold text-amber-900 text-sm">
              <AlertTriangle size={18} />
              <span>{lang === 'en' ? `Low Stock Alert (${lowStock.length})` : `تنبيه نواقص المخزون (${lowStock.length})`}</span>
            </div>
            <button onClick={sendLowStockWhatsApp} className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1">
              <MessageCircle size={14} /> {lang === 'en' ? 'Order via WhatsApp' : 'طلب النواقص واتساب'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((ing) => (
              <span key={ing.id} className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-amber-900 border border-amber-200">
                {ing.name}: {ing.stock} {ing.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      {features.deadStock && deadStockItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-2">
          <div className="font-extrabold text-blue-900 text-sm">
            💤 {lang === 'en' ? `Dead Stock Alert (No sales in 15 days: ${deadStockItems.length})` : `تنبيه ركود الأصناف (لم تُبع منذ 15 يوماً: ${deadStockItems.length} صنف)`}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {deadStockItems.map((it) => (
              <span key={it.id} className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-blue-900 border border-blue-200">
                {it.name} ({fmt(it.price)} {currency})
              </span>
            ))}
          </div>
        </div>
      )}

      {features.branchCompare && branchComparison.length > 1 && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#123B36]/10 space-y-2">
          <h3 className="font-extrabold text-sm text-[#123B36]">⚖️ {lang === 'en' ? 'Branch Performance Comparison' : 'مقارنة أداء الفروع جنباً إلى جنب'}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-[#F4F1EA] font-extrabold text-[#123B36]">
                  <th className="p-2 rounded-r-lg">{lang === 'en' ? 'Branch' : 'الفرع'}</th>
                  <th className="p-2">{lang === 'en' ? 'Orders' : 'الفواتير'}</th>
                  <th className="p-2">{lang === 'en' ? 'Sales' : 'المبيعات'}</th>
                  <th className="p-2">COGS %</th>
                  <th className="p-2 rounded-l-lg">{lang === 'en' ? 'Net Profit' : 'صافي الربح'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#123B36]/10 font-bold">
                {branchComparison.map((b) => (
                  <tr key={b.name}>
                    <td className="p-2 font-extrabold">{b.name}</td>
                    <td className="p-2">{b.count}</td>
                    <td className="p-2">{fmt(b.sales)} {currency}</td>
                    <td className="p-2 text-amber-700">{b.cogsPct}%</td>
                    <td className="p-2 text-emerald-700 font-extrabold">{fmt(b.profit)} {currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {features.menuEng && peakHours.length > 0 && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#123B36]/10 space-y-2">
          <h3 className="font-extrabold text-sm text-[#123B36]">⏰ {lang === 'en' ? 'Peak Hours' : 'ساعات الذروة والازدحام'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {peakHours.map(([hr, count]) => (
              <div key={hr} className="bg-[#F4F1EA] p-2.5 rounded-xl flex justify-between items-center font-extrabold">
                <span>{lang === 'en' ? `${hr}:00` : `الساعة ${hr}:00`}</span>
                <span className="bg-[#123B36] text-white px-2 py-0.5 rounded-lg">{count} {lang === 'en' ? 'orders' : 'طلب'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${features.analytics !== false ? 'lg:grid-cols-3' : ''} gap-4`}>
        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
          <h3 className="font-extrabold text-sm flex items-center gap-2"><Receipt size={16} /> {lang === 'en' ? 'Daily Expenses' : 'تسجيل مصروف يومي'}</h3>
          <form onSubmit={addExpense} className="space-y-2">
            <div className="flex gap-1.5">
              <input value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder={lang === 'en' ? 'Expense description...' : 'بيان المصروف...'} className="flex-1 bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none" />
              <input type="number" step="0.001" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder={lang === 'en' ? 'Amount' : 'المبلغ'} className="w-20 bg-[#F4F1EA] px-2.5 py-2 rounded-xl text-xs outline-none font-bold" />
              <button className="bg-[#123B36] text-white px-3 py-2 rounded-xl text-xs font-bold">{lang === 'en' ? 'Add' : 'إضافة'}</button>
            </div>
            {features.snapExpense && (
              <div className="flex items-center justify-between bg-[#F4F1EA] px-3 py-1.5 rounded-xl text-[11px]">
                <label className="cursor-pointer font-bold text-[#123B36] flex items-center gap-1.5">
                  <span>📸 {lang === 'en' ? 'Snap Receipt Photo' : 'تصوير الفاتورة بالكاميرا'}</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleSnapReceipt} className="hidden" />
                </label>
                {expImage && <span className="text-emerald-700 font-extrabold">✓ تم إرفاق الصورة</span>}
              </div>
            )}
          </form>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {periodExpenses.map((e) => (
              <div key={e.id} className="flex justify-between items-center bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs">
                <div>
                  <span className="font-bold">{e.title}</span> <span className="text-[10px] text-[#123B36]/50">({e.date})</span>
                  {e.receipt_img && <a href={e.receipt_img} target="_blank" rel="noreferrer" className="text-[10px] text-blue-700 underline mr-2">عرض الإيصال</a>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-red-600">{fmt(e.amount)} {currency}</span>
                  <button onClick={() => db.deleteShared('expenses', e.id)} className="text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {features.analytics !== false && (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2"><TrendingUp size={16} /> {lang === 'en' ? 'Top Selling Items' : 'الأصناف الأكثر مبيعاً'}</h3>
              {topSelling.length === 0 ? (
                <p className="text-xs text-[#123B36]/50 py-6 text-center">{lang === 'en' ? 'No sales in this period.' : 'لا توجد مبيعات في هذه الفترة.'}</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {topSelling.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between bg-[#F4F1EA] px-3 py-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-[#123B36] text-white font-extrabold flex items-center justify-center text-[10px]">{idx + 1}</span>
                        <span className="font-extrabold">{item.name}</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-emerald-800">{item.qty}</span>
                        <span className="text-[10px] text-[#123B36]/60 mr-1">({fmt(item.revenue)})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm flex items-center gap-2"><UserCheck size={16} /> {lang === 'en' ? 'Staff Performance' : 'أداء الموظفين والكاشير'}</h3>
              {staffPerformance.length === 0 ? (
                <p className="text-xs text-[#123B36]/50 py-6 text-center">{lang === 'en' ? 'No staff sales recorded.' : 'لا توجد مبيعات مسجلة للموظفين.'}</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {staffPerformance.map((st) => (
                    <div key={st.name} className="flex items-center justify-between bg-[#F4F1EA] px-3 py-2.5 rounded-xl">
                      <div>
                        <div className="font-extrabold">{st.name}</div>
                        <div className="text-[10px] text-[#123B36]/60">{st.count} {lang === 'en' ? 'invoices' : 'فاتورة'}</div>
                      </div>
                      <span className="font-extrabold text-[#123B36]">{fmt(st.total)} {currency}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#123B36]/10 flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#123B36]">{lang === 'en' ? 'Sales & Collection' : 'المبيعات والتحصيل'}</h3>
            <div className="text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
              <span className="text-[#123B36]/70">{lang === 'en' ? 'Total Sales:' : 'إجمالي المبيعات:'}</span>
              <span className="font-extrabold text-[#123B36]">{fmt(totalSales)} {currency}</span>
            </div>
            <div className="text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
              <span className="text-[#123B36]/70">{lang === 'en' ? 'Net Profit:' : 'صافي الربح:'}</span>
              <span className="font-extrabold text-indigo-700">{fmt(netProfit)} {currency}</span>
            </div>
          </div>
          <svg viewBox="0 0 120 120" className="w-24 h-24 -rotate-90">
            <defs>
              <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="46" fill="none" stroke="#E5E7EB" strokeWidth="12" />
            <circle cx="60" cy="60" r="46" fill="none" stroke="url(#tealGrad)" strokeWidth="12" strokeDasharray="210 289" strokeLinecap="round" />
          </svg>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#123B36]/10 flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#123B36]">{lang === 'en' ? 'Costs & Expenses' : 'التكاليف والمصروفات'}</h3>
            <div className="text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="text-[#123B36]/70">{lang === 'en' ? 'Ingredients Cost:' : 'تكلفة الخامات:'}</span>
              <span className="font-extrabold text-amber-800">{fmt(totalCogs)} {currency}</span>
            </div>
            <div className="text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              <span className="text-[#123B36]/70">{lang === 'en' ? 'Daily Expenses:' : 'المصروفات اليومية:'}</span>
              <span className="font-extrabold text-red-700">{fmt(totalExpenses)} {currency}</span>
            </div>
          </div>
          <svg viewBox="0 0 120 120" className="w-24 h-24 -rotate-90">
            <circle cx="60" cy="60" r="46" fill="none" stroke="#E5E7EB" strokeWidth="12" />
            <circle cx="60" cy="60" r="46" fill="none" stroke="url(#tealGrad)" strokeWidth="12" strokeDasharray="180 289" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm space-y-4 border border-[#123B36]/10">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <h3 className="font-extrabold text-base flex items-center gap-2 text-[#123B36]">
            <RotateCcw size={18} /> {lang === 'en' ? `Invoices Control (${periodInvoices.length})` : `سجل وتحكم المالك بالفواتير (${periodLabels[period]}: ${periodInvoices.length} فاتورة)`}
          </h3>
          <span className="text-xs font-extrabold bg-emerald-50 text-emerald-900 px-3 py-1.5 rounded-xl">
            {lang === 'en' ? 'Period Total:' : 'إجمالي الفترة:'} {fmt(totalSales)} {currency}
          </span>
        </div>

        {periodInvoices.length === 0 ? (
          <p className="text-center text-sm text-[#123B36]/50 py-8">{lang === 'en' ? 'No invoices in this period.' : 'لا توجد فواتير مسجلة في هذه الفترة.'}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
            {periodInvoices.map((inv) => (
              <div key={inv.id} className="bg-[#F4F1EA] p-4 rounded-2xl border border-[#123B36]/15 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#123B36]/10 pb-2">
                  <div>
                    <span className="font-extrabold text-base text-[#123B36]">{lang === 'en' ? `Invoice ${inv.number}` : `فاتورة ${inv.number}`}</span>
                    <span className="text-xs text-[#123B36]/70 mr-2">({inv.date})</span>
                    {features.branches && inv.branch && <span className="text-[10px] bg-white px-2 py-0.5 rounded-md font-bold mr-1">{inv.branch}</span>}
                  </div>
                  <span className="font-extrabold text-lg text-emerald-800">{fmt(inv.total)} {currency}</span>
                </div>

                <div className="space-y-1 text-xs font-bold text-[#123B36] bg-white/70 p-2.5 rounded-xl">
                  {(inv.lines || []).map((l, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {l.name} × {l.qty}</span>
                      <span>{fmt(Number(l.price || 0) * Number(l.qty || 1))} {currency}</span>
                    </div>
                  ))}
                </div>

                {inv.note && (
                  <div className="text-xs text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg font-bold">
                    {lang === 'en' ? 'Note:' : 'ملاحظة:'} {inv.note}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#123B36]/70 font-bold">{lang === 'en' ? 'Payment:' : 'الدفع:'}</span>
                    <select
                      value={inv.paymentMethod || 'نقدي'}
                      onChange={(e) => db.updateShared('invoices', inv.id, { paymentMethod: e.target.value })}
                      className="bg-white border border-[#123B36]/20 rounded-lg px-2 py-1 text-xs font-extrabold text-[#123B36] outline-none"
                    >
                      <option value="نقدي">{lang === 'en' ? 'Cash' : 'نقدي'}</option>
                      <option value="بطاقة">{lang === 'en' ? 'Card' : 'بطاقة'}</option>
                      <option value="تحويل">{lang === 'en' ? 'Transfer' : 'تحويل'}</option>
                    </select>
                    <span className="text-[11px] text-[#123B36]/60 mr-1">• {inv.cashierName || (lang === 'en' ? 'Owner' : 'المالك')}</span>
                  </div>

                  <button
                    onClick={() => cancelAndRestockInvoice(inv)}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-red-700"
                  >
                    {lang === 'en' ? 'Delete & Restock' : 'حذف وإرجاع المخزون'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {features.loyalty !== false && (
          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm flex items-center gap-2"><Award size={16} className="text-amber-600" /> {lang === 'en' ? `VIP Customers (${vipCustomers.length})` : `قاعدة بيانات العملاء المميزين VIP (${vipCustomers.length})`}</h3>
            {vipCustomers.length === 0 ? (
              <p className="text-xs text-[#123B36]/50 py-6 text-center">{lang === 'en' ? 'Customers appear here automatically when phone is entered in POS.' : 'سيظهر هنا العملاء تلقائياً عند إدخال رقم جوالهم في الكاشير.'}</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                {vipCustomers.map((c) => (
                  <div key={c.id} className="flex items-center justify-between bg-[#F4F1EA] px-3 py-2.5 rounded-xl">
                    <div>
                      <div className="font-extrabold">{c.phone}</div>
                      <div className="text-[11px] text-[#123B36]/70">
                        {lang === 'en' ? `Visits: ${c.visits || 1} • Points: ${c.points || 0} ⭐ • Spent: ${fmt(c.total_spent)} ${currency}` : `الزيارات: ${c.visits || 1} • النقاط: ${c.points || 0} ⭐ • الإنفاق: ${fmt(c.total_spent)} ${currency}`}
                      </div>
                    </div>
                    <a
                      href={`https://wa.me{String(c.phone).startsWith('968') ? c.phone : '968' + c.phone}?text=${encodeURIComponent(`مرحباً عميلنا المميز في مقهى ${settings?.shopName || 'نيوم'} ☕ لديك رصيد ${c.points || 0} نقطة ولاء!`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {features.feedback !== false && (
         <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm flex items-center gap-2"><Star size={16} className="text-amber-500" /> {lang === 'en' ? `Customer Feedback (${(feedbacks || []).length})` : `تقييمات وآراء الزبائن (${(feedbacks || []).length})`}</h3>
            {(feedbacks || []).length === 0 ? (
              <p className="text-xs text-[#123B36]/50 py-6 text-center">{lang === 'en' ? 'Ratings from QR menu appear here.' : 'ستظهر هنا تقييمات الزبائن بعد الطلب من الباركود.'}</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                {(feedbacks || []).map((fb) => (
                  <div key={fb.id} className="bg-[#F4F1EA] px-3 py-2.5 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-extrabold text-amber-600">{'⭐'.repeat(fb.rating || 5)} {fb.table_num ? <span className="text-[#123B36] mr-1">({lang === 'en' ? `Table ${fb.table_num}` : `طاولة ${fb.table_num}`})</span> : ''}</div>
                      {fb.comment && <div className="text-[#123B36]/80 mt-0.5">{fb.comment}</div>}
                    </div>
                    <button onClick={() => db.deleteShared('feedbacks', fb.id)} className="text-red-500 p-1"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3 lg:col-span-2">
          <h3 className="font-extrabold text-sm flex items-center gap-2"><BookOpen size={16} /> {lang === 'en' ? 'Item Cost & Profit Margin (Based on Recipes)' : 'تكلفة الأصناف وهامش الربح (حسب الرسبي)'}</h3>
          <div className="max-h-60 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {itemProfitList.map((it) => (
              <div key={it.id} className="flex items-center justify-between bg-[#F4F1EA] px-3 py-2 rounded-xl">
                <div>
                  <div className="font-bold">{it.name}</div>
                  <div className="text-[11px] text-[#123B36]/60">{lang === 'en' ? `Sell: ${fmt(it.price)} • Cost: ${fmt(it.cost)}` : `البيع: ${fmt(it.price)} • التكلفة: ${fmt(it.cost)}`}</div>
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-emerald-700">+{fmt(it.profit)} {currency}</div>
                  <div className={`text-[10px] font-bold ${it.margin < 50 ? 'text-red-600' : 'text-emerald-700'}`}>{lang === 'en' ? `Margin ${it.margin}%` : `ربح ${it.margin}%`}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
            export function InventoryScreen({ items = [], ingredients = [], recipes = [], settings, features = {}, isManager = true, currency, lang = 'ar' }) {
  const { data: wasteLogs } = useLiveShared('waste_logs', { order: '-createdAt', limit: 100 })
  const { data: transfers } = useLiveShared('stock_transfers', { order: '-created_at', limit: 50 })
  const [subTab, setSubTab] = useState('ingredients')
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [val1, setVal1] = useState('')
  const [val2, setVal2] = useState('جم')
  const [valCost, setValCost] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [recIng, setRecIng] = useState('')
  const [recQty, setRecQty] = useState('')

  const [editIng, setEditIng] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [editRec, setEditRec] = useState(null)

  const [auditIngId, setAuditIngId] = useState('')
  const [actualQty, setActualQty] = useState('')
  const [auditSentMsg, setAuditSentMsg] = useState(false)
  const [wasteIngId, setWasteIngId] = useState('')
  const [wasteQty, setWasteQty] = useState('')
  const [wasteReason, setWasteReason] = useState('تالف / انتهاء صلاحية')

  const branchesList = settings?.branches || ['الفرع الرئيسي - صلالة']
  const [trFrom, setTrFrom] = useState(branchesList.at(0) || 'الفرع الرئيسي - صلالة')
  const [trTo, setTrTo] = useState(branchesList.at(1) || branchesList.at(0) || '')
  const [trIngId, setTrIngId] = useState('')
  const [trQty, setTrQty] = useState('')

  const selectedAuditIng = ingredients.find((i) => i.id === auditIngId)
  const auditDiff = selectedAuditIng && actualQty !== '' ? Number(actualQty) - Number(selectedAuditIng.stock || 0) : null

  async function handleStocktake(e) {
    e.preventDefault()
    if (!selectedAuditIng || actualQty === '') return
    const newStock = Number(actualQty)
    const diff = newStock - Number(selectedAuditIng.stock || 0)
    await db.updateShared('ingredients', selectedAuditIng.id, { stock: newStock })
    if (diff !== 0) {
      const loss = diff < 0 ? Math.abs(diff) * Number(selectedAuditIng.cost || 0) : 0
      await db.insertShared('waste_logs', {
        ingredient_id: selectedAuditIng.id,
        ingredient_name: selectedAuditIng.name,
        qty: diff,
        unit: selectedAuditIng.unit,
        cost_loss: loss,
        reason: diff < 0 ? 'عجز جرد فعلي' : 'فائض جرد فعلي',
        date: todayStr(),
      })
    }
    setAuditIngId(''); setActualQty('')
    if (!isManager && features.blindStocktake) {
      setAuditSentMsg(true)
      setTimeout(() => setAuditSentMsg(false), 3500)
    }
  }

  async function handleAddWaste(e) {
    e.preventDefault()
    const ing = ingredients.find((i) => i.id === wasteIngId)
    if (!ing || !wasteQty) return
    const q = Number(wasteQty)
    const loss = q * Number(ing.cost || 0)
    await db.incrementShared('ingredients', ing.id, 'stock', -q)
    await db.insertShared('waste_logs', {
      ingredient_id: ing.id,
      ingredient_name: ing.name,
      qty: -q,
      unit: ing.unit,
      cost_loss: loss,
      reason: wasteReason,
      date: todayStr(),
    })
    setWasteIngId(''); setWasteQty('')
  }

  async function handleTransfer(e) {
    e.preventDefault()
    const ing = ingredients.find((i) => i.id === trIngId)
    if (!ing || !trQty || trFrom === trTo) return alert('اختر الخامة وتأكد من اختلاف الفرع المرسل والمستلم')
    await db.insertShared('stock_transfers', {
      from_branch: trFrom,
      to_branch: trTo,
      ingredient_name: ing.name,
      qty: Number(trQty),
      unit: ing.unit,
      date: todayStr(),
      status: 'completed',
      created_at: new Date().toISOString(),
    })
    setTrIngId(''); setTrQty('')
  }

  async function addIngredient(e) {
    e.preventDefault()
    if (!name) return
    await db.insertShared('ingredients', { name, stock: Number(val1 || 0), unit: val2, cost: Number(valCost || 0), prev_cost: 0, minStock: 500 })
    setName(''); setVal1(''); setValCost('')
  }

  async function saveEditIng(e) {
    e.preventDefault()
    if (!editIng) return
    const oldIng = ingredients.find((x) => x.id === editIng.id)
    const oldCost = Number(oldIng?.cost || 0)
    const newCost = Number(editIng.cost || 0)
    await db.updateShared('ingredients', editIng.id, {
      name: editIng.name,
      stock: Number(editIng.stock || 0),
      unit: editIng.unit,
      cost: newCost,
      ...(oldCost > 0 && newCost > 0 && Math.abs(newCost - oldCost) > 0.00001 ? { prev_cost: oldCost } : {}),
      minStock: Number(editIng.minStock || 500),
    })
    setEditIng(null)
  }

  async function addItem(e) {
    e.preventDefault()
    if (!name) return
    await db.insertShared('items', { name, price: Number(val1 || 0), category: val2 || 'عام', out_of_stock: false })
    setName(''); setVal1('')
  }

  async function saveEditItem(e) {
    e.preventDefault()
    if (!editItem) return
    await db.updateShared('items', editItem.id, {
      name: editItem.name,
      price: Number(editItem.price || 0),
      category: editItem.category || 'عام',
    })
    setEditItem(null)
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

  async function saveEditRecipe(e) {
    e.preventDefault()
    if (!editRec) return
    const cleanLines = (editRec.lines || []).filter((l) => Number(l.qty) > 0)
    await db.updateShared('recipes', editRec.id, { lines: cleanLines })
    setEditRec(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl shadow-sm w-fit">
          <button onClick={() => { setSubTab('ingredients'); setSearch('') }} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${subTab === 'ingredients' ? 'bg-[#123B36] text-white' : ''}`}>{lang === 'en' ? `Ingredients (${ingredients.length})` : `الجرد والخامات (${ingredients.length})`}</button>
          <button onClick={() => { setSubTab('items'); setSearch('') }} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${subTab === 'items' ? 'bg-[#123B36] text-white' : ''}`}>{lang === 'en' ? `Menu Items (${items.length})` : `أصناف المنيو (${items.length})`}</button>
          <button onClick={() => { setSubTab('recipes'); setSearch('') }} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${subTab === 'recipes' ? 'bg-[#123B36] text-white' : ''}`}>{lang === 'en' ? `Recipes (${recipes.length})` : `الرسبي والوصفات (${recipes.length})`}</button>
          <button onClick={() => { setSubTab('waste'); setSearch('') }} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${subTab === 'waste' ? 'bg-amber-600 text-white' : 'text-amber-900 bg-amber-50'}`}>{lang === 'en' ? 'Stocktake & Waste' : 'الجرد الفعلي والهالك'}</button>
          {features.branchTransfers && (
            <button onClick={() => { setSubTab('transfers'); setSearch('') }} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${subTab === 'transfers' ? 'bg-blue-700 text-white' : 'text-blue-900 bg-blue-50'}`}>{lang === 'en' ? 'Branch Transfers' : 'التحويل بين الفروع'}</button>
          )}
        </div>
        {subTab !== 'waste' && subTab !== 'transfers' && <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={lang === 'en' ? 'Quick search...' : 'بحث سريع في القائمة...'} className="bg-white px-3.5 py-2 rounded-xl text-xs shadow-sm outline-none min-w-[200px]" />}
      </div>

      {subTab === 'ingredients' && (
        <div className="bg-white p-3.5 rounded-2xl shadow-sm space-y-3">
          <form onSubmit={addIngredient} className="flex flex-wrap gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === 'en' ? 'New ingredient name...' : 'اسم الخامة الجديدة...'} className="flex-1 min-w-[140px] bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none" />
            <input type="number" step="any" value={val1} onChange={(e) => setVal1(e.target.value)} placeholder={lang === 'en' ? 'Stock' : 'الرصيد'} className="w-20 bg-[#F4F1EA] px-2.5 py-2 rounded-xl text-xs outline-none" />
            <select value={val2} onChange={(e) => setVal2(e.target.value)} className="bg-[#F4F1EA] px-2.5 py-2 rounded-xl text-xs outline-none font-bold">
              <option value="جم">جم</option>
              <option value="مل">مل</option>
              <option value="حبة">حبة</option>
            </select>
            <input type="number" step="any" value={valCost} onChange={(e) => setValCost(e.target.value)} placeholder={lang === 'en' ? 'Unit Cost' : 'سعر الوحدة'} className="w-24 bg-[#F4F1EA] px-2.5 py-2 rounded-xl text-xs outline-none" />
            <button className="bg-[#123B36] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1"><Plus size={14} /> {lang === 'en' ? 'Add' : 'إضافة'}</button>
          </form>

          {editIng && (
            <form onSubmit={saveEditIng} className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl flex flex-wrap items-center gap-2 text-xs">
              <span className="font-extrabold text-amber-900">{lang === 'en' ? 'Edit:' : 'تعديل خامة:'}</span>
              <input value={editIng.name} onChange={(e) => setEditIng({ ...editIng, name: e.target.value })} className="flex-1 min-w-[120px] bg-white px-2 py-1 rounded-lg border font-bold" />
              <input type="number" step="any" value={editIng.stock} onChange={(e) => setEditIng({ ...editIng, stock: e.target.value })} placeholder="الرصيد" className="w-20 bg-white px-2 py-1 rounded-lg border font-bold" />
              <select value={editIng.unit} onChange={(e) => setEditIng({ ...editIng, unit: e.target.value })} className="bg-white px-2 py-1 rounded-lg border font-bold">
                <option value="جم">جم</option>
                <option value="مل">مل</option>
                <option value="حبة">حبة</option>
              </select>
              <input type="number" step="any" value={editIng.cost || 0} onChange={(e) => setEditIng({ ...editIng, cost: e.target.value })} placeholder="سعر الوحدة" className="w-24 bg-white px-2 py-1 rounded-lg border font-bold text-amber-800" />
              <input type="number" step="any" value={editIng.minStock || 500} onChange={(e) => setEditIng({ ...editIng, minStock: e.target.value })} placeholder="حد التنبيه" className="w-20 bg-white px-2 py-1 rounded-lg border" />
              <button type="submit" className="bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold">{lang === 'en' ? 'Save' : 'حفظ'}</button>
              <button type="button" onClick={() => setEditIng(null)} className="bg-white px-2.5 py-1 rounded-lg border">{lang === 'en' ? 'Cancel' : 'إلغاء'}</button>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[520px] overflow-y-auto">
            {ingredients.filter((i) => !search || i.name.includes(search)).map((ing) => {
              const cost = Number(ing.cost || 0)
              const prevCost = Number(ing.prev_cost || 0)
              const diffPct = (cost > 0 && prevCost > 0 && Math.abs(cost - prevCost) > 0.00001) ? Math.round(((cost - prevCost) / prevCost) * 100) : 0
              return (
                <div key={ing.id} className="bg-[#F4F1EA] p-2 rounded-xl text-[11px] flex flex-col justify-between gap-1.5 border border-[#123B36]/10">
                  <div>
                    <div className="font-extrabold text-xs text-[#123B36] truncate" title={ing.name}>{ing.name}</div>
                    <div className="text-[#123B36]/75 mt-0.5">
                      {lang === 'en' ? 'Stock:' : 'الرصيد:'} <span className="font-extrabold text-[#123B36]">{ing.stock} {ing.unit}</span>
                    </div>
                    <div className="text-amber-800 font-bold mt-0.5 flex flex-wrap items-center gap-1">
                      <span>{lang === 'en' ? 'Cost:' : 'السعر:'} {cost > 0 ? `${cost.toFixed(4)} ${currency}/${ing.unit}` : (lang === 'en' ? 'Not set' : 'غير محدد')}</span>
                      {diffPct !== 0 && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${diffPct > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {diffPct > 0 ? `↑+${diffPct}%` : `↓${diffPct}%`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-[#123B36]/10">
                    <button onClick={() => setEditIng({ ...ing })} className="bg-white text-[#123B36] px-2 py-0.5 rounded-md font-bold text-[10px] border border-[#123B36]/15">{lang === 'en' ? 'Edit' : 'تعديل'}</button>
                    <button onClick={() => db.deleteShared('ingredients', ing.id)} className="text-red-500 p-0.5"><Trash2 size={13} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {subTab === 'items' && (
        <div className="bg-white p-3.5 rounded-2xl shadow-sm space-y-3">
          <form onSubmit={addItem} className="flex flex-wrap gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === 'en' ? 'Menu item name...' : 'اسم الصنف في المنيو...'} className="flex-1 min-w-[140px] bg-[#F4F1EA] px-3 py-2 rounded-xl text-xs outline-none" />
            <input type="number" step="0.001" value={val1} onChange={(e) => setVal1(e.target.value)} placeholder={lang === 'en' ? 'Price' : 'السعر'} className="w-20 bg-[#F4F1EA] px-2.5 py-2 rounded-xl text-xs outline-none" />
            <input value={val2} onChange={(e) => setVal2(e.target.value)} placeholder={lang === 'en' ? 'Category' : 'الفئة (مثلاً: موهيتو)'} className="w-32 bg-[#F4F1EA] px-2.5 py-2 rounded-xl text-xs outline-none" />
            <button className="bg-[#123B36] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1"><Plus size={14} /> {lang === 'en' ? 'Add' : 'إضافة'}</button>
          </form>

          {editItem && (
            <form onSubmit={saveEditItem} className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl flex flex-wrap items-center gap-2 text-xs">
              <span className="font-extrabold text-amber-900">{lang === 'en' ? 'Edit:' : 'تعديل صنف:'}</span>
              <input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className="flex-1 min-w-[130px] bg-white px-2 py-1 rounded-lg border font-bold" />
              <input type="number" step="0.001" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: e.target.value })} className="w-20 bg-white px-2 py-1 rounded-lg border font-bold" />
              <input value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })} className="w-28 bg-white px-2 py-1 rounded-lg border font-bold" />
              <button type="submit" className="bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold">{lang === 'en' ? 'Save' : 'حفظ'}</button>
              <button type="button" onClick={() => setEditItem(null)} className="bg-white px-2.5 py-1 rounded-lg border">{lang === 'en' ? 'Cancel' : 'إلغاء'}</button>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[520px] overflow-y-auto">
            {items.filter((i) => !search || i.name.includes(search) || (i.category || '').includes(search)).map((it) => (
              <div key={it.id} className={`p-2 rounded-xl text-[11px] flex flex-col justify-between gap-1 border ${it.out_of_stock ? 'bg-red-50/70 border-red-200 opacity-75' : 'bg-[#F4F1EA] border-[#123B36]/10'}`}>
                <div>
                  <div className="font-extrabold text-xs truncate" title={it.name}>{it.name}</div>
                  <div className="text-[#123B36]/65 text-[10px] truncate">{it.category} • <span className="font-extrabold text-amber-800">{fmt(it.price)} {currency}</span></div>
                </div>
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#123B36]/10">
                  {features.itemAvailability ? (
                    <button
                      onClick={() => db.updateShared('items', it.id, { out_of_stock: !it.out_of_stock })}
                      className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${it.out_of_stock ? 'bg-red-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}
                    >
                      {it.out_of_stock ? (lang === 'en' ? 'Out' : 'نفد ✕') : (lang === 'en' ? 'Active' : 'متوفر ✓')}
                    </button>
                  ) : <span />}
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditItem({ ...it })} className="bg-white text-[#123B36] px-2 py-0.5 rounded-md font-bold text-[10px] border border-[#123B36]/15">{lang === 'en' ? 'Edit' : 'تعديل'}</button>
                    <button onClick={() => db.deleteShared('items', it.id)} className="text-red-500 p-0.5"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'recipes' && (
        <div className="bg-white p-3.5 rounded-2xl shadow-sm space-y-3">
          <form onSubmit={addRecipeLine} className="flex flex-wrap gap-2">
            <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="flex-1 min-w-[140px] bg-[#F4F1EA] px-2.5 py-2 rounded-xl text-xs outline-none">
              <option value="">{lang === 'en' ? 'Select menu item...' : 'اختر الصنف من المنيو...'}</option>
              {items.map((it) => <option key={it.id} value={it.name}>{it.name}</option>)}
            </select>
            <select value={recIng} onChange={(e) => setRecIng(e.target.value)} className="flex-1 min-w-[130px] bg-[#F4F1EA] px-2.5 py-2 rounded-xl text-xs outline-none">
              <option value="">{lang === 'en' ? 'Select ingredient...' : 'اختر الخامة...'}</option>
              {ingredients.map((ing) => <option key={ing.id} value={ing.name}>{ing.name} ({ing.unit})</option>)}
            </select>
            <input type="number" step="any" value={recQty} onChange={(e) => setRecQty(e.target.value)} placeholder={lang === 'en' ? 'Qty' : 'الكمية'} className="w-20 bg-[#F4F1EA] px-2.5 py-2 rounded-xl text-xs outline-none" />
            <button className="bg-[#123B36] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1"><Plus size={14} /> {lang === 'en' ? 'Add' : 'إضافة للوصفة'}</button>
          </form>

          {editRec && (
            <form onSubmit={saveEditRecipe} className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl space-y-2 text-xs">
              <div className="font-extrabold text-amber-900">{lang === 'en' ? 'Edit Recipe:' : 'تعديل مقادير:'} {editRec.itemName}</div>
              <div className="space-y-1">
                {(editRec.lines || []).map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex-1 font-bold">{line.name}</span>
                    <input type="number" step="any" value={line.qty} onChange={(e) => { const updated = [...editRec.lines]; updated[idx] = { ...line, qty: e.target.value }; setEditRec({ ...editRec, lines: updated }) }} className="w-20 bg-white px-2 py-1 rounded-lg border font-bold" />
                    <button type="button" onClick={() => setEditRec({ ...editRec, lines: editRec.lines.filter((_, i) => i !== idx) })} className="text-red-500 p-1"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-bold">{lang === 'en' ? 'Save' : 'حفظ'}</button>
                <button type="button" onClick={() => setEditRec(null)} className="bg-white px-2.5 py-1 rounded-lg border">{lang === 'en' ? 'Cancel' : 'إلغاء'}</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[520px] overflow-y-auto">
            {recipes.filter((r) => !search || r.itemName.includes(search)).map((rec) => (
              <div key={rec.id} className="bg-[#F4F1EA] p-2 rounded-xl text-[11px] flex flex-col justify-between gap-1 border border-[#123B36]/10">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-xs text-[#123B36] truncate">{rec.itemName}</span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => setEditRec(JSON.parse(JSON.stringify(rec)))} className="bg-white text-[#123B36] px-1.5 py-0.5 rounded font-bold text-[10px] border border-[#123B36]/15">{lang === 'en' ? 'Edit' : 'تعديل'}</button>
                      <button onClick={() => db.deleteShared('recipes', rec.id)} className="text-red-500 p-0.5"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#123B36]/75 mt-1 leading-snug">{(rec.lines || []).map((l) => `${l.name} (${l.qty})`).join(' • ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'waste' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <form onSubmit={handleStocktake} className="bg-white p-4 rounded-2xl shadow-sm space-y-3 text-xs">
            <h3 className="font-extrabold text-sm text-[#123B36]">
              {(!isManager && features.blindStocktake) ? '1. الجرد الفعلي الأعمى (أدخل الكمية المعدودة فقط)' : '1. الجرد الفعلي وحساب العجز / الفائض'}
            </h3>
            <div>
              <label className="block font-bold mb-1">اختر الخامة لجردها:</label>
              <select value={auditIngId} onChange={(e) => { setAuditIngId(e.target.value); setActualQty('') }} className="w-full bg-[#F4F1EA] px-3 py-2.5 rounded-xl outline-none font-bold">
                <option value="">-- اختر الخامة --</option>
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} {(isManager || !features.blindStocktake) ? `(الدفتري: ${i.stock} ${i.unit})` : `(${i.unit})`}
                  </option>
                ))}
              </select>
            </div>
            {selectedAuditIng && (
              <div className="bg-[#F4F1EA] p-3 rounded-xl space-y-2">
                {(isManager || !features.blindStocktake) && (
                  <div className="flex justify-between"><span>الرصيد المسجل في النظام:</span><b>{selectedAuditIng.stock} {selectedAuditIng.unit}</b></div>
                )}
                <div>
                  <label className="block font-bold mb-1">الكمية الفعلية الموجودة على الرف ({selectedAuditIng.unit}):</label>
                  <input type="number" step="any" value={actualQty} onChange={(e) => setActualQty(e.target.value)} required className="w-full bg-white px-3 py-2 rounded-lg border font-bold" />
                </div>
                {(isManager || !features.blindStocktake) && auditDiff !== null && (
                  <div className={`p-2 rounded-lg font-extrabold text-center ${auditDiff < 0 ? 'bg-red-100 text-red-700' : auditDiff > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                    {auditDiff < 0 ? `يوجد عجز: ${auditDiff} ${selectedAuditIng.unit}` : auditDiff > 0 ? `يوجد فائض: +${auditDiff} ${selectedAuditIng.unit}` : 'الرصيد مطابق تماماً (0 فرق)'}
                  </div>
                )}
              </div>
            )}
            {auditSentMsg && <div className="text-emerald-700 font-extrabold bg-emerald-50 p-2 rounded-lg">✓ تم إرسال نتيجة الجرد الفعلي للمالك بنجاح!</div>}
            <button type="submit" className="w-full bg-[#123B36] text-white py-2.5 rounded-xl font-extrabold">
              {(!isManager && features.blindStocktake) ? 'إرسال نتيجة الجرد للمالك' : 'اعتماد الجرد وتسوية الرصيد'}
            </button>
          </form>

          <form onSubmit={handleAddWaste} className="bg-white p-4 rounded-2xl shadow-sm space-y-3 text-xs">
            <h3 className="font-extrabold text-sm text-red-700">2. تسجيل تالف / هالك / ضيافة</h3>
            <div>
              <label className="block font-bold mb-1">الخامة التالفة:</label>
              <select value={wasteIngId} onChange={(e) => setWasteIngId(e.target.value)} required className="w-full bg-[#F4F1EA] px-3 py-2.5 rounded-xl outline-none font-bold">
                <option value="">-- اختر الخامة --</option>
                {ingredients.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold mb-1">الكمية التالفة:</label>
                <input type="number" step="any" value={wasteQty} onChange={(e) => setWasteQty(e.target.value)} required className="w-full bg-[#F4F1EA] px-3 py-2 rounded-xl outline-none font-bold" />
              </div>
              <div>
                <label className="block font-bold mb-1">السبب:</label>
                <select value={wasteReason} onChange={(e) => setWasteReason(e.target.value)} className="w-full bg-[#F4F1EA] px-3 py-2 rounded-xl outline-none font-bold">
                  <option value="تالف / انتهاء صلاحية">تالف / انتهاء صلاحية</option>
                  <option value="انسكاب / خطأ تحضير">انسكاب / خطأ تحضير</option>
                  <option value="ضيافة مجانية">ضيافة مجانية</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-2.5 rounded-xl font-extrabold">خصم التالف من المخزون</button>
          </form>

          {(isManager || !features.blindStocktake) && (
            <div className="lg:col-span-2 bg-white p-4 rounded-2xl shadow-sm space-y-2 text-xs">
              <h3 className="font-extrabold text-sm">سجل تسويات الجرد والهالك</h3>
              <div className="max-h-56 overflow-y-auto space-y-1.5">
                {(wasteLogs || []).map((w) => (
                  <div key={w.id} className="flex justify-between items-center bg-[#F4F1EA] px-3 py-2 rounded-xl">
                    <div>
                      <span className="font-extrabold">{w.ingredient_name}</span> • <span className="text-[#123B36]/70">{w.reason} ({w.date})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-extrabold ${Number(w.qty) < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{Number(w.qty) > 0 ? `+${w.qty}` : w.qty} {w.unit}</span>
                      {Number(w.cost_loss) > 0 && <span className="text-red-700 font-bold">(-{fmt(w.cost_loss)} {currency})</span>}
                      <button onClick={() => db.deleteShared('waste_logs', w.id)} className="text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'transfers' && features.branchTransfers && (
        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-[#123B36]">🔄 تحويل خامات من فرع إلى فرع</h3>
          <form onSubmit={handleTransfer} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <select value={trFrom} onChange={(e) => setTrFrom(e.target.value)} className="bg-[#F4F1EA] px-3 py-2 rounded-xl font-bold outline-none">
              {branchesList.map((b) => <option key={b} value={b}>من: {b}</option>)}
            </select>
            <select value={trTo} onChange={(e) => setTrTo(e.target.value)} className="bg-[#F4F1EA] px-3 py-2 rounded-xl font-bold outline-none">
              {branchesList.map((b) => <option key={b} value={b}>إلى: {b}</option>)}
            </select>
            <select value={trIngId} onChange={(e) => setTrIngId(e.target.value)} required className="bg-[#F4F1EA] px-3 py-2 rounded-xl font-bold outline-none">
              <option value="">اختر الخامة...</option>
              {ingredients.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
            </select>
            <input type="number" step="any" value={trQty} onChange={(e) => setTrQty(e.target.value)} placeholder="الكمية المحولة" required className="bg-[#F4F1EA] px-3 py-2 rounded-xl font-bold outline-none" />
            <button type="submit" className="bg-[#123B36] text-white py-2 rounded-xl font-extrabold">تسجيل التحويل</button>
          </form>

          {(transfers || []).length > 0 && (
            <div className="space-y-1.5 max-h-60 overflow-y-auto pt-2 border-t">
              {(transfers || []).map((t) => (
                <div key={t.id} className="flex justify-between items-center bg-[#F4F1EA] px-3 py-2 rounded-xl">
                  <div>
                    <span className="font-extrabold">{t.ingredient_name} ({t.qty} {t.unit})</span>
                    <span className="text-[#123B36]/70 mr-2">من <b>{t.from_branch}</b> إلى <b>{t.to_branch}</b> ({t.date})</span>
                  </div>
                  <button onClick={() => db.deleteShared('stock_transfers', t.id)} className="text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
              export function SettingsScreen({ settings, lang = 'ar' }) {
  const { data: items } = useLiveShared('items')
  const { data: ingredients } = useLiveShared('ingredients')
  const { data: recipes } = useLiveShared('recipes')
  const [shopName, setShopName] = useState(settings?.shopName || 'نيوم')
  const [currency, setCurrency] = useState(settings?.currency || 'ر.ع')
  const [seeding, setSeeding] = useState(false)
  const [seedDone, setSeedDone] = useState(false)

  const defaultFeatures = {
    fraudDetection: true,
    blindStocktake: true,
    snapExpense: true,
    itemAvailability: true,
    offlineMode: true,
    auditTrail: true,
    branchTransfers: true,
    branchCompare: true,
    fixedCosts: false,
    smartReorder: true,
    branches: true,
    barista: true,
    loyalty: true,
    qrMenu: true,
    holdDiscount: true,
    shifts: true,
    expiryCredit: true,
    analytics: true,
    quickCash: true,
    feedback: true,
    coupons: true,
    modifiers: true,
    splitPay: true,
    rushMode: true,
    stamps: true,
    happyHour: false,
    deadStock: true,
    menuEng: true,
  }

  const [features, setFeatures] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('neom_features') || 'null')
      if (s) return { ...defaultFeatures, ...s }
    } catch {}
    return { ...defaultFeatures, ...(settings?.features || {}) }
  })

  const [branches, setBranches] = useState(() => settings?.branches || ['الفرع الرئيسي - صلالة'])
  const [newBranchName, setNewBranchName] = useState('')

  const [coupons, setCoupons] = useState(() => settings?.coupons || [])
  const [cCode, setCCode] = useState('')
  const [cType, setCType] = useState('percent')
  const [cVal, setCVal] = useState('')

  const [staff, setStaff] = useState(() => getStaffList())
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffPin, setNewStaffPin] = useState('')
  const [newStaffRole, setNewStaffRole] = useState('cashier')

  async function syncSettingsPayload(nextFeatures, nextCoupons, nextBranches) {
    const payload = { shopName, currency, features: nextFeatures, coupons: nextCoupons, branches: nextBranches }
    if (settings?.id) {
      await db.updateShared('settings', settings.id, payload)
    } else {
      await db.insertShared('settings', { id: 'main', ...payload })
    }
  }

  async function toggleFeature(key) {
    const next = { ...features, [key]: !features[key] }
    setFeatures(next)
    localStorage.setItem('neom_features', JSON.stringify(next))
    await syncSettingsPayload(next, coupons, branches)
  }

  async function handleAddBranch(e) {
    e.preventDefault()
    if (!newBranchName.trim()) return
    const next = [...branches, newBranchName.trim()]
    setBranches(next)
    setNewBranchName('')
    await syncSettingsPayload(features, coupons, next)
  }

  async function handleDeleteBranch(bName) {
    if (branches.length <= 1) return alert('يجب بقاء فرع واحد على الأقل في النظام!')
    if (!confirm(`هل تريد إغلاق وحذف "${bName}" من قائمة الفروع النشطة؟`)) return
    const next = branches.filter((b) => b !== bName)
    setBranches(next)
    await syncSettingsPayload(features, coupons, next)
  }

  async function handleAddCoupon(e) {
    e.preventDefault()
    if (!cCode.trim() || !cVal) return
    const next = [...coupons, { id: Date.now(), code: cCode.trim().toUpperCase(), type: cType, value: Number(cVal), active: true }]
    setCoupons(next)
    setCCode(''); setCVal('')
    await syncSettingsPayload(features, next, branches)
  }

  async function handleDeleteCoupon(id) {
    const next = coupons.filter((c) => c.id !== id)
    setCoupons(next)
    await syncSettingsPayload(features, next, branches)
  }

  const featureLabels = [
    { key: 'fraudDetection', title: '🚨 كشف التلاعب بالخصومات والمرتجعات (Fraud Detection)', desc: 'تنبيه سري للمالك عند تكرار الخصومات اليدوية أو عجز الصندوق أو حذف الفواتير' },
    { key: 'blindStocktake', title: '🙈 نظام الجرد الأعمى (Blind Stocktake)', desc: 'إخفاء الرصيد الدفتري والفروقات عن الموظفين أثناء الجرد وكشفها للمالك فقط لمنع التلاعب' },
    { key: 'snapExpense', title: '📸 تصوير المصروفات بالكاميرا (Snap & Record)', desc: 'التقاط صورة فاتورة المشتريات أو الصيانة بالكاميرا وحفظ الإيصال في لوحة المالك' },
    { key: 'itemAvailability', title: '🚫 إخفاء الأصناف المؤقت عن بُعد (Out of Stock)', desc: 'زر سريع لإخفاء أي صنف نفدت مكوناته من الكاشير ومنيو الباركود بضغطة زر' },
    { key: 'branchTransfers', title: '🔄 التحويل المخزني بين الفروع (Stock Transfers)', desc: 'نقل وتحويل الخامات من فرع إلى آخر بضغطة زر مع سجل الاستلام والتسليم' },
    { key: 'branchCompare', title: '⚖️ مقارنة أداء الفروع (Branch Comparison)', desc: 'جدول يقارن الفروع جنباً إلى جنب من حيث المبيعات، نسبة التكلفة، الهدر، وصافي الربح' },
    { key: 'offlineMode', title: '📡 العمل بدون إنترنت والمزامنة التلقائية (Offline Mode)', desc: 'استمرار البيع وحفظ الفواتير محلياً عند انقطاع الشبكة ثم رفعها تلقائياً عند عودة الاتصال' },
    { key: 'auditTrail', title: '🛡️ سجل المراقبة الدقيق (Audit Trail)', desc: 'تسجيل كل عملية حذف فاتورة أو خصم أو تعديل مخزون باسم الموظف والوقت الدقيق' },
    { key: 'rushMode', title: '⚡ وضع الازدحام السريع (Rush Mode)', desc: 'زر في الكاشير لتسريع الطلبات بلمسة واحدة وإخفاء الخيارات الثانوية وقت الذروة' },
    { key: 'modifiers', title: '🥤 خيارات وإضافات المشروبات (Modifiers)', desc: 'اختيار الحجم، نوع الحليب، مستوى السكر، أو إكسترا شوت عند طلب المشروب' },
    { key: 'splitPay', title: '💳 الدفع المزدوج وتقسيم الفاتورة (Split Payment)', desc: 'السماح للزبون بدفع جزء من الفاتورة نقداً والباقي بالبطاقة أو التحويل' },
    { key: 'stamps', title: '🎟️ بطاقة الطوابع الرقمية (اشترِ 7 والثامن مجاناً)', desc: 'تتبع عدد الأكواب للعميل برقم جواله ومنحه مشروباً مجانياً عند اكتمال البطاقة' },
    { key: 'happyHour', title: '⏰ عروض ساعات السعادة (Happy Hour)', desc: 'تفعيل خصم تلقائي في أوقات محددة من اليوم لتنشيط المبيعات' },
    { key: 'deadStock', title: '📦 تنبيه ركود الأصناف والخامات (Dead Stock)', desc: 'تنبيه في لوحة المالك بالأصناف والخامات التي لم تُبع أو تُستخدم منذ 15 يوماً' },
    { key: 'menuEng', title: '⭐ هندسة المنيو وتحليل ساعات الذروة', desc: 'تصنيف الأصناف وعرض أكثر ساعات اليوم ازدحاماً في لوحة المالك' },
    { key: 'fixedCosts', title: '💼 الرواتب والتكاليف الثابتة لكل فرع', desc: 'تسجيل رواتب الموظفين والإيجارات الشهرية لحساب صافي الربح النهائي بدقة' },
    { key: 'smartReorder', title: '🧠 تنبيهات إعادة الطلب الذكية (Smart Reorder)', desc: 'حساب معدل الاستهلاك اليومي للخامات والتنبيه قبل النفاد' },
    { key: 'branches', title: '🏪 إدارة الفروع المتعددة (Multi-Branch)', desc: 'إضافة فروع جديدة أو إغلاق فرع قديم وفلترة الأرباح حسب كل فرع' },
    { key: 'quickCash', title: '💵 حاسبة الباقي السريعة (1، 5، 10، 20 ر.ع)', desc: 'أزرار فئات الريال العماني لحساب المتبقي للزبون عند الدفع نقداً' },
    { key: 'coupons', title: '🏷️ كوبونات الخصم الترويجية (Promo Codes)', desc: 'إنشاء أكواد خصم للمواسم والمؤثرين وتطبيقها في الكاشير' },
    { key: 'barista', title: '☕ شاشة تحضير الباريستا المباشرة (KDS)', desc: 'تبويب خاص لعرض الطلبات للباريستا مع زر تم التحضير' },
    { key: 'loyalty', title: '🏆 نظام نقاط الولاء وعملاء VIP', desc: 'تجميع نقاط العملاء في الكاشير وعرض قائمتهم في لوحة المالك' },
    { key: 'qrMenu', title: '📱 منيو الباركود وطلبات الطاولات (QR)', desc: 'زر إنشاء باركود الطاولات واستقبال طلبات الزبائن مباشرة' },
    { key: 'feedback', title: '⭐ تقييمات الزبائن السريعة', desc: 'نموذج تقييم يظهر للزبون بعد الطلب من الباركود ويصل للوحة المالك' },
    { key: 'holdDiscount', title: '⏸️ تعليق الطلبات والخصم اليدوي والملاحظات', desc: 'أزرار تعليق الفاتورة وعمل خصم يدوي وملاحظات التحضير' },
    { key: 'shifts', title: '🔐 نظام الورديات ومطابقة الصندوق', desc: 'زر فتح وإغلاق الوردية ومطابقة الكاش في الدرج' },
    { key: 'expiryCredit', title: '📅 البيع الآجل للموردين وتنبيهات الصلاحية', desc: 'تسجيل فواتير الموردين الآجلة وتاريخ انتهاء صلاحية الخامات' },
    { key: 'analytics', title: '📊 تحليلات المالك المتقدمة', desc: 'بطاقات الأصناف الأكثر مبيعاً وأداء الموظفين في الشاشة الرئيسية' },
  ]

  const PERM_OPTIONS = [
    { key: 'pos', label: lang === 'en' ? 'POS' : 'الكاشير' },
    { key: 'receiving', label: lang === 'en' ? 'Receiving' : 'استلام الخامات' },
    { key: 'inventory', label: lang === 'en' ? 'Inventory' : 'المخزن' },
    { key: 'dashboard', label: lang === 'en' ? 'Dashboard' : 'الأرباح والتقارير' },
    { key: 'discount', label: lang === 'en' ? 'Discount' : 'منح خصم' },
    { key: 'settings', label: lang === 'en' ? 'Settings' : 'الإعدادات' },
  ]
  const [newStaffPerms, setNewStaffPerms] = useState({ pos: true, receiving: false, inventory: false, dashboard: false, discount: false, settings: false })

  function handleAddStaff(e) {
    e.preventDefault()
    if (!newStaffName.trim() || !newStaffPin.trim()) return
    const perms = newStaffRole === 'manager'
      ? { pos: true, receiving: true, inventory: true, dashboard: true, discount: true, settings: true }
      : newStaffPerms
    const updated = [...staff, { id: `staff-${Date.now()}`, displayName: newStaffName.trim(), pin: newStaffPin.trim(), role: newStaffRole, perms }]
    setStaff(updated)
    saveStaffList(updated)
    setNewStaffName(''); setNewStaffPin('')
  }

  function toggleStaffPerm(staffId, permKey) {
    const updated = staff.map((st) => {
      if (st.id !== staffId) return st
      const basePerms = st.perms || (st.role === 'manager'
        ? { pos: true, receiving: true, inventory: true, dashboard: true, discount: true, settings: true }
        : { pos: true, receiving: true, inventory: false, dashboard: false, discount: false, settings: false })
      return { ...st, role: 'cashier', perms: { ...basePerms, [permKey]: !basePerms[permKey] } }
    })
    setStaff(updated)
    saveStaffList(updated)
  }

  function handleDeleteStaff(id) {
    if (staff.length <= 1) return alert('يجب بقاء حساب واحد على الأقل في النظام!')
    const updated = staff.filter((s) => s.id !== id)
    setStaff(updated)
