/* eslint-disable no-underscore-dangle */

const { Pool } = require('pg');
const ClientError = require('../../exceptions/ClientError');

class CollaborationsHandler {
  constructor(collaborationsService, playlistService, validator, userService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._playlistService = playlistService;
    this._userService = userService;
    this._validator = validator;

    this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
    this.deleteCollaborationsByIdHandler = this.deleteCollaborationsByIdHandler.bind(this);
  }

  async postCollaborationsHandler(request, h) {
    try {
      this._validator.validateCollaborationsPayload(request.payload);

      const { id: credentialId } = request.auth.credentials;

      const { playlistId, userId } = request.payload;

      await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
      await this._userService.getUserById(userId);

      const collaborationId = await this._collaborationsService
        .addCollaboration(playlistId, userId);

      const response = h.response({
        status: 'success',
        message: 'Berhasil menambahkan Kolaborator',
        data: {
          collaborationId,
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
        status: 'error',
        message: 'Maaf, sedang terjadi kendala pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteCollaborationsByIdHandler(request, h) {
    try {
      this._validator.validateCollaborationsPayload(request.payload);

      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
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
        status: 'error',
        message: 'Maaf, sedang terjadi kendala pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}
module.exports = CollaborationsHandler;
