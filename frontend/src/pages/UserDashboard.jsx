import { useEffect, useState } from 'react';
import './UserDashboard.css';

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
          }
        });

        console.log("Response status:", response.status);
        
        if (!response.ok) {
          // Get more detailed error information
          const errorText = await response.text();
          console.error("API Error:", errorText);
          throw new Error(errorText || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);
        
        // Check if we have valid course data
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format. Expected an array of courses.");
        }
        
        // Format courses with fallback descriptions
        const formattedCourses = data.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description || course.shortDescription || "No description available"
        }));
        
        setCourses(formattedCourses);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load your courses. Please try again later.");
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
      
      {courses.length === 0 ? (
        <div className="empty">You haven't enrolled in any courses yet.</div>
      ) : (
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
      )}
    </div>
  );
}