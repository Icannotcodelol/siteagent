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

export default function TermsOfServicePage() {
  const effectiveDate = "October 26, 2023"; // Update this date whenever the terms change

  return (
    <StaticPageLayout title="Terms of Service">
      <div className="mb-8 p-4 border border-yellow-500/50 rounded-md bg-yellow-500/10 text-yellow-300 text-sm">
        <p className="font-semibold">Important Disclaimer:</p>
        <p>These Terms of Service are a template and do not constitute legal advice. You should consult with a qualified legal professional to ensure these terms are appropriate for your business and comply with all applicable laws and regulations.</p>
      </div>

      <p className="lead text-lg text-gray-300">
        Welcome to SiteAgent! These Terms of Service ("Terms") govern your access to and use of the SiteAgent website, platform, and services (collectively, the "Services") provided by SiteAgent ("SiteAgent," "we," "us," or "our"). Please read these Terms carefully before using our Services.
      </p>
      <p className="text-sm text-gray-500 italic">Effective Date: {effectiveDate}</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using our Services, you agree to be bound by these Terms and our <Link href="/privacy">Privacy Policy</Link>. If you do not agree to these Terms, you may not access or use our Services. If you are using the Services on behalf of an organization or entity ("Organization"), then you are agreeing to these Terms on behalf of that Organization, and you represent and warrant that you have the authority to bind the Organization to these Terms.</p>

      <h2>2. Description of Service</h2>
      <p>SiteAgent provides a platform for users to build, deploy, manage, and integrate AI-powered chatbots. The Services include chatbot creation tools, data management features, integration capabilities with third-party services, analytics, and hosting for the chatbots created on our platform.</p>

      <h2>3. User Accounts</h2>
      <ul>
        <li><strong>Registration:</strong> To access certain features of the Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</li>
        <li><strong>Account Security:</strong> You are responsible for safeguarding your account password and for any activities or actions under your account. You agree to notify us immediately of any unauthorized use of your account. SiteAgent cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.</li>
        <li><strong>Eligibility:</strong> You must be at least 16 years old (or the age of legal majority in your jurisdiction) to use the Services. By agreeing to these Terms, you represent and warrant to us that you meet this age requirement.</li>
      </ul>

      <h2>4. User Conduct and Responsibilities</h2>
      <ul>
        <li><strong>Lawful Use:</strong> You agree to use the Services only for lawful purposes and in accordance with these Terms and all applicable laws and regulations.</li>
        <li><strong>Prohibited Activities:</strong> You agree not to engage in any of the following prohibited activities:
          <ul>
            <li>Using the Services for any illegal purpose or in violation of any local, state, national, or international law;</li>
            <li>Creating or deploying chatbots that engage in, promote, or facilitate illegal activities, hate speech, harassment, or discrimination;</li>
            <li>Uploading or transmitting viruses, worms, or any other malicious code;</li>
            <li>Attempting to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Services, the server on which the Services are stored, or any server, computer, or database connected to the Services;</li>
            <li>Reverse engineering, decompiling, disassembling, or otherwise attempting to discover the source code or underlying ideas or algorithms of the Services;</li>
            <li>Using the Services to send unsolicited communications, spam, or to harvest user data without consent;</li>
            <li>Infringing upon or violating our intellectual property rights or the intellectual property rights of others.</li>
          </ul>
        </li>
        <li><strong>Responsibility for Chatbot Content and Interactions:</strong> You are solely responsible for all data, information, and content you provide or use in connection with the Services, including the content of your chatbots, the data used to train them, and the interactions your chatbots have with end-users. You must ensure you have all necessary rights and permissions for any data you use and that your chatbots comply with all applicable laws, including data privacy and consumer protection laws.</li>
      </ul>

      <h2>5. Intellectual Property Rights</h2>
      <ul>
        <li><strong>Our Intellectual Property:</strong> The Services and their entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by SiteAgent, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. These Terms grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Services for your internal business purposes, subject to these Terms.</li>
        <li><strong>Your Content:</strong> You retain all ownership rights to the content and data you create, upload, or manage through the Services ("User Content"), including the specific configurations and training data for your chatbots. You grant SiteAgent a worldwide, non-exclusive, royalty-free, sublicensable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, perform, and display such User Content solely to the extent necessary to provide, maintain, and improve the Services for you.</li>
        <li><strong>Feedback:</strong> If you provide us with any feedback, suggestions, or ideas regarding the Services ("Feedback"), you hereby grant SiteAgent an unrestricted, perpetual, irrevocable, non-exclusive, fully-paid, royalty-free right to exploit the Feedback in any manner and for any purpose, including to improve the Services and create other products and services.</li>
      </ul>
      
      <h2>6. Fees and Payment</h2>
      <p>Certain aspects of the Services may be provided for a fee or other charge. If you elect to use paid aspects of the Services, you agree to the pricing and payment terms as communicated to you at the time of purchase, which are hereby incorporated by reference into these Terms. We may add new services for additional fees and charges, or amend fees and charges for existing services, at any time in our sole discretion. Any change to our pricing or payment terms shall become effective in the billing cycle following notice of such change to you as provided in these Terms.</p>
      <p>All fees are exclusive of all taxes, levies, or duties imposed by taxing authorities, and you shall be responsible for payment of all such taxes, levies, or duties.</p>

      <h2>7. Term and Termination</h2>
      <ul>
        <li><strong>Term:</strong> These Terms will remain in full force and effect while you use the Services.</li>
        <li><strong>Termination by You:</strong> You may terminate your account and these Terms at any time by discontinuing use of the Services and providing notice to us.</li>
        <li><strong>Termination by SiteAgent:</strong> We may suspend or terminate your access to all or any part of the Services at any time, with or without cause, with or without notice, effective immediately. Reasons for termination may include, but are not limited to, a breach of these Terms.</li>
        <li><strong>Effect of Termination:</strong> Upon termination, your right to use the Services will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</li>
      </ul>

      <h2>8. Disclaimer of Warranties</h2>
      <p>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE. SITEAGENT DOES NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE; NOR DOES IT MAKE ANY WARRANTY AS TO THE RESULTS THAT MAY BE OBTAINED FROM USE OF THE SERVICES, OR AS TO THE ACCURACY, RELIABILITY, OR CURRENCY OF ANY INFORMATION OBTAINED THROUGH THE SERVICES. NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED BY YOU FROM SITEAGENT OR THROUGH THE SERVICES WILL CREATE ANY WARRANTY NOT EXPRESSLY STATED HEREIN.</p>

      <h2>9. Limitation of Liability</h2>
      <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SITEAGENT, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, THE SERVICES. UNDER NO CIRCUMSTANCES WILL SITEAGENT'S AGGREGATE LIABILITY, IN ANY FORM OF ACTION WHATSOEVER IN CONNECTION WITH THIS AGREEMENT OR THE USE OF THE SERVICES, EXCEED THE GREATER OF (1) THE AMOUNT PAID BY YOU TO SITEAGENT FOR THE SERVICES IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO SUCH CLAIM, OR (2) ONE HUNDRED US DOLLARS (USD $100.00).</p>

      <h2>10. Indemnification</h2>
      <p>You agree to defend, indemnify, and hold harmless SiteAgent, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Services, including, but not limited to, your User Content, any use of the Service's content, services, and products other than as expressly authorized in these Terms, or your use of any information obtained from the Services.</p>

      <h2>11. Governing Law and Dispute Resolution</h2>
      <p>These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction - e.g., the country/state where your company is registered], without regard to its conflict of law principles. Any dispute arising from or relating to the subject matter of these Terms shall be finally settled by arbitration in [Your City, Your Jurisdiction], using the English language in accordance with the Arbitration Rules and Procedures of [Arbitration Association Name - e.g., JAMS] then in effect, by one commercial arbitrator with substantial experience in resolving intellectual property and commercial contract disputes. Judgment upon the award rendered by such arbitrator may be entered in any court of competent jurisdiction. Notwithstanding the foregoing, each party shall have the right to institute an action in a court of proper jurisdiction for injunctive or other equitable relief pending a final decision by the arbitrator.</p>

      <h2>12. Changes to Terms</h2>
      <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Services after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Services.</p>

      <h2>13. Miscellaneous</h2>
      <ul>
        <li><strong>Entire Agreement:</strong> These Terms and our Privacy Policy constitute the entire agreement between you and SiteAgent regarding our Services and supersede all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, regarding the Services.</li>
        <li><strong>Waiver and Severability:</strong> No waiver by SiteAgent of any term or condition set out in these Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of SiteAgent to assert a right or provision under these Terms shall not constitute a waiver of such right or provision. If any provision of these Terms is held by a court or other tribunal of competent jurisdiction to be invalid, illegal, or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of the Terms will continue in full force and effect.</li>
        <li><strong>Assignment:</strong> You may not assign any of your rights or delegate any of your obligations under these Terms without our prior written consent. SiteAgent may assign its rights or delegate its obligations under these Terms without your consent.</li>
      </ul>

      <h2>14. Contact Us</h2>
      <p>If you have any questions about these Terms of Service, please contact us:</p>
      <ul>
        <li>By email: <a href="mailto:legal@siteagent.eu" className="hover:text-blue-300">legal@siteagent.eu</a> (or use your general contact email if preferred)</li>
        <li>Via our contact page: <Link href="/contact" className="hover:text-blue-300">siteagent.eu/contact</Link></li>
      </ul>
    </StaticPageLayout>
  );
} 