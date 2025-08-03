import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CoursesView.css';

export default function CoursesView() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(6); // 6 cards per page

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://localhost:7199/api/courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setCourses(data || []);
        setFilteredCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, courses]);

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div className="courses-view">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      <div className="courses-list-container">
      <div className="courses-list">
        {currentCourses.map(course => (
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
                View Course
              </Link>
            </div>
          </div>
        ))}
      </div>
      </div>
      {/* Pagination Controls */}
      {filteredCourses.length > 0 && (
        <div className="pagination-container">
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-arrow"
          >
            &lt; Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`page-number ${currentPage === number ? 'active-page' : ''}`}
              >
                {number}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages || totalPages === 0}
            className="pagination-arrow"
          >
            Next &gt;
          </button>
        </div>
      )}

      {filteredCourses.length === 0 && !loading && (
        <div className="no-results">
          {searchTerm ? 'No courses match your search' : 'No courses available'}
        </div>
      )}
    </div>
  );
}