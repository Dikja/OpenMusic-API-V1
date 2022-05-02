/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist VALUES ($1,$2,$3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Gagal ditambahkan!');
    }

    return result.rows[0].id;
  }

  async getPlaylists(user) {
    const query = {
      text: `SELECT playlist.id, playlist.name, users.username
      FROM playlist
      LEFT JOIN collaborations ON playlist.id= collaborations.playlist_id
      LEFT JOIN users ON users.id = playlist.owner
      WHERE playlist.owner=$1 OR collaborations.user_id=$1`,
      values: [user],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistOwner(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id=$1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist Gagal dihapus, ID tidak ditemukan!!');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const checkSongQuery = {
      text: 'SELECT title FROM songs WHERE id = $1',
      values: [songId],
    };

    const songResult = await this._pool.query(checkSongQuery);

    if (!songResult.rows.length) {
      throw new NotFoundError('Lagu tidak tersedia');
    }

    const id = `playlistSongs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan lagu ke playlist!');
    }
    return result.rows[0].id;
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT playlist.id,playlist.name,users.username FROM playlist INNER JOIN users ON playlist.owner=users.id WHERE playlist.id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
          INNER JOIN songs ON playlist_songs.song_id = songs.id
          WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id=$1 AND song_id=$2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menghapus lagu');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id=$1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlists = result.rows[0];
    if (playlists.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylistActivity(playlistId, songId, action, userId) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_song_activity VALUES ($1,$2,$3,$4,$5) RETURNING id',
      values: [id, playlistId, songId, action, userId],
    };
    await this._pool.query(query);
  }

  async getPlaylistActivity(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activity.action, playlist_song_activity.time FROM playlist_song_activity
      INNER JOIN users ON users.id = playlist_song_activity.user_id
      INNER JOIN songs ON songs.id = playlist_song_activity.song_id
      WHERE playlist_song_activity.playlist_id=$1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}
module.exports = PlaylistService;
