import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CoursePage.css';

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trainerName, setTrainerName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details
        const courseRes = await fetch(`https://localhost:7199/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!courseRes.ok) {
          throw new Error(`Failed to fetch course: ${courseRes.status}`);
        }

        // Fetch materials
        const materialsRes = await fetch(`https://localhost:7199/api/courses/${courseId}/materials`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!materialsRes.ok) {
          throw new Error(`Failed to fetch materials: ${materialsRes.status}`);
        }

        const [courseData, materialsData] = await Promise.all([
          courseRes.json(),
          materialsRes.json()
        ]);

        setCourse(courseData);
        setMaterials(materialsData);
        
        // Fetch trainer's name
        if (courseData.trainerId) {
          const trainerRes = await fetch(`https://localhost:7199/api/user/${courseData.trainerId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (trainerRes.ok) {
            const trainerData = await trainerRes.json();
            setTrainerName(trainerData.name || 'Course Instructor');
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleDownloadMaterial = async (material) => {
    try {
      const response = await fetch(
        `https://localhost:7199/api/courses/${courseId}/materials/${material.id}`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : material.title || 'download';

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading course content...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h2>Error Loading Course</h2>
      <p>{error}</p>
      <Link to="/courses" className="back-btn">
        ← Back to Dashboard
      </Link>
    </div>
  );

  if (!course) return (
    <div className="not-found-container">
      <div className="not-found-icon">🔍</div>
      <h2>Course Not Found</h2>
      <p>The course you're looking for doesn't exist or has been removed.</p>
      <Link to="/student-dashboard" className="back-btn">
        ← Back to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="course-detail-container">
      {/* Header with only title and description */}
      <div className="course-header">
        <Link to="/courses" className="back-btn">
          ← Back to Dashboard
        </Link>
        
        <h1>{course.title}</h1>
        <p className="course-description">{course.description}</p>
      </div>

      {/* Materials section */}
      <div className="materials-section">
        <div className="section-header">
          <h2>Course Materials</h2>
          <p className="section-description">
            Download all resources and materials for this course
          </p>
        </div>

        {materials.length === 0 ? (
          <div className="no-materials">
            <div className="no-materials-icon">📂</div>
            <p>No materials available for this course yet.</p>
            <p>Check back later or contact the instructor.</p>
          </div>
        ) : (
          <div className="materials-list">
            {materials.map(material => (
              <div key={material.id} className="material-item">
                <div className="material-info">
                  <div className="material-icon">
                    {getFileIcon(material.title)}
                  </div>
                  <div className="material-text">
                    <span className="material-name">{material.title}</span>
                    <span className="material-date">
                      Uploaded: {new Date(material.uploadDate || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button 
                  className="download-btn"
                  onClick={() => handleDownloadMaterial(material)}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructor section with trainer's name */}
      <div className="instructor-section">
        <h3>Instructor</h3>
        <div className="instructor-card">
          <div className="instructor-avatar">👤</div>
          <div className="instructor-info">
            <h4>{trainerName}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get file icon based on file extension
function getFileIcon(filename) {
  if (!filename) return '📄';
  
  const extension = filename.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'pdf': return '📕';
    case 'doc':
    case 'docx': return '📝';
    case 'xls':
    case 'xlsx': return '📊';
    case 'ppt':
    case 'pptx': return '📽️';
    case 'zip':
    case 'rar': return '📦';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return '🖼️';
    case 'mp4':
    case 'mov':
    case 'avi': return '🎬';
    case 'mp3':
    case 'wav': return '🎵';
    default: return '📄';
  }
}