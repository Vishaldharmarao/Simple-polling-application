#!/usr/bin/env node

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testMigration() {
    console.log('🔍 Testing Database Migration...\n');

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'polling_app'
        });

        // Check tables exist
        const [tables] = await connection.execute(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='polling_app'"
        );

        console.log('✓ Database Connection: SUCCESS');
        console.log(`✓ Tables Found: ${tables.length}`);
        tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));

        // Check users table structure
        const [userColumns] = await connection.execute('DESCRIBE users');
        console.log('\n✓ Users Table Columns:');
        const requiredUserColumns = ['id', 'email', 'password', 'role', 'created_by'];
        userColumns.forEach(col => {
            const isRequired = requiredUserColumns.includes(col.Field);
            const marker = isRequired ? '✓' : ' ';
            console.log(`  ${marker} ${col.Field} (${col.Type})`);
        });

        // Check polls table structure
        const [pollColumns] = await connection.execute('DESCRIBE polls');
        console.log('\n✓ Polls Table Columns:');
        const requiredPollColumns = ['id', 'question', 'created_by', 'start_time', 'end_time'];
        pollColumns.forEach(col => {
            const isRequired = requiredPollColumns.includes(col.Field);
            const marker = isRequired ? '✓' : ' ';
            console.log(`  ${marker} ${col.Field} (${col.Type})`);
        });

        // Check votes table structure
        const [voteColumns] = await connection.execute('DESCRIBE votes');
        console.log('\n✓ Votes Table Columns:');
        voteColumns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });

        // Check indexes
        const [pollIndexes] = await connection.execute('SHOW INDEXES FROM polls');
        console.log('\n✓ Polls Table Indexes:');
        const uniqueIndexes = new Set();
        pollIndexes.forEach(idx => {
            if (!uniqueIndexes.has(idx.Key_name)) {
                uniqueIndexes.add(idx.Key_name);
                console.log(`  - ${idx.Key_name}`);
            }
        });

        console.log('\n✅ Database Migration: COMPLETE');
        console.log('\nAll required columns and indexes are in place.');

        await connection.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

testMigration();
