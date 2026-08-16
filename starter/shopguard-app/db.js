// db.js — SQLite 연결 헬퍼 (전 주차 공용)
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'shopguard.sqlite');

function openDb() {
  return new Database(DB_PATH);
}

module.exports = { openDb, DB_PATH };
