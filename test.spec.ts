const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Super Mario HTML5 Game', () => {
  test('should load and display the game', async ({ page }) => {
    // 创建截图目录
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    // 打开游戏文件
    const filePath = path.resolve(__dirname, 'mario.html');
    await page.goto(`file://${filePath}`);

    // 等待游戏加载
    await page.waitForLoadState('domcontentloaded');

    // 等待一小段时间让游戏初始化
    await page.waitForTimeout(1000);

    // 截图 - 初始状态
    await page.screenshot({ path: 'screenshots/01-initial.png', fullPage: true });

    // 检查游戏画布是否存在
    const canvas = await page.$('#gameCanvas');
    expect(canvas).toBeTruthy();
    console.log('✅ Canvas element found');

    // 获取画布尺寸
    const canvasBox = await canvas.boundingBox();
    console.log('Canvas size:', canvasBox);

    // 检查是否有错误
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    // 等待一段时间观察游戏运行
    await page.waitForTimeout(2000);

    // 再次截图
    await page.screenshot({ path: 'screenshots/02-after-2s.png', fullPage: true });

    // 输出错误
    if (errors.length > 0) {
      console.log('❌ Errors:', errors);
    } else {
      console.log('✅ No JavaScript errors');
    }

    // 检查控制台日志
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    console.log('Console logs:', consoleLogs);

    // 测试按键 - 向右移动
    console.log('Testing RIGHT key...');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/03-after-right.png', fullPage: true });

    // 测试跳跃
    console.log('Testing JUMP...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/04-after-jump.png', fullPage: true });

    console.log('✅ All tests passed');
  });

  test('should check game state', async ({ page }) => {
    const filePath = path.resolve(__dirname, 'mario.html');
    await page.goto(`file://${filePath}`);
    await page.waitForLoadState('domcontentloaded');

    // 获取分数和金币
    const score = await page.$eval('#score', el => el.textContent);
    const coins = await page.$eval('#coins', el => el.textContent);

    console.log('Score:', score);
    console.log('Coins:', coins);

    expect(score).toBe('0');
    expect(coins).toBe('0');
  });
});
