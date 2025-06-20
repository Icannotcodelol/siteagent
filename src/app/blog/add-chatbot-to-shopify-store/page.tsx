import Link from 'next/link';
import Image from 'next/image';
import LazyVideo from '@/app/_components/lazy-video';

export const metadata = {
  title: 'How to Add a Custom AI Chatbot to Your Shopify Store with SiteAgent',
  description: 'Step-by-step guide to integrating a powerful AI chatbot with your Shopify store using SiteAgent. Boost sales, automate support, and delight customers in minutes.',
  keywords: 'Shopify chatbot, add chatbot to Shopify, AI chatbot for Shopify, Shopify app integration, SiteAgent, ecommerce automation',
  author: 'SiteAgent Team',
  publishedTime: '2025-06-19T00:00:00.000Z',
  modifiedTime: '2025-06-19T00:00:00.000Z',
  openGraph: {
    title: 'How to Add a Custom AI Chatbot to Your Shopify Store with SiteAgent',
    description: 'Integrate a smart AI chatbot with your Shopify store in minutes. Full tutorial with visuals and code.',
    type: 'article',
    publishedTime: '2025-06-19T00:00:00.000Z',
    authors: ['SiteAgent Team'],
    tags: ['Shopify', 'Chatbot', 'AI', 'Ecommerce', 'SiteAgent'],
    images: ['/blog/System%20promt%20pic.png'],
    url: 'https://siteagent.eu/blog/add-chatbot-to-shopify-store'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Add a Custom AI Chatbot to Your Shopify Store with SiteAgent',
    description: 'Integrate a smart AI chatbot with your Shopify store in minutes. Full tutorial with visuals and code.',
    images: ['/blog/System%20promt%20pic.png']
  },
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  alternates: {
    canonical: 'https://siteagent.eu/blog/add-chatbot-to-shopify-store'
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
            <p className="mt-2 text-sm text-gray-400">By <span className="font-semibold text-gray-300">SiteAgent Team</span> · June&nbsp;19,&nbsp;2025 · <span className="uppercase tracking-wide text-blue-400">Ecommerce</span> · ☕️&nbsp;6&nbsp;min&nbsp;read</p>
          </header>
          {children}
        </article>
      </main>
    </div>
  );
}

export default function AddChatbotToShopifyPost() {
  return (
    <BlogPostLayout title="How to Add a Custom AI Chatbot to Your Shopify Store with SiteAgent">
      {/* Intro */}
      <p>
        <strong>Want to boost sales and automate support on your Shopify store?</strong> In this guide, you'll learn how to add a powerful AI chatbot to your Shopify site using SiteAgent. No coding, no hassle—just results.
      </p>
      <p className="border-l-4 border-blue-500 pl-4 text-gray-300 italic">
        <strong>Goal:</strong> A branded chatbot that answers questions, automates order lookups, and helps shoppers 24/7.
      </p>

      {/* Table of Contents */}
      <nav aria-label="Table of contents" className="not-prose mb-10 rounded-lg border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Table of Contents</h2>
        <ol className="space-y-2 pl-4 list-decimal marker:text-blue-400">
          <li><a href="#why-chatbot" className="hover:text-blue-300 font-bold">Why Add a Chatbot to Shopify?</a></li>
          <li><a href="#requirements" className="hover:text-blue-300 font-bold">What You'll Need</a></li>
          <li><a href="#step-1" className="hover:text-blue-300 font-bold">Step 1: Create Your Chatbot</a></li>
          <li><a href="#step-2" className="hover:text-blue-300 font-bold">Step 2: Connect to Shopify</a></li>
          <li><a href="#step-3" className="hover:text-blue-300 font-bold">Step 3: Add Store Content</a></li>
          <li><a href="#step-4" className="hover:text-blue-300 font-bold">Step 4: Customize the System Prompt</a></li>
          <li><a href="#step-5" className="hover:text-blue-300 font-bold">Step 5: Embed the Chatbot</a></li>
          <li><a href="#step-6" className="hover:text-blue-300 font-bold">Step 6: Test and Go Live</a></li>
          <li><a href="#analytics" className="hover:text-blue-300 font-bold">Measuring Success</a></li>
          <li><a href="#faq" className="hover:text-blue-300 font-bold">FAQ</a></li>
        </ol>
      </nav>

      {/* Why Add a Chatbot */}
      <h2 id="why-chatbot" className="font-bold text-2xl mt-10 mb-4">Why Add a Chatbot to Shopify?</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>24/7 instant answers</strong> for shoppers</li>
        <li><strong>Reduce abandoned carts</strong> with proactive help</li>
        <li><strong>Automate FAQs and order lookups</strong></li>
        <li><strong>Capture leads and feedback</strong></li>
        <li><strong>Integrate with Shopify data</strong> (orders, products, and more)</li>
      </ul>

      <div className="my-8 p-6 bg-blue-900/60 border-l-4 border-blue-400 rounded-xl shadow">
        <h3 className="font-bold text-lg mb-2 text-blue-200">What can your Shopify chatbot do?</h3>
        <ul className="list-disc pl-6 text-blue-100">
          <li>Answer "Where is my order?" and track shipments live</li>
          <li>Show today's deals, new arrivals, or bestsellers</li>
          <li>Explain your return and refund policy</li>
          <li>Help with sizing, product details, and recommendations</li>
          <li>Collect emails for restock alerts or newsletters</li>
          <li>Escalate to a human if needed</li>
        </ul>
      </div>

      {/* Requirements */}
      <h2 id="requirements" className="font-bold text-2xl mt-10 mb-4">What You'll Need</h2>
      <ul className="list-disc pl-6">
        <li><strong>SiteAgent account:</strong> <Link href="/signup" className="text-blue-400 underline hover:text-blue-300">Sign up free</Link></li>
        <li><strong>Shopify store admin access</strong></li>
        <li><strong>5–10 minutes</strong></li>
      </ul>

      {/* Step 1 */}
      <h2 id="step-1" className="font-bold text-2xl mt-10 mb-4">Step 1: Create Your Chatbot in SiteAgent</h2>
      <p>
        Go to <strong>Dashboard → Chatbots → New</strong>. Name your bot, pick a language, set a welcome message, and click <strong>Create</strong>.
      </p>
      <figure className="not-prose">
        <LazyVideo
          src="/blog/Chatbot%20creatio.mov"
          poster="/blog/chatbot-creation-poster.jpg"
          className="mx-auto my-8 rounded-lg shadow-lg w-full max-w-3xl"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-400">Creating a new chatbot in the SiteAgent dashboard.</figcaption>
      </figure>

      {/* Step 2 */}
      <h2 id="step-2" className="font-bold text-2xl mt-10 mb-4">Step 2: Connect SiteAgent to Shopify</h2>
      <p>
        In your chatbot's dashboard, go to <strong>Actions → New → Shopify</strong>. Click <strong>Connect</strong> and follow the prompts to authenticate with your Shopify store. Approve the requested permissions so the bot can access orders, products, and customer info as needed.
      </p>
      <figure className="not-prose">
        <LazyVideo
          src="/blog/Connecting%20shopify.mov"
          poster="/blog/connecting-shopify-poster.jpg"
          className="mx-auto my-8 rounded-lg shadow-lg w-full max-w-3xl"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-400">Connecting SiteAgent to Shopify (OAuth flow).</figcaption>
      </figure>

      {/* Step 3 */}
      <h2 id="step-3" className="font-bold text-2xl mt-10 mb-4">Step 3: Add Your Store Content</h2>
      <p>
        Upload your FAQs, policies, product docs, or simply paste your store's URL. This helps the chatbot answer store-specific questions and provide accurate support.
      </p>
      <figure className="not-prose">
        <LazyVideo
          src="/blog/Adding%20documents.mov"
          poster="/blog/adding-documents-poster.jpg"
          className="mx-auto my-8 rounded-lg shadow-lg w-full max-w-3xl"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-400">Uploading store content and FAQs.</figcaption>
      </figure>

      {/* Step 4 */}
      <h2 id="step-4" className="font-bold text-2xl mt-10 mb-4">Step 4: Customize the System Prompt</h2>
      <p>
        Set the chatbot's tone, brand voice, and guardrails in the <strong>System Prompt</strong>. Example: "You are a helpful, friendly assistant for an online store. Always offer to help with orders, returns, and product questions."
      </p>
      <Image
        src="/blog/System%20promt%20pic.png"
        alt="System prompt settings for Shopify chatbot"
        width={960}
        height={540}
        className="mx-auto my-8 rounded-lg shadow-lg"
      />
      <p className="mt-2 text-sm text-gray-400">
        Want to master prompt design? See our <Link href="/blog/meta-prompting-engineering-ai-mind" className="text-blue-400 underline hover:text-blue-300">Meta Prompting guide</Link> or <a href="https://platform.openai.com/docs/guides/prompt-engineering" target="_blank" rel="noopener nofollow" className="text-blue-400 underline hover:text-blue-300">OpenAI's Prompt Engineering Guide</a>.
      </p>

      {/* Step 5 */}
      <h2 id="step-5" className="font-bold text-2xl mt-10 mb-4">Step 5: Embed the Chatbot on Your Shopify Store</h2>
      <p>
        Copy the SiteAgent embed code from your dashboard.
      </p>
      <figure className="not-prose">
        <LazyVideo
          src="/blog/Copy%20Snippet.mov"
          poster="/blog/copy-snippet-poster.jpg"
          className="mx-auto my-6 rounded-lg shadow-lg w-full max-w-2xl"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-400">Copying the embed snippet from SiteAgent.</figcaption>
      </figure>
      <p>
        In Shopify admin, go to <strong>Online Store → Themes → Edit Code</strong>. Open <code>theme.liquid</code> and paste the snippet just before <code>&lt;/body&gt;</code>.
      </p>
      <figure className="not-prose">
        <LazyVideo
          src="/blog/Paste%20snippet.mov"
          poster="/blog/paste-snippet-poster.jpg"
          className="mx-auto my-6 rounded-lg shadow-lg w-full max-w-2xl"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-400">Pasting the snippet into Shopify's theme.liquid.</figcaption>
      </figure>
      <pre className="not-prose overflow-x-auto rounded-md bg-gray-900 text-gray-100 p-4 text-sm">
{`<script
  src="https://siteagent.eu/chatbot-widget.js"
  data-chatbot-id="YOUR_CHATBOT_ID"
  defer
></script>`}
      </pre>

      {/* Step 6 */}
      <h2 id="step-6" className="font-bold text-2xl mt-10 mb-4">Step 6: Test and Go Live</h2>
      <p>
        Preview your store and test the chatbot. Try asking about products, order status, and returns. Make sure the bot responds as expected.
      </p>
      <figure className="not-prose">
        <div className="w-full h-64 bg-gray-800 flex items-center justify-center rounded-lg my-8">
          <span className="text-gray-400">[Video: Testing the chatbot on a live Shopify store – coming soon]</span>
        </div>
        <Image
          src="/blog/Shopify%20Chat%20example.png"
          alt="SiteAgent chatbot answering a customer question inside a Shopify store"
          width={960}
          height={540}
          className="mx-auto my-8 rounded-lg shadow-lg"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-400">Testing the chatbot on a live Shopify store.</figcaption>
      </figure>

      {/* Analytics */}
      <h2 id="analytics" className="font-bold text-2xl mt-10 mb-4">Measuring Success</h2>
      <p>
        Use SiteAgent's <strong>Analytics</strong> dashboard to track:
      </p>
      <ul className="list-disc pl-6">
        <li><strong>Response time</strong></li>
        <li><strong>Message volume</strong></li>
        <li><strong>Popular questions</strong></li>
        <li><strong>Customer feedback</strong></li>
      </ul>
      <p>
        Use these insights to improve your bot and your store's customer experience.
      </p>

      {/* FAQ */}
      <h2 id="faq" className="font-bold text-2xl mt-10 mb-4">FAQ</h2>
      <details className="mt-6">
        <summary className="cursor-pointer text-lg font-semibold">Is my data secure?</summary>
        <div className="mt-2 pl-4 border-l border-gray-700">
          All documents are encrypted at rest and protected by row-level security. SiteAgent strips NUL bytes to prevent Postgres errors—even malformed files are safe.
        </div>
      </details>
      <details className="mt-4">
        <summary className="cursor-pointer text-lg font-semibold">Can I restrict what the bot can do in Shopify?</summary>
        <div className="mt-2 pl-4 border-l border-gray-700">
          Yes! You control which actions and data the bot can access when connecting to Shopify.
        </div>
      </details>
      <details className="mt-4">
        <summary className="cursor-pointer text-lg font-semibold">Does it work with custom themes?</summary>
        <div className="mt-2 pl-4 border-l border-gray-700">
          Yes, as long as you can edit <code>theme.liquid</code> and add the embed code before <code>&lt;/body&gt;</code>.
        </div>
      </details>
      <details className="mt-4">
        <summary className="cursor-pointer text-lg font-semibold">Where can I learn more about Shopify APIs?</summary>
        <div className="mt-2 pl-4 border-l border-gray-700">
          See the <a href="https://shopify.dev/docs/api" target="_blank" rel="noopener nofollow" className="text-blue-400 underline hover:text-blue-300">Shopify API docs</a> and <a href="https://developers.hubspot.com/docs/api/overview" target="_blank" rel="noopener nofollow" className="text-blue-400 underline hover:text-blue-300">HubSpot API docs</a>.
        </div>
      </details>

      {/* Conclusion */}
      <p className="mt-10 text-center text-lg">
        <strong>Ready to boost your Shopify store?</strong> <Link href="/signup" className="text-blue-400 underline hover:text-blue-300">Create your free chatbot now</Link> • <Link href="/blog/create-chatbot-with-siteagent" className="text-blue-400 underline hover:text-blue-300">See our full chatbot creation guide</Link>
      </p>
    </BlogPostLayout>
  );
} 