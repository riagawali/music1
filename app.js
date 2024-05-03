const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = 4000;
const mongoUri = "mongodb://0.0.0.0:27017";
const client = new MongoClient(mongoUri);

app.use(express.json());

async function main() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("music");
    const collection = db.collection("songdetails");

    // Clear the collection
    await collection.deleteMany({});

    // Insert array of song documents
    await collection.insertMany([
      {
        Songname: "Song One",
        Film: "Film One",
        Music_director: "Director One",
        Singer: "Singer One",
      },
      {
        Songname: "Song Two",
        Film: "Film Two",
        Music_director: "Director One",
        Singer: "Singer Two",
      },
      {
        Songname: "Song Three",
        Film: "Film Three",
        Music_director: "Director Two",
        Singer: "Singer Three",
      },
      {
        Songname: "Song Four",
        Film: "Film Four",
        Music_director: "Director Two",
        Singer: "Singer One",
      },
      {
        Songname: "Song Five",
        Film: "Film Five",
        Music_director: "Director Three",
        Singer: "Singer Two",
      },
    ]);

    // Display total count of documents and list all documents
    app.get("/song", async (req, res) => {
      const songs = await collection.find({}).toArray();
      const count = await collection.countDocuments();
      console.log({ count, songs });
    });

    // List specified Music Director songs
    app.get("/director", async (req, res) => {
      const { director } = req.query;
      const songs = await collection
        .find({ Music_director: director })
        .toArray();
      res.send(songs);
    });

    // List specified Music Director songs sung by specified Singer
    app.get("/songs/director-singer", async (req, res) => {
      const { director, singer } = req.query;
      const songs = await collection
        .find({ Music_director: director, Singer: singer })
        .toArray();
      res.send(songs);
    });

    // Delete a song
    app.delete("/songs", async (req, res) => {
      const { songname } = req.query;
      const result = await collection.deleteOne({ Songname: songname });
      res.send(result);
    });

    // Add a new favorite song
    app.post("/song-fav", async (req, res) => {
      const song = req.body;
      const result = await collection.insertOne(song);
      res.send(result);
    });

    // List Songs sung by Specified Singer from specified film
    app.get("/songs/singer-film", async (req, res) => {
      const { singer, film } = req.query;
      const songs = await collection
        .find({ Singer: singer, Film: film })
        .toArray();
      res.send(songs);
    });

    // Update the document by adding Actor and Actress name
    app.patch("/songs", async (req, res) => {
      const { songname, actor, actress } = req.query;
      const result = await collection.updateOne(
        { Songname: songname },
        { $set: { Actor: actor, Actress: actress } }
      );
      res.send(result);
    });

    // Display data in tabular format in the browser
    app.get("/songs/table", async (req, res) => {
      const songs = await collection.find({}).toArray();
      let html = '<table border="1">';
      html +=
        "<tr><th>Song Name</th><th>Film Name</th><th>Music Director</th><th>Singer</th><th>Actor</th><th>Actress</th></tr>";
      songs.forEach((song) => {
        html += `<tr><td>${song.Songname}</td><td>${song.Film}</td><td>${
          song.Music_director
        }</td><td>${song.Singer}</td><td>${song.Actor || ""}</td><td>${
          song.Actress || ""
        }</td></tr>`;
      });
      html += "</table>";
      res.send(html);
    });

    app.listen(port, () => console.log(`App listening on port ${port}`));
  } catch (e) {
    console.error(e);
  } finally {
    // Uncomment below line if you want to close MongoDB connection when main function ends
    // await client.close();
  }
}

main().catch(console.error);
