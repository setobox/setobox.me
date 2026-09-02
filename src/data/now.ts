/**
 * 「最近在听 / 最近在玩」内容。
 *
 * 手动维护的卡片列表；对应数组为空时，About 页的该区块不渲染。
 * 若要接 Last.fm / Steam 自动化，后续可改为请求数据 + 本地列表兜底。
 */

export interface NowListening {
  title: string;
  artist: string;
  /** 封面图 URL。 */
  cover: string;
  href: string;
}

export interface NowPlaying {
  title: string;
  /** 封面图 URL。 */
  cover: string;
  href: string;
  /** 备注，如游戏时长。 */
  note?: string;
}

export const nowListening: NowListening[] = [
  // {
  //   title: "Fly To Meteor",
  //   artist: "Artists",
  //   cover: "https://example.com/cover.jpg",
  //   href: "https://music.163.com/...",
  // },
];

export const nowPlaying: NowPlaying[] = [
  // {
  //   title: "Some Game",
  //   cover: "https://example.com/cover.jpg",
  //   href: "https://store.steampowered.com/...",
  //   note: "120h",
  // },
];
