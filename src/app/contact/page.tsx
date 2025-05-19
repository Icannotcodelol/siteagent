import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from '@/app/_components/auth-button';
import { Facebook, Twitter, Linkedin, Github, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

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

export default function ContactPage() {
  return (
    <StaticPageLayout title="Get in Touch">
      <p className="lead text-lg text-gray-300">
        We're here to help and answer any question you might have. We look forward to hearing from you!
      </p>
      
      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl border-l-4 border-blue-500 pl-4">Contact Information</h2>
          <ul className="space-y-4 text-gray-400">
            <li className="flex items-start">
              <Mail className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
              <span>
                <strong className="font-medium text-gray-200">General Inquiries:</strong>
                <br />
                <a href="mailto:hello@siteagent.eu" className="hover:text-blue-400 transition-colors">hello@siteagent.eu</a>
              </span>
            </li>
            <li className="flex items-start">
              <Mail className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
              <span>
                <strong className="font-medium text-gray-200">Support:</strong>
                <br />
                <a href="mailto:support@siteagent.eu" className="hover:text-blue-400 transition-colors">support@siteagent.eu</a>
              </span>
            </li>
            <li className="flex items-start">
              <Phone className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
              <span>
                <strong className="font-medium text-gray-200">Phone:</strong> (Coming Soon)
              </span>
            </li>
            <li className="flex items-start">
              <MapPin className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
              <span>
                <strong className="font-medium text-gray-200">Office:</strong>
                <br />
                SiteAgent HQ, Digital Park,
                <br />
                Europe (More details soon)
              </span>
            </li>
          </ul>
        </div>
        
        <div>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl border-l-4 border-blue-500 pl-4">Send us a Message</h2>
          <p className="text-gray-400 mb-6">
            Alternatively, you can fill out the form below and we'll get back to you as soon as possible. (Contact form functionality coming soon).
          </p>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
              <input type="text" name="name" id="name" autoComplete="name" disabled className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder-gray-500 opacity-50 cursor-not-allowed" placeholder="Your Name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
              <input type="email" name="email" id="email" autoComplete="email" disabled className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder-gray-500 opacity-50 cursor-not-allowed" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
              <textarea id="message" name="message" rows={4} disabled className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm placeholder-gray-500 opacity-50 cursor-not-allowed" placeholder="Your message..."></textarea>
            </div>
            <div>
              <button type="submit" disabled className="group relative inline-flex w-full h-12 items-center justify-center overflow-hidden rounded-md bg-blue-600 px-6 font-medium text-white transition-all duration-300 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 opacity-50 cursor-not-allowed">
                <span className="relative z-10">Send Message (Coming Soon)</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link href="/docs">
          <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-blue-500 px-6 font-medium text-blue-400 transition-all duration-300 hover:bg-blue-500/10 hover:text-blue-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            <span className="relative z-10">Explore Documentation</span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </Link>
      </div>
    </StaticPageLayout>
  );
} 