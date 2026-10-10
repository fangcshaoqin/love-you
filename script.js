      const letterDialog = document.querySelector("#love-letter");
      const footerThemeButtons = [...document.querySelectorAll("[data-theme-cycle]")];
      const footerThemeStatus = document.querySelector("#footer-theme-status");
      const footerWeatherIcon = document.querySelector("#footer-weather-icon");
      const footerSeasonIcon = document.querySelector("#footer-season-icon");
      const sceneWeatherDetail = document.querySelector("#scene-weather-detail");
      const sceneTimeDetail = document.querySelector("#scene-time-detail");
      const sceneSeasonDetail = document.querySelector("#scene-season-detail");
      const secretNoteClue = document.querySelector("#secret-note-clue");
      const pianoSceneLabel = document.querySelector("#piano-scene-label");
      const pianoSceneChord = document.querySelector("#piano-scene-chord");
      const letterTitle = document.querySelector("#letter-title");
      const letterWeatherCopy = document.querySelector("#letter-weather-copy");
      const letterSeasonCopy = document.querySelector("#letter-season-copy");
      const letterTimeCopy = document.querySelector("#letter-time-copy");
      const letterClosing = document.querySelector("#letter-closing");
      const usedThemeControls = new Set();
      const openLetterButton = document.querySelector("#open-letter");
      const closeLetterButton = document.querySelector(".close-dialog");
      const letterContent = document.querySelector(".letter-content");
      const keepNoteButton = document.querySelector(".keep-note");
      const starMessage = document.querySelector(".star-message");
      const loginBadge = document.querySelector("#login-badge");
      let messageTimeout;
      let envelopeTimeout;
      let closeAfterBurstTimeout;

      let sessionLogin;
      try {
        sessionLogin = JSON.parse(localStorage.getItem("loveLetterLocalSession") || "null");
      } catch (error) {
        console.error("Unable to read the local login session.", error);
      }

      if (!sessionLogin || typeof sessionLogin.username !== "string" || !sessionLogin.username || !Number.isSafeInteger(sessionLogin.count) || sessionLogin.count < 1) {
        window.location.replace("./login.html");
      } else {
        document.documentElement.classList.add("authenticated");
        loginBadge.textContent = `${sessionLogin.username} · 登录 ${sessionLogin.count} 次`;
        loginBadge.classList.add("is-visible");
      }

      const timeCopy = {
        deepNight: {
          greeting: "00:00 · 琴房最后一盏灯",
          eyebrow: "深夜场 · 第七间练习室",
          title: "夜色替我保管这段旋律。",
          message: "雨停了，旧琴房里还有一个音符没有落下。",
          promise: "别急着离开，信的最后一页写着你的名字。",
          sceneDetail: "午夜的钟停在 12 点 07 分，琴键上留着一小块月光。",
          noteTitle: "夜深以后，秘密才会发亮。",
          noteCopy: "窗外安静下来，琴键上的回声却还记得你来过。",
          noteBadge: "夜间档案 · 未寄出的第七封信",
          stars: [
            "最后一盏灯没有关，因为我猜你还会回来。",
            "听见窗外第三声雨了吗？那是我藏好的暗号。",
          ],
        },
        dawn: {
          greeting: "05:00 · 天快亮了",
          eyebrow: "晨光场 · 雨后的第一封信",
          title: "天亮以前，我想先见你。",
          message: "屋檐的雨滴慢慢停下，天边透进一线很轻的光。",
          promise: "把昨晚没说完的话，留到今天继续。",
          sceneDetail: "天边刚亮，窗台的水珠把第一束晨光折成了彩色。",
          noteTitle: "日出是这封信的开场。",
          noteCopy: "天空一点点亮起来，昨天的秘密也有了新的答案。",
          noteBadge: "晨间档案 · 雨停后的第一声琴音",
          stars: [
            "窗台那片叶子上，留着昨晚最后一滴雨。",
            "新的一天开始了，琴房的门今天也为你开着。",
          ],
        },
        morning: {
          greeting: "08:00 · 阳光落在琴谱上",
          eyebrow: "上午场 · 练习从第一小节开始",
          title: "把今天弹成喜欢的样子。",
          message: "晨光停在旧琴谱边缘，像有人替你标好了重点。",
          promise: "翻到下一页，那里有我偷偷写给你的话。",
          sceneDetail: "晨光爬上琴谱边缘，墨迹旁多了一枚新鲜的咖啡杯印。",
          noteTitle: "今天的序章，由你来写。",
          noteCopy: "不必一下子弹得完美，每个认真开始的音符都算数。",
          noteBadge: "上午档案 · 第一个音符已落下",
          stars: [
            "琴盖上有一小片阳光，替你把位置留好了。",
            "今天的第一小节，写着一句：我在想你。",
          ],
        },
        noon: {
          greeting: "12:00 · 阳光照进练习室",
          eyebrow: "正午场 · 中场休息",
          title: "暂停一下，也是一种节奏。",
          message: "午后的钟声敲过十二下，先把琴谱合起来歇一会儿。",
          promise: "等你回来，故事会从刚才那一页接着往下。",
          sceneDetail: "正午的光落在琴凳上，像在提醒你先停下来歇一会儿。",
          noteTitle: "留白，也是乐谱的一部分。",
          noteCopy: "给自己一点休息的空隙，再继续今天未完的旋律。",
          noteBadge: "午间档案 · 请稍作停留",
          stars: [
            "钢琴旁边放了点心，记得趁热吃掉。",
            "休息五分钟吧，琴房不会催你。",
          ],
        },
        afternoon: {
          greeting: "15:00 · 风把窗帘吹开了",
          eyebrow: "午后场 · 光影正在移动",
          title: "慢一点，才能听清心跳。",
          message: "风翻过琴谱，恰好停在那句没敢弹完的地方。",
          promise: "如果你也听见了，就当作我在轻轻回答。",
          sceneDetail: "风从半开的窗进来，替你把谱子翻到了下一段副歌。",
          noteTitle: "风替我们翻到了下一页。",
          noteCopy: "把步子放慢一些，留意那些只出现一瞬的温柔。",
          noteBadge: "午后档案 · 被风翻开的那一页",
          stars: [
            "窗帘动了一下——风也想听你弹琴。",
            "那张折角的琴谱里，还藏着一片枫叶。",
          ],
        },
        goldenHour: {
          greeting: "17:00 · 琴房染成了琥珀色",
          eyebrow: "黄昏场 · 最后一束日光",
          title: "晚霞把没说的话照亮了。",
          message: "夕阳落在琴键上，黑白之间藏着一小段心事。",
          promise: "趁天色还没暗，把那封信打开看看吧。",
          sceneDetail: "夕阳沿着琴盖慢慢退场，金色的余光停在那封信上。",
          noteTitle: "黄昏是秘密最柔软的颜色。",
          noteCopy: "一天快要收尾了，把今天的疲惫留给风，把喜欢带回家。",
          noteBadge: "黄昏档案 · 琥珀色的回声",
          stars: [
            "日落之前，记得看一眼窗外的枫树。",
            "如果琴声变得很轻，那是我在说今天也想你。",
          ],
        },
        evening: {
          greeting: "19:00 · 窗外亮起第一盏灯",
          eyebrow: "入夜场 · 请轻轻推门",
          title: "夜色落下，琴声还没散。",
          message: "校园安静下来，只有练习室里留着一盏暖灯。",
          promise: "今晚的最后一首曲子，想和你一起听完。",
          sceneDetail: "走廊的灯一盏盏亮起来，门边那把伞还在等它的主人。",
          noteTitle: "夜晚替白天留下了回声。",
          noteCopy: "把今天的喧闹关在门外，坐下来听一会儿自己的心。",
          noteBadge: "夜间档案 · 灯仍亮着",
          stars: [
            "门边的伞还在，明天如果下雨我们就一起走。",
            "你推门的声音，我在很远的地方也认得。",
          ],
        },
        lateNight: {
          greeting: "22:00 · 只剩月光和琴声",
          eyebrow: "深夜场 · 最后一页即将合上",
          title: "月光知道，我还没说完。",
          message: "钟声走到十点，琴房里的秘密终于只剩我们知道。",
          promise: "合上信之前，记得把这句喜欢收好。",
          sceneDetail: "夜深后连雨声也睡着了，只剩谱架旁的小灯没有熄。",
          noteTitle: "把今晚的旋律带进梦里。",
          noteCopy: "夜深了，所有没来得及说的话，都可以留给明天的阳光。",
          noteBadge: "夜间档案 · 请妥善保管",
          stars: [
            "月光落在琴谱上，替你圈出了那句我最喜欢的话。",
            "晚安。琴房的钥匙，明天仍然为你留着。",
          ],
        },
      };
      const phaseColors = {
        deepNight: "#161a25",
        dawn: "#432b36",
        morning: "#58443a",
        noon: "#344b5b",
        afternoon: "#353c57",
        goldenHour: "#713e32",
        evening: "#322631",
        lateNight: "#211f36",
      };
      const timePhases = Object.keys(timeCopy);
      const liveDate = document.querySelector("#live-date");
      const liveClock = document.querySelector("#live-clock");
      const letterDate = document.querySelector("#letter-date");
      const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
        month: "numeric",
        day: "numeric",
        weekday: "short",
      });
      const clockFormatter = new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      });
      const letterDateFormatter = new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      let currentTimePhase = "";
      let currentTimeCopy;
      let manualTimePhase = "";

      function updateSeasonalStarMessages() {
        if (!currentTimeCopy) return;

        document.querySelectorAll(".float-star").forEach((star, index) => {
          star.dataset.message = window.SeasonalTheme.getStarMessage(currentTimeCopy.stars[index], index);
        });
      }

      function updateSceneCaption() {
        const seasonLabels = {
          spring: "花开时，旧琴房的窗也打开了",
          summer: "蝉鸣停下，晚风带来一页琴谱",
          autumn: "枫叶落在那封没有寄出的信上",
          winter: "雪落无声，琴房留着一盏灯",
        };
        const weatherLabels = {
          clear: "云散了，窗边的琴键还暖着",
          cloudy: "云层很低，像秘密还没有说完",
          fog: "雾气漫过窗沿，故事暂时藏起来",
          drizzle: "细雨敲窗，琴谱翻到了下一页",
          rain: "雨声渐密，替我们保守秘密",
          snow: "雪花落下，旧琴房安静得刚刚好",
          storm: "雷声经过，琴声仍然没有停",
          unknown: "窗外天气，正替故事换一页",
        };
        const seasonLabel = seasonLabels[document.documentElement.dataset.season] || seasonLabels.spring;
        const weatherLabel = weatherLabels[document.documentElement.dataset.weather] || weatherLabels.unknown;
        const caption = document.querySelector("#scene-weather-label");
        const season = document.documentElement.dataset.season;
        const weather = document.documentElement.dataset.weather;
        const roomSeason = {
          spring: "BLOSSOM SCORE",
          summer: "SUMMER STATIC",
          autumn: "MAPLE LETTER",
          winter: "FROSTED KEYS",
        };
        const roomWeather = {
          clear: "SUNLIT",
          cloudy: "OVERCAST",
          fog: "IN THE MIST",
          drizzle: "SOFT RAIN",
          rain: "AFTER THE RAIN",
          snow: "FIRST SNOW",
          storm: "THUNDER ROLL",
          unknown: "OUTSIDE",
        };
        const weatherChords = {
          clear: "♪ 晴日间奏 ♪",
          cloudy: "♩ 云层低音 ♩",
          fog: "♬ 雾中回声 ♬",
          drizzle: "♩ 细雨前奏 ♩",
          rain: "♫ 雨声副歌 ♫",
          snow: "♩ 雪落休止符 ♩",
          storm: "♬ 雷鸣变奏 ♬",
          unknown: "♩ ♫ ♩",
        };
        if (caption) caption.textContent = `${seasonLabel} · ${weatherLabel}`;
        pianoSceneLabel.textContent = `ROOM 07 · ${roomSeason[season] || roomSeason.spring} / ${roomWeather[weather] || roomWeather.unknown}`;
        pianoSceneChord.textContent = weatherChords[weather] || weatherChords.unknown;
        footerWeatherIcon.textContent = document.querySelector("#weather-icon").textContent;
        footerSeasonIcon.textContent = document.querySelector("#season-symbol").textContent;
        updateAtmosphereDetails();
      }

      function updateAtmosphereDetails() {
        const season = document.documentElement.dataset.season;
        const weather = document.documentElement.dataset.weather;
        const phase = document.documentElement.dataset.time;
        const sceneDetails = {
          spring: "窗缝里钻进一阵花香，琴谱上多了一枚淡粉色的指印。",
          summer: "蝉声躲在午后的光里，钢琴边那杯冰水凝起了雾。",
          autumn: "一片枫叶夹在第七页——背面写着：等你听完这首曲子。",
          winter: "窗上的霜被人画成了五线谱，最后一个音符是你的名字。",
        };
        const weatherDetails = {
          clear: "云散开了，斜阳把窗格投在琴键上；最亮的那格，像是专门留给你的座位。",
          cloudy: "厚云压低了天色，窗外的树影慢慢晃着；今天的琴声听起来也柔软了一些。",
          fog: "雾气把远处的钟楼藏了起来，玻璃上浮出一行字：别急，我还在这里。",
          drizzle: "细雨在窗上敲出轻轻的前奏，谱架边那张纸被水汽熏出了半个心形。",
          rain: "雨点沿着玻璃汇成小河，琴房里只听见你和雨声，把同一段旋律听了两遍。",
          snow: "雪花落在窗沿，世界安静得只剩琴键；窗外那串脚印，停在了练习室门口。",
          storm: "雷声滚过屋顶，灯光闪了一下，琴谱背面的暗号也跟着亮了起来。",
          unknown: "窗外的天气正在变化，琴房替你把这一刻收进了未寄出的信里。",
        };
        const weatherClues = {
          clear: "阳光在琴键上留下了七道细线，像一段没写完的谱。",
          cloudy: "云把窗外的钟藏了起来，琴房里却刚好多了一分钟。",
          fog: "雾里隐约有个人影；眨眼以后，只剩窗上的一颗心。",
          drizzle: "第三滴雨落下时，琴谱自己翻到了写着你名字的那页。",
          rain: "雨声里藏着三短一长的节拍，是我们约好的暗号。",
          snow: "窗外的雪地有两行脚印，走到窗前就忽然消失了。",
          storm: "闪电亮起的一瞬，琴谱边缘显出一行看不见的字。",
          unknown: "天气还没留下答案，先听听窗外的风在说什么。",
        };
        const timeClues = {
          "deep-night": "午夜以后别数琴键：第 88 个音，今晚不会响。",
          dawn: "天亮前的第一束光，会照出琴谱背面的那句留言。",
          morning: "早晨第一声鸟鸣，刚好落在这首曲子的休止符上。",
          noon: "十二点整，钢琴影子会指向那封没寄出的信。",
          afternoon: "下午三点，窗帘会替你翻过一页谱子。",
          "golden-hour": "夕阳把琴房染成金色时，未寄的信会多一枚邮戳。",
          evening: "校园灯亮起的顺序，刚好拼成了练习室的门牌号。",
          "late-night": "深夜最后一颗星，是我替你留在谱架上的灯。",
        };
        const weatherClue = weatherClues[weather] || weatherClues.unknown;
        const timeClue = timeClues[phase] || timeClues.evening;
        const weatherIntensity = document.documentElement.dataset.weatherIntensity;
        const rainVariation = weather === "rain" && weatherIntensity === "heavy"
          ? "风把雨丝斜斜推过窗格，像有人急着赶来赴约。"
          : weather === "rain" && weatherIntensity === "steady"
            ? "雨声一阵紧、一阵松，替琴房守着没说完的话。"
            : "";
        const selectedTimeCopy = timeCopy[timePhases.find((key) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`) === phase)];
        const letterWeatherLines = {
          clear: "窗外放晴了，阳光把信纸照得透亮。我想把这份好天气，和第一个想到的你一起收藏。",
          cloudy: "云把天空铺得很柔软，像一张还没写字的信纸。今天也想把心里的位置留给你。",
          fog: "雾遮住了远处的风景，却没能藏住我的心意：无论看不看得清，我都认得你。",
          drizzle: "细雨替我敲了敲窗，像提醒我该给你写信了。愿这点轻轻的雨声陪你慢下来。",
          rain: "雨落得很认真，我也想认真告诉你：每个平凡日子因为有你，都值得记上一笔。",
          snow: "雪把世界的声音都收走了，这封信就替我说：天冷了，记得照顾好自己，也记得有人惦记你。",
          storm: "窗外雷声很响，但我想让你读到的这句话更坚定：不管天气怎样，我都会站在你这边。",
          unknown: "窗外的天气还没写下答案，我先把这一刻的想念放进信里，寄给正在读它的你。",
        };
        const letterSeasonLines = {
          spring: "春天把新芽送到窗边，我也想陪你把新的愿望，一件一件慢慢实现。",
          summer: "夏日的光很热烈，而我想给你的喜欢不必张扬，却会一直明亮。",
          autumn: "我夹了一片枫叶在信里。等它变得很旧时，也请你记得那天我有多想念你。",
          winter: "如果冬夜有一点冷，就把这封信当作一杯热茶。我愿意把温柔留给你很久很久。",
        };
        const letterTimeLines = {
          "deep-night": "夜深了，不用急着回信。把想说的话留到明天也没关系，我的在意不会过期。",
          dawn: "天快亮了，愿你醒来时心里有新的盼望，也知道有人已经在今天想起你。",
          morning: "新的一天刚刚开始，愿你带着一点轻松出发；遇到开心的事，记得第一个讲给我听。",
          noon: "忙到中午也要记得休息。世界可以等一会儿，你的感受值得先被照顾。",
          afternoon: "下午的光正在移动，愿你不必赶路，也不必证明什么，做自己就已经很好。",
          "golden-hour": "黄昏把今天轻轻合上。无论这一日过得怎样，我都想把一句“辛苦了”留给你。",
          evening: "夜色刚刚落下，愿你把白天的疲惫放在门外，带着安心读完这封信。",
          "late-night": "月亮已经很高了。读到这里就去睡吧，明天醒来，我的喜欢还会在原地。",
        };
        const letterSeasonTitles = {
          spring: "春日里，写给最喜欢的你",
          summer: "夏日晴光，写给最喜欢的你",
          autumn: "枫叶信笺，写给最喜欢的你",
          winter: "冬夜暖信，写给最喜欢的你",
        };
        letterTitle.textContent = letterSeasonTitles[season] || "给最喜欢的你";
        letterWeatherCopy.textContent = letterWeatherLines[weather] || letterWeatherLines.unknown;
        letterSeasonCopy.textContent = letterSeasonLines[season] || letterSeasonLines.autumn;
        letterTimeCopy.textContent = letterTimeLines[phase] || letterTimeLines.evening;
        letterClosing.textContent = selectedTimeCopy
          ? `${selectedTimeCopy.promise} 你的开心值得被珍惜，疲惫也有地方安放。`
          : "愿你记得：你的开心值得被珍惜，疲惫也有地方安放。";
        sceneWeatherDetail.textContent = `天气来信 · ${[weatherDetails[weather] || weatherDetails.unknown, rainVariation].filter(Boolean).join(" ")}`;
        sceneTimeDetail.textContent = `时刻手记 · ${selectedTimeCopy?.sceneDetail || "钟摆轻轻走着，琴房替你留下这一刻。"}`;
        sceneSeasonDetail.textContent = `季节暗语 · ${sceneDetails[season] || sceneDetails.autumn}`;

        const allThemesExplored = ["weather", "time", "season"].every((theme) => usedThemeControls.has(theme));
        secretNoteClue.textContent = allThemesExplored
          ? `隐藏乐句已解锁：${weatherClue} ${timeClue} ${sceneDetails[season] || sceneDetails.autumn}`
          : `— 暗号碎片 · ${weatherClue}`;
      }

      window.addEventListener("seasonchange", updateSeasonalStarMessages);
      window.addEventListener("seasonchange", updateSceneCaption);
      window.addEventListener("weatherchange", updateSceneCaption);
      window.addEventListener("weatherchange", (event) => {
        if (event.detail.source === "live") footerThemeStatus.textContent = "";
      });
      updateSceneCaption();

      function getTimePhase(hour) {
        if (hour < 5) return "deepNight";
        if (hour < 7) return "dawn";
        if (hour < 11) return "morning";
        if (hour < 14) return "noon";
        if (hour < 17) return "afternoon";
        if (hour < 19) return "goldenHour";
        if (hour < 22) return "evening";
        return "lateNight";
      }

      function applyTimePhase(phase) {
        currentTimePhase = phase;
        document.documentElement.dataset.time = phase.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        document.querySelector('meta[name="theme-color"]').content = phaseColors[phase];

        const copy = timeCopy[phase];
        currentTimeCopy = copy;
        document.querySelector("#time-greeting").textContent = copy.greeting;
        document.querySelector("#time-eyebrow").textContent = copy.eyebrow;
        document.querySelector("#time-title").textContent = copy.title;
        document.querySelector("#time-message").textContent = copy.message;
        document.querySelector("#time-promise").textContent = copy.promise;
        document.querySelector("#little-note-title").textContent = copy.noteTitle;
        document.querySelector("#time-note-copy").textContent = copy.noteCopy;
        document.querySelector("#time-note").textContent = copy.noteBadge;
        updateSeasonalStarMessages();
        updateAtmosphereDetails();
      }

      function cycleTimePhase() {
        const currentIndex = timePhases.indexOf(currentTimePhase);
        manualTimePhase = timePhases[(currentIndex + 1) % timePhases.length];
        applyTimePhase(manualTimePhase);
        return timeCopy[manualTimePhase].greeting;
      }

      function updateLocalTime() {
        const now = new Date();
        const hour = now.getHours();
        const actualPhase = getTimePhase(hour);
        const phase = manualTimePhase || actualPhase;
        const nowIso = now.toISOString();

        const dateParts = Object.fromEntries(
          dateFormatter.formatToParts(now).map((part) => [part.type, part.value]),
        );
        liveDate.textContent = `${dateParts.month}月${dateParts.day}日 ${dateParts.weekday}`;
        liveDate.dateTime = nowIso;
        liveClock.textContent = clockFormatter.format(now);
        liveClock.dateTime = nowIso;
        letterDate.textContent = letterDateFormatter.format(now);

        if (phase !== currentTimePhase) applyTimePhase(phase);
      }

      footerThemeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const theme = button.dataset.themeCycle;
          usedThemeControls.add(theme);
          let label;
          if (theme === "weather") {
            label = window.WeatherTheme.cyclePreview();
          } else if (theme === "time") {
            label = cycleTimePhase();
          } else if (theme === "season") {
            label = window.SeasonalTheme.cycleSeason();
          }

          if (label) footerThemeStatus.textContent = usedThemeControls.size === 3
            ? `已切换：${label} · 隐藏乐句已解锁，去展开琴谱背面的字`
            : `已切换：${label}`;
          updateAtmosphereDetails();
        });
      });

      updateLocalTime();
      window.setInterval(updateLocalTime, 1000);

      openLetterButton.addEventListener("click", () => {
        window.clearTimeout(envelopeTimeout);
        letterContent.inert = true;
        letterDialog.dataset.stage = "sealed";
        letterDialog.showModal();

        envelopeTimeout = window.setTimeout(() => {
          letterDialog.dataset.stage = "flap-open";
          envelopeTimeout = window.setTimeout(() => {
            letterDialog.dataset.stage = "paper-rising";
            envelopeTimeout = window.setTimeout(() => {
              letterDialog.dataset.stage = "revealed";
              letterContent.inert = false;
            }, 650);
          }, 480);
        }, 180);
      });

      closeLetterButton.addEventListener("click", () => {
        letterDialog.close();
      });

      keepNoteButton.addEventListener("click", () => {
        if (keepNoteButton.disabled) {
          return;
        }

        keepNoteButton.disabled = true;
        keepNoteButton.innerHTML = '收到啦，放进心里 <span aria-hidden="true">♥</span>';
        const buttonBounds = keepNoteButton.getBoundingClientRect();

        for (let index = 0; index < 7; index += 1) {
          const heart = document.createElement("span");
          heart.className = "heart-burst";
          heart.setAttribute("aria-hidden", "true");
          heart.textContent = index % 2 === 0 ? "♥" : "♡";
          heart.style.left = `${buttonBounds.left + buttonBounds.width / 2}px`;
          heart.style.top = `${buttonBounds.top + 8}px`;
          heart.style.setProperty("--drift", `${(index - 3) * 20}px`);
          heart.style.setProperty("--turn", `${(index - 3) * 18}deg`);
          document.body.append(heart);
          window.setTimeout(() => heart.remove(), 950);
        }

        window.clearTimeout(closeAfterBurstTimeout);
        closeAfterBurstTimeout = window.setTimeout(() => {
          letterDialog.close();
        }, 850);
      });

      letterDialog.addEventListener("close", () => {
        window.clearTimeout(envelopeTimeout);
        window.clearTimeout(closeAfterBurstTimeout);
        keepNoteButton.disabled = false;
        keepNoteButton.innerHTML = '把这颗心收好 <span aria-hidden="true">♡</span>';
        letterContent.inert = true;
        letterDialog.dataset.stage = "sealed";
      });

      letterDialog.addEventListener("click", (event) => {
        if (event.target === letterDialog) {
          letterDialog.close();
        }
      });

      document.querySelectorAll(".float-star").forEach((star) => {
        star.addEventListener("click", () => {
          window.clearTimeout(messageTimeout);
          starMessage.textContent = star.dataset.message;
          starMessage.classList.add("is-visible");
          messageTimeout = window.setTimeout(() => {
            starMessage.classList.remove("is-visible");
          }, 3200);
        });
      });
    
