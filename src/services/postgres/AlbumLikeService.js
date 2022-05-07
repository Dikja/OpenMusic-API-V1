/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumLikeService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbumLike(userId, albumId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1,$2,$3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menyukai lagu!!');
    }
    await this._cacheService.delete(`redisAlbumLikes:${albumId}`);
    return result.rows[0].id;
  }

  async AlbumUnlike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id=$2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal Melakukan Like albums!!');
    }
    await this._cacheService.delete(`redisAlbumLikes:${albumId}`);
    return result.rows.length;
  }

  async checkAlbum(albumId) {
    const query = {
      text: 'SELECT *FROM albums WHERE id=$1',
      values: [albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal, Album tidak ditemukan!!');
    }
  }

  async checkLikeAlbums(userId, albumId) {
    const query = {
      text: 'SELECT *FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    return result.rows.length;
  }

  async countLikes(albumId) {
    try {
      const result = await this._cacheService.get(`redisAlbumLikes:${albumId}`);
      return {
        count: JSON.parse(result),
        source: 'cache',
      };
    } catch (error) {
      const query = {
        text: 'SELECT *FROM user_album_likes WHERE album_id=$1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('Album tidak ditemukan!!');
      }
      await this._cacheService.set(`redisAlbumLikes:${albumId}`, JSON.stringify(result.rows.length));
      return {
        count: result.rows.length,
        source: 'db',
      };
    }
  }
}
module.exports = AlbumLikeService;
