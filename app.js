const tabs = document.querySelectorAll(".tab");
const pages = document.querySelectorAll(".page");
const notifications = document.getElementById("notifications");

const avatarImg = document.getElementById("avatar");
const usernameSpan = document.getElementById("username");
const userGitCountSpan = document.getElementById("userGitCount");
const obfCountSpan = document.getElementById("obfCount");

const codeInput = document.getElementById("code-input");
const codeOutput = document.getElementById("code-output");
const obfuscateBtn = document.getElementById("obfuscate-btn");
const loadingSpinner = document.getElementById("loading");

const encryptStringsCheckbox = document.getElementById("encryptStrings");
const controlFlowCheckbox = document.getElementById("controlFlow");
const junkCodeCheckbox = document.getElementById("junkCode");
const renameVarsCheckbox = document.getElementById("renameVars");
const languageSelect = document.getElementById("language-select");

const logsList = document.getElementById("logs-list");
const clearLogsBtn = document.getElementById("clear-logs-btn");

const themeSelect = document.getElementById("theme-select");
const customThemeControls = document.getElementById("custom-theme-controls");
const customBgInput = document.getElementById("custom-bg");
const customPrimaryInput = document.getElementById("custom-primary");
const customAccentInput = document.getElementById("custom-accent");
const customTextInput = document.getElementById("custom-text");
const applyCustomBtn = document.getElementById("apply-custom-theme");
const resetCustomBtn = document.getElementById("reset-custom-theme");

let obfuscationCount = 0;
let logs = [];

function setActiveTab(tabName) {
  tabs.forEach(t => {
    const active = t.dataset.tab === tabName;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", active);
    t.tabIndex = active ? 0 : -1;
  });
  pages.forEach(p => p.classList.toggle("active", p.id === tabName));
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

function notify(text) {
  const notif = document.createElement("div");
  notif.className = "notification";
  notif.textContent = text;
  notifications.appendChild(notif);

  setTimeout(() => {
    notif.style.opacity = "0";
    notif.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notifications.contains(notif)) notifications.removeChild(notif);
    }, 500);
  }, 3000);

  notif.addEventListener("click", () => {
    if (notifications.contains(notif)) notifications.removeChild(notif);
  });
}

async function fetchGitHubUser(username = "octocat") {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error("User not found");
    const data = await res.json();
    avatarImg.src = data.avatar_url;
    usernameSpan.textContent = data.login;
    userGitCountSpan.textContent = data.public_repos;
  } catch {
    avatarImg.src = "https://avatars.githubusercontent.com/u/583231?v=4";
    usernameSpan.textContent = "octocat";
    userGitCountSpan.textContent = "0";
  }
}

fetchGitHubUser();

function obfuscateCode(code, lang, opts) {
  return new Promise(resolve => {
    setTimeout(() => {
      let output = code.split("").reverse().map(c => {
        if (opts.encryptStrings && /[a-zA-Z]/.test(c)) {
          return String.fromCharCode(c.charCodeAt(0) + 1);
        }
        return c;
      }).join("");
      if (opts.renameVars) output = output.toUpperCase();
      if (opts.junkCode) output += "\n-- junk code injected";
      if (opts.controlFlow) output = "-- control flow added\n" + output;
      resolve(output);
    }, 1500);
  });
}

async function handleObfuscate() {
  const code = codeInput.value.trim();
  if (!code) {
    notify("Input code cannot be empty.");
    return;
  }
  obfuscateBtn.disabled = true;
  loadingSpinner.classList.remove("hidden");
  const opts = {
    encryptStrings: encryptStringsCheckbox.checked,
    controlFlow: controlFlowCheckbox.checked,
    junkCode: junkCodeCheckbox.checked,
    renameVars: renameVarsCheckbox.checked,
  };
  const lang = languageSelect.value;
  try {
    const result = await obfuscateCode(code, lang, opts);
    codeOutput.value = result;
    obfuscationCount++;
    obfCountSpan.textContent = obfuscationCount;
    logs.unshift({
      time: new Date().toLocaleString(),
      lang,
      options: opts,
      output: result,
    });
    updateLogs();
    notify("Obfuscation complete.");
  } catch {
    notify("Obfuscation failed.");
  } finally {
    loadingSpinner.classList.add("hidden");
    obfuscateBtn.disabled = false;
  }
}

obfuscateBtn.addEventListener("click", handleObfuscate);

document.getElementById("copy-btn").addEventListener("click", () => {
  if (!codeOutput.value) return notify("Nothing to copy.");
  navigator.clipboard.writeText(codeOutput.value);
  notify("Output copied to clipboard.");
});

document.getElementById("save-btn").addEventListener("click", () => {
  if (!codeOutput.value) return notify("Nothing to save.");
  const blob = new Blob([codeOutput.value], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `obfuscated.${languageSelect.value === "lua" ? "lua" : "js"}`;
  a.click();
  URL.revokeObjectURL(a.href);
  notify("Output saved.");
});

document.getElementById("clear-btn").addEventListener("click", () => {
  codeOutput.value = "";
  notify("Output cleared.");
});

function updateLogs() {
  logsList.innerHTML = "";
  if (!logs.length) {
    logsList.innerHTML = "<li>No logs yet.</li>";
    return;
  }
  logs.forEach(log => {
    const li = document.createElement("li");
    li.textContent = `[${log.time}] (${log.lang}) Options: ${Object.entries(log.options).map(([k,v])=>k + "=" + v).join(", ")}`;
    logsList.appendChild(li);
  });
}

clearLogsBtn.addEventListener("click", () => {
  logs = [];
  updateLogs();
  notify("Logs cleared.");
});

updateLogs();

const themes = {
  blue: {
    "--bg": "#01020a",
    "--primary": "#00aaff",
    "--accent": "#005577",
    "--text": "#d0e8ff",
    "--shadow": "rgba(0, 170, 255, 0.2)",
  },
  ruby: {
    "--bg": "#1a000b",
    "--primary": "#ff0044",
    "--accent": "#77001f",
    "--text": "#ffb7c5",
    "--shadow": "rgba(255, 0, 68, 0.3)",
  },
  amethyst: {
    "--bg": "#10001a",
    "--primary": "#bb33ff",
    "--accent": "#550077",
    "--text": "#d9bbff",
    "--shadow": "rgba(187, 51, 255, 0.3)",
  },
  ghastly: {
    "--bg": "#000000",
    "--primary": "#00ffff",
    "--accent": "#003333",
    "--text": "#ccffff",
    "--shadow": "rgba(0, 255, 255, 0.4)",
  },
};

function applyTheme(name) {
  if (name === "custom") {
    customThemeControls.classList.remove("hidden");
    applyCustomColors();
  } else {
    customThemeControls.classList.add("hidden");
    const theme = themes[name];
    for (const prop in theme) {
      document.documentElement.style.setProperty(prop, theme[prop]);
    }
  }
}

function applyCustomColors() {
  document.documentElement.style.setProperty("--bg", customBgInput.value);
  document.documentElement.style.setProperty("--primary", customPrimaryInput.value);
  document.documentElement.style.setProperty("--accent", customAccentInput.value);
  document.documentElement.style.setProperty("--text", customTextInput.value);
}

themeSelect.addEventListener("change", e => {
  const val = e.target.value;
  applyTheme(val);
});

applyCustomBtn.addEventListener("click", () => {
  applyCustomColors();
  notify("Custom theme applied.");
});

resetCustomBtn.addEventListener("click", () => {
  customBgInput.value = "#000011";
  customPrimaryInput.value = "#00aaff";
  customAccentInput.value = "#00ffaa";
  customTextInput.value = "#d0e8ff";
  applyCustomColors();
  notify("Custom theme reset.");
});

applyTheme("blue");

document.addEventListener("keydown", e => {
  if (!e.ctrlKey) return;
  switch (e.key) {
    case "1": setActiveTab("home"); break;
    case "2": setActiveTab("obfuscator"); break;
    case "3": setActiveTab("logs"); break;
    case "4": setActiveTab("settings"); break;
    case "d":
    case "D":
      notify("Dark mode is always enabled.");
      break;
  }
});

document.body.addEventListener("mousedown", e => {
  if (e.target.classList.contains("tab")) e.preventDefault();
});
