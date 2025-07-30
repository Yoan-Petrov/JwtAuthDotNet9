import { useEffect, useState } from 'react';
import './CourseEnrollment.css';

export default function CourseEnrollment() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, usersRes] = await Promise.all([
          fetch('https://localhost:7199/api/courses', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch('https://localhost:7199/api/users', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        if (!coursesRes.ok || !usersRes.ok) {
          throw new Error(`Courses: ${coursesRes.status}, Users: ${usersRes.status}`);
        }

        const [coursesData, usersData] = await Promise.all([
          coursesRes.json(),
          usersRes.json()
        ]);

        setCourses(coursesData);
        setAllUsers(usersData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCourseSelect = async (courseId) => {
  try {
    const response = await fetch(
      `https://localhost:7199/api/Enrollments/course-enrollments?courseId=${courseId}`, 
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch enrollments');
    }

    const enrollments = await response.json();
    const course = courses.find(c => c.id === courseId);
    
    setSelectedCourse({
      ...course,
      enrollments: enrollments
    });
  } catch (err) {
    console.error('Error fetching enrollments:', err);
    setError(err.message);
  }
};

  const handleEnroll = async (userId) => {
    try {
      const response = await fetch(
        `https://localhost:7199/api/Enrollments/admin-enroll?userId=${userId}&courseId=${selectedCourse.id}`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Enrollment failed');
      }

      // Refresh the enrollments after successful enrollment
      await handleCourseSelect(selectedCourse.id);
      
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUnenroll = async (enrollment) => {
  try {
    const response = await fetch(
      `https://localhost:7199/api/Enrollments/unenroll?userId=${enrollment.userId}&courseId=${selectedCourse.id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) throw new Error('Unenrollment failed');

    // Refresh the selected course data
    handleCourseSelect(selectedCourse.id);
  } catch (err) {
    setError(err.message);
  }
};
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="course-enrollment">
      <h1>Manage Course Enrollments</h1>
      
      {!selectedCourse ? (
        <div className="course-grid">
          {courses.map(course => (
            <div 
              key={course.id} 
              className="course-card"
              onClick={() => handleCourseSelect(course.id)}
            >
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="enrollment-management">
          <button 
            className="back-btn"
            onClick={() => setSelectedCourse(null)}
          >
            ← Back to Courses
          </button>
          
          <h2>Managing: {selectedCourse.title}</h2>
          
          <div className="enrollment-sections">
            <div className="enroll-section">
              <h3>Enroll Users</h3>
              <div className="user-list">
                {allUsers
                  .filter(user => 
                    !selectedCourse.enrollments.some(e => e.userId === user.id)
                  )
                  .map(user => (
                    <div key={user.id} className="user-item">
                      <span>
                        {user.firstName || user.name} {user.lastName || user.surname} 
                        ({user.email})
                      </span>
                      <button 
                        onClick={() => handleEnroll(user.id)}
                        className="enroll-btn"
                      >
                        Enroll
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="unenroll-section">
              <h3>Enrolled Users</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Enrollment Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCourse.enrollments.map(enrollment => (
                    <tr key={enrollment.userId}>
                      <td>{enrollment.fullName}</td>
                      <td>{enrollment.email}</td>
                      <td>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleUnenroll(enrollment)}
                            className="unenroll-btn"
                            >
                          Unenroll
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}