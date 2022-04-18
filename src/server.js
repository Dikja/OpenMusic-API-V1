require('dotenv').config();
const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const songs = require('./api/songs');
// const AlbumService = require('./services/inMemory/AlbumService');
const AlbumService = require('./services/postgres/AlbumService');
// const SongService = require('./services/inMemory/SongService');
const SongService = require('./services/postgres/SongService');
const AlbumValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');

const init = async () => {
  const serviceAlbum = new AlbumService();
  const serviceSong = new SongService();
  const server = Hapi.server({
    port: process.env.port,
    host: process.env.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        albumService: serviceAlbum,
        albumValidator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        songService: serviceSong,
        songValidator: SongsValidator,
      },
    },
  ]);
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
