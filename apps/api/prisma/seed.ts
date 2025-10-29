import { PrismaClient, UserRole, CourseLevel } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Admin User
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
  console.log('✅ Admin user created:', admin.email);

  // 2. Instructor User
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
  console.log('✅ Instructor user created:', instructorUser.email);

  const instructor = await prisma.instructor.upsert({
    where: { userId: instructorUser.id },
    update: {},
    create: {
      userId: instructorUser.id,
      bio: 'Professionelle Tänzerin mit 15 Jahren Erfahrung in Contemporary und Modern Dance. Ich liebe es, Menschen durch Bewegung zu inspirieren und ihre eigene Ausdrucksform zu finden.',
      expertise: ['Contemporary', 'Modern', 'Improvisation', 'Floor Work'],
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    },
  });
  console.log('✅ Instructor profile created');

  // 3. Sample Courses mit ALLEN neuen Feldern
  const courses = [
    {
      title: 'Contemporary Dance – Basics',
      slug: 'contemporary-basics',
      catchPhrase: 'Finde deinen Flow',
      shortDescription:
        'Ein sanfter Einstieg in zeitgenössischen Tanz. Entdecke Bewegung, Atmung und Ausdruck.',
      description:
        'Ein sanfter Einstieg in die Welt des zeitgenössischen Tanzes. Wir erkunden Grundbewegungen, Atmung und den Fluss zwischen Boden und Stand. Perfekt für Anfänger:innen, die ihren Körper neu entdecken möchten. In diesem Kurs lernst du die Grundlagen der Contemporary-Technik kennen und entwickelst ein Gefühl für deinen eigenen Bewegungsstil.',
      danceStyle: 'Contemporary',
      targetGroup: 'Anfänger:innen ohne Vorkenntnisse',
      level: CourseLevel.BEGINNER,
      maxParticipants: 12,
      priceInCents: 2500,
      duration: 90,
      imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
      instructorId: instructor.id,
      isPublished: true,
      isMarkedAsHighlighted: true,
    },
    {
      title: 'Modern Dance – Intermediate',
      slug: 'modern-intermediate',
      catchPhrase: 'Vertiefe deine Technik',
      shortDescription:
        'Für Fortgeschrittene: Dynamik, Release-Technik und choreografische Sequenzen.',
      description:
        'Für alle, die bereits Tanzerfahrung haben und ihre Technik vertiefen möchten. Wir arbeiten an Dynamik, Release-Technik und choreografischen Sequenzen. Dieser Kurs ist perfekt für dich, wenn du bereits erste Erfahrungen im zeitgenössischen oder modernen Tanz gesammelt hast und deine Fähigkeiten auf das nächste Level bringen möchtest.',
      danceStyle: 'Modern',
      targetGroup: 'Tänzer:innen mit Vorkenntnissen',
      level: CourseLevel.INTERMEDIATE,
      maxParticipants: 10,
      priceInCents: 3000,
      duration: 90,
      imageUrl: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800',
      instructorId: instructor.id,
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
    {
      title: 'Improvisation & Flow',
      slug: 'improvisation-flow',
      catchPhrase: 'Lass los und tanze',
      shortDescription:
        'Freies Bewegen ohne Perfektion. Finde deine eigene Bewegungssprache.',
      description:
        'Frei bewegen, experimentieren, spielen. In diesem Kurs geht es um das Loslassen von Perfektion und das Finden der eigenen Bewegungssprache. Wir nutzen Improvisation als Werkzeug, um unseren Körper besser kennenzulernen und neue Bewegungsmöglichkeiten zu entdecken. Für alle Levels geeignet – jede:r ist willkommen!',
      danceStyle: 'Improvisation',
      targetGroup: 'Alle Levels – offen für jeden',
      level: CourseLevel.ALL_LEVELS,
      maxParticipants: 15,
      priceInCents: 2000,
      duration: 75,
      imageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800',
      instructorId: instructor.id,
      isPublished: true,
      isMarkedAsHighlighted: false,
    },
  ];

  for (const courseData of courses) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: courseData,
    });
    console.log('✅ Course created:', course.title);

    // Sessions erstellen (nächste 4 Wochen, Mittwoch 18:00)
    for (let week = 0; week < 4; week++) {
      const date = new Date();
      const daysUntilWednesday = (3 - date.getDay() + 7) % 7 || 7;
      date.setDate(date.getDate() + daysUntilWednesday + week * 7);
      date.setHours(18, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setMinutes(endDate.getMinutes() + courseData.duration);

      await prisma.session.create({
        data: {
          courseId: course.id,
          startTime: date,
          endTime: endDate,
          location: 'Studio A – Ludwigsburg',
        },
      });
    }
    console.log(`  → 4 Sessions created for ${course.title}`);
  }

  // 4. Test Customer
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
  console.log('✅ Customer user created:', customer.email);

  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('Test Accounts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:      admin@tanzmoment.de / admin123');
  console.log('Instructor: sarah@tanzmoment.de / sarah123');
  console.log('Customer:   max@example.com / customer123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });