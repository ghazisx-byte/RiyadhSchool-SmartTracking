const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n🔧 Starting database setup...');
    
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@school.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123';
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'نظام',
        lastName: 'الإدارة',
        role: 'ADMIN',
        status: 'ACTIVE',
        manager: {
          create: {
            position: 'مدير النظام',
            department: 'تكنولوجيا المعلومات'
          }
        }
      },
      include: { manager: true }
    });
    
    console.log('✅ Admin user created/verified');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    
    // Create sample school class
    const schoolClass = await prisma.schoolClass.upsert({
      where: { name: 'الرابع - أ' },
      update: {},
      create: {
        name: 'الرابع - أ',
        gradeLevel: 4,
        section: 'أ',
        capacity: 30,
        academicYear: '1445-1446'
      }
    });
    
    console.log('✅ Sample class created');
    console.log(`   Name: ${schoolClass.name}`);
    
    // Create sample teacher
    const teacherUser = await prisma.user.upsert({
      where: { email: 'teacher@school.com' },
      update: {},
      create: {
        email: 'teacher@school.com',
        password: await bcrypt.hash('TeacherPassword123', 10),
        firstName: 'غازي',
        lastName: 'العبيدي',
        phoneNumber: '0501234567',
        role: 'TEACHER',
        status: 'ACTIVE',
        teacher: {
          create: {
            pinCode: '1234',
            employeeId: 'EMP001',
            subject: 'العلوم',
            department: 'المواد العلمية',
            experienceYears: 5,
            qualifications: 'بكالوريوس تربية'
          }
        }
      },
      include: { teacher: true }
    });
    
    console.log('✅ Sample teacher created');
    console.log(`   Name: ${teacherUser.firstName} ${teacherUser.lastName}`);
    console.log(`   Email: ${teacherUser.email}`);
    console.log(`   PIN: 1234`);
    
    // Assign teacher to class
    await prisma.classAssignment.upsert({
      where: {
        teacherId_classId_semester: {
          teacherId: teacherUser.teacher.id,
          classId: schoolClass.id,
          semester: 1
        }
      },
      update: {},
      create: {
        teacherId: teacherUser.teacher.id,
        classId: schoolClass.id,
        semester: 1
      }
    });
    
    console.log('✅ Teacher assigned to class');
    
    // Create sample student
    const studentUser = await prisma.user.upsert({
      where: { email: 'student@school.com' },
      update: {},
      create: {
        email: 'student@school.com',
        password: await bcrypt.hash('StudentPassword123', 10),
        firstName: 'محمد',
        lastName: 'الأحمد',
        role: 'STUDENT',
        status: 'ACTIVE'
      }
    });
    
    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        studentId: 'STU001',
        classId: schoolClass.id,
        section: 'أ',
        learningStyle: 'VISUAL',
        enrollmentDate: new Date()
      }
    });
    
    console.log('✅ Sample student created');
    console.log(`   Name: ${studentUser.firstName} ${studentUser.lastName}`);
    console.log(`   Student ID: ${student.studentId}`);
    
    console.log('\n✨ Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: npm install');
    console.log('   2. Configure .env file');
    console.log('   3. Run: npm run dev');
    console.log('   4. Access: http://localhost:5000/health');
    
  } catch (error) {
    console.error('❌ Error during database setup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
