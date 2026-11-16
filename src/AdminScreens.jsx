import { useState, useMemo } from 'react'
import { Plus, Trash2, Send, AlertTriangle, Edit3, Sparkles, CheckCircle2, Receipt, BookOpen } from 'lucide-react'
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
  { name: 'بن إسبريسو', stock: 5000, unit: 'جم', cost: 0.012, minStock: 1000 },
  { name: 'بن مقطر V60', stock: 3000, unit: 'جم', cost: 0.018, minStock: 500 },
  { name: 'حليب طازج', stock: 20000, unit: 'مل', cost: 0.0006, minStock: 3000 },
  { name: 'حليب مكثف محلى', stock: 5000, unit: 'جم', cost: 0.002, minStock: 1000 },
  { name: 'سيروب بلوبيري', stock: 2000, unit: 'مل', cost: 0.004, minStock: 300 },
  { name: 'سيروب بلو كارساو', stock: 2000, unit: 'مل', cost: 0.004, minStock: 300 },
  { name: 'سيروب فراولة', stock: 2000, unit: 'مل', cost: 0.004, minStock: 300 },
  { name: 'سيروب باشن', stock: 2000, unit: 'مل', cost: 0.004, minStock: 300 },
  { name: 'صوص شوكليت', stock: 2000, unit: 'جم', cost: 0.005, minStock: 300 },
  { name: 'نوتيلا', stock: 2000, unit: 'جم', cost: 0.006, minStock: 300 },
  { name: 'لوتس', stock: 2000, unit: 'جم', cost: 0.006, minStock: 300 },
  { name: 'أوريو', stock: 2000, unit: 'جم', cost: 0.004, minStock: 300 },
  { name: 'شاي ورق', stock: 2000, unit: 'جم', cost: 0.003, minStock: 300 },
  { name: 'عسل نحل', stock: 2000, unit: 'جم', cost: 0.005, minStock: 300 },
  { name: 'أكواب ورقية', stock: 500, unit: 'حبة', cost: 0.025, minStock: 100 },
  { name: 'أكواب بلاستيك بارد', stock: 500, unit: 'حبة', cost: 0.030, minStock: 100 },
]

export function DashboardScreen({ invoices, ingredients, recipes, settings }) {
  const { data: expenses } = useLiveShared('expenses', { order: '-createdAt', limit: 100 })
  const [expTitle, setExpTitle] = useState('')
  const [expAmount, setExpAmount] = useState('')

  const today = todayStr()
  const todayInvoices = invoices.filter((i) => i.date === today)
