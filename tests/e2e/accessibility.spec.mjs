import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function assertAccessible(page,label){const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();expect(results.violations,`${label}: ${results.violations.map(v=>`${v.id}(${v.nodes.length})`).join(', ')}`).toEqual([])}

test('landing and scenario selection have no WCAG A/AA axe violations',async({page})=>{await page.goto('/');await assertAccessible(page,'home');await page.getByRole('button',{name:'ابدأ المحاكاة'}).click();await assertAccessible(page,'scenario')});

test('data work market and accessible semantic task have no WCAG A/AA axe violations',async({page})=>{await page.goto('/');await page.getByRole('button',{name:'ابدأ المحاكاة'}).click();await page.locator('article.scenario').filter({hasText:'سامر'}).getByRole('button',{name:'اختيار هذه الحالة'}).click();await page.getByRole('button',{name:'أوافق وأدخل No Boss'}).click();await assertAccessible(page,'work market');await page.getByRole('button',{name:'قبول',exact:true}).first().click();await assertAccessible(page,'data task');const semanticRegion=page.locator('[data-semantic-region="0"]');await semanticRegion.focus();await expect(semanticRegion).toBeFocused()});