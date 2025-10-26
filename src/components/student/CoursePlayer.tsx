'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Course = any;
type Enrollment = any;
type Progress = any;

export function CoursePlayer({
  course,
  enrollment,
  progressRecords,
  userId,
}: {
  course: Course;
  enrollment: Enrollment;
  progressRecords: Progress[];
  userId: string;
}) {
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Get all lessons flat
  const allLessons = course.modules.flatMap((m: any) => m.lessons);

  // Find the first incomplete lesson or the first lesson
  useEffect(() => {
    if (!currentLesson && allLessons.length > 0) {
      const incompleteLesson = allLessons.find(
        (lesson: any) =>
          !progressRecords.some(
            (p: any) => p.lessonId === lesson.id && p.completed
          )
      );
      setCurrentLesson(incompleteLesson || allLessons[0]);
    }
  }, [allLessons, currentLesson, progressRecords]);

  const isLessonCompleted = (lessonId: string) => {
    return progressRecords.some(
      (p: any) => p.lessonId === lessonId && p.completed
    );
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          completed: true,
        }),
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
    }
  };

  if (!currentLesson) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen -mt-8 -mx-4">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? 'w-80' : 'w-0'
        } bg-white border-r overflow-hidden transition-all`}
      >
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">{course.title}</h2>
          <div className="text-sm text-gray-600 mt-1">
            {enrollment.completionPercentage}% Complete
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${enrollment.completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          {course.modules.map((module: any, moduleIdx: number) => (
            <div key={module.id} className="border-b">
              <div className="p-4 bg-gray-50 font-medium">
                Module {moduleIdx + 1}: {module.title}
              </div>
              <div>
                {module.lessons.map((lesson: any) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson)}
                    className={`w-full text-left p-3 hover:bg-gray-50 border-b flex items-center gap-2 ${
                      currentLesson.id === lesson.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <span>
                      {isLessonCompleted(lesson.id) ? '✓' : '○'}
                    </span>
                    <span className="flex-1 text-sm">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4 flex items-center gap-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-gray-600 hover:text-gray-900"
          >
            ☰
          </button>
          <h1 className="text-xl font-semibold">{currentLesson.title}</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {currentLesson.contentType === 'VIDEO' && currentLesson.videoUrl && (
            <video
              src={currentLesson.videoUrl}
              controls
              className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
            >
              Your browser does not support the video tag.
            </video>
          )}

          {currentLesson.contentType === 'AUDIO' && currentLesson.audioUrl && (
            <div className="max-w-2xl mx-auto">
              <audio src={currentLesson.audioUrl} controls className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {currentLesson.contentType === 'PDF' && currentLesson.pdfUrl && (
            <div className="max-w-4xl mx-auto">
              <iframe
                src={currentLesson.pdfUrl}
                className="w-full h-[600px] border rounded-lg"
                title={currentLesson.title}
              />
            </div>
          )}

          {currentLesson.contentType === 'TEXT' && currentLesson.textContent && (
            <div className="max-w-3xl mx-auto prose">
              <div dangerouslySetInnerHTML={{ __html: currentLesson.textContent }} />
            </div>
          )}

          {currentLesson.description && (
            <div className="max-w-3xl mx-auto mt-8">
              <h3 className="text-lg font-semibold mb-2">About this lesson</h3>
              <p className="text-gray-600">{currentLesson.description}</p>
            </div>
          )}

          <div className="max-w-3xl mx-auto mt-8 flex justify-between">
            <button
              onClick={() => {
                const currentIdx = allLessons.findIndex(
                  (l: any) => l.id === currentLesson.id
                );
                if (currentIdx > 0) {
                  setCurrentLesson(allLessons[currentIdx - 1]);
                }
              }}
              disabled={allLessons[0].id === currentLesson.id}
              className="btn-secondary"
            >
              Previous Lesson
            </button>

            {!isLessonCompleted(currentLesson.id) && (
              <button
                onClick={() => markLessonComplete(currentLesson.id)}
                className="btn-primary"
              >
                Mark as Complete
              </button>
            )}

            <button
              onClick={() => {
                const currentIdx = allLessons.findIndex(
                  (l: any) => l.id === currentLesson.id
                );
                if (currentIdx < allLessons.length - 1) {
                  setCurrentLesson(allLessons[currentIdx + 1]);
                }
              }}
              disabled={
                allLessons[allLessons.length - 1].id === currentLesson.id
              }
              className="btn-primary"
            >
              Next Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
