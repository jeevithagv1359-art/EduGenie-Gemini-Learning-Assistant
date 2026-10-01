/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/Common/Toast';
import { Navbar } from './components/Navigation/Navbar';
import { Sidebar } from './components/Navigation/Sidebar';
import { HomeView } from './components/Home/HomeView';
import { ChatView } from './components/Chat/ChatView';
import { SummarizerView } from './components/Summarizer/SummarizerView';
import { QuizView } from './components/Quiz/QuizView';
import { LearningPathView } from './components/LearningPath/LearningPathView';
import { DashboardView } from './components/Dashboard/DashboardView';
import { SavedLearningView } from './components/Saved/SavedLearningView';
import { StudyHistoryView } from './components/History/StudyHistoryView';
import { SettingsView } from './components/Settings/SettingsView';
import { UserSettings } from './types';
import { getStoredSettings, saveStoredSettings } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(() => getStoredSettings());

  // Deep linking / passing prompt between views
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);
  const [quizInitialTopic, setQuizInitialTopic] = useState<string | undefined>(undefined);

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveStoredSettings(updated);
      return updated;
    });
  };

  const handleNavigate = (tab: string, initialPrompt?: string) => {
    if (tab === 'chat' && initialPrompt) {
      setChatInitialPrompt(initialPrompt);
    }
    if (tab === 'quiz' && initialPrompt) {
      setQuizInitialTopic(initialPrompt);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic font size styling
  const fontSizeClass =
    settings.fontSize === 'xlarge'
      ? 'text-lg'
      : settings.fontSize === 'large'
      ? 'text-base'
      : 'text-sm';

  return (
    <ToastProvider>
      <div className={`min-h-screen bg-slate-50 text-slate-900 ${fontSizeClass}`}>
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />

        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Area */}
        <main className="md:ml-64 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 transition-all">
          {activeTab === 'home' && <HomeView onNavigate={handleNavigate} />}

          {activeTab === 'chat' && (
            <ChatView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              initialPrompt={chatInitialPrompt}
              onClearInitialPrompt={() => setChatInitialPrompt(undefined)}
              onNavigateToQuiz={(topic) => handleNavigate('quiz', topic)}
              onNavigateToSummarizer={(text) => handleNavigate('summarizer', text)}
            />
          )}

          {activeTab === 'summarizer' && (
            <SummarizerView
              settings={settings}
              onNavigateToQuiz={(text) => handleNavigate('quiz', text)}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              settings={settings}
              initialTopic={quizInitialTopic}
              onNavigateToChat={(prompt) => handleNavigate('chat', prompt)}
            />
          )}

          {activeTab === 'path' && (
            <LearningPathView
              settings={settings}
              onNavigateToChat={(prompt) => handleNavigate('chat', prompt)}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView settings={settings} onNavigate={handleNavigate} />
          )}

          {activeTab === 'saved' && (
            <SavedLearningView
              onNavigateToChat={(prompt) => handleNavigate('chat', prompt)}
            />
          )}

          {activeTab === 'history' && (
            <StudyHistoryView
              onNavigateToChat={(prompt) => handleNavigate('chat', prompt)}
              onNavigateToQuiz={(topic) => handleNavigate('quiz', topic)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearChat={() => {
                setChatInitialPrompt(undefined);
              }}
            />
          )}
        </main>
      </div>
    </ToastProvider>
  );
}
