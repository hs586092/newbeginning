const { chromium } = require('playwright');
const fs = require('fs').promises;

const SITE_URL = 'https://newbeginning-seven.vercel.app/';

class QuickAnalyzer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      buttons: [],
      pages: {},
      navigation: [],
      issues: []
    };
  }

  async initialize() {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1200, height: 800 });
  }

  async analyzeHomepage() {
    console.log('🏠 Analyzing Homepage...');
    
    try {
      const response = await this.page.goto(SITE_URL, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });

      // Get all navigation buttons
      const navButtons = await this.page.$$eval('nav a, header a', links => 
        links.map(link => ({
          text: link.textContent.trim(),
          href: link.href,
          isInternal: link.href.includes(window.location.hostname)
        }))
      );

      console.log(`Found ${navButtons.length} navigation buttons`);

      // Test each navigation link
      for (const button of navButtons) {
        try {
          console.log(`Testing: ${button.text} -> ${button.href}`);
          
          const linkResponse = await this.page.goto(button.href, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
          });

          const pageContent = await this.page.evaluate(() => {
            const title = document.title;
            const h1 = document.querySelector('h1')?.textContent || '';
            const bodyText = document.body.textContent || '';
            const wordCount = bodyText.split(' ').filter(w => w.length > 2).length;
            
            return {
              title,
              h1,
              wordCount,
              hasContent: wordCount > 50,
              hasPlaceholder: bodyText.includes('Lorem ipsum') || bodyText.includes('placeholder'),
              hasJobContent: bodyText.includes('채용') || bodyText.includes('구인') || bodyText.includes('job'),
              hasParentingContent: bodyText.includes('임신') || bodyText.includes('출산') || bodyText.includes('신생아') || bodyText.includes('육아')
            };
          });

          this.results.buttons.push({
            text: button.text,
            href: button.href,
            status: linkResponse.ok() ? '✅ Working' : '❌ Error',
            httpStatus: linkResponse.status(),
            pageContent
          });

        } catch (error) {
          console.log(`Error with ${button.text}: ${error.message}`);
          this.results.buttons.push({
            text: button.text,
            href: button.href,
            status: '❌ Error',
            error: error.message
          });
        }
      }

      // Go back to homepage
      await this.page.goto(SITE_URL);

    } catch (error) {
      console.error('Homepage analysis failed:', error);
    }
  }

  async testSpecificPages() {
    console.log('📄 Testing Specific Pages...');
    
    const testPages = [
      { name: 'Community', path: '/community' },
      { name: 'Posts', path: '/posts' },
      { name: 'Login', path: '/login' },
      { name: 'About', path: '/about' }
    ];

    for (const testPage of testPages) {
      try {
        const url = SITE_URL.replace(/\/$/, '') + testPage.path;
        console.log(`Testing ${testPage.name} page: ${url}`);
        
        const response = await this.page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });

        const analysis = await this.page.evaluate(() => {
          const title = document.title;
          const h1 = document.querySelector('h1')?.textContent || '';
          const forms = document.querySelectorAll('form').length;
          const buttons = document.querySelectorAll('button').length;
          const inputs = document.querySelectorAll('input').length;
          const bodyText = document.body.textContent || '';
          
          return {
            title,
            h1,
            forms,
            buttons,
            inputs,
            wordCount: bodyText.split(' ').filter(w => w.length > 2).length,
            hasError: bodyText.includes('404') || bodyText.includes('Error') || bodyText.includes('Not Found'),
            functionality: forms > 0 || buttons > 0 || inputs > 0 ? 75 : (bodyText.length > 100 ? 50 : 25)
          };
        });

        this.results.pages[testPage.name] = {
          url,
          status: response.status(),
          accessible: response.ok(),
          analysis
        };

      } catch (error) {
        this.results.pages[testPage.name] = {
          url: SITE_URL + testPage.path,
          accessible: false,
          error: error.message
        };
      }
    }
  }

  async generateQuickReport() {
    const workingButtons = this.results.buttons.filter(b => b.status.includes('✅')).length;
    const brokenButtons = this.results.buttons.filter(b => b.status.includes('❌')).length;
    const accessiblePages = Object.values(this.results.pages).filter(p => p.accessible).length;
    const totalPages = Object.keys(this.results.pages).length;

    const report = `# 🍼 Website Analysis Report - ${new Date().toLocaleDateString()}

## Executive Summary
- **Navigation Status**: ${workingButtons}/${this.results.buttons.length} buttons working
- **Page Accessibility**: ${accessiblePages}/${totalPages} pages accessible
- **Critical Issues**: ${brokenButtons} broken navigation links

## 1. Button Functionality Analysis

${this.results.buttons.map(btn => `
### "${btn.text}"
- **Status**: ${btn.status}
- **URL**: ${btn.href}
- **HTTP Status**: ${btn.httpStatus || 'N/A'}
- **Page Content**: ${btn.pageContent ? `${btn.pageContent.wordCount} words, ${btn.pageContent.hasContent ? '✅ Has content' : '❌ Minimal content'}` : 'Not analyzed'}
- **Brand Alignment**: ${btn.pageContent?.hasParentingContent ? '✅ Parenting content' : btn.pageContent?.hasJobContent ? '❌ Job content found' : '⚠️ Neutral'}
${btn.error ? `- **Error**: ${btn.error}` : ''}
`).join('\n')}

## 2. Page Analysis

${Object.entries(this.results.pages).map(([name, page]) => `
### ${name} Page
- **URL**: ${page.url}
- **Accessible**: ${page.accessible ? '✅ Yes' : '❌ No'}
- **Status Code**: ${page.status || 'N/A'}
- **Functionality Level**: ${page.analysis?.functionality || 0}%
- **Interactive Elements**: ${page.analysis ? `${page.analysis.forms} forms, ${page.analysis.buttons} buttons, ${page.analysis.inputs} inputs` : 'N/A'}
- **Content**: ${page.analysis?.wordCount || 0} words
${page.error ? `- **Error**: ${page.error}` : ''}
`).join('\n')}

## 3. Key Findings & Recommendations

### 🎯 Critical Issues
${brokenButtons > 0 ? `- ${brokenButtons} navigation buttons are not working properly` : '- No critical navigation issues found ✅'}
${accessiblePages < totalPages ? `- ${totalPages - accessiblePages} pages are not accessible` : '- All tested pages are accessible ✅'}

### 🏗️ Development Priorities
1. **Fix Broken Navigation** - Ensure all menu items lead to functional pages
2. **Content Development** - Pages with low functionality scores need proper content
3. **Brand Consistency** - Remove any remaining job/recruitment content
4. **User Experience** - Add interactive features for parent engagement

### 📊 Completion Status
- **Fully Functional**: ${this.results.buttons.filter(b => b.pageContent?.hasContent && b.status.includes('✅')).length} pages
- **Need Content**: ${this.results.buttons.filter(b => !b.pageContent?.hasContent && b.status.includes('✅')).length} pages
- **Need Fixing**: ${brokenButtons} pages

### 🍼 Parenting Community Alignment
- **Brand Aligned Pages**: ${this.results.buttons.filter(b => b.pageContent?.hasParentingContent).length}
- **Mixed Messaging**: ${this.results.buttons.filter(b => b.pageContent?.hasJobContent).length}
- **Neutral Content**: ${this.results.buttons.filter(b => b.pageContent && !b.pageContent.hasParentingContent && !b.pageContent.hasJobContent).length}

## Next Steps
1. Address all ❌ marked issues
2. Develop content for low-functionality pages
3. Ensure consistent parenting theme across all pages
4. Add user engagement features (forms, interactive content)
`;

    await fs.writeFile('./quick-analysis-report.md', report);
    console.log('\n✅ Quick analysis complete! Report saved to quick-analysis-report.md');
  }

  async run() {
    try {
      await this.initialize();
      await this.analyzeHomepage();
      await this.testSpecificPages();
      await this.generateQuickReport();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the quick analysis
const analyzer = new QuickAnalyzer();
analyzer.run().catch(console.error);