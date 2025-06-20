import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from '@/app/_components/auth-button';
import { Facebook, Twitter, Linkedin, Github, ArrowLeft } from 'lucide-react';
import LazyVideo from '@/app/_components/lazy-video';

// Page-specific metadata
export const metadata = {
  title: 'Create a Chatbot With SiteAgent in 5 Minutes: Step-by-Step Tutorial | SiteAgent Blog',
  description: 'Step-by-step guide to build an AI chatbot with SiteAgent: create, upload documents, craft a system prompt, embed on your site, and analyse performance.',
  keywords: 'create chatbot, SiteAgent, AI chatbot tutorial, upload documents, system prompt, embed chatbot, no-code AI, customer support automation',
  author: 'SiteAgent Team',
  publishedTime: '2025-06-18T00:00:00.000Z',
  modifiedTime: '2025-06-18T00:00:00.000Z',
  openGraph: {
    title: 'Create a Chatbot With SiteAgent in 5 Minutes',
    description: 'Learn how to build an AI chatbot using SiteAgent in under five minutes.',
    type: 'article',
    publishedTime: '2025-06-18T00:00:00.000Z',
    authors: ['SiteAgent Team'],
    tags: ['Chatbot', 'AI', 'SiteAgent', 'Tutorial'],
    images: ['/blog/siteagent-chatbot-guide/chatbot-creation-poster.jpg'],
    url: 'https://siteagent.eu/blog/create-chatbot-with-siteagent'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create a Chatbot With SiteAgent in 5 Minutes',
    description: 'Quick tutorial covering chatbot creation, document ingestion and embedding.',
    images: ['/blog/siteagent-chatbot-guide/chatbot-creation-poster.jpg']
  },
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  alternates: {
    canonical: 'https://siteagent.eu/blog/create-chatbot-with-siteagent'
  }
};

// Reusable Navbar (duplicated for now; consider refactoring)
function PageNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-gray-900/95 supports-[backdrop-filter]:bg-gray-900/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={40} height={40} priority />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#features" className="relative text-sm font-medium text-gray-300 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full">Features</Link>
          <Link href="/#pricing" className="relative text-sm font-medium text-gray-300 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full">Pricing</Link>
          <Link href="/contact" className="relative text-sm font-medium text-gray-300 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

// Reusable Footer
function PageFooter() {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/#features' },
        { label: 'Pricing', href: '/#pricing' },
        { label: 'Documentation', href: '/docs' },
        { label: 'Changelog', href: '/changelog' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Security', href: '/security' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' }
  ];

  return (
    <footer className="border-t border-gray-800 bg-gray-900 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="group flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 transition-all duration-300 group-hover:bg-blue-500">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-blue-400">
                SiteAgent
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 transition-colors duration-300 hover:text-gray-300">
              Build, deploy, and manage AI-powered chatbots that integrate with your tools and data.
            </p>
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-all duration-300 hover:text-white hover:scale-110"
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-block text-gray-400 transition-all duration-300 hover:text-white hover:translate-x-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SiteAgent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Generic Layout wrapper for blog articles
function BlogPostLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      <PageNavbar />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <article className="prose prose-invert lg:prose-xl max-w-none prose-h2:text-2xl prose-h2:font-bold prose-h2:text-white prose-h2:mt-10 prose-h2:mb-4 prose-p:mb-6">
          <header className="mb-10 border-b border-gray-800 pb-6">
            <Link href="/blog" className="mb-4 inline-flex items-center text-sm text-gray-400 hover:text-gray-200">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Link>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent sm:text-5xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-gray-400">By <span className="font-semibold text-gray-300">max@siteagent.eu</span> · June&nbsp;18,&nbsp;2025 · <span className="uppercase tracking-wide text-blue-400">Tutorial</span> · ☕️&nbsp;7&nbsp;min&nbsp;read</p>
          </header>
          {children}
        </article>
      </main>
      <PageFooter />
    </div>
  );
}

export default function CreateChatbotPost() {
  return (
    <BlogPostLayout title="Create a Chatbot With SiteAgent in 5 Minutes: Step-by-Step Tutorial">
      {/* Intro */}
      <p>
        <strong>Want a custom AI chatbot on your website in minutes?</strong> With SiteAgent, you can build, train, and launch a production-ready assistant—no coding, no infrastructure, no hassle. This guide shows you every step, with real visuals and copy-paste code.
      </p>

      <p className="mt-4 text-sm text-gray-400">
        <strong>Related reading:</strong> <Link href="/blog/rag-explained-simple-terms" className="text-blue-400 underline hover:text-blue-300">RAG Explained in Simple Terms</Link> • <Link href="/blog/meta-prompting-engineering-ai-mind" className="text-blue-400 underline hover:text-blue-300">Meta Prompting: Engineering the Mind of Your AI</Link>
      </p>

      <p className="border-l-4 border-blue-500 pl-4 text-gray-300 italic">
        <strong>Goal:</strong> A branded chatbot that answers questions using your content, with analytics and full control.
      </p>

      {/* Table of Contents */}
      <nav aria-label="Table of contents" className="not-prose mb-10 rounded-lg border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Table of Contents</h2>
        <ol className="space-y-2 pl-4 list-decimal marker:text-blue-400">
          <li><a href="#why-siteagent" className="hover:text-blue-300 font-bold">Why SiteAgent?</a></li>
          <li><a href="#prerequisites" className="hover:text-blue-300 font-bold">What You Need</a></li>
          <li><a href="#step-1" className="hover:text-blue-300 font-bold">Step 1: Create Your Chatbot</a></li>
          <li><a href="#step-2" className="hover:text-blue-300 font-bold">Step 2: Add Documents</a></li>
          <li><a href="#step-3" className="hover:text-blue-300 font-bold">Step 3: Set the System Prompt</a></li>
          <li><a href="#step-4" className="hover:text-blue-300 font-bold">Step 4: Embed on Your Site</a></li>
          <li><a href="#step-5" className="hover:text-blue-300 font-bold">Step 5: Measure & Improve</a></li>
          <li><a href="#faq" className="hover:text-blue-300 font-bold">FAQ</a></li>
        </ol>
      </nav>

      {/* Why SiteAgent */}
      <h2 id="why-siteagent" className="font-bold text-2xl mt-10 mb-4">Why SiteAgent?</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Accurate answers:</strong> Uses <strong>Retrieval-Augmented Generation (RAG)</strong> (<Link href="/blog/rag-explained-simple-terms" className="text-blue-400 underline hover:text-blue-300">what's RAG?</Link>) and your docs, not random web data.</li>
        <li><strong>Real actions:</strong> Connects to Shopify, HubSpot, Jira, and more.</li>
        <li><strong>Open standards:</strong> No lock-in—export your data anytime.</li>
        <li><strong>Security:</strong> Row-level security and domain controls.</li>
        <li><strong>Fast, visual setup:</strong> No CLI, no Docker, just your browser.</li>
      </ul>

      {/* Prerequisites */}
      <h2 id="prerequisites" className="font-bold text-2xl mt-10 mb-4">What You Need</h2>
      <ul className="list-disc pl-6">
        <li><strong>SiteAgent account:</strong> <Link href="/signup" className="text-blue-400 underline hover:text-blue-300">Sign up free</Link></li>
        <li><strong>Your content:</strong> PDF, DOCX, CSV, or a website URL</li>
        <li><strong>5 minutes:</strong> That's all it takes</li>
      </ul>

      {/* Step 1 */}
      <h2 id="step-1" className="font-bold text-2xl mt-10 mb-4">Step 1: Create Your Chatbot</h2>
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
      <p>
        <strong>What happens?</strong> SiteAgent instantly creates a private vector database and configures RAG for your bot. No waiting, no setup.
      </p>

      {/* Step 2 */}
      <h2 id="step-2" className="font-bold text-2xl mt-10 mb-4">Step 2: Add Documents</h2>
      <p>
        Click the <strong>Documents</strong> tab. Drag-and-drop your files or paste a website URL. SiteAgent extracts, cleans, chunks, and embeds your content automatically.
      </p>
      <figure className="not-prose">
        <LazyVideo
          src="/blog/Adding%20documents.mov"
          poster="/blog/adding-documents-poster.jpg"
          className="mx-auto my-8 rounded-lg shadow-lg w-full max-w-3xl"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-400">Uploading PDFs and knowledge-base docs.</figcaption>
      </figure>

      {/* Step 3 */}
      <h2 id="step-3" className="font-bold text-2xl mt-10 mb-4">Step 3: Set the System Prompt</h2>
      <p>
        The <strong>System Prompt</strong> controls your bot's tone, style, and guardrails. Use clear instructions and bullet points. Add brand facts to prevent hallucinations.
      </p>
      <Image
        src="/blog/System%20promt%20pic.png"
        alt="System prompt settings in SiteAgent"
        width={960}
        height={540}
        className="mx-auto my-8 rounded-lg shadow-lg"
      />
      <p>
        <strong>Tip:</strong> Start with a short intro, add rules, and finish with "If unsure, ask follow-up questions."
      </p>

      <p className="mt-2 text-sm text-gray-400">
        Want to master prompt design? See our <Link href="/blog/meta-prompting-engineering-ai-mind" className="text-blue-400 underline hover:text-blue-300">Meta Prompting guide</Link> or <a href="https://platform.openai.com/docs/guides/prompt-engineering" target="_blank" rel="noopener nofollow" className="text-blue-400 underline hover:text-blue-300">OpenAI's Prompt Engineering Guide</a>.
      </p>

      {/* Step 4 */}
      <h2 id="step-4" className="font-bold text-2xl mt-10 mb-4">Step 4: Embed on Your Site</h2>
      <p>
        Copy the embed code from the dashboard and paste it before <code>&lt;/body&gt;</code> in your <code>app/layout.tsx</code> file.
      </p>
      <figure className="not-prose">
        <LazyVideo
          src="/blog/Copy%20Snippet.mov"
          poster="/blog/copy-snippet-poster.jpg"
          className="mx-auto my-6 rounded-lg shadow-lg w-full max-w-2xl"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-400">Copying the embed snippet from the dashboard.</figcaption>
      </figure>
      <figure className="not-prose">
        <LazyVideo
          src="/blog/Paste%20snippet.mov"
          poster="/blog/paste-snippet-poster.jpg"
          className="mx-auto my-6 rounded-lg shadow-lg w-full max-w-2xl"
        />
        <figcaption className="mt-2 text-center text-sm text-gray-400">Pasting the snippet into app/layout.tsx in VS Code.</figcaption>
      </figure>
      <pre className="not-prose overflow-x-auto rounded-md bg-gray-900 text-gray-100 p-4 text-sm">
{`<script
  src="https://siteagent.eu/chatbot-widget.js"
  data-chatbot-id="YOUR_CHATBOT_ID"
  defer
></script>`}
      </pre>
      <p>
        <strong>Features:</strong> Responsive, dark-mode ready, and only loads on your approved domains.
      </p>

      {/* Step 5 */}
      <h2 id="step-5" className="font-bold text-2xl mt-10 mb-4">Step 5: Measure & Improve</h2>
      <p>
        Open <strong>Analytics</strong> in the dashboard to see:
      </p>
      <ul className="list-disc pl-6">
        <li><strong>Response time:</strong> See how fast your bot helps users.</li>
        <li><strong>Message volume:</strong> Track engagement and popular topics.</li>
        <li><strong>Feedback:</strong> Use thumbs-up/down to refine your prompt and docs.</li>
      </ul>
      <p>
        <strong>Update anytime:</strong> Upload new docs and click <strong>Re-index</strong> for instant learning.
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
        <summary className="cursor-pointer text-lg font-semibold">Can I connect Shopify, HubSpot, or custom APIs?</summary>
        <div className="mt-2 pl-4 border-l border-gray-700">
          Yes! Go to <strong>Chatbot → Actions</strong>, click <strong>New</strong>, and pick your integration. The bot can trigger real-world actions via API.<br />
          For more, see the <a href="https://shopify.dev/docs/api" target="_blank" rel="noopener nofollow" className="text-blue-400 underline hover:text-blue-300">Shopify API docs</a> and <a href="https://developers.hubspot.com/docs/api/overview" target="_blank" rel="noopener nofollow" className="text-blue-400 underline hover:text-blue-300">HubSpot API docs</a>.
        </div>
      </details>

      {/* Conclusion */}
      <p className="mt-10 text-center text-lg">
        <strong>Ready to launch?</strong> <Link href="/signup" className="text-blue-400 underline hover:text-blue-300">Create your free chatbot now</Link> • <Link href="/#features" className="text-blue-400 underline hover:text-blue-300">See all features</Link>
      </p>

      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: 'Create a Chatbot With SiteAgent in 5 Minutes',
            image: ['https://siteagent.eu/blog/siteagent-chatbot-guide/chatbot-creation-poster.jpg'],
            datePublished: '2025-06-18T00:00:00.000Z',
            dateModified: '2025-06-18T00:00:00.000Z',
            author: {
              '@type': 'Organization',
              name: 'SiteAgent Team',
              url: 'https://siteagent.eu'
            },
            publisher: {
              '@type': 'Organization',
              name: 'SiteAgent',
              logo: {
                '@type': 'ImageObject',
                url: 'https://siteagent.eu/sitelogo.svg'
              }
            },
            description: 'Step-by-step guide to build an AI chatbot with SiteAgent: create, upload documents, craft a system prompt, embed on your site, and analyse performance.'
          })
        }}
      />
    </BlogPostLayout>
  );
} 