import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic2, Bot, Sparkles, ArrowRight, Volume2, MessageCircle } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1.1, 1.4, 1],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.3, 0.6, 0.4, 0.7, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-pink-500/10 to-purple-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.3, 1.1, 1.2],
            rotate: [360, 270, 180, 90, 0],
            opacity: [0.2, 0.5, 0.3, 0.6, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AVA</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">AI Voice Assistant</p>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center mb-12"
        >
          {/* Main Title */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Meet AVA
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Your intelligent voice-powered AI assistant that listens, understands, and responds with natural conversation
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
              <Mic2 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice Recognition</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
              <Volume2 className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Speech</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Natural Conversation</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Smart Responses</span>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
            className="group relative px-12 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white font-semibold text-lg rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-blue-500/40 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-3">
              Start Talking with AVA
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </div>
          </motion.button>
        </motion.div>

        {/* Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-slate-700/50 shadow-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Experience Natural AI Conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Just click the button above to start your journey with AVA
              </p>
            </div>

            {/* Preview Animation */}
            <div className="flex items-center justify-center gap-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg"
              >
                <Mic2 className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                className="text-4xl"
              >
                💬
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg"
              >
                <Bot className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;