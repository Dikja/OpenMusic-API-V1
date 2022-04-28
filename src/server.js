require('dotenv').config();
const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const authentications = require('./api/authentications');
const songs = require('./api/songs');
const users = require('./api/users');
const AlbumService = require('./services/postgres/AlbumService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const SongService = require('./services/postgres/SongService');
const UsersService = require('./services/postgres/UsersService');
const TokenManager = require('./tokenize/TokenManager');
const AlbumValidator = require('./validator/albums');
const AuthenticationsValidator = require('./validator/authentications');
const SongsValidator = require('./validator/songs');
const UserValidator = require('./validator/users');

const init = async () => {
  const serviceAlbum = new AlbumService();
  const serviceSong = new SongService();
  const userService = new UsersService();
  const authenticationsService = new AuthenticationsService();
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
    {
      plugin: users,
      options: {
        service: userService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        userService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
