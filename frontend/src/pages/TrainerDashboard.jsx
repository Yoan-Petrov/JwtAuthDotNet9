import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TrainerDashboard.css';
import './CoursesView.css'; // Reuse styles for card layout

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

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

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
        // Ensure each course has a description
        const coursesWithDescriptions = data.map(course => ({
          ...course,
          // Use shortDescription if description is missing
          description: course.description || course.shortDescription || 'No description available'
        }));
        setCourses(coursesWithDescriptions);
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

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const currentCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="trainer-dashboard">
      <div className="dashboard-header">
          <div className="dashboard-controls">
        <div class="search-filter">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
       
        </div>
      </div>
        <button 
          className="add-course-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Course
        </button> 
      </div>
    

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

      <div className="courses-list-container">
        <div className="courses-list">
          {currentCourses.length === 0 ? (
            <p>No courses found.</p>
          ) : (
            currentCourses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-image">
                  <img 
                    src="/images/background.png"
                    alt={course.title || "Course"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/fallback-image.jpg";
                    }}
                  />
                </div>
              <div className="course-content">
                <h2>{course.title || 'Untitled Course'}</h2>
                <p className="description">
                  {course.shortDescription || // Use short description if available
                    (course.description 
                      ? (course.description.length > 100 
                          ? `${course.description.substring(0, 100)}...` 
                          : course.description)
                      : 'No description available')}
                </p>
                <Link to={`/trainer-dashboard/courses/${course.id}`} className="view-btn">
                  View Course
                </Link>
              </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
            className="pagination-arrow"
          >
            &lt; Previous
          </button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`page-number ${currentPage === number ? 'active-page' : ''}`}
              >
                {number}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === totalPages}
            className="pagination-arrow"
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  );
}
