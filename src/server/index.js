import Router from '../client/router';
import React from 'react';
import express from 'express';
import { StaticRouter } from 'react-router-dom/server';
import { renderToString } from 'react-dom/server';

// server configuration
const port = 3000;

// dependencies
const path = require('path');
const results = Object.create(null);
const chalk = require('chalk');
const logger = console.log;
const server = express();
const nessAplication = server;
const assets = require('../../deploy/assets.json');
const { networkInterfaces } = require('os');
const nets = networkInterfaces();

// retrieve networkInterfaces
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
    if (net.family === familyV4Value && !net.internal) {
      if (!results[name]) results[name] = [];
      results[name].push(net.address);
    }
  }
}

server.use(express.static('../../deploy/chunks.json'));
server.set('view engine', 'pug');
server.set('views', path.join(__dirname, '..', 'views'));

// all routes to client router
server.get('/*', (req, res) => {
  const context = {};
  const serverRouter = renderToString(<StaticRouter location={req.url}><Router/></StaticRouter>);

  if (context.url) res.redirect(context.url);
  else res.status(200).render('index', {
      production: process.env.NODE_ENV === 'production',
      title: 'Welcome to NessApp',
      clientStyles: assets.client.css,
      bundledScript: assets.client.js,
      body: serverRouter,
    })
  }
);

// start server
server.listen(process.env.PORT || port, () => {
  logger(`🌱 NessApp started on: ${chalk.hex('#5590CB').bold('http://localhost:' + process.env.PORT || port)} and ${chalk.hex('#5590CB').bold('http://' + results['en0'][0] + ':' + process.env.PORT || port)}`);
});

// Error handlers
server.on('error', error => {
  console.log(`🌱 NessApp error: ${chalk.error(error)}`);
});

// server live mode
if (module.hot) module.hot.accept('./index', () => {
  try {
    application = require('./server').default;
    server.removeListener('request', nessAplication);
    server.on('request', application);
    nessAplication = application;
  } catch (error) {console.error(error)}
});