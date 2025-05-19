import Link from 'next/link';
import Image from 'next/image';
import { AuthButton } from '@/app/_components/auth-button';
import { Facebook, Twitter, Linkedin, Github, ArrowRight } from 'lucide-react';

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
          <article className="prose prose-invert lg:prose-xl max-w-none prose-headings:border-l-4 prose-headings:border-blue-500 prose-headings:pl-4 prose-headings:text-white prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-strong:text-gray-200">
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

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 26, 2023"; // Update this date whenever the policy changes

  return (
    <StaticPageLayout title="Privacy Policy">
      <div className="mb-8 p-4 border border-yellow-500/50 rounded-md bg-yellow-500/10 text-yellow-300 text-sm">
        <p className="font-semibold">Important Disclaimer:</p>
        <p>This Privacy Policy is a template and does not constitute legal advice. You should consult with a qualified legal professional to ensure this policy accurately reflects your data processing practices and complies with all applicable laws and regulations in your jurisdiction.</p>
      </div>

      <p className="lead text-lg text-gray-300">
        Welcome to SiteAgent! We are committed to protecting your privacy and handling your personal information with transparency and care. This Privacy Policy explains how SiteAgent ("SiteAgent," "we," "us," or "our") collects, uses, discloses, and protects your information when you use our website, platform, and services (collectively, the "Services").
      </p>
      <p className="text-sm text-gray-500 italic">Last Updated: {lastUpdated}</p>

      <h2>1. Information We Collect</h2>
      <p>We collect information to provide and improve our Services. The types of information we collect include:</p>
      
      <h3>a. Information You Provide to Us:</h3>
      <ul>
        <li><strong>Account Information:</strong> When you create a SiteAgent account, we collect information such as your name, email address, password, and company name (if applicable).</li>
        <li><strong>Payment Information:</strong> If you subscribe to our paid Services, we (or our third-party payment processors like Stripe or Paddle) will collect payment and billing information. SiteAgent does not directly store your full credit card details.</li>
        <li><strong>Chatbot Configuration Data:</strong> Information you provide to build and configure your chatbots, such as knowledge base documents (text, PDFs, URLs), integration credentials (e.g., API keys for third-party services), and conversation flow designs.</li>
        <li><strong>Communications:</strong> If you contact us directly (e.g., for support or inquiries), we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</li>
      </ul>

      <h3>b. Information We Collect Automatically:</h3>
      <ul>
        <li><strong>Usage Information:</strong> We collect information about your interactions with our Services, such as the pages you visit, the features you use, the chatbots you create and manage, IP address, browser type, operating system, referring URLs, and dates and times of access.</li>
        <li><strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to track activity on our Services and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</li>
        <li><strong>Chatbot Interaction Data:</strong> When end-users interact with chatbots powered by SiteAgent, we may collect and store conversation logs, including user queries and chatbot responses. This data is used to operate the chatbot, provide analytics to you (our customer), and improve our Services. You are responsible for informing your end-users about this data collection as per your own privacy policies.</li>
      </ul>

      <h3>c. Information from Third-Party Services:</h3>
      <p>If you choose to connect third-party services (e.g., CRM, helpdesk, databases) to your SiteAgent chatbots, we may receive information from these services as configured by you. We only collect information necessary to facilitate these integrations as directed by you.</p>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect for various purposes, including to:</p>
      <ul>
        <li>Provide, operate, and maintain our Services;</li>
        <li>Improve, personalize, and expand our Services;</li>
        <li>Understand and analyze how you use our Services;</li>
        <li>Develop new products, services, features, and functionality;</li>
        <li>Process your transactions and manage your subscriptions;</li>
        <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service, and for marketing and promotional purposes (in accordance with your preferences);</li>
        <li>Send you emails and other communications;</li>
        <li>Detect and prevent fraud, and ensure the security of our Services;</li>
        <li>For compliance purposes, including enforcing our Terms of Service, or other legal rights, or as may be required by applicable laws and regulations or requested by any judicial process or governmental agency.</li>
      </ul>

      <h2>3. How We Share Your Information</h2>
      <p>We may share your information in the following situations:</p>
      <ul>
        <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work. Examples include: payment processing (e.g., Stripe), data storage and hosting (e.g., Supabase, Vercel), analytics, and customer support tools. These service providers are contractually obligated to protect your information and use it only for the purposes for which it was disclosed.</li>
        <li><strong>For Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
        <li><strong>With Your Consent or at Your Direction:</strong> We may share your information with third parties when you have given us consent to do so, or when you configure your chatbots to integrate with third-party services.</li>
        <li><strong>For Legal Reasons:</strong> We may disclose your information if we are required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency). This includes to meet national security or law enforcement requirements.</li>
        <li><strong>To Protect Rights and Property:</strong> We may disclose your information when we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, situations involving potential threats to the safety of any person and illegal activities, or as evidence in litigation in which we are involved.</li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2>4. Data Storage, Security, and Retention</h2>
      <p>We implement a variety of security measures designed to maintain the safety of your personal information when you enter, submit, or access your personal information. We use services like Supabase which provide robust security features for data at rest and in transit. However, no electronic transmission or storage of information can be entirely secure, so we cannot guarantee the absolute security of your information.</p>
      <p>We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.</p>
      <p>Data you provide for chatbot training and conversation logs related to your chatbots are retained as per your subscription terms and can be managed or deleted by you through the Service, subject to system backups and archival processes.</p>

      <h2>5. Your Data Protection Rights</h2>
      <p>Depending on your location and applicable law, you may have certain rights regarding your personal information, such as:</p>
      <ul>
        <li>The right to access – You have the right to request copies of your personal data.</li>
        <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
        <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
        <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
        <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
        <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
      </ul>
      <p>If you wish to exercise any of these rights, please contact us using the contact information provided below. We will respond to your request in accordance with applicable data protection laws.</p>

      <h2>6. Third-Party Websites and Services</h2>
      <p>Our Service may contain links to other websites or services that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
      <p>This also applies to third-party services you choose to integrate with your SiteAgent chatbots. Your use of such third-party services is subject to their respective privacy policies and terms.</p>

      <h2>7. Children's Privacy</h2>
      <p>Our Services are not intended for use by children under the age of 16 (or a higher age threshold if required by applicable law in your jurisdiction). We do not knowingly collect personally identifiable information from children under 16. If you become aware that a child has provided us with Personal Information, please contact us. If we become aware that we have collected Personal Information from children without verification of parental consent, we take steps to remove that information from our servers.</p>

      <h2>8. International Data Transfers</h2>
      <p>Your information, including personal data, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those from your jurisdiction. If you are located outside the European Union and choose to provide information to us, please note that we transfer the data, including Personal Data, to data centers which may be in various locations (e.g., United States, Europe) and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.</p>

      <h2>9. Changes to This Privacy Policy</h2>
      <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

      <h2>10. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us:</p>
      <ul>
        <li>By email: <a href="mailto:privacy@siteagent.eu" className="hover:text-blue-300">privacy@siteagent.eu</a> (or use your general contact email if preferred)</li>
        <li>Via our contact page: <Link href="/contact" className="hover:text-blue-300">siteagent.eu/contact</Link></li>
      </ul>
    </StaticPageLayout>
  );
} 