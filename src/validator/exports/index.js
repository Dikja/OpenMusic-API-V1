const ExportOpenMusicPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportsValidator = {
  validateExportOpenMusicPayload: (payload) => {
    const validatioinResult = ExportOpenMusicPayloadSchema.validate(payload);

    if (validatioinResult.error) {
      throw new InvariantError(validatioinResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
