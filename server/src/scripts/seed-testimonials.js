require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const testimonials = [
    {
        name: 'Priya Sharma',
        role: 'PhD Student, Delhi University',
        content: 'ScholarAssist transformed my thesis writing process. The expert guidance helped me structure my research methodology perfectly. I could not have completed my dissertation without their support!',
        rating: 5
    },
    {
        name: 'Arjun Mehta',
        role: 'M.Tech, IIT Bombay',
        content: 'The research paper support was exceptional. They helped me with data analysis and formatting, and my paper got accepted at an international conference. Highly recommended!',
        rating: 5
    },
    {
        name: 'Sneha Kapoor',
        role: 'MBA, IIM Ahmedabad',
        content: 'I was struggling with my project documentation. ScholarAssist provided clear and actionable guidance that improved the quality of my work significantly. Worth every penny!',
        rating: 4
    },
    {
        name: 'Rahul Verma',
        role: 'B.Tech, NIT Trichy',
        content: 'Amazing service! The essay guidance was thorough and helped me understand academic writing at a deeper level. My grades improved dramatically after using their services.',
        rating: 5
    }
];

async function seed() {
    for (const t of testimonials) {
        await pool.query(
            'INSERT INTO testimonials (name, role, content, rating, published, display_order) VALUES ($1, $2, $3, $4, true, 0)',
            [t.name, t.role, t.content, t.rating]
        );
        console.log('✅ Added:', t.name);
    }
    console.log('\n🎉 All 4 demo testimonials added!');
    pool.end();
}

seed().catch(err => { console.error('Error:', err); pool.end(); });
