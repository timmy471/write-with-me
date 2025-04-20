'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { PulseLoader } from 'react-spinners';
import { useDebouncedCallback } from 'use-debounce';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const editorModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ header: [1, 2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

export default function WriteWithMe() {
  const [input, setInput] = useState<string>('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const quillRef = useRef<any>(null);

  const fetchSuggestion = async (text: string) => {
    if (!text.trim()) {
      setSuggestion('');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini-autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text }),
      });

      const data = await res.json();
      let suggestionResponse = data.suggestion || '';

      // If input ends with space and suggestion starts with space, remove one
      //   if (text.endsWith(' ') && suggestionResponse.startsWith(' ')) {
      //     suggestionResponse = suggestionResponse.trimStart();
      //   }

      setSuggestion(suggestionResponse);
    } catch (err) {
      console.error('Error fetching suggestion:', err);
      setSuggestion('');
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSuggestion = useDebouncedCallback(
    (text: string) => fetchSuggestion(text),
    1000
  );

  const handleChange = (_content: string, _delta: any, _source: string, editor: any) => {
    const plainText = editor.getText().replace(/\n+$/, '');
    setInput(plainText);

    // setSuggestion('');

    debouncedFetchSuggestion(plainText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      console.log('PREVENTING');

      if (!quillRef.current) {
        console.log('Editor not loaded');
        return;
      }

      const editor = quillRef.current.getEditor();

      if (editor) {
        const length = editor.getLength();
        console.log(suggestion);
        editor.insertText(length - 1, suggestion);
        setSuggestion('');
        debouncedFetchSuggestion.cancel();
      }
    }
  };

  return (
    <div className='mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm max-w-3xl'>
      <label className='block text-xl font-semibold mb-4 text-gray-800'>
        ✍️ Write with me
      </label>
      <div className='relative'>
        <div
          className='absolute top-[80px] md:top-[54px] w-full whitespace-pre-wrap break-words pointer-events-none px-4 leading-relaxed'
          aria-hidden='true'>
          <div className='inline'>
            <span className='invisible'>{input}</span>
            <PulseLoader
              color={'gray'}
              loading={isLoading}
              size={4}
              aria-label='Loading Spinner'
              data-testid='loader'
            />
            <span className='text-gray-400'>{suggestion}</span>
          </div>
        </div>

        <ReactQuill
          ref={quillRef}
          theme='snow'
          onKeyDown={handleKeyDown}
          //   onKeyUp={handleKeyDown}
          //   onKeyPress={handleKeyDown}
          onChange={handleChange}
          placeholder="What's on your mind?"
          modules={editorModules}
        />
      </div>
    </div>
  );
}
