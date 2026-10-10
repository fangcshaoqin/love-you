(() => {
  const seasons = {
    spring: {
      label: "春日",
      mark: "春日来信",
      symbol: "❀",
      whisper: "春风路过时，也替我想起你。",
      note: "愿温柔像新芽一样，悄悄长满每一天。",
      login: "此刻正值春天，愿你也有新的期待。",
      stars: ["愿你的日子像花一样慢慢盛开。", "春风刚好，我也刚好在想你。"],
    },
    summer: {
      label: "夏日",
      mark: "夏日晴笺",
      symbol: "☼",
      whisper: "把阳光、晚风和喜欢都分你一半。",
      note: "愿每个明亮的日子，都有冰凉的甜和真心的陪伴。",
      login: "夏日正盛，愿每一束光都落在你喜欢的地方。",
      stars: ["今天也给自己一点热烈又轻快的快乐。", "晚风会把我的想念，轻轻送到你身边。"],
    },
    autumn: {
      label: "秋日",
      mark: "枫叶来信",
      symbol: "🍁",
      whisper: "一片枫叶夹进琴谱，替我把心事留给你。",
      note: "枫叶落下的时候，藏在里面的话也该被你发现了。",
      login: "秋天把枫叶和那封信，都留在了琴房里。",
      stars: ["那枚枫叶书签，是我等你时夹进去的。", "秋风经过窗边时，琴谱替我翻到了想你的那页。"],
    },
    winter: {
      label: "冬日",
      mark: "冬日暖信",
      symbol: "❄",
      whisper: "天气冷了，我的偏爱还是热的。",
      note: "愿你有热茶、有好梦，也有随时可以依靠的温柔。",
      login: "冬夜安静，愿这份小小温暖陪你一会儿。",
      stars: ["记得添一件衣服，也记得照顾好自己。", "把手放进口袋，我把一句喜欢放在里面。"],
    },
  };
  let currentSeason = "";
  let manualSeason = "";

  function getSeason(date) {
    // Use local calendar months for the northern-hemisphere meteorological seasons.
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
  }

  function applySeason(date = new Date()) {
    const season = manualSeason || getSeason(date);
    const root = document.documentElement;
    if (root.dataset.season === season) return;

    root.dataset.season = season;
    currentSeason = season;
    const copy = seasons[season];
    const seasonMark = document.querySelector("#season-mark");
    const seasonWhisper = document.querySelector("#season-whisper");
    const seasonLabel = document.querySelector("#season-label");
    const seasonSymbol = document.querySelector("#season-symbol");
    const seasonNote = document.querySelector("#season-note");
    const loginSeason = document.querySelector("#login-season");

    if (seasonMark) seasonMark.textContent = copy.mark;
    if (seasonWhisper) seasonWhisper.textContent = copy.whisper;
    if (seasonLabel) seasonLabel.textContent = copy.label;
    if (seasonSymbol) seasonSymbol.textContent = copy.symbol;
    if (seasonNote) seasonNote.textContent = copy.note;
    if (loginSeason) loginSeason.textContent = copy.login;
    window.dispatchEvent(new CustomEvent("seasonchange", { detail: { season } }));
  }

  function cycleSeason() {
    const seasonNames = Object.keys(seasons);
    const currentIndex = seasonNames.indexOf(currentSeason || getSeason(new Date()));
    manualSeason = seasonNames[(currentIndex + 1) % seasonNames.length];
    applySeason();
    return seasons[manualSeason].label;
  }

  function getStarMessage(message, index, date = new Date()) {
    const copy = seasons[currentSeason || getSeason(date)];
    return `${message} ${copy.stars[index]}`;
  }

  applySeason();
  window.setInterval(applySeason, 60_000);
  window.SeasonalTheme = Object.freeze({ getSeason, getStarMessage, applySeason, cycleSeason });
})();
