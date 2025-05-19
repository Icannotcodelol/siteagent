import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from '@/app/_components/auth-button';
import { Facebook, Twitter, Linkedin, Github, Mail, ArrowRight } from 'lucide-react';

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

export default function CareersPage() {
  return (
    <StaticPageLayout title="Careers at SiteAgent">
      <p className="lead text-lg text-gray-300">
        Thank you for your interest in joining the SiteAgent team! We are passionate about building the future of AI-powered customer interaction and are always on the lookout for talented individuals who share our vision.
      </p>
      
      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl border-l-4 border-blue-500 pl-4">Current Opportunities</h2>
      <p className="text-gray-400">
        While we are not actively hiring for specific roles at this moment, we believe that great talent can emerge at any time. If you are enthusiastic about what we do at SiteAgent and believe your skills and experience can make a significant contribution to our team, we would love to hear from you.
      </p>
      
      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl border-l-4 border-blue-500 pl-4">Share Your Potential</h2>
      <p className="text-gray-400">
        If you have innovative ideas, a strong work ethic, and a desire to be part of a dynamic team working on cutting-edge AI technology, please don't hesitate to reach out.
      </p>
      <p className="mt-4 text-gray-400">
        Send us an email introducing yourself, outlining your areas of expertise, and explaining how you envision contributing to SiteAgent's success. Please include your resume or a link to your portfolio/LinkedIn profile.
      </p>
      
      <div className="mt-10 flex items-center justify-center">
        <a 
          href="mailto:henkes2max@gmail.com"
          className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-blue-600 px-6 font-medium text-white transition-all duration-300 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <Mail className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="relative z-10">Contact Max Henkes</span>
        </a>
      </div>

      <p className="mt-12 text-sm text-gray-500 text-center">
        We appreciate your interest and will keep your information on file for future openings that match your profile. 
      </p>
    </StaticPageLayout>
  );
} 