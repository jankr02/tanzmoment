/** BullMQ queue name for email jobs */
export const EMAIL_QUEUE = 'email';

/** Job names */
export const EmailJobName = {
  SEND: 'send-email',
} as const;

/** Email subjects (German) */
export const EMAIL_SUBJECTS = {
  'booking-confirmed': 'Buchungsbestätigung – {{courseName}}',
  'booking-cancelled': 'Stornierungsbestätigung – {{courseName}}',
  'booking-cancelled-by-studio': 'Kursabsage – {{courseName}}',
  'waitlist-joined': 'Warteliste – {{courseName}}',
  'waitlist-promoted': '🎉 Platz frei! – {{courseName}}',
  'session-reminder': 'Erinnerung: Morgen {{courseName}}',
  'refund-processed': 'Erstattung veranlasst – {{courseName}}',
  'contact-form': 'Neue Kontaktanfrage: {{subject}}',
  'contact-confirmation': 'Wir haben deine Nachricht erhalten',
} as const;
