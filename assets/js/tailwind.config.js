/* ============================================================
   المحبة بلاست — Tailwind CDN configuration
   Loaded AFTER the Tailwind CDN script on every page:
   <script src="https://cdn.tailwindcss.com"></script>
   <script src="assets/js/tailwind.config.js"></script>
   ============================================================ */
tailwind.config = {
  theme: {
    extend: {
      /* Brand palette — deep industrial blue + vivid orange accent */
      colors: {
        primary: {
          DEFAULT: '#0B3C7A',   // deep blue — headings, buttons, links
          50:  '#EEF4FB',
          100: '#D8E6F5',
          200: '#B0CCE9',
          600: '#0B3C7A',
          700: '#092F61',
          800: '#071F3F'        // dark navy — footer, hero
        },
        navy:    '#071F3F',
        accent: {
          DEFAULT: '#FF7A1A',   // vivid orange — CTAs, highlights
          50:  '#FFF3E8',
          100: '#FFE3CC',
          600: '#F26A05',
          700: '#D65E04'
        },
        surface: '#F4F6F9',     // soft gray page background
        ink:     '#1F2937',     // body text
        muted:   '#5B6472'      // secondary text (AA on white)
      },
      /* IBM Plex Sans Arabic (AR body) + Alexandria (AR display) / Inter (EN) — toggled on <body> */
      fontFamily: {
        cairo: ['IBM Plex Sans Arabic', 'Tahoma', 'sans-serif'],
        inter: ['Inter', 'Segoe UI', 'sans-serif'],
        display: ['Alexandria', 'IBM Plex Sans Arabic', 'Tahoma', 'sans-serif']
      },
      maxWidth: { content: '1200px' },
      boxShadow: {
        card: '0 1px 2px rgba(7, 31, 63, 0.05), 0 8px 24px -8px rgba(7, 31, 63, 0.10)',
        lift: '0 2px 4px rgba(7, 31, 63, 0.06), 0 18px 40px -12px rgba(7, 31, 63, 0.20)',
        header: '0 2px 16px -6px rgba(7, 31, 63, 0.12)'
      },
      transitionTimingFunction: { smooth: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    }
  }
};