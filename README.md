# ![WordJumbleBot](./utils/images/wordjumblebot.webp) WordJumbleBot

> - WordJumbleBot for Discord

---

![Bun](https://img.shields.io/badge/Bun-1.4.3-informational?style=plastic&logo=bun) &nbsp;
![discord.js](https://img.shields.io/badge/discord.js-^14.27.0-informational?style=plastic&logo=discord.js) &nbsp;
![Drizzle](https://img.shields.io/badge/Drizzle-1.0.0--rc.4-informational?style=plastic&logo=drizzle)
![SQLite](https://img.shields.io/badge/SQLite-3.49.2-informational?style=plastic&logo=sqlite)

![CodeQL](https://github.com/chump29/wordjumblebot/workflows/CodeQL/badge.svg) &nbsp;
![Coverage](https://img.shields.io/badge/Coverage-78.82%25-success?style=plastic&logo=jest)

![NO AI](https://img.shields.io/badge/NO-AI-orange?style=plastic "NO AI") &nbsp;
![License](https://img.shields.io/github/license/chump29/wordjumblebot?style=plastic&color=blueviolet&label=License&logo=gplv3 "GPLv3") &nbsp; <!-- markdownlint-disable MD013 -->
![CVE Scan](https://img.shields.io/badge/CVE%20Scan-Pass-success?style=plastic&logo=owasp "CVE Scan")

---

### What it does: <!-- markdownlint-disable-line MD001 -->

- Jumbles words

---

### 🔗 Invite Link <!-- markdownlint-disable-line MD001 -->

[Add WordJumbleBot](https://discord.com/oauth2/authorize?client_id=1496825383348211783&permissions=93184&integration_type=0&scope=bot)

---

### 🖥️ Discord

#### Role Permissions:

|   ⚙️ Permission    |
|:------------------:|
|    ViewChannel     |
|    SendMessages    |
|     EmbedLinks     |
|   ManageMessages   |
| ReadMessageHistory |

#### Commands:

|      📋 Task      |      🔧 Command       | ⚙️ Permission |
|:-----------------:|:---------------------:|:-------------:|
|       Info        |        `/info`        | SendMessages  |
| Show Leaderboard  |    `/leaderboard`     | SendMessages  |
|       Ping        |        `/ping`        | SendMessages  |
| Reset User Score  | `/reset <@user\|all>` | Administrator |
|    Word Status    |       `/status`       | Administrator |
| Generate New Word |        `/word`        | Administrator |

---

### 🖧 Docker

#### Environment Variables:

|     📝 Description      |   📌 Variable   |   {...} Value    |
|:-----------------------:|:---------------:|:----------------:|
|        Activity         |    ACTIVITY     |     Jumbling     |
|       Channel ID        |   CHANNEL_ID    |      \<id>       |
| Embed Color<sup>1</sup> |      COLOR      |     #78866b      |
|         DB Name         |     DB_NAME     | wordjumblebot.db |
|         DB Path         |     DB_PATH     |      ./db/       |
|          Debug          |      DEBUG      |  true/**false**  |
|   Maximum Word Length   |   MAX_LENGTH    |  0<sup>2</sup>   |
|   Minimum Word Length   |   MIN_LENGTH    |  5<sup>3</sup>   |
|        Bot Name         |      NAME       |  WordJumbleBot   |
|     Points Modifier     | POINTS_MODIFIER |  3<sup>4</sup>   |
|      Quest Points       |  QUEST_POINTS   | 100<sup>4</sup>  |
|       Quest Words       |   QUEST_WORDS   |  10<sup>4</sup>  |
|        Bot Token        |      TOKEN      |     \<token>     |

###### <sup>1</sup> #RRGGBB format <!-- markdownlint-disable-line MD001 -->

###### <sup>2</sup> 0=disable (will default to *maximum* word length = 10), or >= 3 *(must be >= `MIN_LENGTH`)*

###### <sup>3</sup> 0=disable (will default to *minimum* word length = 3), or >= 3

###### <sup>4</sup> Must be > 0

##### From `@postfmly/logoserver`:

| 📝 Description | 📌 Variable |    {...} Value     |
|:--------------:|:-----------:|:------------------:|
|   Logo Name    |  LOGO_NAME  | wordjumblebot.webp |
|   Local Path   |  LOGO_PATH  |   ./utils/images   |
|      Port      |  LOGO_PORT  | **Random**/[port]  |
|    Logo URL    |  LOGO_URL   |       \<url>       |

##### From `@postfmly/checkrate`:

###### *NOTE: Rate limited to 1 request per 1 second*

#### Points Calculation:

```typescript
const getWordPoints = async (word: string): Promise<number> => {
  return Math.floor(
    word
      .trim()
      .toUpperCase()
      .split("")
      .reduce((sum: number, char: string): number => sum + char.charCodeAt(0), 0) / POINTS_MODIFIER
  )
}

const word: string = "test"
const points: number = getWordPoints(word)
// T=84, E=69, S=83, T=84
// 84 + 69 + 83 + 84 = 320
// 320 / 3 = 106.6666666666667 ≈ 106

```

#### Deployment:

|  📜 Script  |  🔧 Command   |
|:-----------:|:-------------:|
|    Full     | `./build.sh`  |
| Docker Only | `./docker.sh` |

---

### 📄 Documentation

### Generate:

```bash
./docs.sh
```

---

### 🛰️ Git & CI/CD

- **Pre-Commit:** Staged files are automatically linted
- **Github Actions:** Builds and pushes images to repository
  - latest
    - amd64
    - arm64
