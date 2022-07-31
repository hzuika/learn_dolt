const { Youtube } = require("hzkl");
require("dotenv").config();
const mysql = require("mysql2/promise");
(async () => {
  const con = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
  });

  await con.query(`use dotlive_video`)
  const idList = (
    await con.query("SELECT id FROM channel")
  )[0].map((data) => data.id);

  const yt = new Youtube(process.env.YOUTUBE_API_KEY);

  await Promise.all(idList.map(async channelId => {
    const playlistId = Youtube.getUploadPlaylistIdFromChannelId(channelId);
    const playlistItemApiDataList = await yt.getPlaylistItems(playlistId);
    const videoIdList = playlistItemApiDataList.map(playlistItemApiData => {
      return Youtube.getVideoIdFromPlaylistItemApiData(playlistItemApiData);
    })
    const videoApiDataList = await yt.getVideos(videoIdList);
    await Promise.all(videoApiDataList.map(async videoApiData => {
      const id = Youtube.getVideoIdFromVideoApiData(videoApiData);
      const title = Youtube.getTitleFromVideoApiData(videoApiData);
      const channelId = Youtube.getChannelIdFromVideoApiData(videoApiData);
      await con.query(
        "INSERT IGNORE INTO video (title, id, channelId) VALUES (?, ?, ?)", [title, id, channelId]
      );
    }))
  }))

  console.log((await con.query("select * from video"))[0])

  await con.end();
})();

