import PropTypes from 'prop-types';
import '../styles/CourseCard.css';

export default function CourseCard({ course }) {
    return (
        <div className="course-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="progress-container">
                <div 
                    className="progress-bar" 
                    style={{ width: `${course.progress}%` }}
                ></div>
            </div>
            <span>{course.progress}% Complete</span>
            <button 
                className="view-course-btn"
                onClick={() => window.location.href=`/course/${course.id}`}
            >
                {course.progress > 0 ? 'Continue' : 'Start'}
            </button>
        </div>
    );
}

CourseCard.propTypes = {
    course: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        progress: PropTypes.number.isRequired
    }).isRequired
};