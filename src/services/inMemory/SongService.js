const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

/* eslint-disable no-underscore-dangle */
class SongService {
  constructor() {
    this._songService = [];
  }

  addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const newSong = {
      id, title, year, genre, performer, duration, albumId,
    };

    this._songService.push(newSong);

    const isSuccess = this._songService.filter((song) => song.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Gagal menambahkan lagu');
    }
    return id;
  }

  getSongs() {
    return this._songService;
  }

  getSongById(id) {
    const song = this._songService.filter((n) => n.id === id)[0];
    if (!song) {
      throw new NotFoundError('Gagal menampilkan Lagu, Id lagu tidak ditemukan');
    }

    return song;
  }

  editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const index = this._songService.findIndex((song) => song.id === id);

    if (index === -1) {
      throw new NotFoundError('Gagal memperbarui lagu, Id lagu tidak ditemukan');
    }

    this._songService[index] = {
      ...this._songService[index],
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    };
  }

  deleteSongById(id) {
    const index = this._songService.findIndex((song) => song.id === id);

    if (index === -1) {
      throw new NotFoundError('Gagal menghapus lagu, Id lagu tidak ditemukan');
    }

    this._songService.splice(index, 1);
  }
}
module.exports = SongService;
