require('dotenv').config();

module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: `${process.env.POSTGRES_USERNAME}`,
  password: `${process.env.POSTGRES_PASSWORD}`,
  database: 'gobarber',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
