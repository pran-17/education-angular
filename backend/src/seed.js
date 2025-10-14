import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import admin from 'firebase-admin';

dotenv.config();

async function run() {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (serviceAccountBase64) {
    const json = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(json)) });
  } else if (serviceAccountPath) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccountPath) });
  } else {
    admin.initializeApp();
  }

  const db = admin.firestore();
  // Clean collections for demo seeding
  const collections = ['teachers', 'students', 'admins'];
  for (const col of collections) {
    const snap = await db.collection(col).get();
    const batch = db.batch();
    snap.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  const password = 'Password123!';
  const passwordHash = await bcrypt.hash(password, 10);

  const tDocs = [
    { name: 'Alice Johnson', email: 'alice@school.edu', passwordHash, subject: 'Mathematics', department: 'Science', phone: '1234567890' },
    { name: 'Bob Smith', email: 'bob@school.edu', passwordHash, subject: 'English', department: 'Arts', phone: '2345678901' },
  ];
  const tRefs = await Promise.all(tDocs.map((d) => db.collection('teachers').add(d)));

  const sDocs = [
    { name: 'Charlie Brown', email: 'charlie@student.edu', passwordHash, rollNumber: 'R001', className: '10', section: 'A', phone: '3456789012' },
    { name: 'Dana White', email: 'dana@student.edu', passwordHash, rollNumber: 'R002', className: '10', section: 'B', phone: '4567890123' },
    { name: 'Evan Green', email: 'evan@student.edu', passwordHash, rollNumber: 'R003', className: '11', section: 'A', phone: '5678901234' },
  ];
  const sRefs = await Promise.all(sDocs.map((d) => db.collection('students').add(d)));

  const adminRef = await db.collection('admins').add({ name: 'Super Admin', email: 'admin@school.edu', passwordHash });

  console.log('Seed complete:');
  console.log({
    teachersCount: tRefs.length,
    studentsCount: sRefs.length,
    adminId: adminRef.id,
    defaultPassword: password
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


