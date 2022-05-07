/* eslint-disable no-underscore-dangle */

const fs = require('fs');
const { Pool } = require('pg');

class StorageService {
  constructor(folder) {
    this._folder = folder;
    this._pool = new Pool();

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }

  async addCoverAlbums(filename, id) {
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };
    await this._pool.query(query);
  }
}
module.exports = StorageService;
