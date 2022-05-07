/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(service, validator, playlistService) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;

    this.postExportSongInPlaylistByIdHandler = this.postExportSongInPlaylistByIdHandler.bind(this);
  }

  async postExportSongInPlaylistByIdHandler(request, h) {
    try {
      this._validator.validateExportOpenMusicPayload(request.payload);

      const { playlistId } = request.params;
      const userId = request.auth.credentials.id;
      await this._playlistService.verifyPlaylistOwner(playlistId, userId);

      const message = {
        playlistId,
        targetEmail: request.payload.targetEmail,
      };

      await this._service.sendMessage('export:playlists', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda dalam antrean',
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
}
module.exports = ExportsHandler;
