const { Youtube, removeDuplicatesFromArray } = require("hzkl");
require("dotenv").config();
const mysql = require("mysql2/promise");
const yt = new Youtube(process.env.YOUTUBE_API_KEY);

(async () => {
  const con = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
  });

  await con.query(`use dotlive_video`);

  await con.query(
    "CREATE TABLE IF NOT EXISTS playlist (id char(34) not null primary key, title varchar(255), channelId char(24))"
  );

  const dbDataList = (
    await con.query("SELECT id, videoCount FROM channel")
  )[0];
  const idList = dbDataList.map((data) => data.id);

  const updateChannel = async (channelIdList) => {
    const channelApiDataList = await yt.getChannels(channelIdList);
    await Promise.all(
      channelApiDataList.map(async (channelApiData) => {
        const columns = [
          "title",
          "thumbnail",
          "banner",
          "publishedAt",
          "viewCount",
          "subscriberCount",
          "videoCount",
        ];
        const updateColumns = columns.map(
          (column) => `${column}=values(${column})`
        );

        await con.query(
          `INSERT INTO channel (id, ${columns.join(
            ","
          )}) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE ${updateColumns}`,
          [
            Youtube.getChannelIdFromChannelApiData(channelApiData),
            Youtube.getTitleFromChannelApiData(channelApiData),
            Youtube.getThumbnailFromChannelApiData(channelApiData),
            Youtube.getBannerFromChannelApiData(channelApiData),
            Youtube.getPublishedAtFromChannelApiData(channelApiData),
            Youtube.getViewCountFromChannelApiData(channelApiData),
            Youtube.getSubscriberCountFromChannelApiData(channelApiData),
            Youtube.getVideoCountFromChannelApiData(channelApiData),
          ]
        );
      })
    );
  };

  let allIdList = [];
  allIdList.push(idList);

  await Promise.all(
    dbDataList.map(async (dbData) => {
      if (dbData.videoCount > 0) {
        const channelId = dbData.id;
        const playlistId = Youtube.getUploadPlaylistIdFromChannelId(channelId);
        const playlistItemApiDataList = await yt.getPlaylistItems(playlistId);
        const videoIdList = playlistItemApiDataList.map(
          (playlistItemApiData) => {
            return Youtube.getVideoIdFromPlaylistItemApiData(
              playlistItemApiData
            );
          }
        );
        const videoApiDataList = await yt.getVideos(videoIdList);
        await Promise.all(
          videoApiDataList.map(async (videoApiData) => {
            const description =
              Youtube.getDescriptioFromVideoApiData(videoApiData);
            allIdList.push(Youtube.searchChannelIdFromText(description));

            const id = Youtube.getVideoIdFromVideoApiData(videoApiData);
            const channelId =
              Youtube.getChannelIdFromVideoApiData(videoApiData);
            const title = Youtube.getTitleFromVideoApiData(videoApiData);
            const viewCount =
              Youtube.getViewCountFromVideoApiData(videoApiData);
            const likeCount =
              Youtube.getLikeCountFromVideoApiData(videoApiData);
            const publishedAt =
              Youtube.getPublishedAtFromVideoApiData(videoApiData);
            const startTime =
              Youtube.getStartTimeFromVideoApiData(videoApiData);
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
      }
    })
  );

  await Promise.all(
    idList.map(async (id) => {
      const playlistApiDataList = await yt.getPlaylists(id);
      playlistApiDataList.map(async (playlistApiData) => {
        const columnList = ["id", "title", "channelId"];
        const updateColumnList = columnList.map(
          (column) => `${column}=values(${column})`
        );
        await con.query(
          `INSERT INTO playlist (${columnList.join(
            ","
          )}) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ${updateColumnList.join(
            ","
          )}`,
          [
            Youtube.getPlaylistIdFromPlaylistApiData(playlistApiData),
            Youtube.getTitleFromPlaylistApiData(playlistApiData),
            playlistApiData.snippet.channelId,
          ]
        );
      });
    })
  );

  let flatAllIdList = removeDuplicatesFromArray(allIdList.flat());
  updateChannel(flatAllIdList);

  await con.end();
})();
