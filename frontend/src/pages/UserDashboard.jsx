import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TrainerDashboard.css'; // Reuse trainer dashboard styles
import './CoursesView.css'; // Reuse card styles

export default function UserDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await fetch('https://localhost:7199/api/enrollments/my-courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch enrolled courses');

        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const currentCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  if (loading) return <div className="loading">Loading your courses...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="trainer-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-controls">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="courses-list-container">
        <div className="courses-list">
          {currentCourses.length === 0 ? (
            <div className="no-courses-message">
              {searchTerm ? (
                <>
                  <p>No enrolled courses match your search "{searchTerm}"</p>
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <p>You haven't enrolled in any courses yet</p>
              )}
            </div>
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
                      {course.description 
                        ? (course.description.length > 100 
                            ? `${course.description.substring(0, 100)}...` 
                            : course.description)
                        : 'No description available'}
                    </p>
                    <Link 
                      to={`/course/${course.id}`} 
                      className="view-btn"
                    >
                      Continue Learning
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