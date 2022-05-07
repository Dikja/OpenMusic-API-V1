const ClientError = require('../../exceptions/ClientError');

/* eslint-disable no-underscore-dangle */
class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUploadCoverAlbumsByHandler = this.postUploadCoverAlbumsByHandler.bind(this);
  }

  async postUploadCoverAlbumsByHandler(request, h) {
    try {
      const { cover } = request.payload;
      this._validator.validateCoverAlbumsHeader(cover.hapi.headers);

      const filename = await this._service.writeFile(cover, cover.hapi);

      await this._service.addCoverAlbums(filename, request.params.id);
      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
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
        message: 'Maaf, terjadi kegagalan pada server kami!',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}
module.exports = UploadsHandler;
