const pool = require('../db/connection');

// User Model
class User {
    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async create(email, hashedPassword, role = 'user', createdByAdminId = null) {
        const [result] = await pool.query(
            'INSERT INTO users (email, password, role, created_by) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, role, createdByAdminId]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByRole(role) {
        const [rows] = await pool.query(
            'SELECT id, email, role, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
            [role]
        );
        return rows;
    }

    static async getAllUsers() {
        const [rows] = await pool.query(
            'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        return rows;
    }

    static async delete(id) {
        try {
            const [result] = await pool.query(
                'DELETE FROM users WHERE id = ?',
                [id]
            );
            if (result.affectedRows === 0) {
                throw new Error('User not found or already deleted');
            }
            return {
                success: true,
                message: 'User deleted successfully',
                affectedRows: result.affectedRows
            };
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    static async updateRole(id, newRole) {
        const [result] = await pool.query(
            'UPDATE users SET role = ? WHERE id = ?',
            [newRole, id]
        );
        return result.affectedRows > 0;
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

    static async getActivePolls() {
        // Return only polls that are currently active based on start_time and end_time
        const now = new Date();
        const [rows] = await pool.query(
            `SELECT * FROM polls 
             WHERE (start_time IS NULL OR start_time <= NOW())
             AND (end_time IS NULL OR end_time > NOW())
             AND is_active = 1
             ORDER BY created_at DESC`
        );
        return rows;
    }

    static async getByCreatedBy(facultyId) {
        // Get all polls created by a specific faculty member
        const [rows] = await pool.query(
            'SELECT * FROM polls WHERE created_by = ? ORDER BY created_at DESC',
            [facultyId]
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM polls WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(question, createdBy, startTime = null, endTime = null) {
        const [result] = await pool.query(
            'INSERT INTO polls (question, is_active, created_by, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
            [question, true, createdBy, startTime, endTime]
        );
        return result.insertId;
    }

    static async update(id, question, isActive) {
        await pool.query(
            'UPDATE polls SET question = ?, is_active = ? WHERE id = ?',
            [question, isActive ? 1 : 0, id]
        );
    }

    static async updateSchedule(id, startTime, endTime) {
        await pool.query(
            'UPDATE polls SET start_time = ?, end_time = ? WHERE id = ?',
            [startTime, endTime, id]
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
