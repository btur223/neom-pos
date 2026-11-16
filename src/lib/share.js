export const share = { whatsapp(phone, text) { window.open(`https://wa.me{phone}?text=${encodeURIComponent(text)}`, '_blank') } }
