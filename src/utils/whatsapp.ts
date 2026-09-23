/**
 * WhatsApp Helper Utilities for BackToMe
 * Converts reporter phone numbers to direct wa.me chat links with pre-filled templates.
 */

export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return '6281234567890';
  
  // Remove non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // Replace leading 0 with Indonesia country code 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  // If no country code, prefix with 62
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
}

export function generateWhatsAppMessage(params: {
  reporterName: string;
  itemTitle: string;
  itemId?: string;
  userName?: string;
  proofDescription?: string;
}): string {
  const { reporterName, itemTitle, itemId, userName, proofDescription } = params;
  
  let msg = `Halo ${reporterName}, saya ${userName || 'pengguna BackToMe'}.`;
  msg += `\n\nSaya menghubungi Anda melalui aplikasi *BackToMe* terkait barang temuan: *${itemTitle}*`;
  if (itemId) {
    msg += ` (ID: #${itemId.slice(-5)})`;
  }
  
  if (proofDescription) {
    msg += `\n\n*Bukti/Ciri Kepemilikan yang Saya Miliki:*\n"${proofDescription}"`;
  }
  
  msg += `\n\nMohon konfirmasinya untuk jadwal pencocokan fisik bersama petugas keamanan/Satpam. Terima kasih.`;
  
  return msg;
}

export function getWhatsAppUrl(phone?: string, messageText?: string): string {
  const cleaned = cleanPhoneNumber(phone);
  const encoded = encodeURIComponent(messageText || 'Halo, saya menghubungi Anda terkait laporan barang temuan di aplikasi BackToMe.');
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

export function openWhatsAppRedirect(phone?: string, messageText?: string) {
  const url = getWhatsAppUrl(phone, messageText);
  window.open(url, '_blank', 'noopener,noreferrer');
}
