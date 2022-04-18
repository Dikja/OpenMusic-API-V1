const ClientError = require('../../exceptions/ClientError');

/* eslint-disable no-underscore-dangle */
class SongsHandler {
  constructor(songService, songValidator) {
    this._songService = songService;
    this._songValidator = songValidator;

    this.postSongByHandler = this.postSongByHandler.bind(this);
    this.getSongsByHandler = this.getSongsByHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongByHandler(request, h) {
    try {
      this._songValidator.validateSongPayload(request.payload);
      const {
        title, year, performer, genre, duration, albumId,
      } = request.payload;

      const songId = await this._songService.addSong({
        title, year, performer, genre, duration, albumId,
      });

      const response = h.response({
        status: 'success',
        message: 'Berhasil menambahkan lagu',
        data: {
          songId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongsByHandler(request) {
    const { title, performer } = request.query;
    const songs = await this._songService.getSongs(title, performer);
    return {
      status: 'success',
      data: { songs },
    };
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._songService.getSongById(id);
      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._songValidator.validateSongPayload(request.payload);
      const { id } = request.params;

      await this._songService.editSongById(id, request.payload);

      return {
        status: 'success',
        message: 'Lagu berhasil dirubah',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._songService.deleteSongById(id);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      const response = h.response({
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}
module.exports = SongsHandler;
