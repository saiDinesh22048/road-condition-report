"use strict";
// Database Seed Script
// Run with: npm run db:seed
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 12;
async function main() {
    console.log('🌱 Starting database seed...\n');
    // Create admin user
    const adminPassword = await bcryptjs_1.default.hash('admin123', SALT_ROUNDS);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@roadcondition.app' },
        update: {},
        create: {
            email: 'admin@roadcondition.app',
            password: adminPassword,
            name: 'System Admin',
            phone: '+1234567890',
            role: 'ADMIN'
        }
    });
    console.log('✅ Admin user created:', admin.email);
    console.log('   Password: admin123 (change in production!)\n');
    // Create test user
    const userPassword = await bcryptjs_1.default.hash('user1234', SALT_ROUNDS);
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            password: userPassword,
            name: 'Test User',
            phone: '+1987654321',
            role: 'USER'
        }
    });
    console.log('✅ Test user created:', user.email);
    console.log('   Password: user1234\n');
    // Create sample complaints for testing
    const sampleComplaints = [
        {
            complaintId: 'RC-20260423-0001',
            category: 'pothole',
            title: 'Large pothole on main street',
            description: 'There is a large pothole approximately 2 feet wide near the intersection of Main Street and Oak Avenue. It poses a danger to vehicles and motorcycles.',
            address: '123 Main Street, Near Oak Avenue Intersection, Downtown District',
            status: 'Submitted',
            userId: user.id
        },
        {
            complaintId: 'RC-20260423-0002',
            category: 'waterlogging',
            title: 'Severe waterlogging during rain',
            description: 'This area gets severely waterlogged even with light rain. Water accumulates to knee level making it impossible for pedestrians and two-wheelers to pass.',
            address: '456 Riverside Road, Near City Park Entrance',
            status: 'Under Review',
            adminRemarks: 'Under investigation by the drainage department.',
            userId: user.id
        },
        {
            complaintId: 'RC-20260423-0003',
            category: 'damaged signboard',
            title: 'Broken speed limit sign',
            description: 'The speed limit sign has been knocked down and is lying on the sidewalk. This is near a school zone so it is important for safety.',
            address: '789 School Lane, Outside St. Mary High School',
            status: 'Assigned',
            adminRemarks: 'Assigned to traffic department for repair.',
            userId: user.id
        },
        {
            complaintId: 'RC-20260423-0004',
            category: 'debris on road',
            title: 'Construction debris blocking road',
            description: 'There is construction debris including bricks and sand blocking half the road. Very dangerous especially at night.',
            address: '321 Industrial Avenue, Near Factory Zone',
            status: 'In Progress',
            adminRemarks: 'Cleanup crew dispatched.',
            userId: user.id
        },
        {
            complaintId: 'RC-20260423-0005',
            category: 'crack',
            title: 'Road cracks spreading rapidly',
            description: 'Multiple cracks have appeared on this stretch of road and are getting worse each day. Some cracks are over an inch wide.',
            address: '555 Highway 101, Mile Marker 23',
            status: 'Resolved',
            adminRemarks: 'Repair completed on April 20, 2026.',
            userId: user.id
        }
    ];
    for (const complaint of sampleComplaints) {
        await prisma.complaint.upsert({
            where: { complaintId: complaint.complaintId },
            update: {},
            create: complaint
        });
        console.log(`✅ Sample complaint created: ${complaint.complaintId}`);
    }
    console.log('\n🎉 Database seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('─────────────────────');
    console.log('Admin Login:');
    console.log('  Email: admin@roadcondition.app');
    console.log('  Password: admin123');
    console.log('\nUser Login:');
    console.log('  Email: user@example.com');
    console.log('  Password: user1234');
    console.log('─────────────────────');
    console.log('\n⚠️  Remember to change these credentials in production!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map