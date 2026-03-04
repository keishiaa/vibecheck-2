const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.zenatjcoxjpfzzipladb:cd%40*GYb8Q3*%26bLw@aws-1-us-east-2.pooler.supabase.com:5432/postgres' });
async function main() {
    await client.connect();
    const res = await client.query('SELECT id, name, "locationUrl", "locationImageUrl" FROM "Trip"');
    console.log("TRIPS:", res.rows);
    const prodRes = await client.query('SELECT id, name, "imageUrl" FROM "Product"');
    console.log("PRODUCTS:", prodRes.rows);
    await client.end();
}
main();
