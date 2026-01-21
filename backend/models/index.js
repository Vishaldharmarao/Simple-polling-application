const pool = require('../db/connection');

// User Model
class User {
    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async create(email, hashedPassword, role = 'user') {
        const [result] = await pool.query(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, hashedPassword, role]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }
}

// Poll Model
class Poll {
    static async getAll(isActive = null) {
        let query = 'SELECT * FROM polls';
        const params = [];
        
        if (isActive !== null) {
            query += ' WHERE is_active = ?';
            params.push(isActive ? 1 : 0);
        }
        
        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(query, params);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM polls WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(question, createdBy) {
        const [result] = await pool.query(
            'INSERT INTO polls (question, is_active, created_by) VALUES (?, ?, ?)',
            [question, true, createdBy]
        );
        return result.insertId;
    }

    static async update(id, question, isActive) {
        await pool.query(
            'UPDATE polls SET question = ?, is_active = ? WHERE id = ?',
            [question, isActive ? 1 : 0, id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM polls WHERE id = ?', [id]);
    }
}

// Poll Option Model
class PollOption {
    static async getByPollId(pollId) {
        const [rows] = await pool.query(
            'SELECT id, poll_id, option_text FROM poll_options WHERE poll_id = ?',
            [pollId]
        );
        return rows;
    }

    static async create(pollId, optionText) {
        const [result] = await pool.query(
            'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)',
            [pollId, optionText]
        );
        return result.insertId;
    }

    static async update(id, optionText) {
        await pool.query(
            'UPDATE poll_options SET option_text = ? WHERE id = ?',
            [optionText, id]
        );
    }

    static async delete(id) {
        await pool.query('DELETE FROM poll_options WHERE id = ?', [id]);
    }
}

// Vote Model
class Vote {
    static async create(userId, pollId, optionId) {
        const [result] = await pool.query(
            'INSERT INTO votes (user_id, poll_id, option_id) VALUES (?, ?, ?)',
            [userId, pollId, optionId]
        );
        return result.insertId;
    }

    static async userHasVoted(userId, pollId) {
        const [rows] = await pool.query(
            'SELECT id FROM votes WHERE user_id = ? AND poll_id = ?',
            [userId, pollId]
        );
        return rows.length > 0;
    }

    static async getByPollId(pollId) {
        const [rows] = await pool.query(
            'SELECT option_id, COUNT(*) as count FROM votes WHERE poll_id = ? GROUP BY option_id',
            [pollId]
        );
        return rows;
    }

    static async getTotalVotesByPoll(pollId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as total FROM votes WHERE poll_id = ?',
            [pollId]
        );
        return rows[0].total;
    }

    static async deleteByPollId(pollId) {
        await pool.query('DELETE FROM votes WHERE poll_id = ?', [pollId]);
    }
}

module.exports = { User, Poll, PollOption, Vote };
