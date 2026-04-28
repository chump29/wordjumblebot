# ![WordJumbleBot](./utils/images/wordjumblebot.webp) WordJumbleBot

> - WordJumbleBot for Discord

---

![Biome](https://img.shields.io/badge/Biome-^2.4.13-informational?style=plastic&logo=biome) &nbsp;
![Bun](https://img.shields.io/badge/Bun-~1.3.13-informational?style=plastic&logo=bun) &nbsp;
![discord.js](https://img.shields.io/badge/discord.js-^14.26.3-informational?style=plastic&logo=discord.js) &nbsp;
![Drizzle](https://img.shields.io/badge/Drizzle-1.0.0--beta.22-informational?style=plastic&logo=drizzle)

![CodeQL](https://github.com/chump29/wordjumblebot/workflows/CodeQL/badge.svg) &nbsp;
![License](https://img.shields.io/github/license/chump29/wordjumblebot?style=plastic&color=blueviolet&label=License&logo=gplv3)

---

### 🔗 Invite Link <!-- markdownlint-disable-line MD001 -->

[Add WordJumbleBot](https://discord.com/oauth2/authorize?client_id=1496825383348211783&permissions=84992&integration_type=0&scope=bot)

---

### 🖥️ Discord

#### Role Permissions:

|   ⚙️ Permission    |
|:------------------:|
|    ViewChannel     |
|    SendMessages    |
|     EmbedLinks     |
| ReadMessageHistory |

#### Commands:

|      📋 Task      |   🔧 Command    | ⚙️ Permission |
|:-----------------:|:---------------:|:-------------:|
|       Info        |     `/info`     | SendMessages  |
| Show Leaderboard  | `/leaderboard`  | SendMessages  |
|       Ping        |     `/ping`     | SendMessages  |
| Reset All Scores  |    `/reset`     | Administrator |
| Reset User Score  | `/reset [user]` | Administrator |
|    Start Game     |    `/start`     | Administrator |
|    Word Status    |    `/status`    | Administrator |
|     Stop Game     |     `/stop`     | Administrator |
| Generate New Word |     `/word`     | Administrator |

---

### 🛠️ Environment Management

#### NPM ([Bun](https://github.com/oven-sh/bun "Bun") toolkit):

| 📋 Task |  🔧 Command   |
|:-------:|:-------------:|
| Upgrade | `bun upgrade` |

---

### 📦 Dependency Management

#### Installation & Removal:

|        📋 Task         |            🔧 Command (Full)             |           🔧 Command (Short)           |
|:----------------------:|:----------------------------------------:|:--------------------------------------:|
|      Install DEV       |              `bun install`               |                `bun i`                 |
|      Install PROD      |        `bun install --production`        |               `bun i -p`               |
|     Add dependency     |      `bun add [package][@version]`       |      `bun a [package][@version]`       |
|   Add devDependency    | `bun add --save-dev [package][@version]` |     `bun a -d [package][@version]`     |
| Add optionalDependency | `bun add --optional [package][@version]` | `bun a --optional [package][@version]` |
|   Add peerDependency   |   `bun add --peer [package][@version]`   |   `bun a --peer [package][version]`    |
|       Add Global       |  `bun add --global [package][@version]`  |     `bun a -g [package][@version]`     |
|   Remove Dependency    |          `bun remove [package]`          |           `bun r [package]`            |

#### Maintenance & Quality:

|     📋 Task     |   🔧 Command (Full)    | 🔧 Command (Short)  |
|:---------------:|:----------------------:|:-------------------:|
|  Check Updates  |     `bun outdated`     |       &mdash;       |
|   Update All    |      `bun update`      |       &mdash;       |
| Update Specific | `bun update [package]` |       &mdash;       |
| Security Audit  |      `bun audit`       |       &mdash;       |
|  Package Info   |  `bun info [package]`  |       &mdash;       |
|   Run Script    |   `bun run [script]`   |   `bun [script]`    |
|      List       |       `bun list`       |       &mdash;       |
|   List Extra    |    `bun list --all`    |       &mdash;       |
|    Hierarchy    | `bun pm why [package]` | `bun why [package]` |

---

### 🧪 Development

#### Scripts:

|    📋 Task     |  🔧 Command (Full)   | 🔧 Command (Short) |
|:--------------:|:--------------------:|:------------------:|
| Lint All (DEV) |    `bun run lint`    |     `bun lint`     |
| Lint All (CI)  |  `bun run lint:ci`   |   `bun lint:ci`    |
|   Lint Biome   | `bun run lint:biome` |  `bun lint:biome`  |
|    Lint ENV    |  `bun run lint:env`  |   `bun lint:env`   |
|   Build DEV    |    `bun run dev`     |     `bun dev`      |
|   Build PROD   |    `bun run prod`    |     `bun prod`     |

---

### 🖧 Docker

#### Environment Variables:

|     📝 Description      | 📌 Variable |   {...} Value    |
|:-----------------------:|:-----------:|:----------------:|
|     Autostart Game      |  AUTOSTART  |  true/**false**  |
|   Message Channel ID    | CHANNEL_ID  |   [channel id]   |
|         DB Name         |   DB_NAME   | wordjumblebot.db |
|         DB Path         |   DB_PATH   |      ./db/       |
|          Debug          |  IS_DEBUG   |  true/**false**  |
|    Logo Server Port     |  LOGO_PORT  |       8004       |
|     Run Logo Server     | LOGO_SERVER |  **true**/false  |
|        Logo URL         |  LOGO_URL   |    [logo url]    |
|   Maximum Word Length   | MAX_LENGTH  |   0 (disable)    |
|   Minimum Word Length   | MIN_LENGTH  | 4 (must be >=3)  |
|        Bot Name         |    NAME     |  WordJumbleBot   |
|      Award Points       |   POINTS    |        1         |
|   Message Rate Limit    |    RATE     |        1s        |
| Wait Time Between Words |   TIMEOUT   |       180s       |
|        Bot Token        |    TOKEN    |     [token]      |

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
