const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const AlbumService = require('./services/inMemory/AlbumService');
const AlbumValidator = require('./validator/albums');

const init = async () => {
  const serviceAlbum = new AlbumService();
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: albums,
    options: {
      albumService: serviceAlbum,
      albumValidator: AlbumValidator,
    },
  });
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
