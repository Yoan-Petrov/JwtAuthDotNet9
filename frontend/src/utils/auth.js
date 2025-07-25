export const getTokenData = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'], // Direct string value
      expires: new Date(payload.exp * 1000)
    };
  } catch (error) {
    console.error('Token decoding failed:', error);
    return null;
  }
};