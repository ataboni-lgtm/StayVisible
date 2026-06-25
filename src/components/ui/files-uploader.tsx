'use client';
/**
 * MIT License
 *
 * Copyright (c) 2025 AC Autonomous Systems, LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  FileIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UploadCloudIcon,
  TrashIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
// import InvisibleUploadDropzone from './invisible-drop-to-upload';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/loading';
import { toast } from 'sonner';

/**
 * @author [Mark Chang](https://github.com/AChangXD)
 * @description This is a file uploader component.
 * @param {onSingleDocumentUpload} onSingleDocumentUpload - This is called when a single file is uploaded. Note that this function is called within a try/catch block.
 * @param {onAllDocumentsUploaded} onAllDocumentsUploaded - This is called when all files are uploaded. This IS NOT called within a try/catch block.
 * @returns
 */
export default function FilesUploader({
  onSingleDocumentUpload,
  onAllDocumentsUploaded,
  className,
}: {
  onSingleDocumentUpload: (file: File) => Promise<void>;
  onAllDocumentsUploaded: () => Promise<void>;
  className?: string;
}) {
  /* -------------------------------------------------------------------------- */
  /*                                    Hooks                                   */
  /* -------------------------------------------------------------------------- */
  const nextRouter = useRouter();
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const [files, setFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                               Event Handlers                               */
  /* -------------------------------------------------------------------------- */
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(e.dataTransfer.files),
      ]);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files!)]);
      }
    },
    [],
  );

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handlePrevFile = () => {
    setCurrentFileIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : files.length - 1,
    );
  };

  const handleNextFile = () => {
    setCurrentFileIndex((prevIndex) =>
      prevIndex < files.length - 1 ? prevIndex + 1 : 0,
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div
      className={cn(
        'w-full h-full flex flex-col @container/uploader-parent',
        className,
      )}
    >
      <div
        className={cn(
          'w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer',
          isDragging
            ? 'border-primary bg-secondary'
            : 'border-gray-300 hover:border-primary hover:bg-primary/5',
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleAreaClick}
      >
        <div className="text-center">
          <UploadCloudIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {isDragging
              ? 'Drop your files here'
              : 'Drag & drop files here or click to select'}
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />
      </div>
      {files.length > 0 && (
        <>
          <p className="text-muted-foreground text-sm mt-4">
            {files.length} file(s) selected. Use the arrows to cycle through
            them.
          </p>
          <Card className="w-full mt-2">
            <CardContent className="pt-6 w-full flex flex-col gap-2">
              <div className="w-full flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevFile}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentFileIndex + 1} of {files.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextFile}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
              {files[currentFileIndex] && (
                <div className="w-full flex flex-row justify-between items-center gap-2">
                  <>
                    <FileIcon className="w-8 h-8 text-primary min-w-8" />
                    <div>
                      <p className="font-medium truncate max-w-[15ch] @md/uploader-parent:max-w-[25ch]">
                        {files[currentFileIndex].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(files[currentFileIndex].size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </>

                  <Button
                    variant={'ghostLiteInversed'}
                    size="icon"
                    onClick={() => {
                      setFiles((prevFiles) =>
                        prevFiles.filter((f) => f !== files[currentFileIndex]),
                      );
                      setCurrentFileIndex(0);
                    }}
                  >
                    <TrashIcon className="w-4 h-4 min-w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
      <Button
        disabled={isFileUploading}
        onClick={async () => {
          if (isFileUploading) {
            return;
          }
          // Handle file upload here
          setIsFileUploading(true);
          const filesToUploadPromises = files.map(async (file) => {
            try {
              await onSingleDocumentUpload(file);

              // Remove the file from the list of files:
              setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
              setCurrentFileIndex(0);
            } catch (error) {
              if (error instanceof Error) {
                toast.error(error.message);
              } else {
                toast.error('An unknown error occurred while uploading.');
              }
            }
          });

          await Promise.all(filesToUploadPromises);

          await onAllDocumentsUploaded();
          setFiles([]);
          setIsFileUploading(false);
          nextRouter.refresh();
        }}
        className="mt-4 gap-2"
      >
        {isFileUploading ? (
          <Loading className="h-4 w-4" />
        ) : (
          <UploadCloudIcon className="h-4 w-4" />
        )}
        Upload
      </Button>
    </div>
  );
}
