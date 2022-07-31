const { Youtube } = require("hzkl");
require("dotenv").config();
const mysql = require("mysql2/promise");
(async () => {
  const con = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
  });

  await con.query(`use dotlive_video`);
  const idList = (await con.query("SELECT id FROM channel"))[0].map(
    (data) => data.id
  );

  const yt = new Youtube(process.env.YOUTUBE_API_KEY);

  const channelApiDataList = await yt.getChannels(idList);
  await Promise.all(channelApiDataList.map(async (channelApiData) => {
    const columns = [
      "title",
      "thumbnail",
      "banner",
      "publishedAt",
      "viewCount",
      "subscriberCount",
    ];
    const updateColumns = columns.map(
      (column) => `${column}=values(${column})`
    );

    await con.query(
      `INSERT INTO channel (id, ${columns.join(
        ","
      )}) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE ${updateColumns}`,
      [
        Youtube.getChannelIdFromChannelApiData(channelApiData),
        Youtube.getTitleFromChannelApiData(channelApiData),
        Youtube.getThumbnailFromChannelApiData(channelApiData),
        Youtube.getBannerFromChannelApiData(channelApiData),
        Youtube.getPublishedAtFromChannelApiData(channelApiData),
        Youtube.getViewCountFromChannelApiData(channelApiData),
        Youtube.getSubscriberCountFromChannelApiData(channelApiData),
      ]
    );
  }));

  console.log(await con.query("select * from channel"))

  await Promise.all(
    idList.map(async (channelId) => {
      const playlistId = Youtube.getUploadPlaylistIdFromChannelId(channelId);
      const playlistItemApiDataList = await yt.getPlaylistItems(playlistId);
      const videoIdList = playlistItemApiDataList.map((playlistItemApiData) => {
        return Youtube.getVideoIdFromPlaylistItemApiData(playlistItemApiData);
      });
      const videoApiDataList = await yt.getVideos(videoIdList);
      await Promise.all(
        videoApiDataList.map(async (videoApiData) => {
          const id = Youtube.getVideoIdFromVideoApiData(videoApiData);
          const channelId = Youtube.getChannelIdFromVideoApiData(videoApiData);
          const title = Youtube.getTitleFromVideoApiData(videoApiData);
          const viewCount = Youtube.getViewCountFromVideoApiData(videoApiData);
          const likeCount = Youtube.getLikeCountFromVideoApiData(videoApiData);
          const publishedAt =
            Youtube.getPublishedAtFromVideoApiData(videoApiData);
          const startTime = Youtube.getStartTimeFromVideoApiData(videoApiData);
          const endTime = Youtube.getEndTimeFromVideoApiData(videoApiData);
          const columns = [
            "title",
            "viewCount",
            "likeCount",
            "publishedAt",
            "startTime",
            "endTime",
          ];
          const updateColumns = columns.map(
            (column) => `${column}=values(${column})`
          );
          await con.query(
            `INSERT INTO video (id, channelId, ${columns.join(
              ","
            )}) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE ${updateColumns.join(
              ","
            )}`,
            [
              id,
              channelId,
              title,
              viewCount,
              likeCount,
              publishedAt,
              startTime,
              endTime,
            ]
          );
        })
      );
    })
  );

  await con.end();
})();
