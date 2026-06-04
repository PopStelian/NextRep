const { test, expect } = require('@playwright/test');

test('Flux complet GOLD: Login -> Home -> Dashboard -> CRUD', async ({ page }) => {
  // 1. Mergem la pagina de Login (asigură-te că portul 5173 este cel activ)
  await page.goto('http://localhost:5173/login');

  // 2. Completăm datele de autentificare
  // Folosim waitForSelector pentru a fi siguri că pagina s-a încărcat
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'stelian@nextrep.com');
  await page.fill('input[type="password"]', '1234');

  // 3. Apăsăm butonul de Sign In
  await page.click('button[type="submit"]');

  // 4. Verificăm tranziția către Landing Page (Home)
  // Folosim o expresie regulată pentru URL pentru a fi flexibili
  await page.waitForURL(/.*home/);
  const heroTitle = page.locator('.hero-title');
  await expect(heroTitle).toBeVisible();
  await expect(heroTitle).toContainText('Track. Analyze. Grow.');

  // 5. Navigăm către Dashboard prin butonul Get Started
  await page.click('text=Get Started');
  await page.waitForURL(/.*dashboard/);

  // 6. Testăm funcționalitatea CRUD (Adăugăm un exercițiu nou)
  // Completăm formularul de adăugare
  await page.fill('input[placeholder="Name"]', 'Pullups');
  await page.fill('input[placeholder="Muscle"]', 'Back');
  await page.fill('input[placeholder="Reps"]', '10');

  // Salvăm și așteptăm un timp scurt pentru ca React să actualizeze starea în RAM
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(500); // Mic delay pentru stabilitate

  // 7. Verificăm prezența în Tabel (Cerința GOLD: Sincronizare)
  // Folosim bara de Search pentru a izola rezultatul (previne eroarea de paginare)
  const searchInput = page.locator('input[placeholder*="Search"]');
  if (await searchInput.isVisible()) {
    await searchInput.fill('Pullups');
  }

  const table = page.locator('.gold-table'); // Selectorul tău premium
  await expect(table).toContainText('Pullups');
  await expect(table).toContainText('Back');

  // 8. Verificăm persistența sesiunii (Cerința SILVER: Cookies)
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'user_session');

  // Testul trece dacă cookie-ul de sesiune este definit
  expect(sessionCookie).toBeDefined();
  console.log('✅ Silver & Gold check passed: Session cookie found and CRUD synced!');
});