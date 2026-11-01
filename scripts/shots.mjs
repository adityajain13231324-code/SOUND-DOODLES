// Captures key screens in every theme at desktop and phone sizes for visual review.
import { chromium } from "@playwright/test";
const base = process.env.BASE || "http://localhost:3210";
const themes = ["Midnight", "Paper", "Neon", "Sunset"];
const browser = await chromium.launch({
  channel: "chrome",
  args: [
    "--use-fake-device-for-media-stream",
    "--use-fake-ui-for-media-stream",
  ],
});
for (const [label, viewport] of [
  ["desktop", { width: 1280, height: 800 }],
  ["phone", { width: 390, height: 844 }],
]) {
  const ctx = await browser.newContext({
    viewport,
    permissions: ["microphone"],
  });
  const page = await ctx.newPage();
  await page.goto(base);
  await page.screenshot({ path: `shots/${label}-landing.png`, fullPage: true });
  await page
    .getByRole("button", { name: "Create a room", exact: true })
    .first()
    .click();
  await page.screenshot({ path: `shots/${label}-create.png` });
  await page.getByLabel("Your nickname").fill("Aditya");
  await page.getByRole("button", { name: "Create room", exact: true }).click();
  await page.getByText("Tonight’s game").waitFor();
  for (const t of themes) {
    await page
      .getByRole("button", { name: /theme/i })
      .first()
      .click()
      .catch(() => {});
    const opt = page.getByText(new RegExp(t, "i")).first();
    await opt.click().catch(() => {});
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    await page.screenshot({
      path: `shots/${label}-lobby-${t}.png`,
      fullPage: true,
    });
  }
  await ctx.close();
}
await browser.close();
