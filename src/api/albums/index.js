const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { albumService, albumValidator }) => {
    const albumHandler = new AlbumHandler(albumService, albumValidator);
    server.route(routes(albumHandler));
  },
};
