const routes = require('./routes');
const CollaborationsHandler = require('./handler');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {
    collaborationsService, playlistService, validator, userService,
  }) => {
    const collaborationHandler = new
    CollaborationsHandler(collaborationsService, playlistService, validator, userService);

    server.route(routes(collaborationHandler));
  },

};
