const ClientError = require('../../exceptions/ClientError');

/* eslint-disable no-underscore-dangle */
class AlbumsLikesHandler {
  constructor(service) {
    this._service = service;

    this.postLikeAlbumsByHandler = this.postLikeAlbumsByHandler.bind(this);
    this.getLikesCountByHandler = this.getLikesCountByHandler.bind(this);
  }

  async postLikeAlbumsByHandler(request, h) {
    try {
      const { id } = request.params;

      const { id: credentialId } = request.auth.credentials;

      await this._service.checkAlbum(id);
      const alreadyLike = await this._service.checkLikeAlbums(credentialId, id);
      if (!alreadyLike) {
        await this._service.addAlbumLike(credentialId, id);
        const response = h.response({
          status: 'success',
          message: 'Behasil Menyukai Lagu',
        });
        response.code(201);
        return response;
      }

      await this._service.AlbumUnlike(credentialId, id);
      const response = h.response({
        status: 'success',
        message: 'Unlike',
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
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getLikesCountByHandler(request, h) {
    try {
      const { id } = request.params;
      const countLikes = await this._service.countLikes(id);
      const response = h.response({
        status: 'success',
        data: {
          likes: countLikes.count,
        },
      });
      response.header('X-Data-Source', countLikes.source);
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
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AlbumsLikesHandler;
