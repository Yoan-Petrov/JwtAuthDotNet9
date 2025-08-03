import { useEffect, useState } from 'react';
import './CoursesView.css';
import './CourseEnrollment.css';

export default function CourseEnrollment() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('enroll');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination for courses
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(6);

  // Pagination for users
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, usersRes] = await Promise.all([
          fetch('https://localhost:7199/api/courses', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          fetch('https://localhost:7199/api/users', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        if (!coursesRes.ok || !usersRes.ok) {
          throw new Error(`Courses: ${coursesRes.status}, Users: ${usersRes.status}`);
        }

        const [coursesData, usersData] = await Promise.all([
          coursesRes.json(),
          usersRes.json()
        ]);

        setCourses(coursesData || []);
        setFilteredCourses(coursesData || []);
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

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, courses]);

  useEffect(() => {
    setUserCurrentPage(1); // Reset user pagination on tab/search change
  }, [searchTerm, activeTab]);

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCourseSelect = async (courseId) => {
    try {
      // Fetch full course details
      const courseRes = await fetch(`https://localhost:7199/api/Courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (!courseRes.ok) {
        const errorData = await courseRes.json();
        throw new Error(errorData.message || 'Failed to fetch course details');
      }

      const courseData = await courseRes.json();

      // Fetch enrollments
      const enrollmentsRes = await fetch(
        `https://localhost:7199/api/Enrollments/course-enrollments?courseId=${courseId}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (!enrollmentsRes.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const enrollments = await enrollmentsRes.json();

      setSelectedCourse({ ...courseData, enrollments });
    } catch (err) {
      console.error('Error fetching course details or enrollments:', err);
      setError(err.message);
    }
  };

  const handleEnroll = async (userId) => {
    try {
      const response = await fetch(
        `https://localhost:7199/api/Enrollments/admin-enroll?userId=${userId}&courseId=${selectedCourse.id}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Enrollment failed');
      }

      const enrolledUser = allUsers.find(u => u.id === userId);
      const newEnrollment = {
        userId,
        fullName: `${enrolledUser.firstName || enrolledUser.name} ${enrolledUser.lastName || enrolledUser.surname}`,
        email: enrolledUser.email,
        enrollmentDate: new Date().toISOString()
      };

      setSelectedCourse(prev => ({
        ...prev,
        enrollments: [...prev.enrollments, newEnrollment]
      }));
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
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (!response.ok) throw new Error('Unenrollment failed');

      setSelectedCourse(prev => ({
        ...prev,
        enrollments: prev.enrollments.filter(e => e.userId !== enrollment.userId)
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const renderUserPagination = (totalPages) => (
    <div className="pagination-container">
      <button
        onClick={() => setUserCurrentPage(userCurrentPage - 1)}
        disabled={userCurrentPage === 1}
        className="pagination-arrow"
      >
        &lt; Previous
      </button>
      <div className="page-numbers">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
          <button
            key={number}
            onClick={() => setUserCurrentPage(number)}
            className={`page-number ${userCurrentPage === number ? 'active-page' : ''}`}
          >
            {number}
          </button>
        ))}
      </div>
      <button
        onClick={() => setUserCurrentPage(userCurrentPage + 1)}
        disabled={userCurrentPage === totalPages || totalPages === 0}
        className="pagination-arrow"
      >
        Next &gt;
      </button>
    </div>
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="course-enrollment-container">
      {!selectedCourse ? (
        <>
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="courses-list">
            {currentCourses.map(course => {
              // Get the best available description for card display
              const description = course.shortDescription || course.description;
              const displayText = description 
                ? (description.length > 100 
                    ? `${description.substring(0, 100)}...` 
                    : description)
                : 'No description available';

              return (
                <div
                  key={course.id}
                  className="course-card"
                  onClick={() => handleCourseSelect(course.id)}
                >
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
                      {displayText}
                    </p>
                    <div className="view-btn">View Enrollments</div>
                  </div>
                </div>
              );
            })}
          </div>

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
        </>
      ) : (
        <div className="enrollment-management">
          <button className="back-btn" onClick={() => setSelectedCourse(null)}>
            ← Back to Courses
          </button>

          <div className="selected-course-header">
            <h2>{selectedCourse.title}</h2>
            <p>{selectedCourse.description || selectedCourse.shortDescription || 'No description available'}</p>
          </div>

          <div className="enrollment-tabs">
            <button
              className={`tab-btn ${activeTab === 'enroll' ? 'active' : ''}`}
              onClick={() => setActiveTab('enroll')}
            >
              Enroll Users
            </button>
            <button
              className={`tab-btn ${activeTab === 'unenroll' ? 'active' : ''}`}
              onClick={() => setActiveTab('unenroll')}
            >
              Enrolled Users
            </button>
          </div>

          <div className="search-filter">
            <input
              type="text"
              placeholder={`Search ${activeTab === 'enroll' ? 'available' : 'enrolled'} users...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {activeTab === 'enroll' ? (() => {
            const availableUsers = allUsers.filter(user =>
              !selectedCourse.enrollments.some(e => e.userId === user.id) &&
              (
                user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
              )
            );
            const totalUserPages = Math.ceil(availableUsers.length / usersPerPage);
            const paginatedAvailableUsers = availableUsers.slice(
              (userCurrentPage - 1) * usersPerPage,
              userCurrentPage * usersPerPage
            );

            return (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAvailableUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.firstName || user.name} {user.lastName || user.surname}</td>
                        <td>{user.email}</td>
                        <td>
                          <button onClick={() => handleEnroll(user.id)} className="enroll-btn">
                            Enroll
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {availableUsers.length > usersPerPage && renderUserPagination(totalUserPages)}
              </>
            );
          })() : (() => {
            const enrolledUsers = selectedCourse.enrollments.filter(enrollment =>
              enrollment.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              enrollment.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const totalEnrolledPages = Math.ceil(enrolledUsers.length / usersPerPage);
            const paginatedEnrolledUsers = enrolledUsers.slice(
              (userCurrentPage - 1) * usersPerPage,
              userCurrentPage * usersPerPage
            );

            return (
              <>
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
                    {paginatedEnrolledUsers.map(enrollment => (
                      <tr key={enrollment.userId}>
                        <td>{enrollment.fullName}</td>
                        <td>{enrollment.email}</td>
                        <td>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => handleUnenroll(enrollment)}
                            className="unenroll-btn"
                          >
                            Unenroll
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {enrolledUsers.length > usersPerPage && renderUserPagination(totalEnrolledPages)}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}