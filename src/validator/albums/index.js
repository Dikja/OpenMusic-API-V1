const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema } = require('./schema');

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validateAlbumResult = AlbumPayloadSchema.validate(payload);
    if (validateAlbumResult.error) {
      throw new InvariantError(validateAlbumResult.error.message);
    }
  },
};

module.exports = AlbumValidator;
