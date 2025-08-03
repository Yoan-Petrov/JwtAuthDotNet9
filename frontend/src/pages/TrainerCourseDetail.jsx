import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './TrainerCourseDetail.css';

export default function TrainerCourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editedCourse, setEditedCourse] = useState({
    title: '',
    shortDescription: '',
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details
        const courseRes = await fetch(`https://localhost:7199/api/Courses/${courseId}`, {
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
        // Initialize editedCourse with current course data
        setEditedCourse({
          title: courseData.title,
          shortDescription: courseData.shortDescription || '',
          description: courseData.description
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`https://localhost:7199/api/courses/${courseId}/materials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const newMaterial = await response.json();
      setMaterials([...materials, newMaterial]);
      setShowUploadForm(false);
      setFile(null);
      setUploadProgress(0);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch(`https://localhost:7199/api/Courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Id: parseInt(courseId), // PascalCase ID
        Title: editedCourse.title, // PascalCase property
        ShortDescription: editedCourse.shortDescription, // PascalCase property
        Description: editedCourse.description // PascalCase property
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Update failed');
    }

    // Update local course state
    setCourse({
      ...course,
      title: editedCourse.title,
      shortDescription: editedCourse.shortDescription,
      description: editedCourse.description
    });
    
    setShowEditForm(false);
  } catch (err) {
    setError(err.message);
  }
};

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this entire course? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`https://localhost:7199/api/Courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        throw new Error('Unauthorized - Please log in again');
      }

      if (response.status === 403) {
        throw new Error('You do not have permission to delete this course');
      }

      if (response.status === 404) {
        throw new Error('Course not found');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Delete failed');
      }

      // Redirect to dashboard after successful deletion
      window.location.href = '/trainer-dashboard';
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    try {
      const response = await fetch(`https://localhost:7199/api/courses/${courseId}/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setMaterials(materials.filter(m => m.id !== materialId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadMaterial = async (material) => {
    try {
      // Fetch material with authentication
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

      // Get filename from Content-Disposition header or use material title
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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!course) return <div className="error-message">Course not found</div>;

  return (
    <div className="course-detail-container">
      {/* Edit Course Modal */}
      {showEditForm && (
        <div className="edit-course-modal">
          <div className="edit-course-form">
            <h2>Edit Course</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={editedCourse.title}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Short Description:</label>
                <textarea
                  name="shortDescription"
                  value={editedCourse.shortDescription}
                  onChange={handleEditChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={editedCourse.description}
                  onChange={handleEditChange}
                  rows="5"
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  className="btn cancel-btn"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn save-btn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="course-header">
  <div className="header-top">
    <Link to="/trainer-dashboard" className="back-btn">
      ← Back to Dashboard
    </Link>
    
    {/* Edit button moved to top right */}
    <button 
      className="edit-course-btn"
      onClick={() => setShowEditForm(true)}
    >
      Edit Course
    </button>
  </div>
  
  <div className="header-bottom">
    <h1>{course.title}</h1>
    <p className="course-description">{course.description}</p>
  </div>
</div>

      <div className="materials-section">
        <div className="section-header">
          <h2>Course Materials</h2>
          <button 
            className="add-material-btn"
            onClick={() => setShowUploadForm(true)}
          >
            + Add Material
          </button>
        </div>

        {showUploadForm && (
          <div className="upload-form">
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Select File:</label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  required
                />
              </div>
              {file && (
                <div className="file-info">
                  <span>Selected: {file.name}</span>
                  <span>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowUploadForm(false);
                    setFile(null);
                    setUploadProgress(0);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="upload-btn"
                  disabled={!file}
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        )}

        {materials.length === 0 ? (
          <p className="no-materials">No materials uploaded yet.</p>
        ) : (
          <div className="materials-list">
            {materials.map(material => (
              <div key={material.id} className="material-item">
                <div className="material-info">
                  <span className="material-name">{material.title}</span>
                  <span className="material-date">
                    Uploaded: {new Date(material.uploadDate || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="material-actions">
                  <button 
                    className="download-btn"
                    onClick={() => handleDownloadMaterial(material)}
                  >
                    Download
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="course-footer">
          <button 
            className="delete-course-btn"
            onClick={() => handleDeleteCourse(course.id)}
          >
            Delete Course
          </button>
        </div>
      </div>
    </div>
  );
}