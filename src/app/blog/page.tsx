import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from '@/app/_components/auth-button';
import { Facebook, Twitter, Linkedin, Github, ArrowRight } from 'lucide-react';

// Consistent Navbar (Copied from AboutPage - consider refactoring to a shared component)
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

// Consistent Footer (Copied from AboutPage - consider refactoring to a shared component)
function PageFooter() {
  const footerSections = [
    { title: "Product", links: [{ label: "Features", href: "/#features" }, { label: "Pricing", href: "/#pricing" }, { label: "Documentation", href: "/docs" }, { label: "Changelog", href: "/changelog" }] },
    { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Careers", href: "/careers" }, { label: "Contact", href: "/contact" }] },
    { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }, { label: "Security", href: "/security" }] },
  ];
  const socialLinks = [
    { icon: Facebook, label: "Facebook", href: "#" }, 
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
    { icon: Github, label: "GitHub", href: "#" },
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
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 transition-all duration-300 hover:text-white hover:scale-110">
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
                    <Link href={link.href} className="text-gray-400 transition-all duration-300 hover:text-white hover:translate-x-1 inline-block">
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

// Generic Page Layout Component (Copied from AboutPage - consider refactoring to a shared component)
function StaticPageLayout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      <PageNavbar />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="bg-gray-900 shadow-xl rounded-lg p-8 md:p-12">
          <article className="prose prose-invert lg:prose-xl max-w-none">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent sm:text-4xl md:text-5xl mb-10 pb-2">
              {title}
            </h1>
            {children}
          </article>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}

// Blog post metadata type
interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  href: string;
}

// Static blog posts data (easier and more reliable than filesystem scanning)
function getBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [
    {
      slug: 'ai-chatbots-reduce-cart-abandonment',
      title: 'AI Chatbots for E-commerce: 10 Ways to Reduce Cart Abandonment',
      description: 'Discover how AI chatbots can cut cart abandonment from 69.99% to under 30% with proven strategies, real-world examples, and actionable implementation tips.',
      date: 'June 25, 2025',
      category: 'E-commerce',
      href: '/blog/ai-chatbots-reduce-cart-abandonment'
    },
    {
      slug: 'ai-chatbot-vs-live-chat-comparison',
      title: 'AI Chatbot vs Live Chat: Complete Data-Driven Comparison',
      description: 'Comprehensive comparison of AI chatbots vs live chat support. Real cost analysis, performance data, and ROI calculations to make the right choice for your business.',
      date: 'June 25, 2025',
      category: 'Business Strategy',
      href: '/blog/ai-chatbot-vs-live-chat-comparison'
    },
    {
      slug: 'chatbot-security-best-practices',
      title: 'Chatbot Security Best Practices: Complete Implementation Guide',
      description: 'Essential security framework for AI chatbots. Learn data protection, compliance (GDPR, CCPA, HIPAA), encryption, and threat prevention with real-world examples.',
      date: 'June 25, 2025',
      category: 'Security',
      href: '/blog/chatbot-security-best-practices'
    },
         {
       slug: 'meta-prompting-engineering-ai-mind',
       title: 'Meta Prompting: Engineering the Mind of Your AI',
       description: 'Master meta prompting techniques to transform LLMs from talented interns into dependable colleagues. Deep dive into cognitive architecture, design patterns, and real-world applications.',
       date: 'June 8, 2025',
       category: 'Advanced Guide',
       href: '/blog/meta-prompting-engineering-ai-mind'
     },
    {
      slug: 'rag-explained-simple-terms',
      title: 'RAG Explained in Simple Terms: Custom Chatbot Implementation Guide',
      description: 'Discover how Retrieval-Augmented Generation (RAG) revolutionizes chatbots and how SiteAgent simplifies implementation.',
      date: 'June 4, 2025',
      category: 'Technical',
      href: '/blog/rag-explained-simple-terms'
    },
    {
      slug: 'create-chatbot-with-siteagent',
      title: 'Create a Chatbot With SiteAgent in 5 Minutes',
      description: 'Follow this quick tutorial to build, train and embed a custom AI chatbot on your website using SiteAgent.',
      date: 'June 18, 2025',
      category: 'Tutorial',
      href: '/blog/create-chatbot-with-siteagent'
    },
    {
      slug: 'add-chatbot-to-shopify-store',
      title: 'How to Add a Custom AI Chatbot to Your Shopify Store',
      description: 'Step-by-step guide to integrate a SiteAgent chatbot with Shopify in minutes.',
      date: 'June 19, 2025',
      category: 'E-commerce',
      href: '/blog/add-chatbot-to-shopify-store'
    }
  ];

  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function BlogPage() {
  const blogPosts = getBlogPosts();

  return (
    <StaticPageLayout title="SiteAgent Blog">
      <p className="lead text-lg text-gray-300">
        Welcome to the SiteAgent blog! Here, we'll share insights, tutorials, and news about the exciting world of AI-powered chatbots, conversational AI, and how SiteAgent is helping businesses like yours transform customer interactions and streamline operations.
      </p>
      
      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl border-l-4 border-blue-500 pl-4">What We're About</h2>
      <p className="text-gray-400">
        SiteAgent is dedicated to making advanced AI chatbot technology accessible and easy to use. Our platform enables you to:
      </p>
      <ul className="mt-4 space-y-2 pl-5 text-gray-400">
        <li>Build custom AI chatbots tailored to your specific needs.</li>
        <li>Deploy them across multiple channels, including your website and messaging apps.</li>
        <li>Manage and optimize their performance with powerful analytics.</li>
        <li>Integrate seamlessly with your existing tools and data sources.</li>
      </ul>
      <p className="mt-6 text-gray-400">
        Whether you're looking to enhance customer support, generate leads, automate repetitive tasks, or provide instant information, SiteAgent provides the tools to create intelligent conversational experiences that deliver real value.
      </p>

      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl border-l-4 border-blue-500 pl-4">Stay Tuned</h2>
      <p className="text-gray-400">
        We're just getting started! Our blog will feature a variety of content, including:
      </p>
      <ul className="mt-4 space-y-2 pl-5 text-gray-400">
        <li><strong>Product Updates:</strong> Learn about the latest features and improvements to the SiteAgent platform.</li>
        <li><strong>Best Practices:</strong> Tips and tricks for designing effective and engaging chatbots.</li>
        <li><strong>Industry News:</strong> Stay informed about the latest trends in AI and conversational technology.</li>
        <li><strong>Case Studies:</strong> Discover how businesses are using SiteAgent to achieve their goals.</li>
        <li><strong>Tutorials:</strong> Step-by-step guides to help you get the most out of SiteAgent.</li>
      </ul>
      <p className="mt-6 text-gray-400">
        Check back soon for our first posts. We're excited to share our journey and help you navigate the future of AI-driven communication!
      </p>

      {/* Latest Posts */}
      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl border-l-4 border-green-500 pl-4">
        {blogPosts.length === 1 ? 'Latest Post' : 'Latest Posts'}
      </h2>
      {blogPosts.length > 0 ? (
        <div className="space-y-6">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={post.href} className="group block rounded-lg border border-gray-800 bg-gray-900 p-6 transition-colors hover:border-blue-600">
              <h3 className="text-xl font-semibold text-white group-hover:text-blue-400">{post.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{post.date} · {post.category}</p>
              <p className="mt-4 text-gray-400">{post.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No blog posts found. Check back soon for our latest content!</p>
      )}

      <div className="mt-16 text-center">
        <Link href="/contact">
          <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-blue-600 px-6 font-medium text-white transition-all duration-300 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            <span className="relative z-10">Questions? Contact Us</span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </Link>
      </div>
    </StaticPageLayout>
  );
} 