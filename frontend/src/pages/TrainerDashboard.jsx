import { useState, useEffect } from 'react';
import './TrainerDashboard.css';

export default function TrainerDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    shortDescription: '',
    description: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://localhost:7199/api/Courses/trainer-courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch courses');
        
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://localhost:7199/api/Courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCourse)
      });

      if (!response.ok) throw new Error('Failed to create course');

      const createdCourse = await response.json();
      setCourses([...courses, createdCourse]);
      setShowAddForm(false);
      setNewCourse({ title: '', shortDescription: '', description: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="trainer-dashboard">
      <h1>My Courses</h1>
      
      <button 
        className="add-course-btn"
        onClick={() => setShowAddForm(true)}
      >
        + Add New Course
      </button>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="add-course-form">
            <h2>Create New Course</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={newCourse.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Short Description:</label>
                <textarea
                  name="shortDescription"
                  value={newCourse.shortDescription}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Full Description:</label>
                <textarea
                  name="description"
                  value={newCourse.description}
                  onChange={handleInputChange}
                  rows="5"
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="courses-list">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <h2>{course.title}</h2>
            <p>{course.shortDescription || "No short description"}</p>
            {/* Add other course details here */}
          </div>
        ))}
      </div>
    </div>
  );
}