const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

/* eslint-disable no-underscore-dangle */
class AlbumService {
  constructor() {
    this._albumService = [];
  }

  addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const newAlbum = {
      id, name, year,
    };

    this._albumService.push(newAlbum);

    const isSuccess = this._albumService.filter((album) => album.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return id;
  }

  getAlbumById(id) {
    const album = this._albumService.filter((n) => n.id === id)[0];

    if (!album) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return album;
  }

  editAlbumById(id, { name, year }) {
    const index = this._albumService.findIndex((album) => album.id === id);

    if (index === -1) {
      throw new NotFoundError('Gagal memperbarui album, Id tidak ditemukan');
    }

    this._albumService[index] = {
      ...this._albumService[index],
      name,
      year,
    };
  }

  deleteAlbumById(id) {
    const index = this._albumService.findIndex((album) => album.id === id);

    if (index === -1) {
      throw new NotFoundError('Album Gagal dihapus, Id tidak ditemukan');
    }

    this._albumService.splice(index, 1);
  }
}
module.exports = AlbumService;
