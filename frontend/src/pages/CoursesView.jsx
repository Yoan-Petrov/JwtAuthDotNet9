import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CoursesView.css';

export default function CoursesView() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://localhost:7199/api/courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div className="courses-view">
      <h1>Courses</h1>
      
      <div className="courses-list">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <Link 
              to={`/admin/courses/${course.id}`} 
              className="view-btn"
            >
              View Course
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}