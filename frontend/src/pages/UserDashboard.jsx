import { useEffect, useState } from 'react';
import './UserDashboard.css';

// Temporary fix for HTTPS in development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default function UserDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await fetch('https://localhost:7199/api/enrollments/my-courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (loading) return <div className="loading">Loading your courses...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-dashboard">
      <h1>My Enrolled Courses</h1>
      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <button 
              className="view-btn"
              onClick={() => window.location.href=`/course/${course.id}`}
            >
              View Course
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}