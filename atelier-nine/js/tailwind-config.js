tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: { 50:'#F1F7F3',100:'#E0EEE3',200:'#C2DCC8',300:'#97C2A1',400:'#63A175',500:'#3F8355',600:'#2C6A43',700:'#225237',800:'#1D432F',900:'#142E21' },
        sand: '#F7F6F2'
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        display: ['"Plus Jakarta Sans"','Inter','system-ui','sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.12)',
        lift: '0 12px 40px -16px rgba(16,24,40,.22)'
      }
    }
  }
};
