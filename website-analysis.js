const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const SITE_URL = 'https://newbeginning-seven.vercel.app/';
const SCREENSHOTS_DIR = './analysis-screenshots';

class WebsiteAnalyzer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.analysis = {
      buttons: [],
      pages: {},
      navigation: {},
      branding: {},
      recommendations: []
    };
  }

  async initialize() {
    // Create screenshots directory
    try {
      await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
    } catch (e) {
      // Directory exists
    }

    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // Slow down actions for better observation
    });
    this.page = await this.browser.newPage();
    
    // Set viewport for consistent screenshots
    await this.page.setViewportSize({ width: 1200, height: 800 });
    
    console.log('🚀 Starting comprehensive website analysis...');
  }

  async analyzeButtonFunctionality() {
    console.log('\n🔘 Analyzing Button Functionality...');
    
    try {
      await this.page.goto(SITE_URL, { waitUntil: 'networkidle' });
      await this.page.screenshot({ path: `${SCREENSHOTS_DIR}/homepage.png` });

      // Define button selectors to test
      const buttonSelectors = [
        // Header navigation
        'nav a[href*="pregnancy"], nav a:has-text("임신")',
        'nav a[href*="birth"], nav a:has-text("출산")', 
        'nav a[href*="newborn"], nav a:has-text("신생아")',
        'nav a[href*="weaning"], nav a:has-text("이유식")',
        'nav a[href*="development"], nav a:has-text("발달정보")',
        'nav a[href*="community"], nav a:has-text("커뮤니티")',
        'nav a[href*="emergency"], nav a:has-text("응급")',
        
        // Auth buttons
        'button:has-text("로그인"), a:has-text("로그인")',
        'button:has-text("회원가입"), a:has-text("회원가입")',
        'button:has-text("글쓰기"), a:has-text("글쓰기")',
        
        // CTA buttons
        'button:has-text("시작하기")',
        'button:has-text("더 알아보기")',
        'button:has-text("지금 가입")',
        
        // Generic buttons and links
        'button', 'a[href]'
      ];

      // Get all clickable elements
      const buttons = await this.page.$$eval('button, a[href], [role="button"]', elements => 
        elements.map((el, index) => ({
          index,
          tagName: el.tagName,
          text: el.textContent.trim(),
          href: el.href || null,
          className: el.className,
          id: el.id,
          isVisible: el.offsetWidth > 0 && el.offsetHeight > 0
        })).filter(btn => btn.isVisible && (btn.text || btn.href))
      );

      console.log(`Found ${buttons.length} clickable elements`);

      // Test each button
      for (let i = 0; i < Math.min(buttons.length, 20); i++) { // Limit to first 20 for efficiency
        const button = buttons[i];
        try {
          console.log(`Testing button: "${button.text}" (${button.tagName})`);
          
          const buttonAnalysis = {
            text: button.text,
            tagName: button.tagName,
            href: button.href,
            status: 'unknown',
            destination: null,
            httpStatus: null,
            error: null
          };

          if (button.href && button.href.startsWith('http')) {
            // Test external/internal links
            const response = await this.page.goto(button.href, { 
              waitUntil: 'domcontentloaded',
              timeout: 10000 
            });
            
            buttonAnalysis.httpStatus = response.status();
            buttonAnalysis.destination = this.page.url();
            buttonAnalysis.status = response.ok() ? '✅ Working' : '❌ Error';
            
            if (response.ok()) {
              await this.page.screenshot({ 
                path: `${SCREENSHOTS_DIR}/button_${i}_${button.text.replace(/[^a-zA-Z0-9]/g, '_')}.png` 
              });
            }
            
            // Go back to main page for next test
            await this.page.goto(SITE_URL, { waitUntil: 'networkidle' });
          } else {
            // Test JavaScript buttons
            try {
              await this.page.click(`button:nth-of-type(${i + 1}), a:nth-of-type(${i + 1})`);
              await this.page.waitForTimeout(2000);
              
              buttonAnalysis.destination = this.page.url();
              buttonAnalysis.status = '✅ Clickable';
              
              await this.page.goBack();
            } catch (e) {
              buttonAnalysis.status = '❌ Not clickable';
              buttonAnalysis.error = e.message;
            }
          }

          this.analysis.buttons.push(buttonAnalysis);
          
        } catch (error) {
          console.log(`Error testing button "${button.text}": ${error.message}`);
          this.analysis.buttons.push({
            text: button.text,
            status: '❌ Error',
            error: error.message
          });
        }
      }

    } catch (error) {
      console.error('Error in button analysis:', error);
    }
  }

  async analyzePageContent() {
    console.log('\n📄 Analyzing Page Content...');

    const pagesToAnalyze = [
      { url: SITE_URL, name: 'Homepage' },
      { url: `${SITE_URL}pregnancy`, name: '임신' },
      { url: `${SITE_URL}birth`, name: '출산' },
      { url: `${SITE_URL}newborn`, name: '신생아' },
      { url: `${SITE_URL}weaning`, name: '이유식' },
      { url: `${SITE_URL}development`, name: '발달정보' },
      { url: `${SITE_URL}community`, name: '커뮤니티' },
      { url: `${SITE_URL}emergency`, name: '응급' },
      { url: `${SITE_URL}about`, name: 'About' },
      { url: `${SITE_URL}contact`, name: 'Contact' }
    ];

    for (const pageInfo of pagesToAnalyze) {
      try {
        console.log(`Analyzing page: ${pageInfo.name}`);
        
        const response = await this.page.goto(pageInfo.url, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });

        const pageAnalysis = {
          name: pageInfo.name,
          url: pageInfo.url,
          httpStatus: response.status(),
          isAccessible: response.ok(),
          content: {},
          functionality: 0,
          branding: {}
        };

        if (response.ok()) {
          // Analyze content
          const content = await this.page.evaluate(() => {
            const title = document.title;
            const h1 = document.querySelector('h1')?.textContent || '';
            const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.textContent).join(' ');
            const images = document.querySelectorAll('img').length;
            const buttons = document.querySelectorAll('button').length;
            const forms = document.querySelectorAll('form').length;
            const textContent = document.body.textContent || '';
            
            return {
              title,
              h1,
              wordCount: textContent.split(' ').length,
              paragraphContent: paragraphs.substring(0, 200) + '...',
              images,
              buttons,
              forms,
              hasPlaceholder: textContent.includes('Lorem ipsum') || textContent.includes('placeholder') || textContent.includes('Coming soon'),
              isEmpty: textContent.trim().length < 100
            };
          });

          pageAnalysis.content = content;

          // Assess functionality level
          if (content.isEmpty) {
            pageAnalysis.functionality = 0;
          } else if (content.hasPlaceholder) {
            pageAnalysis.functionality = 25;
          } else if (content.wordCount > 100 && (content.buttons > 0 || content.forms > 0)) {
            pageAnalysis.functionality = 75;
          } else if (content.wordCount > 50) {
            pageAnalysis.functionality = 50;
          } else {
            pageAnalysis.functionality = 25;
          }

          // Assess branding alignment
          const brandingKeywords = ['임신', '출산', '신생아', '육아', '부모', '첫돌', '아기', '엄마', '아빠'];
          const jobKeywords = ['채용', '구인', '취업', '면접', '이력서', 'job', 'career'];
          
          const hasParentingContent = brandingKeywords.some(keyword => 
            content.title.includes(keyword) || content.h1.includes(keyword) || content.paragraphContent.includes(keyword)
          );
          const hasJobContent = jobKeywords.some(keyword => 
            content.title.includes(keyword) || content.h1.includes(keyword) || content.paragraphContent.includes(keyword)
          );

          pageAnalysis.branding = {
            alignsWithParenting: hasParentingContent,
            hasJobContent: hasJobContent,
            brandConsistency: hasParentingContent && !hasJobContent ? '✅ Good' : hasJobContent ? '❌ Mixed messaging' : '⚠️ Neutral'
          };

          // Take screenshot
          await this.page.screenshot({ 
            path: `${SCREENSHOTS_DIR}/page_${pageInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
            fullPage: true 
          });
        }

        this.analysis.pages[pageInfo.name] = pageAnalysis;

      } catch (error) {
        console.log(`Error analyzing page ${pageInfo.name}:`, error.message);
        this.analysis.pages[pageInfo.name] = {
          name: pageInfo.name,
          url: pageInfo.url,
          error: error.message,
          isAccessible: false
        };
      }
    }
  }

  async analyzeNavigation() {
    console.log('\n🗺️ Creating Navigation Structure Map...');
    
    await this.page.goto(SITE_URL, { waitUntil: 'networkidle' });

    const navigationStructure = await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      const navStructure = {
        internal: [],
        external: [],
        broken: [],
        total: links.length
      };

      links.forEach(link => {
        const href = link.href;
        const text = link.textContent.trim();
        
        if (href.includes(window.location.hostname)) {
          navStructure.internal.push({ href, text, type: 'internal' });
        } else if (href.startsWith('http')) {
          navStructure.external.push({ href, text, type: 'external' });
        }
      });

      return navStructure;
    });

    this.analysis.navigation = navigationStructure;
  }

  async generateRecommendations() {
    console.log('\n💡 Generating Development Recommendations...');

    const recommendations = [];

    // Analyze pages for completion status
    const incompletePages = [];
    const criticalMissingPages = [];
    
    Object.entries(this.analysis.pages).forEach(([name, page]) => {
      if (!page.isAccessible) {
        criticalMissingPages.push(name);
      } else if (page.functionality < 50) {
        incompletePages.push({ name, functionality: page.functionality });
      }
    });

    if (criticalMissingPages.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Missing Pages',
        description: `${criticalMissingPages.length} critical pages are not accessible`,
        pages: criticalMissingPages,
        impact: 'High - Users cannot access key features'
      });
    }

    if (incompletePages.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Incomplete Content',
        description: 'Pages with low functionality scores need content development',
        pages: incompletePages.sort((a, b) => a.functionality - b.functionality).slice(0, 5),
        impact: 'Medium - Poor user experience'
      });
    }

    // Analyze branding issues
    const brandingIssues = [];
    Object.entries(this.analysis.pages).forEach(([name, page]) => {
      if (page.branding?.hasJobContent) {
        brandingIssues.push(name);
      }
    });

    if (brandingIssues.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Brand Consistency',
        description: 'Pages contain job/recruitment content not aligned with parenting theme',
        pages: brandingIssues,
        impact: 'Medium - Confusing brand message'
      });
    }

    // Button functionality issues
    const brokenButtons = this.analysis.buttons.filter(btn => btn.status.includes('❌'));
    if (brokenButtons.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Navigation Issues',
        description: `${brokenButtons.length} buttons/links are not working properly`,
        details: brokenButtons.slice(0, 5),
        impact: 'High - Users cannot navigate effectively'
      });
    }

    this.analysis.recommendations = recommendations;
  }

  async generateReport() {
    const report = `
# 🍼 Comprehensive Website Analysis Report
**Site**: ${SITE_URL}
**Analysis Date**: ${new Date().toISOString()}

## 1. 🔘 Button Functionality Analysis

**Total buttons tested**: ${this.analysis.buttons.length}
**Working buttons**: ${this.analysis.buttons.filter(b => b.status.includes('✅')).length}
**Broken buttons**: ${this.analysis.buttons.filter(b => b.status.includes('❌')).length}

### Button Test Results:
${this.analysis.buttons.map(btn => `
**"${btn.text}"** (${btn.tagName})
- Status: ${btn.status}
- Destination: ${btn.destination || 'N/A'}
- HTTP Status: ${btn.httpStatus || 'N/A'}
${btn.error ? `- Error: ${btn.error}` : ''}
`).join('\n')}

---

## 2. 📄 Page Completion Status

${Object.entries(this.analysis.pages).map(([name, page]) => `
### ${name}
- **URL**: ${page.url}
- **Accessible**: ${page.isAccessible ? '✅ Yes' : '❌ No'}
- **HTTP Status**: ${page.httpStatus || 'N/A'}
- **Functionality Level**: ${page.functionality || 0}%
- **Content Summary**: ${page.content?.wordCount || 0} words, ${page.content?.images || 0} images
- **Brand Alignment**: ${page.branding?.brandConsistency || 'Unknown'}
${page.content?.hasPlaceholder ? '⚠️ Contains placeholder content' : ''}
${page.error ? `❌ Error: ${page.error}` : ''}
`).join('\n')}

---

## 3. 🗺️ Navigation Structure Map

**Total links found**: ${this.analysis.navigation.total || 0}
**Internal links**: ${this.analysis.navigation.internal?.length || 0}
**External links**: ${this.analysis.navigation.external?.length || 0}

### Internal Navigation:
${(this.analysis.navigation.internal || []).map(link => `- [${link.text}](${link.href})`).join('\n')}

---

## 4. 🎯 Parenting Community Alignment

### Brand Consistency Analysis:
${Object.entries(this.analysis.pages).map(([name, page]) => `
**${name}**: ${page.branding?.brandConsistency || 'Not analyzed'}
${page.branding?.hasJobContent ? '⚠️ Contains job/recruitment content' : ''}
${page.branding?.alignsWithParenting ? '✅ Contains parenting-relevant content' : ''}
`).join('\n')}

---

## 5. 💡 Priority Development Recommendations

${this.analysis.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.category} (${rec.priority} Priority)
**Description**: ${rec.description}
**Impact**: ${rec.impact}
${rec.pages ? `**Affected Pages**: ${Array.isArray(rec.pages) ? rec.pages.map(p => typeof p === 'string' ? p : `${p.name} (${p.functionality}%)`).join(', ') : rec.pages}` : ''}
${rec.details ? `**Details**: ${rec.details.map(d => `${d.text}: ${d.status}`).join(', ')}` : ''}
`).join('\n')}

---

## 📊 Summary Statistics

- **Total pages analyzed**: ${Object.keys(this.analysis.pages).length}
- **Fully functional pages**: ${Object.values(this.analysis.pages).filter(p => p.functionality >= 75).length}
- **Pages needing work**: ${Object.values(this.analysis.pages).filter(p => p.functionality < 50).length}
- **Critical issues found**: ${this.analysis.recommendations.filter(r => r.priority === 'CRITICAL').length}
- **High priority issues**: ${this.analysis.recommendations.filter(r => r.priority === 'HIGH').length}

## 🎯 Recommended Development Order

1. **Fix Critical Issues** - Address inaccessible pages and broken navigation
2. **Complete Core Pages** - Focus on 임신, 출산, 신생아, 커뮤니티 pages
3. **Remove Mixed Messaging** - Clean up any remaining job/recruitment content
4. **Enhance User Experience** - Add interactive features and better content
5. **Optimize Performance** - Improve load times and mobile experience

*Screenshots and detailed evidence available in: ${SCREENSHOTS_DIR}*
`;

    await fs.writeFile('./website-analysis-report.md', report);
    console.log('\n✅ Analysis complete! Report saved to website-analysis-report.md');
    console.log(`📸 Screenshots saved to ${SCREENSHOTS_DIR}/`);
  }

  async run() {
    try {
      await this.initialize();
      await this.analyzeButtonFunctionality();
      await this.analyzePageContent(); 
      await this.analyzeNavigation();
      await this.generateRecommendations();
      await this.generateReport();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the analysis
const analyzer = new WebsiteAnalyzer();
analyzer.run().catch(console.error);