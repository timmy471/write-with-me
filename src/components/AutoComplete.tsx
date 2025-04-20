'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { PulseLoader } from 'react-spinners';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const editorModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ header: [1, 2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'], // Keep remove formatting
  ],
};

export default function WriteWithMe() {
  const [input, setInput] = useState<string>('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const quillRef = useRef<any>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

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
      setSuggestion(data.suggestion || '');
    } catch (err) {
      console.error('Error fetching suggestion:', err);
      setSuggestion('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (_content: string, _delta: any, _source: string, editor: any) => {
    const plainText = editor.getText().replace(/\n+$/, '');
    setInput(plainText);
    setSuggestion('');

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchSuggestion(plainText);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Tab' || e.key === 'Enter') && suggestion) {
      e.preventDefault();
      const editor = quillRef.current?.getEditor();

      if (editor) {
        editor.insertText(editor.getLength() - 1, suggestion);
        setSuggestion('');
      }
    }
  };

  return (
    <div className='mx-auto mt-10 p-6 bg-white rounded-xl shadow-sm max-w-3xl'>
      <label className='block text-xl font-semibold mb-4 text-gray-800'>
        ✍️ Write with me
      </label>
      <div className='relative' onKeyDown={handleKeyDown}>
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
          theme='snow'
          onChange={handleChange}
          placeholder="What's on your mind?"
          modules={editorModules}
        />
      </div>
    </div>
  );
}

//Accept text
//Take form
