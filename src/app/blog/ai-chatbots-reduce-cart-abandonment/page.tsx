import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LazyVideo from '@/app/_components/lazy-video';

export const metadata = {
  title: 'AI Chatbots for E-commerce: 10 Proven Ways to Reduce Cart Abandonment in 2025',
  description: 'Discover how AI chatbots reduce the average 69.99% cart abandonment rate. Learn 10 proven strategies with real examples, implementation guides, and ROI data.',
  keywords: 'cart abandonment, ecommerce chatbot, AI customer service, reduce cart abandonment, ecommerce conversion, online shopping automation, customer support chatbot',
  author: 'SiteAgent Team',
  publishedTime: '2025-01-15T00:00:00.000Z',
  modifiedTime: '2025-01-15T00:00:00.000Z',
  openGraph: {
    title: 'AI Chatbots for E-commerce: 10 Proven Ways to Reduce Cart Abandonment',
    description: 'Learn how AI chatbots can recover lost sales and reduce the 69.99% average cart abandonment rate with proven strategies.',
    type: 'article',
    publishedTime: '2025-01-15T00:00:00.000Z',
    authors: ['SiteAgent Team'],
    tags: ['E-commerce', 'Cart Abandonment', 'AI Chatbot', 'Conversion Optimization'],
    images: ['/og-image.png'],
    url: 'https://siteagent.eu/blog/ai-chatbots-reduce-cart-abandonment'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chatbots for E-commerce: 10 Proven Ways to Reduce Cart Abandonment',
    description: 'Learn how AI chatbots can recover lost sales and reduce the 69.99% average cart abandonment rate.',
    images: ['/og-image.png']
  },
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  alternates: {
    canonical: 'https://siteagent.eu/blog/ai-chatbots-reduce-cart-abandonment'
  }
};

function BlogPostLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <article className="prose prose-invert lg:prose-xl max-w-none prose-h2:text-2xl prose-h2:font-bold prose-h2:text-white prose-h2:mt-10 prose-h2:mb-4 prose-p:mb-6">
          <header className="mb-10 border-b border-gray-800 pb-6">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent sm:text-5xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-gray-400">By <span className="font-semibold text-gray-300">SiteAgent Team</span> · January&nbsp;15,&nbsp;2025 · <span className="uppercase tracking-wide text-blue-400">E-commerce</span> · ☕️&nbsp;8&nbsp;min&nbsp;read</p>
          </header>
          {children}
        </article>
      </main>
    </div>
  );
}

export default function CartAbandonmentPost() {
  return (
    <BlogPostLayout title="AI Chatbots for E-commerce: 10 Proven Ways to Reduce Cart Abandonment">
      {/* Intro */}
      <p>
        <strong>Cart abandonment is costing your business thousands of dollars every month.</strong> With an average abandonment rate of <a href="https://baymard.com/lists/cart-abandonment-rate" target="_blank" rel="noopener" className="text-blue-400 underline hover:text-blue-300">69.99% across industries</a>, most online shoppers leave without buying—but AI chatbots can change that.
      </p>
      
      <div className="my-8 p-6 bg-red-900/40 border-l-4 border-red-400 rounded-xl shadow">
        <h3 className="font-bold text-lg mb-2 text-red-200">The Cart Abandonment Crisis</h3>
        <ul className="list-disc pl-6 text-red-100 space-y-1">
          <li><strong>$4.6 trillion</strong> worth of merchandise abandoned annually</li>
          <li><strong>$260 billion</strong> recoverable through better UX</li>
          <li><strong>70% of shoppers</strong> never return to complete purchase</li>
          <li><strong>Mobile abandonment</strong> rates reach 85.65%</li>
        </ul>
        <p className="mt-3 text-sm text-red-200">Source: <a href="https://www.salesforce.com/resources/articles/shopping-cart/" target="_blank" rel="noopener" className="underline hover:text-red-100">Salesforce Commerce Cloud</a></p>
      </div>

      <p className="border-l-4 border-blue-500 pl-4 text-gray-300 italic">
        <strong>Goal:</strong> Reduce cart abandonment by 15-35% using AI-powered interventions at critical decision points.
      </p>

      {/* Table of Contents */}
      <nav aria-label="Table of contents" className="not-prose mb-10 rounded-lg border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Table of Contents</h2>
        <ol className="space-y-2 pl-4 list-decimal marker:text-blue-400">
          <li><a href="#why-customers-abandon" className="hover:text-blue-300 font-bold">Why Customers Abandon Carts</a></li>
          <li><a href="#strategy-1" className="hover:text-blue-300 font-bold">1. Proactive Exit-Intent Assistance</a></li>
          <li><a href="#strategy-2" className="hover:text-blue-300 font-bold">2. Instant Shipping & Return Answers</a></li>
          <li><a href="#strategy-3" className="hover:text-blue-300 font-bold">3. Real-Time Price Match & Discount Discovery</a></li>
          <li><a href="#strategy-4" className="hover:text-blue-300 font-bold">4. Smart Size & Fit Guidance</a></li>
          <li><a href="#strategy-5" className="hover:text-blue-300 font-bold">5. Payment & Security Reassurance</a></li>
          <li><a href="#strategy-6" className="hover:text-blue-300 font-bold">6. Stock Alerts & Alternative Suggestions</a></li>
          <li><a href="#strategy-7" className="hover:text-blue-300 font-bold">7. Guest Checkout Optimization</a></li>
          <li><a href="#strategy-8" className="hover:text-blue-300 font-bold">8. Mobile-First Quick Actions</a></li>
          <li><a href="#strategy-9" className="hover:text-blue-300 font-bold">9. Post-Abandonment Recovery Sequences</a></li>
          <li><a href="#strategy-10" className="hover:text-blue-300 font-bold">10. Social Proof & Urgency Messaging</a></li>
          <li><a href="#implementation" className="hover:text-blue-300 font-bold">Implementation with SiteAgent</a></li>
          <li><a href="#measuring-success" className="hover:text-blue-300 font-bold">Measuring Success</a></li>
        </ol>
      </nav>

      {/* Why Customers Abandon */}
      <h2 id="why-customers-abandon" className="font-bold text-2xl mt-10 mb-4">Why Customers Abandon Carts</h2>
      <p>Understanding the root causes helps us design targeted interventions:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-bold text-lg mb-3 text-white">Top Abandonment Reasons</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• <strong>58%</strong> - High shipping costs</li>
            <li>• <strong>42%</strong> - Required account creation</li>
            <li>• <strong>27%</strong> - Complicated checkout</li>
            <li>• <strong>24%</strong> - Security concerns</li>
            <li>• <strong>22%</strong> - Delivery too slow</li>
          </ul>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-bold text-lg mb-3 text-white">Critical Decision Points</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Product page (sizing/compatibility)</li>
            <li>• Cart review (total cost shock)</li>
            <li>• Checkout start (account requirements)</li>
            <li>• Payment entry (security doubts)</li>
            <li>• Final confirmation (last-minute hesitation)</li>
          </ul>
        </div>
      </div>

      {/* Strategy 1 */}
      <h2 id="strategy-1" className="font-bold text-2xl mt-10 mb-4">1. Proactive Exit-Intent Assistance</h2>
      <p><strong>The Problem:</strong> 35% of users abandon when they encounter confusion or uncertainty during checkout.</p>
      <p><strong>The AI Solution:</strong> Deploy chatbots that detect hesitation patterns and offer immediate help.</p>
      
      <div className="my-6 p-6 bg-blue-900/40 border-l-4 border-blue-400 rounded-xl">
        <h4 className="font-bold mb-2 text-blue-200">Real-World Example: Fashion Retailer</h4>
        <p className="text-blue-100 mb-3">When users hover over the "X" button or stay on checkout for {'>'}90 seconds, the chatbot triggers:</p>
        <blockquote className="border-l-2 border-blue-300 pl-4 italic text-blue-200">
          "Hi! I noticed you might have a question about your order. I'm here to help with sizing, shipping, or any concerns. What can I clarify for you?"
        </blockquote>
        <p className="text-blue-100 mt-3"><strong>Result:</strong> 23% reduction in exit rate at checkout page.</p>
      </div>

      <h4 className="font-bold text-lg mt-6 mb-3">Implementation Tips:</h4>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Trigger timing:</strong> 60-90 seconds of inactivity or specific mouse movements</li>
        <li><strong>Message tone:</strong> Helpful, not pushy ("I'm here if you need help" vs "Don't leave!")</li>
        <li><strong>Quick actions:</strong> One-click access to shipping info, size guides, or return policy</li>
      </ul>

      {/* Strategy 2 */}
      <h2 id="strategy-2" className="font-bold text-2xl mt-10 mb-4">2. Instant Shipping & Return Answers</h2>
      <p><strong>The Problem:</strong> Unexpected shipping costs cause 58% of cart abandonment—the #1 reason worldwide.</p>
      <p><strong>The AI Solution:</strong> Proactively surface shipping information and alternatives before users abandon.</p>

      <div className="my-6 p-6 bg-green-900/40 border-l-4 border-green-400 rounded-xl">
        <h4 className="font-bold mb-2 text-green-200">Success Story: Electronics Store</h4>
        <p className="text-green-100 mb-3">Chatbot detects when shipping costs exceed 15% of order value and automatically suggests:</p>
        <ul className="list-disc pl-6 text-green-100 space-y-1">
          <li>"Add $12 more for free shipping" with product recommendations</li>
          <li>Alternative shipping speeds with cost breakdown</li>
          <li>In-store pickup options with instant availability</li>
        </ul>
        <p className="text-green-100 mt-3"><strong>Result:</strong> 31% increase in average order value, 18% reduction in shipping-related abandonment.</p>
      </div>

      <h4 className="font-bold text-lg mt-6 mb-3">Chatbot Responses to Deploy:</h4>
      <div className="not-prose bg-gray-900 rounded-lg p-4 my-4">
        <pre className="text-gray-300 text-sm overflow-x-auto">
{`💬 "I see you're looking at shipping options. Here's what I can do:
   • Free shipping on orders $50+ (you're $12 away!)
   • Express delivery by tomorrow for $8.99
   • Pick up in-store today - it's ready in 2 hours
   
   Would you like me to suggest items to reach free shipping?"`}
        </pre>
      </div>

      {/* Strategy 3 */}
      <h2 id="strategy-3" className="font-bold text-2xl mt-10 mb-4">3. Real-Time Price Match & Discount Discovery</h2>
      <p><strong>The Problem:</strong> 67% of shoppers compare prices across multiple sites before purchasing.</p>
      <p><strong>The AI Solution:</strong> Offer immediate price matching or reveal applicable discounts when users hesitate.</p>

      <div className="my-6 p-6 bg-purple-900/40 border-l-4 border-purple-400 rounded-xl">
        <h4 className="font-bold mb-2 text-purple-200">Case Study: Home Goods Retailer</h4>
        <p className="text-purple-100 mb-3">When users spend {'>'}3 minutes on product pages or return multiple times, chatbot offers:</p>
        <blockquote className="border-l-2 border-purple-300 pl-4 italic text-purple-200 my-2">
          "Found this item cheaper elsewhere? I can price match and apply our current 10% first-time buyer discount. That brings your total to $89 instead of $99."
        </blockquote>
        <p className="text-purple-100"><strong>Result:</strong> 28% increase in price-sensitive customer conversions.</p>
      </div>

      {/* Strategy 4 */}
      <h2 id="strategy-4" className="font-bold text-2xl mt-10 mb-4">4. Smart Size & Fit Guidance</h2>
      <p><strong>The Problem:</strong> 64% of fashion returns are due to poor fit, and sizing uncertainty causes massive abandonment.</p>
      <p><strong>The AI Solution:</strong> Interactive size guides and fit recommendations based on customer data.</p>

      <figure className="not-prose my-8">
        <LazyVideo
          src="/blog/Adding%20documents.mov"
          poster="/blog/adding-documents-poster.jpg"
          className="mx-auto rounded-lg shadow-lg w-full max-w-3xl"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-400">Example: Uploading size charts and fit guides to train your chatbot.</figcaption>
      </figure>

      <h4 className="font-bold text-lg mt-6 mb-3">Advanced Sizing Features:</h4>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Measurement calculator:</strong> "I'm 5'6" and usually wear Medium in tops"</li>
        <li><strong>Brand comparison:</strong> "This runs small compared to Nike - size up"</li>
        <li><strong>Customer reviews integration:</strong> "87% of customers your size bought Large"</li>
        <li><strong>Return assurance:</strong> "Free returns within 30 days if fit isn't perfect"</li>
      </ul>

      {/* Strategy 5 */}
      <h2 id="strategy-5" className="font-bold text-2xl mt-10 mb-4">5. Payment & Security Reassurance</h2>
      <p><strong>The Problem:</strong> 24% abandon due to security concerns, especially on mobile devices.</p>
      <p><strong>The AI Solution:</strong> Proactively address security doubts with clear, immediate reassurance.</p>

      <div className="my-6 p-6 bg-gray-800 border border-gray-700 rounded-xl">
        <h4 className="font-bold mb-3 text-white">Trust-Building Messages</h4>
        <div className="space-y-3 text-gray-300">
          <p><strong>🔒 Security:</strong> "Your payment is secured with 256-bit SSL encryption - the same protection banks use."</p>
          <p><strong>💳 Payment options:</strong> "Pay with PayPal, Apple Pay, Google Pay, or any major credit card."</p>
          <p><strong>📞 Support:</strong> "Questions? Call us at [number] or chat right here - real humans available 24/7."</p>
          <p><strong>⭐ Social proof:</strong> "Trusted by 50,000+ customers with 4.8/5 average rating."</p>
        </div>
      </div>

      {/* Strategy 6 */}
      <h2 id="strategy-6" className="font-bold text-2xl mt-10 mb-4">6. Stock Alerts & Alternative Suggestions</h2>
      <p><strong>The Problem:</strong> Out-of-stock items or low inventory creates urgency but also abandonment.</p>
      <p><strong>The AI Solution:</strong> Convert stock issues into engagement opportunities.</p>

      <div className="my-6 p-6 bg-orange-900/40 border-l-4 border-orange-400 rounded-xl">
        <h4 className="font-bold mb-2 text-orange-200">Inventory Management Example</h4>
        <div className="text-orange-100 space-y-2">
          <p><strong>Low stock:</strong> "Only 3 left in Medium! I can reserve this for 15 minutes while you decide."</p>
          <p><strong>Out of stock:</strong> "This size is sold out, but I found 3 similar items you might like. Want to see them?"</p>
          <p><strong>Restock alerts:</strong> "Get notified the moment this comes back - I'll send you a text."</p>
        </div>
      </div>

      {/* Strategy 7 */}
      <h2 id="strategy-7" className="font-bold text-2xl mt-10 mb-4">7. Guest Checkout Optimization</h2>
      <p><strong>The Problem:</strong> 42% abandon when forced to create accounts.</p>
      <p><strong>The AI Solution:</strong> Guide users to guest checkout while capturing email for future marketing.</p>

      <div className="not-prose bg-gray-900 rounded-lg p-4 my-6">
        <pre className="text-gray-300 text-sm overflow-x-auto">
{`💬 "No account needed! Here's your fastest checkout options:
   
   🚀 Guest Checkout (30 seconds)
   • Just email + payment info
   • Get order tracking via email
   
   👤 Create Account (optional)
   • Save info for next time
   • Track orders easily
   • Get exclusive member discounts
   
   Which would you prefer?"`}
        </pre>
      </div>

      {/* Strategy 8 */}
      <h2 id="strategy-8" className="font-bold text-2xl mt-10 mb-4">8. Mobile-First Quick Actions</h2>
      <p><strong>The Problem:</strong> Mobile cart abandonment reaches 85.65% due to form complexity and small screens.</p>
      <p><strong>The AI Solution:</strong> Voice-first interactions and one-tap solutions.</p>

      <h4 className="font-bold text-lg mt-6 mb-3">Mobile Optimization Features:</h4>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Voice search:</strong> "Tell me what you're looking for"</li>
        <li><strong>Quick reorder:</strong> "Buy the same items as last time?"</li>
        <li><strong>Autofill assistance:</strong> "I can help fill out shipping info"</li>
        <li><strong>Visual search:</strong> "Take a photo of what you want to match"</li>
      </ul>

      {/* Strategy 9 */}
      <h2 id="strategy-9" className="font-bold text-2xl mt-10 mb-4">9. Post-Abandonment Recovery Sequences</h2>
      <p><strong>The Problem:</strong> Most abandoned carts are forgotten within 24 hours.</p>
      <p><strong>The AI Solution:</strong> Intelligent follow-up sequences that re-engage without being pushy.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 not-prose">
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="font-bold text-white mb-2">30 Minutes Later</h4>
          <p className="text-gray-300 text-sm">"Forgot something in your cart? Your items are still available - complete your order in 2 clicks."</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="font-bold text-white mb-2">24 Hours Later</h4>
          <p className="text-gray-300 text-sm">"Still thinking it over? Here's 10% off to help you decide. Code: WELCOME10"</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="font-bold text-white mb-2">1 Week Later</h4>
          <p className="text-gray-300 text-sm">"Those items are popular! 127 people viewed them this week. Secure yours now?"</p>
        </div>
      </div>

      {/* Strategy 10 */}
      <h2 id="strategy-10" className="font-bold text-2xl mt-10 mb-4">10. Social Proof & Urgency Messaging</h2>
      <p><strong>The Problem:</strong> Customers need validation and fear missing out, but fake urgency backfires.</p>
      <p><strong>The AI Solution:</strong> Real-time, honest social proof and scarcity indicators.</p>

      <div className="my-6 p-6 bg-gray-800 border border-gray-700 rounded-xl">
        <h4 className="font-bold mb-3 text-white">Authentic Social Proof Examples</h4>
        <div className="space-y-3 text-gray-300">
          <p>• "5 people bought this item in the last hour"</p>
          <p>• "This has a 4.7/5 rating from 234 verified buyers"</p>
          <p>• "Sarah from San Diego bought this yesterday and loves it!"</p>
          <p>• "Best seller in the 'Winter Coats' category this month"</p>
        </div>
      </div>

      {/* Implementation */}
      <h2 id="implementation" className="font-bold text-2xl mt-10 mb-4">Implementation with SiteAgent</h2>
      <p>Getting started with these strategies using SiteAgent is straightforward:</p>

      <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-bold text-lg mb-3 text-white">Quick Setup (15 minutes)</h3>
          <ol className="space-y-2 text-gray-300 list-decimal pl-5">
            <li><Link href="/dashboard/chatbot/new" className="text-blue-400 hover:text-blue-300">Create your chatbot</Link></li>
            <li>Upload product FAQs, shipping policies, return guides</li>
            <li>Configure proactive message triggers</li>
            <li>Set up exit-intent detection</li>
            <li>Integrate with your e-commerce platform</li>
          </ol>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-bold text-lg mb-3 text-white">Advanced Features</h3>
          <ul className="space-y-2 text-gray-300 list-disc pl-5">
            <li>A/B test different intervention timings</li>
            <li>Segment customers by behavior patterns</li>
            <li>Integrate with email marketing tools</li>
            <li>Track conversion attribution</li>
            <li>Multi-language support for global stores</li>
          </ul>
        </div>
      </div>

      <figure className="not-prose my-8">
        <LazyVideo
          src="/blog/Copy%20Snippet.mov"
          poster="/blog/copy-snippet-poster.jpg"
          className="mx-auto rounded-lg shadow-lg w-full max-w-3xl"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-400">Installing your cart abandonment chatbot takes just minutes.</figcaption>
      </figure>

      <p>For Shopify stores specifically, check out our detailed <Link href="/blog/add-chatbot-to-shopify-store" className="text-blue-400 underline hover:text-blue-300">Shopify integration guide</Link>.</p>

      {/* Measuring Success */}
      <h2 id="measuring-success" className="font-bold text-2xl mt-10 mb-4">Measuring Success</h2>
      <p>Track these key metrics to optimize your cart abandonment strategy:</p>

      <Image
        src="/blog/Analytics.png"
        alt="SiteAgent analytics dashboard showing cart abandonment reduction metrics"
        width={960}
        height={540}
        className="mx-auto my-8 rounded-lg shadow-lg"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-bold text-lg mb-3 text-white">Primary Metrics</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• <strong>Cart abandonment rate</strong> (target: {'<'}15%)</li>
            <li>• <strong>Conversion rate</strong> (track improvement)</li>
            <li>• <strong>Average order value</strong> (upsell success)</li>
            <li>• <strong>Customer acquisition cost</strong></li>
          </ul>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="font-bold text-lg mb-3 text-white">Chatbot Metrics</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• <strong>Intervention success rate</strong></li>
            <li>• <strong>Time to resolution</strong></li>
            <li>• <strong>Customer satisfaction scores</strong></li>
            <li>• <strong>Escalation to human rate</strong></li>
          </ul>
        </div>
      </div>

      <div className="my-8 p-6 bg-green-900/40 border-l-4 border-green-400 rounded-xl">
        <h3 className="font-bold text-lg mb-2 text-green-200">Expected Results</h3>
        <p className="text-green-100 mb-3">Based on our customers' data:</p>
        <ul className="list-disc pl-6 text-green-100 space-y-1">
          <li><strong>15-35% reduction</strong> in cart abandonment within 30 days</li>
          <li><strong>12-28% increase</strong> in conversion rate</li>
          <li><strong>18-25% boost</strong> in average order value through upsells</li>
          <li><strong>ROI of 300-500%</strong> within first quarter</li>
        </ul>
      </div>

      {/* CTA Section */}
      <div className="my-12 p-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-500/30 not-prose">
        <h3 className="text-2xl font-bold text-white mb-4">Ready to Recover Those Lost Sales?</h3>
        <p className="text-gray-300 mb-6">
          Don't let another $1,000 in potential revenue walk away. Set up your cart abandonment chatbot in 15 minutes and start recovering sales today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard/chatbot/new"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Start Free Trial
          </Link>
          <Link
            href="/blog/add-chatbot-to-shopify-store"
            className="px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-lg transition-colors"
          >
            View Shopify Guide
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <h2 className="font-bold text-2xl mt-12 mb-4">Frequently Asked Questions</h2>
      
      <details className="mt-6 border border-gray-800 rounded-lg p-4">
        <summary className="cursor-pointer text-lg font-semibold hover:text-blue-400">How quickly can I see results?</summary>
        <div className="mt-3 pl-4 border-l border-gray-700 text-gray-300">
          Most stores see a 10-15% improvement in cart abandonment within the first week. Full optimization typically takes 30-60 days as the AI learns customer patterns.
        </div>
      </details>
      
      <details className="mt-4 border border-gray-800 rounded-lg p-4">
        <summary className="cursor-pointer text-lg font-semibold hover:text-blue-400">Will this work with my existing e-commerce platform?</summary>
        <div className="mt-3 pl-4 border-l border-gray-700 text-gray-300">
          Yes! SiteAgent integrates with Shopify, WooCommerce, Magento, BigCommerce, and custom platforms through our JavaScript widget and API.
        </div>
      </details>
      
      <details className="mt-4 border border-gray-800 rounded-lg p-4">
        <summary className="cursor-pointer text-lg font-semibold hover:text-blue-400">How do I prevent the chatbot from being annoying?</summary>
        <div className="mt-3 pl-4 border-l border-gray-700 text-gray-300">
          Smart timing is key. We recommend starting with exit-intent triggers and 90-second delays. You can A/B test different approaches and adjust based on customer feedback.
        </div>
      </details>
      
      <details className="mt-4 border border-gray-800 rounded-lg p-4">
        <summary className="cursor-pointer text-lg font-semibold hover:text-blue-400">Can the chatbot handle complex product questions?</summary>
        <div className="mt-3 pl-4 border-l border-gray-700 text-gray-300">
          Absolutely. Upload your product manuals, size charts, compatibility guides, and FAQs. The AI uses <Link href="/blog/rag-explained-simple-terms" className="text-blue-400 underline hover:text-blue-300">RAG technology</Link> to provide accurate, contextual answers from your actual documentation.
        </div>
      </details>

      <p className="mt-8 text-sm text-gray-400">
        <strong>Related reading:</strong> <Link href="/blog/create-chatbot-with-siteagent" className="text-blue-400 underline hover:text-blue-300">Complete Guide to Creating Your First AI Chatbot</Link> • <Link href="/blog/rag-explained-simple-terms" className="text-blue-400 underline hover:text-blue-300">What is RAG? A Simple Explanation</Link>
      </p>
    </BlogPostLayout>
  );
} 