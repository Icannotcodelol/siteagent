import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from '@/app/_components/auth-button';
import { Facebook, Twitter, Linkedin, Github, ArrowRight, Check } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About SiteAgent",
  description: "Learn more about SiteAgent, our mission, and the team building the future of AI chatbots.",
  openGraph: {
    title: "About SiteAgent",
    description: "Learn more about SiteAgent, our mission, and the team building the future of AI chatbots.",
    // You can optionally override the site-wide OG image here if you have a specific one for this page
  },
  // You can also add page-specific twitter card info or other metadata here
};

// Consistent Navbar
function PageNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-gray-900/95 supports-[backdrop-filter]:bg-gray-900/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <Image src="/sitelogo.svg" alt="SiteAgent Logo" width={40} height={40} priority />
          {/* <span className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-blue-400">SiteAgent</span> */}
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

// Consistent Footer
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

// Generic Page Layout Component
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

export default function AboutPage() {
  return (
    <StaticPageLayout title="About SiteAgent">
      <p className="lead text-lg text-gray-300">
        SiteAgent empowers businesses to build, deploy, and manage sophisticated AI-powered chatbots with ease. Our platform is designed to seamlessly integrate with your existing tools and data sources, enabling you to create intelligent conversational experiences that enhance customer engagement, automate support, and drive business growth.
      </p>
      
      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl border-l-4 border-blue-500 pl-4">Our Mission</h2>
      <p className="text-gray-400">
        Our mission is to democratize access to advanced AI chatbot technology, making it simple for organizations of all sizes to leverage the power of conversational AI. We believe that intelligent automation should be intuitive to implement and manage, allowing you to focus on what you do best while your SiteAgent chatbots handle inquiries, provide information, and engage users 24/7.
      </p>
      
      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl border-l-4 border-blue-500 pl-4">What We Do</h2>
      <p className="text-gray-400">
        SiteAgent provides a comprehensive suite of tools for the entire chatbot lifecycle:
      </p>
      <ul className="mt-4 space-y-3 pl-5 text-gray-400">
        {[
          { title: "Intuitive Chatbot Builder", description: "Design complex conversation flows with a user-friendly visual interface—no coding required for basic setups, with advanced customization options for developers." },
          { title: "Seamless Integrations", description: "Connect your chatbots to CRM systems, knowledge bases, databases, APIs, and various third-party applications to fetch and update information in real-time." },
          { title: "Data-Powered Conversations", description: "Train your chatbots on your own documents, website content, and product information to provide accurate and contextually relevant responses." },
          { title: "Multi-Channel Deployment", description: "Embed your chatbots on your website, mobile apps, and popular messaging platforms." },
          { title: "Actionable Analytics", description: "Monitor chatbot performance, user interactions, and conversation trends to continuously optimize and improve your AI agents." },
          { title: "Scalability and Reliability", description: "Built on robust infrastructure, SiteAgent ensures your chatbots are always available and can handle fluctuating loads." }
        ].map(item => (
          <li key={item.title} className="flex items-start">
            <Check className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
            <span><strong className="font-medium text-gray-200">{item.title}:</strong> {item.description}</span>
          </li>
        ))}
      </ul>
      
      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl border-l-4 border-blue-500 pl-4">Our Vision</h2>
      <p className="text-gray-400">
        We envision a future where AI seamlessly assists human interaction, making information more accessible and services more efficient. SiteAgent aims to be at the forefront of this transformation, providing businesses with the tools to create truly intelligent and helpful digital assistants.
      </p>

      <div className="mt-16 text-center">
        <Link href="/signup">
          <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-blue-600 px-6 font-medium text-white transition-all duration-300 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            <span className="relative z-10">Try SiteAgent Free</span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </Link>
      </div>
    </StaticPageLayout>
  );
}

// Helper icon component (if not already globally available)
// For this example, assuming lucide-react handles Check correctly.
// const Check = ({ className }: { className?: string }) => (
//   <svg className={cn("h-5 w-5 text-blue-500", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//   </svg>
// ); 