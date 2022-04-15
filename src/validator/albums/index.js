const { AlbumPayloadSchema } = require('./schema');

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validateAlbumResult = AlbumPayloadSchema.validate(payload);
    if (validateAlbumResult.error) {
      throw new Error(validateAlbumResult.error.message);
    }
  },
};

module.exports = AlbumValidator;
