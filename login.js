const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");
const usernameInput = document.querySelector("#login-username");
const passwordInput = document.querySelector("#login-password");
const loginGreeting = document.querySelector("#login-greeting");
const loginClock = document.querySelector("#login-clock");
const accountStoreKey = "loveLetterLocalDemoLogin";
const sessionKey = "loveLetterLocalSession";
const credentials = window.LOGIN_CONFIG;

try {
  localStorage.removeItem("loveLetterLocalDemoLastLogin");
  const storedAccounts = localStorage.getItem(accountStoreKey);
  if (storedAccounts) {
    const accounts = JSON.parse(storedAccounts);
    if (accounts && typeof accounts === "object" && !Array.isArray(accounts)) {
      for (const account of Object.values(accounts)) {
        if (account && typeof account === "object") {
          delete account.password;
        }
      }
      localStorage.setItem(accountStoreKey, JSON.stringify(accounts));
    }
  }
} catch (error) {
  console.error("Unable to remove legacy locally stored passwords.", error);
}

const greetingsByPhase = {
  deepNight: "00:00 · 琴房最后一盏灯",
  dawn: "05:00 · 天快亮了",
  morning: "08:00 · 阳光落在琴谱上",
  noon: "12:00 · 阳光照进练习室",
  afternoon: "15:00 · 风把窗帘吹开了",
  goldenHour: "17:00 · 琴房染成了琥珀色",
  evening: "19:00 · 窗外亮起第一盏灯",
  lateNight: "22:00 · 只剩月光和琴声",
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
});
const clockFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
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

function updateLoginTime() {
  const now = new Date();
  const phase = getTimePhase(now.getHours());
  const phaseAttribute = phase.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const dateParts = Object.fromEntries(
    dateFormatter.formatToParts(now).map((part) => [part.type, part.value]),
  );

  document.documentElement.dataset.time = phaseAttribute;
  document.querySelector('meta[name="theme-color"]').content = phaseColors[phase];
  loginGreeting.textContent = greetingsByPhase[phase];
  loginClock.textContent = `${dateParts.month}月${dateParts.day}日 ${clockFormatter.format(now)}`;
  loginClock.dateTime = now.toISOString();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginStatus.textContent = "";

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    loginStatus.textContent = "账号和密码都需要填写。";
    return;
  }

  if (
    !credentials ||
    typeof credentials.username !== "string" ||
    typeof credentials.password !== "string" ||
    !credentials.username ||
    !credentials.password ||
    credentials.username === "CHANGE_ME" ||
    credentials.password === "CHANGE_ME"
  ) {
    loginStatus.textContent = "请先在 login-config.js 中设置账号和密码。";
    return;
  }

  if (username !== credentials.username || password !== credentials.password) {
    loginStatus.textContent = "账号或密码不正确，请再试一次。";
    return;
  }

  try {
    const storedAccounts = localStorage.getItem(accountStoreKey);
    const savedAccounts = storedAccounts ? JSON.parse(storedAccounts) : {};
    if (!savedAccounts || typeof savedAccounts !== "object" || Array.isArray(savedAccounts)) {
      throw new TypeError("Saved account data is invalid.");
    }
    const accounts = Object.assign(Object.create(null), savedAccounts);
    const priorAccount = Object.prototype.hasOwnProperty.call(accounts, username)
      ? accounts[username]
      : null;

    const priorCount = Number(priorAccount?.count || 0);
    if (!Number.isSafeInteger(priorCount) || priorCount < 0 || priorCount === Number.MAX_SAFE_INTEGER) {
      throw new RangeError("The saved login count is invalid.");
    }
    const nextCount = priorCount + 1;

    for (const account of Object.values(accounts)) {
      if (account && typeof account === "object") {
        delete account.password;
      }
    }
    accounts[username] = { count: nextCount };
    localStorage.setItem(accountStoreKey, JSON.stringify(accounts));

    localStorage.setItem(sessionKey, JSON.stringify({ username, count: nextCount }));
    window.location.assign("./index.html");
  } catch (error) {
    console.error("Unable to save the local login.", error);
    loginStatus.textContent = "无法保存本地登录信息，请检查浏览器存储设置后重试。";
  }
});

updateLoginTime();
window.setInterval(updateLoginTime, 1000);
