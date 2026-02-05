const player = {
  level: 1,
  exp: 0,
  expToNext: 100,
  hp: 120,
  mp: 60,
  atk: 14,
  def: 10,
  gold: 120,
  skillPoints: 4,
  title: "芽吹く探究者",
};

const branches = [
  { id: "sword", name: "剣術系統", color: "#ef4444" },
  { id: "magic", name: "元素魔法", color: "#3b82f6" },
  { id: "support", name: "支援・回復", color: "#22c55e" },
  { id: "tank", name: "守護・防衛", color: "#f59e0b" },
  { id: "craft", name: "鍛冶・錬金", color: "#a855f7" },
  { id: "explore", name: "探索術", color: "#14b8a6" },
  { id: "tactics", name: "戦術・指揮", color: "#f97316" },
  { id: "arcane", name: "深淵魔導", color: "#6366f1" },
];

const skillTree = [];
const branchConfig = {
  sword: {
    tiers: 24,
    skillsPerTier: 24,
    baseCost: 1,
    description: "近接戦闘の基礎から必殺剣まで広がる主軸。",
  },
  magic: {
    tiers: 24,
    skillsPerTier: 24,
    baseCost: 1,
    description: "火・水・風・土の元素を操り戦場を支配する。",
  },
  support: {
    tiers: 24,
    skillsPerTier: 24,
    baseCost: 1,
    description: "回復・強化・弱体化を併せ持つ万能支援系統。",
  },
  tank: {
    tiers: 24,
    skillsPerTier: 24,
    baseCost: 1,
    description: "防御技術と挑発スキルで仲間を守る壁役。",
  },
  craft: {
    tiers: 24,
    skillsPerTier: 24,
    baseCost: 1,
    description: "武具制作・薬品調合・装備強化の職人系統。",
  },
  explore: {
    tiers: 24,
    skillsPerTier: 24,
    baseCost: 1,
    description: "地形把握・隠し道発見・採集効率を向上。",
  },
  tactics: {
    tiers: 24,
    skillsPerTier: 24,
    baseCost: 2,
    description: "陣形・指揮・解析で戦局を塗り替える戦術。",
  },
  arcane: {
    tiers: 24,
    skillsPerTier: 24,
    baseCost: 2,
    description: "禁術・星詠み・召喚など高位魔導の根幹。",
  },
};

const skillNames = {
  sword: [
    "基本剣術",
    "連撃強化",
    "剣気充填",
    "斬撃速度",
    "必殺準備",
    "瞬足踏み込み",
  ],
  magic: ["火炎強化", "氷結掌握", "雷鳴制御", "風刃支配", "土石守護", "元素共鳴"],
  support: ["初級回復", "浄化儀式", "鼓舞の声", "守護の祈り", "治癒増幅", "救済の輪"],
  tank: ["防壁生成", "挑発強化", "鉄壁姿勢", "守護結界", "逆境耐性", "盾反撃"],
  craft: ["鍛冶基礎", "素材目利き", "錬金処方", "装備強化", "希少素材解析", "匠の極意"],
  explore: ["地図作成", "気配察知", "隠し道発見", "採集効率", "危険回避", "探索眼"],
  tactics: ["陣形理解", "戦況分析", "指揮伝令", "集中砲火", "連携必殺", "戦場統治"],
  arcane: ["星詠み", "契約召喚", "虚無制御", "禁断解放", "次元干渉", "根源理解"],
};

const flavorLines = [
  "熟練者たちの記録から生まれた技術。",
  "長い旅路で磨かれた知恵。",
  "失われた古代文明の断片。",
  "鍛錬と研究の成果。",
  "次なる拡張を見据えた基盤スキル。",
];

function updateViewportVars() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  document.documentElement.style.setProperty("--viewport-width", `${width}px`);
  document.documentElement.style.setProperty("--viewport-height", `${height}px`);
}

function createSkillTree() {
  branches.forEach((branch) => {
    const config = branchConfig[branch.id];
    for (let tier = 1; tier <= config.tiers; tier += 1) {
      for (let i = 1; i <= config.skillsPerTier; i += 1) {
        const nameIndex = (tier * config.skillsPerTier + i - 1) % skillNames[branch.id].length;
        const baseName = skillNames[branch.id][nameIndex];
        skillTree.push({
          id: `${branch.id}-${tier}-${i}`,
          name: `${baseName}・${tier}-${i}`,
          branch: branch.id,
          branchName: branch.name,
          tier,
          cost: config.baseCost + Math.floor(tier / 2),
          unlocked: false,
          description: `${branch.name}の第${tier}階層。${flavorLines[(tier + i) % flavorLines.length]}`,
        });
      }
    }
  });
}

function updateHeader() {
  document.getElementById("skills-count").textContent = skillTree.length.toString();
  document.getElementById("skills-unlocked").textContent = skillTree.filter((s) => s.unlocked).length.toString();
  document.getElementById("skill-points").textContent = player.skillPoints.toString();
}

function updateStatus() {
  document.getElementById("level").textContent = player.level.toString();
  document.getElementById("exp").textContent = `${player.exp} / ${player.expToNext}`;
  document.getElementById("hp").textContent = `${player.hp} / ${player.hp}`;
  document.getElementById("mp").textContent = `${player.mp} / ${player.mp}`;
  document.getElementById("atk").textContent = player.atk.toString();
  document.getElementById("def").textContent = player.def.toString();
  document.getElementById("gold").textContent = player.gold.toString();
  document.getElementById("title").textContent = player.title;
}

function logMessage(message) {
  const log = document.getElementById("battle-log");
  const line = document.createElement("p");
  line.textContent = message;
  log.prepend(line);
}

function grantQuestRewards() {
  const expGain = 30 + Math.floor(Math.random() * 20);
  const goldGain = 45 + Math.floor(Math.random() * 20);
  player.exp += expGain;
  player.gold += goldGain;
  logMessage(`クエスト成功！経験値+${expGain}、ゴールド+${goldGain}。`);

  if (player.exp >= player.expToNext) {
    player.exp -= player.expToNext;
    player.level += 1;
    player.expToNext = Math.floor(player.expToNext * 1.3);
    player.hp += 15;
    player.mp += 8;
    player.atk += 2;
    player.def += 2;
    player.skillPoints += 2;
    player.title = player.level >= 5 ? "熟練の冒険者" : player.title;
    logMessage("レベルアップ！スキルポイント+2。");
  }

  updateStatus();
  updateHeader();
}

function restAtCamp() {
  player.hp += 10;
  player.mp += 6;
  logMessage("キャンプで休息し、HP/MPが回復した。");
  updateStatus();
}

function groupedSkills(filteredSkills) {
  return branches.map((branch) => ({
    branch,
    skills: filteredSkills.filter((skill) => skill.branch === branch.id),
  }));
}

function renderSkillTree(filterText, filterBranch) {
  const container = document.getElementById("skill-tree");
  container.innerHTML = "";
  const normalized = filterText.trim();
  const list = skillTree.filter((skill) => {
    const matchesBranch = filterBranch === "all" || skill.branch === filterBranch;
    const matchesText = !normalized || skill.name.includes(normalized) || skill.description.includes(normalized);
    return matchesBranch && matchesText;
  });

  groupedSkills(list).forEach(({ branch, skills }) => {
    if (skills.length === 0) {
      return;
    }
    const wrapper = document.createElement("div");
    wrapper.className = "skill-branch";

    const header = document.createElement("div");
    header.className = "branch-header";
    header.innerHTML = `<h3>${branch.name}</h3><span class="branch-meta">${branchConfig[branch.id].description}</span>`;
    wrapper.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "skills";

    skills.forEach((skill) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `skill-card ${skill.unlocked ? "unlocked" : "locked"}`;
      card.innerHTML = `<span>階層${skill.tier} / コスト${skill.cost}</span><strong>${skill.name}</strong>`;
      card.style.borderColor = skill.unlocked ? "#22c55e" : "transparent";
      card.addEventListener("click", () => selectSkill(skill));
      grid.appendChild(card);
    });

    wrapper.appendChild(grid);
    header.addEventListener("click", () => {
      grid.classList.toggle("hidden");
    });
    container.appendChild(wrapper);
  });
}

function populateFilters() {
  const filter = document.getElementById("skill-filter");
  branches.forEach((branch) => {
    const option = document.createElement("option");
    option.value = branch.id;
    option.textContent = branch.name;
    filter.appendChild(option);
  });
}

function selectSkill(skill) {
  const detail = document.querySelector(".detail-content");
  const placeholder = document.querySelector("#skill-detail .placeholder");
  placeholder.classList.add("hidden");
  detail.classList.remove("hidden");
  document.getElementById("detail-name").textContent = skill.name;
  document.getElementById("detail-desc").textContent = skill.description;
  document.getElementById("detail-branch").textContent = skill.branchName;
  document.getElementById("detail-tier").textContent = skill.tier.toString();
  document.getElementById("detail-cost").textContent = skill.cost.toString();
  const unlockButton = document.getElementById("unlock-skill");
  unlockButton.disabled = skill.unlocked || player.skillPoints < skill.cost;
  unlockButton.textContent = skill.unlocked ? "解放済み" : "スキル解放";
  unlockButton.onclick = () => unlockSkill(skill);
}

function unlockSkill(skill) {
  if (skill.unlocked || player.skillPoints < skill.cost) {
    return;
  }
  player.skillPoints -= skill.cost;
  skill.unlocked = true;
  logMessage(`${skill.name} を解放した！`);
  updateHeader();
  renderSkillTree(document.getElementById("skill-search").value, document.getElementById("skill-filter").value);
  selectSkill(skill);
}

function toggleAllBranches(expand) {
  document.querySelectorAll(".skills").forEach((grid) => {
    if (expand) {
      grid.classList.remove("hidden");
    } else {
      grid.classList.add("hidden");
    }
  });
}

function init() {
  createSkillTree();
  populateFilters();
  updateStatus();
  updateHeader();
  renderSkillTree("", "all");
  logMessage("冒険の準備が整った。巨大なスキルツリーを解放しよう。");
  updateViewportVars();
  window.addEventListener("resize", updateViewportVars);

  document.getElementById("adventure-button").addEventListener("click", grantQuestRewards);
  document.getElementById("rest-button").addEventListener("click", restAtCamp);
  document.getElementById("skill-search").addEventListener("input", (event) => {
    renderSkillTree(event.target.value, document.getElementById("skill-filter").value);
  });
  document.getElementById("skill-filter").addEventListener("change", (event) => {
    renderSkillTree(document.getElementById("skill-search").value, event.target.value);
  });
  document.getElementById("expand-all").addEventListener("click", () => toggleAllBranches(true));
  document.getElementById("collapse-all").addEventListener("click", () => toggleAllBranches(false));
}

init();
