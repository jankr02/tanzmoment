/**
 * Database Seed Script
 *
 * Creates initial data for development and testing.
 * Run with: npx prisma db seed
 *
 * Test Accounts:
 * - Admin:      admin@tanzmoment.de / admin123
 * - Instructor: sarah@tanzmoment.de / sarah123
 * - Customer:   max@example.com / customer123
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =============================================================================
// ENUM VALUES (as strings to avoid import issues before prisma generate)
// =============================================================================

const UserRole = {
  CUSTOMER: 'CUSTOMER',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN: 'ADMIN',
} as const;

const CourseLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  ALL_LEVELS: 'ALL_LEVELS',
} as const;

// =============================================================================
// COURSE DATA
// =============================================================================

/**
 * Course definitions organized by dance style
 * Each course has sessions at both locations
 */
const COURSES_BY_STYLE = {
  // =========================================================================
  // AUSDRUCKSTANZ (Expressive Dance)
  // =========================================================================
  expressive: [
    {
      title: 'Ausdruckstanz – frei & verbunden',
      slug: 'ausdruckstanz-frei-verbunden',
      catchPhrase: 'Mein Tipp ...',
      shortDescription:
        'Deinen wahren Ausdruck findest du nicht im Spiegel, sondern in der Bewegung. Lass los und entdecke, was in dir tanzt.',
      description: `Ausdruckstanz ist Emotion in Bewegung. In diesem Kurs geht es nicht um perfekte Schritte, sondern um authentischen Ausdruck.

Wir arbeiten mit:
• Freier Improvisation und geführten Bewegungssequenzen
• Atemtechniken zur Körperwahrnehmung
• Musik verschiedener Genres als Inspirationsquelle
• Partner- und Gruppenübungen für Verbindung

Dieser Kurs ist perfekt für alle, die Tanz als Form der Selbsterfahrung entdecken möchten. Keine Vorkenntnisse nötig – nur die Bereitschaft, sich auf dich selbst einzulassen.`,
      danceStyle: 'expressive',
      targetGroup: 'Erwachsene jeden Alters',
      level: CourseLevel.ALL_LEVELS,
      maxParticipants: 12,
      priceInCents: 2500,
      duration: 90,
      imageUrl: '/assets/images/courses/expressive-frei.jpg',
      isPublished: true,
      isMarkedAsHighlighted: true, // Featured course
    },
    {
      title: 'Ausdruckstanz – Vertiefung',
      slug: 'ausdruckstanz-vertiefung',
      catchPhrase: 'Geh tiefer ...',
      shortDescription:
        'Für alle, die bereits erste Erfahrungen im Ausdruckstanz gesammelt haben und ihre Praxis vertiefen möchten.',
      description: `In diesem Aufbaukurs vertiefen wir die Grundlagen des Ausdruckstanzes und erkunden fortgeschrittene Techniken.

Schwerpunkte:
• Erweiterte Improvisationstechniken
• Choreografische Elemente
• Emotionale Tiefe und Ausdruck
• Performance-Vorbereitung

Voraussetzung: Grundkurs oder vergleichbare Erfahrung im freien Tanz.`,
      danceStyle: 'expressive',
      targetGroup: 'Fortgeschrittene',
      level: CourseLevel.INTERMEDIATE,
      maxParticipants: 10,
      priceInCents: 2800,
      duration: 90,
      imageUrl: '/assets/images/courses/expressive-vertiefung.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
  ],

  // =========================================================================
  // TANZEN FÜR KINDER (Kids Dance)
  // =========================================================================
  kids: [
    {
      title: 'Tanzmäuse (4-6 Jahre)',
      slug: 'tanzmaeuse-4-6',
      catchPhrase: 'Kinderleicht ...',
      shortDescription:
        'Spielerischer Einstieg in die Welt des Tanzes. Hier wird gelacht, gehüpft und die Freude an Bewegung entdeckt.',
      description: `Bei den Tanzmäusen steht der Spaß im Vordergrund! Durch spielerische Übungen und kindgerechte Musik entdecken die Kleinen ihren Körper und seine Möglichkeiten.

Was wir machen:
• Bewegungsspiele und Tanzgeschichten
• Rhythmusübungen mit Musik
• Kreative Improvisation
• Kleine Choreografien

Die Kinder entwickeln Körpergefühl, Koordination und Selbstvertrauen – ganz nebenbei und mit viel Freude!`,
      danceStyle: 'kids',
      targetGroup: 'Kinder 4-6 Jahre',
      level: CourseLevel.BEGINNER,
      maxParticipants: 12,
      priceInCents: 1500,
      duration: 45,
      imageUrl: '/assets/images/courses/kids-tanzmaeuse.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
    {
      title: 'Tanzfüchse (7-10 Jahre)',
      slug: 'tanzfuechse-7-10',
      catchPhrase: 'Werde zum Tanzfuchs ...',
      shortDescription:
        'Für kleine Tänzer:innen, die schon etwas mehr wollen. Erste Schritte, echte Choreografien und jede Menge Tanzspaß.',
      description: `Die Tanzfüchse lernen bereits erste "echte" Tanzschritte und arbeiten an kleinen Choreografien.

Kursinhalte:
• Grundlegende Tanztechniken
• Rhythmusgefühl und Musikalität
• Teamwork und Gruppenübungen
• Aufführungsvorbereitung

Der Kurs fördert nicht nur die motorischen Fähigkeiten, sondern auch Teamgeist und Selbstbewusstsein.`,
      danceStyle: 'kids',
      targetGroup: 'Kinder 7-10 Jahre',
      level: CourseLevel.BEGINNER,
      maxParticipants: 14,
      priceInCents: 1800,
      duration: 60,
      imageUrl: '/assets/images/courses/kids-tanzfuechse.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
    {
      title: 'Schnupperkurs – Alt oder Jung',
      slug: 'schnupperkurs-alt-jung',
      catchPhrase: 'Einfach mal ausprobieren ...',
      shortDescription:
        'Der perfekte Einstieg! Dieser Kurs richtet sich an jeden, der den ersten Tanzschritt wagen möchte – egal welches Alter.',
      description: `Du wolltest schon immer mal tanzen, hast dich aber nie getraut? Dieser Schnupperkurs ist deine Chance!

In entspannter Atmosphäre:
• Lernst du erste einfache Bewegungen
• Entdeckst du verschiedene Tanzstile
• Findest du heraus, was dir Spaß macht
• Triffst du Gleichgesinnte

Keine Vorkenntnisse nötig. Komm wie du bist!`,
      danceStyle: 'kids',
      targetGroup: 'Alle Altersgruppen',
      level: CourseLevel.BEGINNER,
      maxParticipants: 16,
      priceInCents: 1200,
      duration: 60,
      imageUrl: '/assets/images/courses/schnupperkurs.jpg',
      isPublished: true,
      isMarkedAsHighlighted: true, // Featured course
    },
  ],

  // =========================================================================
  // TANZEN MIT BEHINDERUNG (Accessible Dance)
  // =========================================================================
  accessible: [
    {
      title: 'Inklusiver Tanzkreis',
      slug: 'inklusiver-tanzkreis',
      catchPhrase: 'Gemeinsam bewegen ...',
      shortDescription:
        'Tanz für alle – angepasst an individuelle Bedürfnisse. Hier zählt die Freude an der Bewegung, nicht die Perfektion.',
      description: `Im inklusiven Tanzkreis ist jede:r willkommen, unabhängig von körperlichen oder geistigen Einschränkungen.

Unser Ansatz:
• Individuell angepasste Bewegungen
• Unterstützung durch erfahrene Assistenz
• Musik und Rhythmus als verbindende Elemente
• Gemeinschaft und Akzeptanz

Wir tanzen im Sitzen, Stehen oder in Bewegung – so wie es für dich passt. Das Wichtigste ist die Freude am gemeinsamen Erleben.`,
      danceStyle: 'accessible',
      targetGroup: 'Menschen mit und ohne Behinderung',
      level: CourseLevel.ALL_LEVELS,
      maxParticipants: 10,
      priceInCents: 2000,
      duration: 60,
      imageUrl: '/assets/images/courses/inclusive-tanzkreis.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
    {
      title: 'Rollstuhltanz',
      slug: 'rollstuhltanz',
      catchPhrase: 'Tanz kennt keine Grenzen ...',
      shortDescription:
        'Elegante Bewegungen auf Rädern. Entdecke, wie viel Ausdruck und Freude im Rollstuhltanz steckt.',
      description: `Rollstuhltanz ist eine anerkannte Tanzsportdisziplin, die Eleganz und Ausdruck mit Mobilität verbindet.

Was dich erwartet:
• Grundlagen des Rollstuhltanzes
• Koordination und Körpergefühl
• Partnerübungen (optional)
• Verschiedene Musikstile

Der Kurs ist sowohl für Rollstuhlfahrer:innen als auch für Fußgänger:innen als Tanzpartner:innen geeignet.`,
      danceStyle: 'accessible',
      targetGroup: 'Rollstuhlfahrer:innen & Partner:innen',
      level: CourseLevel.BEGINNER,
      maxParticipants: 8,
      priceInCents: 2200,
      duration: 75,
      imageUrl: '/assets/images/courses/rollstuhltanz.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
  ],

  // =========================================================================
  // TANZEN FÜR MÜTTER (Mothers Dance)
  // =========================================================================
  mothers: [
    {
      title: 'Mama tanzt – Zeit für mich',
      slug: 'mama-tanzt-zeit-fuer-mich',
      catchPhrase: 'Durchatmen & Bewegen ...',
      shortDescription:
        'Eine Auszeit vom Alltag – Bewegung, die Kraft gibt und den Alltag vergessen lässt. Zeit nur für dich.',
      description: `Als Mama kommt man selbst oft zu kurz. Dieser Kurs ist deine Zeit – zum Durchatmen, Bewegen und Kraft tanken.

Was dich erwartet:
• Sanfte bis dynamische Bewegungen
• Stressabbau durch Tanz
• Körperarbeit nach der Schwangerschaft
• Austausch mit anderen Müttern

Babys können mitgebracht werden (schlafend im Kinderwagen) oder du genießt die kinderfreie Zeit. Beides ist willkommen!`,
      danceStyle: 'mothers',
      targetGroup: 'Mütter (mit/ohne Baby)',
      level: CourseLevel.BEGINNER,
      maxParticipants: 10,
      priceInCents: 2200,
      duration: 75,
      imageUrl: '/assets/images/courses/mama-tanzt.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
    {
      title: 'Mama & Baby Tanz',
      slug: 'mama-baby-tanz',
      catchPhrase: 'Gemeinsam von Anfang an ...',
      shortDescription:
        'Tanzen mit deinem Baby – eine besondere Bindungszeit mit Bewegung, Musik und anderen Mamas.',
      description: `Dieser Kurs verbindet sanfte Bewegung mit wertvoller Bindungszeit zwischen dir und deinem Baby.

Kursinhalte:
• Babytragen-freundliche Choreografien
• Bewegungslieder und Fingerspiele
• Beckenbodenfreundliche Übungen
• Entspannungseinheiten

Geeignet für Babys von 3-12 Monaten. Stillen und Wickeln jederzeit möglich.`,
      danceStyle: 'mothers',
      targetGroup: 'Mütter mit Baby (3-12 Monate)',
      level: CourseLevel.BEGINNER,
      maxParticipants: 8,
      priceInCents: 2000,
      duration: 60,
      imageUrl: '/assets/images/courses/mama-baby.jpg',
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
  ],
};

// =============================================================================
// LOCATIONS
// =============================================================================

const LOCATIONS = ['Mössingen', 'Bodelshausen'];

// =============================================================================
// SEED FUNCTIONS
// =============================================================================

async function seedUsers() {
  console.log('👤 Creating users...');

  // Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tanzmoment.de' },
    update: {},
    create: {
      email: 'admin@tanzmoment.de',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });
  console.log('  ✅ Admin:', admin.email);

  // Instructor User
  const instructorPassword = await bcrypt.hash('sarah123', 10);
  const instructorUser = await prisma.user.upsert({
    where: { email: 'sarah@tanzmoment.de' },
    update: {},
    create: {
      email: 'sarah@tanzmoment.de',
      passwordHash: instructorPassword,
      firstName: 'Sarah',
      lastName: 'Müller',
      role: UserRole.INSTRUCTOR,
      emailVerified: true,
    },
  });
  console.log('  ✅ Instructor:', instructorUser.email);

  // Instructor Profile
  const instructor = await prisma.instructor.upsert({
    where: { userId: instructorUser.id },
    update: {},
    create: {
      userId: instructorUser.id,
      bio: 'Professionelle Tänzerin und Tanzpädagogin mit 15 Jahren Erfahrung. Ich liebe es, Menschen durch Bewegung zu inspirieren und ihre eigene Ausdrucksform zu finden. Mein Herz schlägt besonders für inklusiven Tanz.',
      expertise: [
        'Ausdruckstanz',
        'Inklusiver Tanz',
        'Kindertanz',
        'Improvisation',
      ],
      imageUrl: '/assets/images/instructors/sarah-mueller.jpg',
    },
  });
  console.log('  ✅ Instructor profile created');

  // Customer User
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'max@example.com' },
    update: {},
    create: {
      email: 'max@example.com',
      passwordHash: customerPassword,
      firstName: 'Max',
      lastName: 'Mustermann',
      phone: '+49 176 12345678',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });
  console.log('  ✅ Customer:', customer.email);

  return { admin, instructorUser, instructor, customer };
}

async function seedCourses(instructorId: string) {
  console.log('\n📚 Creating courses...');

  const allCourses = Object.values(COURSES_BY_STYLE).flat();
  let createdCount = 0;

  for (const courseData of allCourses) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: {
        ...courseData,
        instructorId,
      },
    });
    createdCount++;
    console.log(`  ✅ ${course.title} (${course.danceStyle})`);

    // Create sessions for each course
    await seedSessionsForCourse(course.id, course.duration);
  }

  console.log(`  📊 Total courses: ${createdCount}`);
}

async function seedSessionsForCourse(courseId: string, duration: number) {
  // Create sessions for the next 6 weeks at both locations
  const sessionsPerLocation = 3;

  for (const location of LOCATIONS) {
    for (let week = 0; week < sessionsPerLocation; week++) {
      const date = new Date();

      // Alternate days: Mössingen = Wednesday (3), Bodelshausen = Friday (5)
      const targetDay = location === 'Mössingen' ? 3 : 5;
      const daysUntilTarget = (targetDay - date.getDay() + 7) % 7 || 7;

      date.setDate(date.getDate() + daysUntilTarget + week * 7);

      // Alternate times based on course type
      const hour = week % 2 === 0 ? 17 : 19; // 17:00 or 19:00
      date.setHours(hour, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setMinutes(endDate.getMinutes() + duration);

      await prisma.session.create({
        data: {
          courseId,
          startTime: date,
          endTime: endDate,
          location,
        },
      });
    }
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('🌱 Starting database seed...\n');
  console.log('━'.repeat(50));

  // Seed users
  const { instructor } = await seedUsers();

  // Seed courses with sessions
  await seedCourses(instructor.id);

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log('🎉 Seeding completed successfully!\n');

  console.log('📊 Summary:');
  const courseCount = await prisma.course.count();
  const sessionCount = await prisma.session.count();
  const userCount = await prisma.user.count();

  console.log(`   • Users: ${userCount}`);
  console.log(`   • Courses: ${courseCount}`);
  console.log(`   • Sessions: ${sessionCount}`);

  console.log('\n🔐 Test Accounts:');
  console.log('━'.repeat(50));
  console.log('   Admin:      admin@tanzmoment.de / admin123');
  console.log('   Instructor: sarah@tanzmoment.de / sarah123');
  console.log('   Customer:   max@example.com / customer123');
  console.log('━'.repeat(50) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
