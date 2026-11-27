export async function scanDocumentOcr(file) {
  if (!file) return { text: '', items: [], firstItem: null, totalAmount: '' }

  if (!window.Tesseract) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://jsdelivr.net'
      s.onload = resolve
      s.onerror = reject
      document.head.appendChild(s)
    })
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const worker = await window.Tesseract.createWorker(['ara', 'eng'])
    const { data: { text } } = await worker.recognize(objectUrl)
    await worker.terminate()

    const rawLines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 1)
    const parsedItems = []
    let maxPrice = 0

    for (const line of rawLines) {
      const nums = (line.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => Number(n.replace(',', '.')))
      const cleanName = line.replace(/[\d.,]+/g, '').replace(/[^\u0600-\u06FFa-zA-Z\s]/g, '').trim()

      if (nums.length > 0) {
        const lastNum = nums[nums.length - 1]
        if (lastNum > maxPrice) maxPrice = lastNum
        if (cleanName.length >= 2) {
          parsedItems.push({
            name: cleanName,
            qty: nums.length >= 2 ? nums : 1,
            price: nums.length >= 2 ? nums[nums.length - 1] : 0,
          })
        }
      }
    }

    return {
      text,
      items: parsedItems,
      firstItem: parsedItems || null,
      totalAmount: maxPrice > 0 ? maxPrice.toFixed(3) : '',
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
