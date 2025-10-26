'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export function AddLessonForm({
  moduleId,
  courseId,
  onSuccess,
}: {
  moduleId: string;
  courseId: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'VIDEO',
    dripDays: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept:
      formData.contentType === 'VIDEO'
        ? { 'video/*': [] }
        : formData.contentType === 'AUDIO'
        ? { 'audio/*': [] }
        : formData.contentType === 'PDF'
        ? { 'application/pdf': [] }
        : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileUrl = null;

      // Upload file if present
      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          fileUrl = url;
        }
      }

      // Create lesson
      const lessonData: any = {
        title: formData.title,
        description: formData.description || null,
        contentType: formData.contentType,
        dripDays: formData.dripDays ? parseInt(formData.dripDays) : null,
      };

      if (fileUrl) {
        if (formData.contentType === 'VIDEO') {
          lessonData.videoUrl = fileUrl;
        } else if (formData.contentType === 'AUDIO') {
          lessonData.audioUrl = fileUrl;
        } else if (formData.contentType === 'PDF') {
          lessonData.pdfUrl = fileUrl;
        }
      }

      const response = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/lessons`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData),
        }
      );

      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          contentType: 'VIDEO',
          dripDays: '',
        });
        setFile(null);
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 mb-3">
      <div className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Lesson title"
            required
            className="input-field"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <textarea
            placeholder="Lesson description (optional)"
            rows={2}
            className="input-field"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              className="input-field"
              value={formData.contentType}
              onChange={(e) => {
                setFormData({ ...formData, contentType: e.target.value });
                setFile(null);
              }}
            >
              <option value="VIDEO">Video</option>
              <option value="AUDIO">Audio</option>
              <option value="PDF">PDF</option>
              <option value="TEXT">Text</option>
              <option value="QUIZ">Quiz</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drip Days (optional)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="input-field"
              value={formData.dripDays}
              onChange={(e) =>
                setFormData({ ...formData, dripDays: e.target.value })
              }
            />
          </div>
        </div>

        {['VIDEO', 'AUDIO', 'PDF'].includes(formData.contentType) && (
          <div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <p className="text-sm text-gray-700">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Drag & drop a file here, or click to select
                </p>
              )}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Adding...' : 'Add Lesson'}
        </button>
      </div>
    </form>
  );
}
