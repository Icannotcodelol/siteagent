import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from '@/app/_components/auth-button';
import { Facebook, Twitter, Linkedin, Github, ArrowRight, ShieldCheck, Database, Lock, Users, MessageSquare } from 'lucide-react';

// Consistent Navbar (Consider refactoring to a shared component)
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

// Consistent Footer (Consider refactoring to a shared component)
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

// Generic Page Layout Component (Consider refactoring to a shared component)
function StaticPageLayout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-gray-100">
      <PageNavbar />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="bg-gray-900 shadow-xl rounded-lg p-8 md:p-12">
          <article className="prose prose-invert lg:prose-xl max-w-none prose-headings:border-l-4 prose-headings:border-blue-500 prose-headings:pl-4 prose-headings:text-white prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-strong:text-gray-200 prose-ul:list-none prose-ul:pl-0">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent sm:text-4xl md:text-5xl mb-10 pb-2 !border-none !pl-0">
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

interface SecurityFeatureProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function SecurityFeature({ icon: Icon, title, description }: SecurityFeatureProps) {
  return (
    <li className="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-lg transition-all hover:bg-gray-800/80">
      <div className="flex-shrink-0">
        <Icon className="h-8 w-8 text-blue-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        <p className="mt-1 text-gray-400">{description}</p>
      </div>
    </li>
  );
}

export default function SecurityPage() {
  return (
    <StaticPageLayout title="Our Commitment to Security">
      <div className="mb-8 p-4 border border-yellow-500/50 rounded-md bg-yellow-500/10 text-yellow-300 text-sm">
        <p className="font-semibold">Important Note:</p>
        <p>This page outlines our general approach to security. For specific details on data handling, please refer to our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Service</Link>. If you are a security researcher and believe you have found a vulnerability, please contact us immediately at <a href="mailto:security@siteagent.eu" className="font-semibold hover:text-blue-300">security@siteagent.eu</a>.</p>
      </div>

      <p className="lead text-lg text-gray-300">
        At SiteAgent, we take the security of your data and our platform extremely seriously. We understand that you entrust us with valuable information when you use our Services to build and manage AI chatbots, and we are committed to implementing robust security measures to protect that trust.
      </p>

      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">Key Security Practices</h2>
      <ul className="space-y-6">
        <SecurityFeature 
          icon={Lock}
          title="Data Encryption"
          description="All data transmitted between you and SiteAgent, and between our servers and integrated services, is encrypted using industry-standard Transport Layer Security (TLS). Data at rest, including your chatbot configurations and training data stored within our Supabase infrastructure, is also encrypted to protect its confidentiality."
        />
        <SecurityFeature 
          icon={Database}
          title="Infrastructure Security"
          description="Our platform is built on Vercel and Supabase, reputable cloud infrastructure providers that maintain high standards of physical and network security. This includes measures against unauthorized access, DDoS protection, and regular infrastructure audits."
        />
        <SecurityFeature 
          icon={ShieldCheck}
          title="Application Security"
          description="We follow secure coding practices and conduct regular code reviews. Our development lifecycle includes considerations for security at each stage. We also aim to perform regular vulnerability assessments and penetration testing to identify and remediate potential security weaknesses in our application."
        />
        <SecurityFeature 
          icon={Users}
          title="Access Controls"
          description="Access to your account and data within SiteAgent is protected by authentication mechanisms. We implement role-based access controls internally to ensure that only authorized personnel have access to sensitive systems and data, based on the principle of least privilege."
        />
        <SecurityFeature 
          icon={MessageSquare}
          title="Chatbot Data & Integrations"
          description="You control the data used to train your chatbots and the integrations you configure. We provide tools for managing this data, and we encourage you to follow best practices for securing API keys and sensitive information used in your integrations. SiteAgent does not access your integrated third-party accounts beyond what is necessary to provide the configured service."
        />
      </ul>

      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">Your Role in Security</h2>
      <p className="text-gray-400">
        While we implement comprehensive security measures, maintaining the security of your SiteAgent account and the data you manage also depends on your actions. We encourage you to:
      </p>
      <ul className="mt-4 list-disc list-inside space-y-2 text-gray-400">
        <li>Use strong, unique passwords for your SiteAgent account and change them regularly.</li>
        <li>Be cautious about phishing attempts and ensure you are on the official SiteAgent domain before entering credentials.</li>
        <li>Securely manage any API keys or credentials used for integrating third-party services with your chatbots.</li>
        <li>Regularly review the access permissions and data shared with your chatbots.</li>
        <li>Inform your end-users about how their data is processed by your chatbots, in line with your own privacy commitments.</li>
      </ul>

      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">Incident Response</h2>
      <p className="text-gray-400">
        In the event of a security incident affecting your data, SiteAgent is committed to responding promptly and transparently. Our incident response plan includes steps for containment, eradication, recovery, and post-incident analysis. We will notify affected users in accordance with applicable laws and our contractual obligations.
      </p>

      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">Reporting Vulnerabilities</h2>
      <p className="text-gray-400">
        We value the work of security researchers and the broader security community. If you believe you have discovered a security vulnerability in our Services, please report it to us immediately at <a href="mailto:security@siteagent.eu" className="hover:text-blue-300">security@siteagent.eu</a>. We are committed to investigating all legitimate reports and taking appropriate action to address them.
      </p>

      <h2 className="mt-12 mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">Continuous Improvement</h2>
      <p className="text-gray-400">
        Security is an ever-evolving landscape. SiteAgent is dedicated to continuously reviewing and enhancing our security practices, technologies, and policies to adapt to new threats and ensure the ongoing protection of your data.
      </p>

      <div className="mt-16 text-center">
        <p className="text-gray-300">For further details on how we handle your data, please review our <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>.</p>
        <p className="mt-2 text-gray-300">If you have specific questions about our security practices, feel free to <Link href="/contact" className="text-blue-400 hover:text-blue-300">contact us</Link>.</p>
      </div>
    </StaticPageLayout>
  );
} 