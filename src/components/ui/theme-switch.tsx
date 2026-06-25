/**
    MIT License

    Copyright (c) 2025 AC Autonomous Systems

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

 */

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-between h-10 w-28 rounded-full bg-secondary p-1">
      <button
        onClick={() => setTheme('system')}
        className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
          theme === 'system' &&
          'bg-primary/90 text-primary-foreground shadow-sm'
        }`}
        aria-label="Use system theme"
      >
        <Monitor className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('light')}
        className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
          theme === 'light' && 'bg-primary/90 text-primary-foreground shadow-sm'
        }`}
        aria-label="Use light theme"
      >
        <Sun className="h-4 w-4" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
          theme === 'dark' && 'bg-primary/90 text-primary-foreground shadow-sm'
        }`}
        aria-label="Use dark theme"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
