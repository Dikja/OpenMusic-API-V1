require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const albums = require('./api/albums');
const authentications = require('./api/authentications');
const collaborations = require('./api/collaborations');
const playlist = require('./api/playlist');
const songs = require('./api/songs');
const users = require('./api/users');
const AlbumService = require('./services/postgres/AlbumService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const PlaylistService = require('./services/postgres/PlaylistService');
const SongService = require('./services/postgres/SongService');
const UsersService = require('./services/postgres/UsersService');
const TokenManager = require('./tokenize/TokenManager');
const AlbumValidator = require('./validator/albums');
const AuthenticationsValidator = require('./validator/authentications');
const CollaborationsValidator = require('./validator/collaborations');
const PlaylistValidator = require('./validator/playlists');
const SongsValidator = require('./validator/songs');
const UserValidator = require('./validator/users');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const serviceAlbum = new AlbumService();
  const serviceSong = new SongService();
  const userService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistService = new PlaylistService(collaborationsService);

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
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('openmusicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
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
    {
      plugin: playlist,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistService,
        userService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
