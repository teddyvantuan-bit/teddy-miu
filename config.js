/* Everything the couple may need to change later lives here. */
window.WEDDING_CONFIG = {
  // Google Apps Script web-app URL (ends with /exec). Empty = RSVP shows "coming soon".
  rsvpUrl: 'https://script.google.com/macros/s/AKfycbwHX7xUUgFF0frYiYrLGk_a9JRG1BukGQuKNtff9Y23mvmT3K866AgB4JMiwOUFf-Yr3Q/exec',

  // Map search text for each celebration. Replace with the exact address or a Google Maps link.
  maps: {
    bride: 'Nhà Văn Hóa Thôn Tân Quý, Xã Chiên Đàn, Đà Nẵng',
    groom: 'TDP Tống Văn, Phường Trần Lãm, Hưng Yên'
  },

  // Wedding gift (Mừng cưới). The gift button appears once an account number or QR image is filled in.
  gifts: [
    { side: 'bride', name: 'HUỲNH THỊ MỸ DUNG', bank: '', account: '', qr: '' },
    { side: 'groom', name: 'NGUYỄN VĂN TUẤN', bank: '', account: '', qr: '' }
  ]
};
