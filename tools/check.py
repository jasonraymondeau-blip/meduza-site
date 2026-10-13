"""Vérification rapide du site : erreurs JS, ressources manquantes, captures aux positions clés.
Usage :  pip install playwright && playwright install chromium
         python tools/check.py            # ouvre index.html en local (file://)
Les captures sont écrites dans tools/shots/.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "file://" + os.path.join(ROOT, "index.html")
OUT = os.path.join(ROOT, "tools", "shots")
os.makedirs(OUT, exist_ok=True)

SECTIONS = ["#services", "#pourquoi-nous", "#realisations", "#about", "#audience", "#contact"]

async def run(browser, name, viewport):
    page = await browser.new_page(viewport=viewport)
    errors, failed = [], []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("requestfailed", lambda r: failed.append(r.url) if "fonts" not in r.url else None)
    await page.goto(URL)
    await page.wait_for_timeout(1500)
    for sel in SECTIONS:
        y = await page.evaluate(f"document.querySelector('{sel}').getBoundingClientRect().top + scrollY")
        await page.evaluate(f"window.scrollTo({{top:{int(y)},behavior:'instant'}})")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(OUT, f"{name}_{sel.strip('#')}.png"))
    print(name, "erreurs JS:", errors or "aucune", "| ressources manquantes:", failed or "aucune")
    await page.close()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        await run(browser, "ordinateur", {"width": 1440, "height": 900})
        await run(browser, "telephone", {"width": 393, "height": 798})
        await browser.close()

asyncio.run(main())
