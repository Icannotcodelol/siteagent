'use client'

import { useEffect } from 'react'

export default function MetaPromptGeneratorTool() {
  useEffect(() => {
    // Load the SiteAgent chatbot widget for bottom-right positioning
    const script = document.createElement('script')
    script.src = 'https://www.siteagent.eu/chatbot-widget.js'
    script.setAttribute('data-chatbot-id', 'a623575a-a1c9-445a-bbc7-d9c5ff560a0e')
    script.async = true
    
    document.body.appendChild(script)
    
    return () => {
      // Cleanup script on unmount
      if (script.parentNode === document.body) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Understanding Meta Prompting</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn how to transform basic AI prompts into structured, powerful meta prompts that deliver consistent, high-quality results every time.
        </p>
      </div>

      {/* What is Meta Prompting */}
      <article className="prose prose-lg max-w-none">
        <h2>What is Meta Prompting?</h2>
        <p>
          Meta prompting is the practice of writing prompts about how to prompt. Instead of simply asking an AI to perform a task, 
          you provide detailed instructions about the role it should assume, the context it should consider, the format it should follow, 
          and the criteria for success.
        </p>

        <h3>The Problem with Basic Prompts</h3>
        <p>
          Most people interact with AI using basic, conversational prompts like "Write a blog post about productivity" or 
          "Help me with my email." While these prompts work, they often produce inconsistent results because the AI has to 
          make assumptions about:
        </p>
        <ul>
          <li>Who the intended audience is</li>
          <li>What tone and style to use</li>
          <li>How long the output should be</li>
          <li>What format or structure to follow</li>
          <li>What specific elements to include or avoid</li>
        </ul>

        <h3>The Meta Prompting Solution</h3>
        <p>
          Meta prompts eliminate guesswork by explicitly defining these parameters. A well-crafted meta prompt typically includes:
        </p>
        <ul>
          <li><strong>Role Definition:</strong> "You are a [specific expert/professional]"</li>
          <li><strong>Context:</strong> Background information and constraints</li>
          <li><strong>Task Specification:</strong> Exactly what needs to be accomplished</li>
          <li><strong>Format Requirements:</strong> Structure, length, and organization</li>
          <li><strong>Tone and Style:</strong> Voice, formality level, and approach</li>
          <li><strong>Success Criteria:</strong> What constitutes a good result</li>
        </ul>
      </article>

      {/* Before and After Example */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Before vs After: A Real Example</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-red-600 mb-3">❌ Basic Prompt</h3>
            <blockquote className="text-gray-600 italic mb-4">
              "Write an email to my team about the new project deadline."
            </blockquote>
            <div className="text-sm text-gray-500">
              <strong>Problems:</strong> Unclear audience size, missing context about the deadline change, 
              no tone guidance, undefined length, no structure specified.
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-green-600 mb-3">✅ Meta Prompt</h3>
            <blockquote className="text-gray-600 italic mb-4">
              "You are a project manager writing to a team of 12 software developers and 3 designers. 
              Write a professional but reassuring email about a project deadline extension from March 15 to March 22. 
              
              Include: 1) Brief explanation of why the extension is necessary, 2) New milestone schedule, 
              3) How this affects each team member's current tasks, 4) Next immediate action steps.
              
              Tone: Professional yet empathetic, acknowledging the inconvenience while staying solution-focused. 
              Length: 200-250 words. Format: Clear subject line + structured email with numbered sections."
            </blockquote>
            <div className="text-sm text-gray-500">
              <strong>Includes:</strong> Role, specific audience, complete context, required elements, 
              tone guidance, length specification, and formatting instructions.
            </div>
          </div>
        </div>
      </div>

      {/* Key Components of Meta Prompts */}
      <article className="prose prose-lg max-w-none">
        <h2>Essential Components of Effective Meta Prompts</h2>
        
        <h3>1. Role Definition</h3>
        <p>
          Start your prompt by defining who the AI should be. Instead of letting it assume a generic assistant role, 
          specify exactly what kind of expert or professional perspective you need.
        </p>
        <blockquote>
          <strong>Examples:</strong> "You are a senior marketing strategist with 10 years of B2B experience..." 
          or "You are a technical writer specializing in API documentation..."
        </blockquote>

        <h3>2. Context and Constraints</h3>
        <p>
          Provide the AI with relevant background information and any limitations or requirements it should consider. 
          This includes target audience, company information, brand guidelines, or specific restrictions.
        </p>

        <h3>3. Task Specification</h3>
        <p>
          Be explicit about what you want accomplished. Break down complex tasks into specific, actionable components 
          rather than using vague instructions.
        </p>

        <h3>4. Format and Structure</h3>
        <p>
          Specify the desired output format, length, organization, and any structural elements you need. 
          This eliminates ambiguity about how the response should be presented.
        </p>

        <h3>5. Tone and Style Guidelines</h3>
        <p>
          Define the appropriate voice, formality level, and communication style. Consider your audience and 
          the context where the content will be used.
        </p>

        <h3>6. Success Criteria</h3>
        <p>
          Include specific criteria that define what a successful output looks like. This helps the AI understand 
          your quality standards and priorities.
        </p>
      </article>

      {/* When to Use Meta Prompts */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">When Meta Prompting Makes the Biggest Difference</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 High-Stakes Content</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Client presentations and proposals</li>
              <li>• Marketing copy and campaigns</li>
              <li>• Technical documentation</li>
              <li>• Executive communications</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 Repetitive Tasks</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Regular reports and updates</li>
              <li>• Social media content</li>
              <li>• Customer support responses</li>
              <li>• Email templates</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Team Collaboration</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Shared content creation workflows</li>
              <li>• Brand consistency requirements</li>
              <li>• Standardized output formats</li>
              <li>• Quality control processes</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Business-Critical Outputs</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Strategic planning documents</li>
              <li>• Financial reports and analysis</li>
              <li>• Product specifications</li>
              <li>• Legal and compliance content</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Prompts?</h2>
        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
          Use the chat widget in the bottom right to get personalized help turning your basic prompts into powerful meta prompts. 
          Our AI assistant will guide you through the process step by step.
        </p>
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-bold">Meta Prompting Assistant Available</span>
        </div>
      </div>
    </div>
  )
} 