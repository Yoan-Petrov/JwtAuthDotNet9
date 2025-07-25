import { getAuthToken } from '../utils/auth';

export const fetchEnrolledCourses = async () => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch('/api/enrollments/me', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch enrolled courses');
    }

    return await response.json();
};