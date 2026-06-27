# Mario H5 开发笔记

## 开发历程

### 3. World 1-3 天空运动关 + 全局体验优化

#### 新增实体模块 (11 个新 .js 文件)
- `moving-platform.js` — 水平/垂直/对角移动平台，携带玩家 `getDeltaX/Y`
- `falling-platform.js` — 状态机 `idle → shaking(18帧) → falling → gone`
- `springboard.js` — 踩压压缩 6 帧后弹射，`launchForce=-18`（~295px 高）
- `paratroopa.js` — 飞行库巴，绿=垂直 sin 飞、红=水平 cos 飞；踩一次掉翅膀变普通库巴
- `hammer-bro.js` + `Hammer` 类 — 抛物线铁锤，`setFacing(playerX)` 面向玩家
- `koopa.js` / `piranha-plant.js` / `fireball.js` / `elevator.js` / `pipe-system.js`

#### 关卡地图 (`generateLevel3Map`, 250×15)
- 7 段式布局：入口 / 桥区 / 弹簧区 / 移动平台 / 坠落平台 / 高低路线 / 阶梯旗杆
- 新增 tile 类型 `16=树冠` `17=桥板`，加入 `SOLID_TILES`
- 水管两根（cols 62, 170），旗杆 col 232，城堡 cols 237-245
- 旗杆下加 rows 12-13 砖基，让马里奥落地而非踩空

#### 音频
- `playAthletic()` 运动 BGM（bpm 180，方波旋律）
- `spring()` 弹簧音效（锯齿波上滑 200→900Hz）
- `die()` 死亡音阶增强（gain 0.35，时长 0.25s × 5 音）
- 所有死亡路径统一 `music.stop(); music.die()` — 锤子/敌人/食人花/掉坑/超时
- 掉坑死亡原代码只设 `alive=false` 不调 `die()`，已修复

#### 游戏性修复
- **固定时间步长循环**：60Hz 物理累加器 + 40fps 渲染采样，解决插电/电池速度差异
- **旗杆烟花**：保留 `FLAGPOLE` 状态，180 帧倒计时，每 30 帧生成一组粒子；完成后 `nextLevel()`
- **PLAY AGAIN 按钮**：只在 GAME OVER / YOU WIN 显示，关卡过渡隐藏
- **水管居中**：`entryCol * TILE_SIZE + TILE_SIZE - player.width / 2`

#### 暂停系统 (P 键)
- `Game.paused` + `togglePause()`
- `gameLoop` 暂停时不累加 accumulator，恢复时不会物理爆炸
- `Music.pause()` / `resume()` 通过 `AudioContext.suspend/resume` 实现
- 记录 `currentTrack` + `loopScheduledAt` + `loopDuration`，恢复时重排循环定时器

#### 死亡动画 (FC 风格)
- `renderer.drawMario` 开头 `!player.alive` 分支：双臂高举、双腿分开、正面朝前
- `mario.update` 已含 `GRAVITY * 0.6` 减速下落
- 死亡造型在 `draw` 时 `return`，绕开 jump/idle/walk 精灵选择

#### 踩坑记录
- **`playerBounds` 用前未声明**：锤子碰撞循环用了 `const playerBounds`，但声明在下方更晚位置。JS `const` 暂时性死区（TDZ）→ 游戏循环抛错卡死，画面"消失"。把声明挪到 `enemies.filter` 之前修复。
- **飞行库巴翅膀判定**：`enemy.state === 'idle'` 不存在，弹簧板用 `!sb.compressed`。
- **`drawFireball` 头被误删**：整块替换时 `new_string` 漏了方法签名，需二次 edit 补回。

---

### 1. 第二关开发 (`feature/level-2`)

#### 关卡系统
- `GameState` 添加 `currentLevel`、`totalLevels`、`LEVEL_TRANSITION` 状态
- `generateLevelMap(level)` 根据关卡编号生成不同地图
- Level 2: 240列地下关卡，7个深渊坑，约35个Goomba
- 关卡完成后显示 "WORLD 1-2 Get Ready!" 过渡动画

#### 关卡选择界面
- 标题画面替换为两个关卡按钮（WORLD 1-1 / WORLD 1-2）
- 鼠标点击选择关卡
- 键盘快捷键：按 `1` 选第一关，按 `2` 选第二关
- `PLAY AGAIN` 按钮重置到第一关

---

### 2. 蘑菇道具系统

#### 核心逻辑
- 顶问号砖块（type 3）→ 弹出金币动画 + 50%概率出蘑菇
- 蘑菇从砖块内部冒出（`emergeProgress` 动画），在地面左右移动
- 碰墙反弹，掉坑消失

#### 变大/变小
- `Mario.becomeBig()`: height 30→45，y上移15px（脚保持在地面）
- `Mario.shrink()`: height 45→30，y下移15px
- 变大/变小后有无敌时间

#### 无敌系统
- `isInvincible` + `invincibleTimer`（帧数倒计时）
- 渲染时每4帧闪烁一次（跳过绘制）
- 大马里奥受伤：变小 + 120帧无敌
- 小马里奥受伤：死亡

---

### 3. 大马里奥渲染（踩坑记录）

#### 问题1：拉伸变形
- 原精灵 28×28，拉伸到 32×32 或更大 → 变形
- **解决**：保持精灵原始尺寸，等比例放大

#### 问题2：用像素画拼接
- 尝试用 Canvas fillRect 画帽子、脸、身体、裤子 → 很丑
- 尝试离屏 Canvas 预渲染 → 坐标不精确
- **解决**：直接用 drawImage 放大原精灵

#### 问题3：翻转裁剪
- `scale(-1,1)` 翻转时，镜像中心用 `player.width/2=14`
- 大马里奥精灵宽 42px，中心应在 21 → 翻转后被裁剪
- **解决**：大马里奥翻转中心用 `x + 14`（精灵中心）

#### 最终方案
```
大马里奥 = 精灵 42×42（28×1.5）+ 蓝色裤腿 8px + 棕色鞋
imageSmoothingEnabled = false（保持像素锐利）
height = 45（30 × 1.5）
```

---

### 4. 踩踏/受伤检测

#### 问题：大马里奥踩敌人无效
- 原因：`becameBig()` 改变了 height，但 `prevY` 保存的是变大前的位置
- `prevY + height`（height=45）算出的脚底位置偏高15px

#### 解决
- `becameBig()` 时保存 `prevHeight = 30`
- 踩踏检测用 `prevY + prevHeight`（变大前的位置）
- 防止同一帧内 height 变化导致判断错误

---

### 5. 第一关管道高度修复

#### 问题
- 第二个水管（col 48-49）4格高，跳不过去
- 原版马里奥第二个水管应该能跳过

#### 修复
- 第二个水管从 4格 降为 3格（和第一个一样）
- 第三个水管保持 4格（原版就跳不过去）
- 地面统一在第12-14行，不在第11行填地面

---

### 6. 网络/推送问题

#### 问题：GitHub HTTPS 443端口超时
- Ping GitHub 正常，但 HTTPS 连接超时
- HTTP 80端口可连接，但 GitHub 强制重定向到 HTTPS

#### 解决
- 发现 Clash Verge 代理端口是 7897（不是默认的 7890）
- 配置 Git 代理：`git config --global http.proxy http://127.0.0.1:7897`
- 配置 Git 凭据：`git config --global credential.helper wincred`

---

### 7. 大马里奥永久无敌 Bug

#### 问题
- 变大后碰到敌人不受伤，直接穿过

#### 原因
- `becomeBig()` 将 `isInvincible` 设为 `true`，`invincibleTimer` 设为 60
- 计时器递减到 0 后，`isInvincible` 从未被重置为 `false`
- 受伤检测 `!this.player.isInvincible` 永远为 `false`，导致永久无敌

#### 修复
```js
// game.js update() 中无敌时间递减
if (this.player.invincibleTimer > 0) {
    this.player.invincibleTimer--;
} else {
    this.player.isInvincible = false;
}
```
- 计时器归零时将 `isInvincible` 重置为 `false`，恢复正常受伤逻辑

---

### 8. 深渊坑跳不过去

#### 问题
- 第二关 6 个深渊坑设计为 4-5 列宽（128-160px），马里奥根本跳不过去

#### 原因
- 设计关卡地图时**没有先计算跳跃物理参数**，凭直觉画坑宽度
- 马里奥实际最大跳跃距离只有 **146px**，而跳过一个 4 列坑需要从实地边缘跳到对面实地边缘 = **160px**

#### 跳跃物理公式
```
滞空时间 = 2 × |JUMP_FORCE| / GRAVITY = 2 × 11.5 / 0.55 ≈ 41.8 帧
最大水平距离 = 滞空时间 × PLAYER_SPEED = 41.8 × 3.5 ≈ 146px
```

#### 修复
```
修复前: [[22,25],[50,54],[84,88],[118,122],[158,162],[192,196]]  (4-5列)
修复后: [[22,23],[51,52],[85,86],[119,120],[159,160],[193,194]]  (2列)
```
- 2 列坑 = 64px 宽，跳过需要约 90px，留有 56px 余量

---

### 9. 关卡设计准则

> **核心原则：先算物理参数，再画地图。任何障碍物都必须经过可通行性验证。**

#### 跳跃参数速查表
| 参数 | 值 |
|------|------|
| GRAVITY | 0.55 |
| JUMP_FORCE | -11.5 |
| PLAYER_SPEED | 3.5 px/帧 |
| TILE_SIZE | 32 px |
| 最大跳跃高度 | ~120 px（约 3.7 格） |
| 最大跳跃距离 | ~146 px（约 4.6 格） |

#### 坑（Pit）设计
- **最大宽度：2 列**（64px）— 跳跃需要 90px，余量 56px
- 绝对不要设计 3 列以上的坑（3 列 = 96px，需跳过 128px，余量仅 18px，太紧）
- 两个坑之间至少间隔 3 列实地，给玩家落地和调整的空间

#### 管道（Pipe）设计
- 管道高度不能超过 3 格（从地面算起），否则跳不过去（最大跳高 ~3.7 格）
- 如果管道必须高于 3 格，需要在管道旁提供绕行路径（台阶或平台）
- 管道宽 2 列 = 64px，中心 X = `pipeCol * 32 + 32`
- 食人花从管道中心出来：`plant.x = pipeCol * 32 + (64 - plantWidth) / 2`
- 不要凭直觉写偏移量（如 `+4`），要用公式算居中

#### 平台间距
- 垂直跳跃最大 ~120px（3.7 格），平台之间垂直间距不超过 3 格
- 水平跳跃最大 ~146px（4.6 格），平台之间水平间距不超过 4 格
- 同时需要水平和垂直跳跃时，距离要按比例缩减

#### 敌人放置
- 第一个敌人距离出生点至少 **15 列**，给玩家反应时间
- 敌人不要放在坑边（玩家来不及同时处理跳跃和躲避）
- 出生/重生后给予 **180 帧（3 秒）无敌时间**

#### 新障碍物引入原则
- 第一次出现时要在安全环境中（无敌人、无坑）
- 第二次出现时加入一个额外挑战
- 第三次出现时组合多个挑战

---

## 技术要点

### Tile 类型定义
| 类型 | 含义 |
|------|------|
| 0 | 空 |
| 1 | 地面（顶部有草地） |
| 2 | 砖块/台阶 |
| 3 | 问号砖块 |
| 4-7 | 管道（4=左上，5=右上，6=左身，7=右身） |
| 8 | 已用砖块 |
| 9 | 旗杆 |
| 10 | 旗杆底座 |
| 11 | 地下地面 |
| 12 | 地下砖块 |
| 13 | 天花板 |
| 14 | 隐藏砖块（顶后显现） |
| 15 | 多金币砖块（可多次顶出金币） |
| 16 | 树冠（Level 3 天空主题平台） |
| 17 | 桥板（Level 3 木桥） |

### Mario 状态
- `isBig`: 是否变大
- `isFire`: 是否火焰状态（可发射火球）
- `isStar`: 是否星星状态（无敌+碰敌即杀）
- `starTimer`: 星星倒计时（帧）
- `isDucking`: 是否蹲下（大马里奥专属）
- `isInvincible`: 是否无敌（受伤保护）
- `invincibleTimer`: 无敌倒计时（帧）
- `fireballCooldown`: 火球发射冷却（帧）
- `prevY`: 上一帧Y位置（用于踩踏判断）
- `prevHeight`: 变大前的高度

### 渲染层级
1. 背景（天空/地下主题）
2. 地图瓦片
3. 金币
4. 蘑菇/道具（1UP、火焰花、星星）
5. 敌人（Goomba、Koopa、Paratroopa、HammerBro）
6. 锤子（HammerBro 投掷）
7. 升降平台
8. 移动平台（Moving Platform）
9. 掉落平台（Falling Platform）
10. 弹簧板（Springboard）
11. 食人花
12. 火球
13. 马里奥
14. 烟花粒子效果
15. 暂停覆盖层（半透明遮罩 + PAUSED 文字）
