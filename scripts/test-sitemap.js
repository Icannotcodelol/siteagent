import { GET } from '../src/app/sitemap.xml/route.js'

async function testSitemap() {
  console.log('Testing sitemap generation...\n')
  
  try {
    const response = await GET()
    const sitemapContent = await response.text()
    
    console.log('Generated sitemap:')
    console.log('=================')
    console.log(sitemapContent)
    console.log('\n=================')
    
    // Check for important elements
    const hasHreflangNamespace = sitemapContent.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    const hasHreflangTags = sitemapContent.includes('xhtml:link rel="alternate"')
    const hasAllLocales = ['de', 'it', 'pl', 'es', 'nl'].every(locale => 
      sitemapContent.includes(`hreflang="${locale}"`)
    )
    
    console.log('\nValidation Results:')
    console.log(`✓ Hreflang namespace present: ${hasHreflangNamespace}`)
    console.log(`✓ Hreflang tags present: ${hasHreflangTags}`)
    console.log(`✓ All locales included: ${hasAllLocales}`)
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }
}

testSitemap()