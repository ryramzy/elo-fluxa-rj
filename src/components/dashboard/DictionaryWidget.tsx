import React, { useState } from 'react';
import { FaSearch, FaVolumeUp } from 'react-icons/fa';
import { trackEvent } from '../../utils/analytics';

interface DefinitionData {
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  audioUrl?: string;
}

export const DictionaryWidget: React.FC = () => {
  const [searchWord, setSearchWord] = useState('');
  const [result, setResult] = useState<DefinitionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const word = searchWord.trim();
    if (!word) return;

    setLoading(true);
    setError(null);
    setResult(null);

    trackEvent('dictionary_search', { word });

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
        throw new Error('Palavra não encontrada no dicionário.');
      }
      
      const data = await response.json();
      const entry = data[0];
      
      // Extract first definition
      const firstMeaning = entry.meanings?.[0];
      const partOfSpeech = firstMeaning?.partOfSpeech || 'noun';
      const definition = firstMeaning?.definitions?.[0]?.definition || '';
      
      // Extract phonetic spelling
      const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || '';
      
      // Find first valid audio URL
      const audioUrl = entry.phonetics?.find((p: any) => p.audio && p.audio.startsWith('http'))?.audio || '';

      setResult({
        word: entry.word,
        phonetic,
        partOfSpeech,
        definition,
        audioUrl
      });
    } catch (err: any) {
      console.warn('Dictionary search failed:', err);
      setError(err.message || 'Erro ao buscar definição.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (result?.audioUrl) {
      const audio = new Audio(result.audioUrl);
      audio.play().catch(err => {
        console.error('Audio playback failed:', err);
      });
      trackEvent('dictionary_audio_play', { word: result.word });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📖</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Quick Dictionary</h3>
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-light">
          Search word meanings and listen to correct American pronunciation.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="Type in English..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-4 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
            >
              <FaSearch size={14} />
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 py-2 font-medium">{error}</p>
        )}

        {result && (
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 animate-fade-in">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{result.word}</h4>
                <span className="text-xs text-slate-400 font-mono italic">{result.phonetic}</span>
              </div>
              
              {result.audioUrl && (
                <button
                  onClick={playAudio}
                  className="p-2 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-all"
                  title="Listen pronunciation"
                >
                  <FaVolumeUp size={12} />
                </button>
              )}
            </div>
            
            <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
              <span className="inline-block px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                {result.partOfSpeech}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                {result.definition}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
