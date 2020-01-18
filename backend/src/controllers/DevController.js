const axios = require("axios");
const Dev = require("../models/Dev");
const parseStringAsArray = require("../utils/parseStringAsArray");
const { findConnections, sendMessage } = require("../websocket");

module.exports = {
  async index(req, res) {
    const devs = await Dev.find();

    return res.json(devs);
  },

  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      const apiResp = await axios.get(
        `https://api.github.com/users/${github_username}`
      );

      const { name = login, avatar_url, bio } = apiResp.data;

      const techsArray = parseStringAsArray(techs);

      const location = {
        type: "Point",
        coordinates: [longitude, latitude]
      };

      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location
      });

      const sendSocketMessageTo = findConnections(
        {
          latitude,
          longitude
        },
        techsArray
      );

      sendMessage(sendSocketMessageTo, 'new-dev', dev);
    }

    return res.json(dev);
  },

  async update(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      res.status(404).json({ message: "Developer not found!" });
    }

    const apiResp = await axios.get(
      `https://api.github.com/users/${github_username}`
    );

    const { name = login, avatar_url, bio } = apiResp.data;

    const techsArray = parseStringAsArray(techs);

    const location = {
      type: "Point",
      coordinates: [longitude, latitude]
    };

    await Dev.update(
      { github_username },
      {
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location
      }
    );

    dev = await Dev.findOne({ github_username });

    return res.json(dev);
  },

  async destroy(req, res) {
    const { github_username } = req.body;

    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      res.status(404).json({ message: "Developer not found!" });
    }

    dev = await Dev.deleteOne({ github_username });

    if (dev) {
      return res.json({ message: "Developer deleted success!!" });
    }

    return res.status(400).json({ message: "Error on delete developer!" });
  }
};
