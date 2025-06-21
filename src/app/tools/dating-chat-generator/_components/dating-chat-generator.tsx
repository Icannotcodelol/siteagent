'use client'

import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'

interface Message {
  id: string
  sender: 'user' | 'match'
  text: string
  timestamp: string
  isPhotoResponse?: boolean
  prompt?: string
}

interface Profile {
  name: string
  age: string
  location: string
  photo: string
  prompt: string
  promptResponse: string
  initialMessages: Message[]
}

const profiles: Profile[] = [
  {
    name: 'Emma',
    age: '25',
    location: '3 miles away',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b388?w=400&h=600&fit=crop&crop=face',
    prompt: "I'm weirdly attracted to",
    promptResponse: "People who don't have social media accounts.",
    initialMessages: [
      {
        id: '1',
        sender: 'match',
        text: "Loved your comment on my prompt! Finally someone who gets it 😂",
        timestamp: '9:46 AM',
        isPhotoResponse: true,
        prompt: "People who don't have social media accounts."
      },
      {
        id: '2',
        sender: 'user',
        text: "Right? It's so refreshing to meet someone real",
        timestamp: '10:03 AM'
      },
      {
        id: '3',
        sender: 'match',
        text: "Exactly! So what do you do when you're not avoiding Instagram? 😉",
        timestamp: '10:15 AM'
      }
    ]
  },
  {
    name: 'Sofia',
    age: '23',
    location: '1 mile away',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face',
    prompt: "My simple pleasures",
    promptResponse: "Sunday morning coffee and building side projects",
    initialMessages: [
      {
        id: '1',
        sender: 'match',
        text: "A fellow builder! What kind of side projects are you working on?",
        timestamp: '9:46 AM',
        isPhotoResponse: true,
        prompt: "Sunday morning coffee and building side projects"
      },
      {
        id: '2',
        sender: 'user',
        text: "Currently working on an AI chatbot platform for businesses",
        timestamp: '10:03 AM'
      },
      {
        id: '3',
        sender: 'match',
        text: "That's so cool! I run a small online store and could definitely use something like that",
        timestamp: '10:15 AM'
      }
    ]
  },
  {
    name: 'Maya',
    age: '26',
    location: '2 miles away',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face',
    prompt: "I'm looking for",
    promptResponse: "Someone who can explain their startup in one sentence",
    initialMessages: [
      {
        id: '1',
        sender: 'match',
        text: "Okay, I'll bite - what's your one sentence startup pitch? 🚀",
        timestamp: '9:46 AM',
        isPhotoResponse: true,
        prompt: "Someone who can explain their startup in one sentence"
      },
      {
        id: '2',
        sender: 'user',
        text: "We help businesses convert website visitors into customers using AI-powered chat",
        timestamp: '10:03 AM'
      },
      {
        id: '3',
        sender: 'match',
        text: "Love it! Clear and valuable. How's traction looking?",
        timestamp: '10:15 AM'
      }
    ]
  },
  {
    name: 'Zoe',
    age: '24',
    location: '4 miles away',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
    prompt: "Unusual skills",
    promptResponse: "I can spot a good business idea from a mile away",
    initialMessages: [
      {
        id: '1',
        sender: 'match',
        text: "Intrigued by your business radar! What's the best idea you've spotted recently?",
        timestamp: '7:42 PM',
        isPhotoResponse: true,
        prompt: "I can spot a good business idea from a mile away"
      }
    ]
  },
  {
    name: 'Luna',
    age: '27',
    location: '5 miles away',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
    prompt: "I get excited about",
    promptResponse: "People who solve real problems instead of creating fake ones",
    initialMessages: [
      {
        id: '1',
        sender: 'match',
        text: "Love this perspective! What real problem are you passionate about solving?",
        timestamp: '1:28 PM',
        isPhotoResponse: true,
        prompt: "People who solve real problems instead of creating fake ones"
      }
    ]
  }
]

export default function DatingChatGenerator() {
  const [appType, setAppType] = useState<'hinge' | 'tinder' | 'bumble'>('hinge')
  const [selectedProfile, setSelectedProfile] = useState<Profile>(profiles[0])
  const [messages, setMessages] = useState<Message[]>(profiles[0].initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [newSender, setNewSender] = useState<'user' | 'match'>('match')
  const chatRef = useRef<HTMLDivElement>(null)

  const handleProfileChange = (profile: Profile) => {
    setSelectedProfile(profile)
    setMessages(profile.initialMessages)
  }

  const addMessage = () => {
    if (!newMessage.trim()) return
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const message: Message = {
      id: Date.now().toString(),
      sender: newSender,
      text: newMessage,
      timestamp
    }
    
    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const downloadScreenshot = async () => {
    if (!chatRef.current) return
    
    try {
      const canvas = await html2canvas(chatRef.current, {
        useCORS: true,
        allowTaint: true
      })
      
      const link = document.createElement('a')
      link.download = `${appType}-chat-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Error generating screenshot:', error)
      alert('Error generating screenshot. Please try again.')
    }
  }

  const getAppColors = () => {
    switch (appType) {
      case 'hinge':
        return {
          primary: '#6B46C1', // Hinge purple
          secondary: '#8B5CF6',
          background: '#F9FAFB'
        }
      case 'tinder':
        return {
          primary: '#fd5068',
          secondary: '#ff6b7a',
          background: '#ffffff'
        }
      case 'bumble':
        return {
          primary: '#ffb800',
          secondary: '#ffc726',
          background: '#ffffff'
        }
    }
  }

  const colors = getAppColors()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Choose Your Match</h3>
            
            {/* Profile Selection */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {profiles.map((profile) => (
                <div
                  key={profile.name}
                  onClick={() => handleProfileChange(profile)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedProfile.name === profile.name
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={profile.photo}
                      alt={profile.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {profile.name}, {profile.age}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">{profile.location}</p>
                      <div className="bg-gray-100 rounded-lg p-2">
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {profile.prompt}
                        </p>
                        <p className="text-sm text-gray-900">{profile.promptResponse}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* App Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dating App
              </label>
              <select
                value={appType}
                onChange={(e) => setAppType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="hinge">Hinge</option>
                <option value="tinder">Tinder</option>
                <option value="bumble">Bumble</option>
              </select>
            </div>
          </div>

          {/* Add Messages */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add Messages</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sender
              </label>
                             <select
                 value={newSender}
                 onChange={(e) => setNewSender(e.target.value as any)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
               >
                 <option value="match">{selectedProfile.name}</option>
                 <option value="user">You</option>
               </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Enter message text..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={addMessage}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Add Message
            </button>
          </div>

          {/* Download */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <button
              onClick={downloadScreenshot}
              className="w-full text-white py-3 px-6 rounded-md font-semibold transition-colors"
              style={{ backgroundColor: colors.primary }}
            >
              Download Screenshot
            </button>
          </div>
        </div>

        {/* Phone Preview */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-80 h-[640px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
              <div 
                ref={chatRef}
                className="w-full h-full rounded-[2rem] overflow-hidden bg-white"
              >
                {/* Status Bar */}
                <div className="bg-white px-6 py-2 flex justify-between items-center text-black text-sm font-medium">
                  <span>9:41</span>
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-1 h-3 bg-black rounded-sm"></div>
                      <div className="w-1 h-3 bg-black rounded-sm"></div>
                      <div className="w-1 h-3 bg-black rounded-sm"></div>
                      <div className="w-1 h-3 bg-gray-300 rounded-sm"></div>
                    </div>
                    <svg className="w-4 h-4 ml-1" fill="black" viewBox="0 0 24 24">
                      <path d="M2 17h20v2H2zm1.15-4.05L4 11l.85 1.95.85-1.95L6.55 11l-.85-1.95L4.85 11 4 12.95zm3.7-2.9h.3c.67 0 1.2.53 1.2 1.2v.3c0 .67-.53 1.2-1.2 1.2h-.3c-.67 0-1.2-.53-1.2-1.2v-.3c0-.67.53-1.2 1.2-1.2z"/>
                    </svg>
                    <svg className="w-6 h-3" fill="black" viewBox="0 0 24 12">
                      <rect x="1" y="3" width="22" height="6" rx="3" fill="black"/>
                      <rect x="23" y="5" width="1" height="2" rx="0.5" fill="black"/>
                    </svg>
                  </div>
                </div>

                {/* Header */}
                <div className="bg-white px-4 py-3 flex items-center space-x-3 border-b border-gray-100">
                  <button className="text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                                     <div className="flex-1 text-center">
                     <div className="font-semibold text-gray-900 text-lg">{selectedProfile.name}</div>
                   </div>
                  <div className="flex space-x-4">
                    <button className="text-gray-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                    <button className="text-gray-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="text-gray-700">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white border-b border-gray-200">
                  <div className="flex">
                    <button className="flex-1 py-3 text-center font-semibold text-gray-900 border-b-2 border-gray-900">
                      Chat
                    </button>
                    <button className="flex-1 py-3 text-center font-medium text-gray-500">
                      Profile
                    </button>
                  </div>
                </div>

                                 {/* Messages */}
                 <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50" style={{ height: 'calc(100% - 180px)' }}>
                   {/* Show prompt as photo post */}
                   {messages.length > 0 && messages[0].isPhotoResponse && (
                     <div className="mb-6">
                       {/* Profile header */}
                       <div className="flex items-center space-x-3 mb-3 px-2">
                         <img
                           src={selectedProfile.photo}
                           alt={selectedProfile.name}
                           className="w-8 h-8 rounded-full object-cover"
                         />
                         <div>
                           <p className="font-semibold text-gray-900 text-sm">{selectedProfile.name}</p>
                           <p className="text-xs text-gray-500">{selectedProfile.age} • {selectedProfile.location}</p>
                         </div>
                       </div>
                       
                       {/* Photo with text overlay */}
                       <div className="relative rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: '3/4', maxHeight: '300px' }}>
                         <img
                           src={selectedProfile.photo}
                           alt={selectedProfile.name}
                           className="w-full h-full object-cover"
                         />
                         <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                         <div className="absolute bottom-6 left-6 right-6">
                           <div className="bg-white bg-opacity-95 rounded-lg p-4">
                             <p className="text-sm font-medium text-gray-700 mb-2">{selectedProfile.prompt}</p>
                             <p className="text-lg font-semibold text-gray-900">{selectedProfile.promptResponse}</p>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                   
                   {/* Timestamp */}
                   <div className="text-center mb-4">
                     <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                       Today {messages[0]?.timestamp || '9:46 AM'}
                     </span>
                   </div>
                   
                   {messages.map((message, index) => (
                     <div key={message.id} className="mb-3">
                       <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className="relative group max-w-xs">
                           {message.sender === 'user' ? (
                             <div
                               className="px-4 py-3 rounded-2xl text-white font-medium"
                               style={{ backgroundColor: '#6B46C1' }}
                             >
                               {message.text}
                             </div>
                           ) : (
                             <div className="px-4 py-3 rounded-2xl bg-gray-200 text-gray-900 font-medium">
                               {message.text}
                             </div>
                           )}
                           <button
                             onClick={() => removeMessage(message.id)}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                             ×
                           </button>
                         </div>
                       </div>
                       
                       {/* Show timestamp for individual messages */}
                       {index < messages.length - 1 && (
                         <div className="text-center mt-3">
                           <span className="text-xs text-gray-400">
                             Today {messages[index + 1]?.timestamp || '10:03 AM'}
                           </span>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-100 rounded-full px-4 py-3">
                      <span className="text-gray-500 font-medium">Send a message</span>
                    </div>
                    <button className="text-gray-400 font-semibold">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 