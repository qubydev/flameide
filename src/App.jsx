import React, { useEffect, useState } from 'react'
import Split from 'react-split'
import Editor from '@monaco-editor/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/select";
import { FaPlay } from "react-icons/fa";

const LANGUAGES = {
  cpp: {
    name: 'C++',
    extension: '.cpp',
    mode: 'cpp',
    snippet: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int T;
    cin >> T;

    while(T--) {

    }

    return 0;
}`
  },
  c: {
    name: 'C',
    extension: '.c',
    mode: 'c',
    snippet: `#include <stdio.h>

int main() {
    int T;
    scanf("%d", &T);

    while (T--) {

    }

    return 0;
}`
  },
  python: {
    name: 'Python',
    extension: '.py',
    mode: 'python',
    snippet: `T = int(input())

for _ in range(T):
    pass
`
  },
  java: {
    name: 'Java',
    extension: '.java',
    mode: 'java',
    snippet: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int T = sc.nextInt();

        for (int i = 0; i < T; i++) {

        }

        sc.close();
    }
}`
  },
  javascript: {
    name: 'JavaScript',
    extension: '.js',
    mode: 'javascript',
    snippet: `let T = parseInt(readline());

for (let i = 0; i < T; i++) {

}`
  }
};

export default function App() {
  const [minSizes, setMinSizes] = useState([200, 200]);
  const [editorState, setEditorState] = useState(() => {
    const savedState = localStorage.getItem('editorState');
    return savedState ? JSON.parse(savedState) : { value: '', language: 'cpp', stdin: '' };
  });
  const [error, setError] = useState('');
  const [stdout, setStdout] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (value) => {
    setEditorState(prev => ({
      ...prev,
      language: value,
      value: prev.value || LANGUAGES[value]?.snippet || ''
    }));
  };

  const handleRun = async () => {
    setIsRunning(true);
    setStdout('');
    setError('');

    const payload = {
      lang: editorState.language || '',
      code: editorState.value || '',
      stdin: editorState.stdin || '',
    };

    try {
      const res = await fetch('https://voidrunner.vercel.app/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.success) {
        setStdout(result.output);
        setError('');
      } else {
        setStdout('');
        setError(result.error || 'Unknown error occurred.');
      }
    } catch (err) {
      setStdout('');
      setError('Network or server error.');
    }

    setIsRunning(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrCmd && e.key === "'") {
        e.preventDefault();
        handleRun();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun]);

  useEffect(() => {
    localStorage.setItem('editorState', JSON.stringify(editorState));
  }, [editorState]);

  useEffect(() => {
    const updateMinSizes = () => {
      const width = window.innerWidth;
      const p60 = Math.floor(width * 0.6);
      setMinSizes(prev => [p60, prev[1]]);
    };

    updateMinSizes();
    window.addEventListener('resize', updateMinSizes);
    return () => window.removeEventListener('resize', updateMinSizes);
  }, []);

  return (
    <div className='box-border h-screen w-screen overflow-hidden flex flex-col'>
      <nav className='p-2 flex items-center justify-between border-b border-gray-600'>
        <img
          src="/logo.svg"
          className='size-8'
        />
        <div className='flex items-center gap-4'>
          <Select value={editorState.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className='w-[100px] btn-primary'>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                {Object.entries(LANGUAGES).map(([key, lang]) => (
                  <SelectItem key={key} value={key}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <button
            className='btn-primary flex items-center gap-2'
            onClick={handleRun}
            disabled={isRunning}
          >
            <FaPlay className='size-3' />
            Run
          </button>
        </div>
      </nav>

      <Split className="split flex-1 w-full" sizes={[70, 30]} gutterSize={5} minSize={minSizes}>
        <Editor
          language={editorState.language}
          theme="vs-dark"
          options={{
            fontSize: 16,
            wordWrap: 'on',
            minimap: { enabled: false }
          }}
          value={editorState.value}
          onChange={(val) => setEditorState(prev => ({ ...prev, value: val }))}
        />

        <Split gutterSize={5} direction="vertical" className='solit'>
          <div className='flex flex-col p-2'>
            <p className='font-mono font-semibold uppercase opacity-50 text-sm'>stdin</p>
            <textarea
              placeholder='write input here...'
              className='w-full flex-1 outline-none resize-none bg-transparent text-white'
              value={editorState.stdin}
              onChange={(e) => setEditorState(prev => ({ ...prev, stdin: e.target.value }))}
            ></textarea>
          </div>
          <div className='p-2'>
            <p className='font-mono font-semibold uppercase opacity-50 text-sm'>stdout</p>
            {error ? <pre className='text-red-400 whitespace-pre-wrap'>{error}</pre> :
              stdout ? <pre className='whitespace-pre-wrap'>{stdout}</pre> : null}
          </div>
        </Split>
      </Split>
    </div>
  );
}
